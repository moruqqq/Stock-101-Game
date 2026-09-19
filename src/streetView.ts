import { groundY, type CityProfile } from "./cityProfiles";
import { type Citizen } from "./cityCrowd";

// Pick a clear view of a gathering instead of zooming into the back of a building.
export function streetView(
  p: CityProfile,
  buildings: { x: number; z: number; w: number; d: number; h: number }[],
  people: Citizen[],
) {
  const gatherings = people
    .filter((person) => person.activity === "talking")
    .filter((_, i) => i % 3 === 0);
  const candidates = gatherings.length
    ? gatherings
    : people
        .slice(0, 10)
        .map((person) => ({
          ...person,
          ...(person.route?.points[
            Math.floor(person.route.points.length / 2)
          ] ?? {}),
        }));
  return clearCityView(p, buildings, candidates, people);
}

export function clearCityView(
  p: CityProfile,
  buildings: { x: number; z: number; w: number; d: number; h: number }[],
  candidates: { x: number; z: number }[],
  people: { x: number; z: number; route: unknown }[] = [],
  radius = 6.4,
  height = 4.4,
  focusHeight = 0.5,
) {
  const obstacles = [
    ...buildings,
    ...p.landmarks.map((l) => ({
      x: l.x,
      z: l.z,
      w: (l.scale ?? 1) * 2.8,
      d: (l.scale ?? 1) * 2.8,
      h: (l.scale ?? 1) * 5,
    })),
  ];
  let best = { x: 0, z: 0, dx: 5, dz: 5, score: -Infinity };
  for (const person of candidates)
    for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 4) {
      const dx = Math.sin(angle) * radius,
        dz = Math.cos(angle) * radius;
      let blocked = 0;
      for (let t = 0.12; t < 1; t += 0.08) {
        const x = person.x + dx * t,
          z = person.z + dz * t;
        const y = groundY(person.x, person.z) + focusHeight + height * t;
        blocked += obstacles.filter(
          (b) =>
            Math.abs(x - b.x) < b.w / 2 + 1 &&
            Math.abs(z - b.z) < b.d / 2 + 1 &&
            y < groundY(b.x, b.z) + b.h + 0.3,
        ).length;
      }
      const near = people.filter(
        (other) =>
          !other.route &&
          Math.hypot(other.x - person.x, other.z - person.z) < 4,
      ).length;
      const score = near - blocked * 12 - Math.hypot(person.x, person.z) * 0.05;
      if (score > best.score)
        best = { x: person.x, z: person.z, dx, dz, score };
    }
  return best;
}
