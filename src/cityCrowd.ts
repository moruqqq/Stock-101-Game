import {
  isWater,
  streetCoords,
  waterCenter,
  type CityProfile,
} from "./cityProfiles";

type Footprint = { x: number; z: number; w: number; d: number };
export type WalkPoint = { x: number; z: number };
export type WalkRoute = {
  points: WalkPoint[];
  distances: number[];
  length: number;
  kind: "street" | "park" | "quay";
};
export type Citizen = {
  route: WalkRoute | null;
  x: number;
  z: number;
  heading: number;
  phase: number;
  speed: number;
  scale: number;
  style: number;
  activity: "walking" | "jogging" | "talking" | "watching";
  gathering?: {
    eventId: string;
    focus: WalkPoint;
    start: WalkPoint;
    wait: number;
    linger: number;
  };
};
export const MAX_CITIZENS = 144;

// Check the whole person's footprint, not only the centre of the route.
export function walkable(
  p: CityProfile,
  buildings: Footprint[],
  x: number,
  z: number,
  margin = 0.23,
) {
  for (const dx of [-margin, 0, margin])
    for (const dz of [-margin, 0, margin])
      if (isWater(p, x + dx, z + dz)) return false;
  return (
    !buildings.some(
      (b) =>
        Math.abs(x - b.x) < b.w / 2 + margin &&
        Math.abs(z - b.z) < b.d / 2 + margin,
    ) &&
    !p.landmarks.some(
      (l) =>
        Math.hypot(x - l.x, z - l.z) < (l.scale ?? 1) * 1.5 + margin - 0.23,
    )
  );
}

export function makeCityCrowd(p: CityProfile, buildings: Footprint[]) {
  let seed = p.id.split("").reduce((s, c) => s * 31 + c.charCodeAt(0), 17);
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  const routes: WalkRoute[] = [];
  const addPath = (points: WalkPoint[], kind: WalkRoute["kind"]) => {
    let run: WalkPoint[] = [];
    const flush = () => {
      if (run.length > 5) {
        const distances = [0];
        for (let i = 1; i < run.length; i++)
          distances.push(
            distances[i - 1] +
              Math.hypot(run[i].x - run[i - 1].x, run[i].z - run[i - 1].z),
          );
        const length = distances[distances.length - 1];
        if (length > 1.5) routes.push({ points: run, distances, length, kind });
      }
      run = [];
    };
    for (const point of points) {
      if (walkable(p, buildings, point.x, point.z)) run.push(point);
      else flush();
    }
    flush();
  };
  // Both sides of each street, split at water, buildings and landmarks.
  for (const s of streetCoords())
    for (const horizontal of [true, false])
      for (const side of [-1, 1]) {
        const points: WalkPoint[] = [];
        for (let t = -19; t <= 19; t += 0.2)
          points.push({
            x: horizontal ? t : s + side * 0.5,
            z: horizontal ? s + side * 0.5 : t,
          });
        addPath(points, "street");
      }
  for (const [cx, cz, radius] of p.parks) {
    for (const ring of [0.42, 0.72]) {
      const points: WalkPoint[] = [];
      for (let i = 0; i <= 100; i++) {
        const a = (i / 100) * Math.PI * 2;
        points.push({
          x: cx + Math.cos(a) * radius * ring,
          z: cz + Math.sin(a) * radius * ring,
        });
      }
      addPath(points, "park");
    }
  }
  // Waterfront promenades follow the same shoreline as the terrain.
  for (const side of [-1, 1]) {
    const points: WalkPoint[] = [];
    for (let t = -17; t <= 17; t += 0.2) {
      if (p.id === "nyc") points.push({ x: side * 5.15, z: t });
      else if (p.terrain === "strait" || p.terrain === "inland")
        points.push({
          x: waterCenter(p, t) + side * (p.riverWidth + 0.65),
          z: t,
        });
      else
        points.push({
          x: t,
          z:
            waterCenter(p, t) +
            (p.terrain === "coast" ? -0.75 : side * (p.riverWidth + 0.65)),
        });
    }
    addPath(points, "quay");
  }
  const people: Citizen[] = [];
  const special = routes.filter((r) => r.kind !== "street");
  const streets = routes.filter((r) => r.kind === "street");
  for (let i = 0; i < 108 && routes.length; i++) {
    const pool =
      i % 3 === 0 && special.length
        ? special
        : streets.length
          ? streets
          : routes;
    const route = pool[Math.floor(random() * pool.length)];
    const jogging = route.kind === "park" && i % 4 === 0;
    people.push({
      route,
      x: 0,
      z: 0,
      heading: 0,
      phase: random() * 200,
      speed: jogging ? 0.62 : 0.25 + random() * 0.16,
      scale: 0.85 + random() * 0.2,
      style: i,
      activity: jogging ? "jogging" : "walking",
    });
  }
  // Small conversations near landmarks, parks and district centres.
  const centres = [
    ...p.landmarks,
    ...p.districts,
    ...p.parks.map(([x, z]) => ({ x, z })),
  ];
  const occupied: WalkPoint[] = [];
  for (const centre of centres) {
    let groups = 0;
    for (
      let i = 0;
      i < 28 && groups < 2 && people.length + 3 <= MAX_CITIZENS;
      i++
    ) {
      const angle = i * 2.39996,
        radius = 2.35 + Math.floor(i / 7) * 0.65;
      const x = centre.x + Math.cos(angle) * radius,
        z = centre.z + Math.sin(angle) * radius;
      if (occupied.some((o) => Math.hypot(x - o.x, z - o.z) < 1.5)) continue;
      const group = [0, 1, 2].map((j) => {
        const a = (j / 3) * Math.PI * 2 + angle;
        return {
          x: x + Math.sin(a) * 0.36,
          z: z + Math.cos(a) * 0.36,
          heading: a + Math.PI,
        };
      });
      if (
        !group.every(
          (q) =>
            walkable(p, buildings, q.x, q.z) &&
            streetCoords().every(
              (s) => Math.abs(q.x - s) > 0.56 && Math.abs(q.z - s) > 0.56,
            ),
        )
      )
        continue;
      group.forEach((q, j) =>
        people.push({
          ...q,
          route: null,
          phase: random() * 50,
          speed: 0,
          scale: j === 2 && groups === 1 ? 0.76 : 0.96,
          style: people.length,
          activity: "talking",
        }),
      );
      occupied.push({ x, z });
      groups++;
    }
  }
  return { people, routes };
}

export type CitizenPose = {
  x: number;
  z: number;
  heading: number;
  stride: number;
  moving: boolean;
  attention?: number;
};
// Writes into a reusable pose: no per-person allocations during rendering.
export function citizenPose(person: Citizen, time: number, out: CitizenPose) {
  out.attention = 0;
  if (person.gathering) {
    const g = person.gathering;
    const dx = person.x - g.start.x,
      dz = person.z - g.start.z;
    const travel = Math.hypot(dx, dz) / person.speed;
    const watchAt = g.wait + travel,
      leaveAt = watchAt + g.linger;
    const stage = (time + person.phase) % (leaveAt + travel + 2.4);
    const approaching = stage >= g.wait && stage < watchAt;
    const leaving = stage >= leaveAt && stage < leaveAt + travel;
    const watching = stage >= watchAt && stage < leaveAt;
    const blend = approaching
      ? (stage - g.wait) / travel
      : watching
        ? 1
        : leaving
          ? 1 - (stage - leaveAt) / travel
          : 0;
    out.x = g.start.x + dx * blend;
    out.z = g.start.z + dz * blend;
    const walkHeading = Math.atan2(dx, dz);
    const faceHeading = Math.atan2(g.focus.x - out.x, g.focus.z - out.z);
    const faceBlend = watching ? 1 : approaching ? Math.min(1, blend * 1.4) : 0;
    const heading = walkHeading + (leaving || stage >= leaveAt ? Math.PI : 0);
    const turn = Math.atan2(
      Math.sin(faceHeading - heading),
      Math.cos(faceHeading - heading),
    );
    out.heading = heading + turn * faceBlend;
    out.moving = approaching || leaving;
    const walkStage = approaching ? stage - g.wait : stage - leaveAt;
    const fade = out.moving
      ? Math.min(1, walkStage * 3, (travel - walkStage) * 3)
      : 0;
    out.stride = Math.sin((time + person.phase) * 6) * 0.52 * fade;
    out.attention = watching
      ? Math.min(1, (stage - watchAt) * 2, (leaveAt - stage) * 2)
      : 0;
    return out;
  }
  const r = person.route;
  if (!r) {
    out.x = person.x;
    out.z = person.z;
    out.heading = person.heading;
    out.stride = 0;
    out.moving = false;
    return out;
  }
  const travel = r.length / person.speed,
    pause = 2.4,
    half = travel + pause;
  const elapsed = (time + person.phase) % (half * 2),
    returning = elapsed >= half;
  const stage = elapsed % half,
    moving = stage < travel;
  const distance = returning
    ? r.length - Math.min(stage, travel) * person.speed
    : Math.min(stage, travel) * person.speed;
  let index = 1;
  while (index < r.distances.length - 1 && r.distances[index] < distance)
    index++;
  const a = r.points[index - 1],
    b = r.points[index];
  const blend =
    (distance - r.distances[index - 1]) /
    (r.distances[index] - r.distances[index - 1]);
  out.x = a.x + (b.x - a.x) * blend;
  out.z = a.z + (b.z - a.z) * blend;
  const turn = moving ? 0 : Math.min(1, (stage - travel) / pause);
  out.heading =
    Math.atan2(b.x - a.x, b.z - a.z) +
    (returning ? Math.PI : 0) +
    turn * Math.PI;
  const fade = moving ? Math.min(1, stage * 3, (travel - stage) * 3) : 0;
  out.stride =
    Math.sin((time + person.phase) * (person.activity === "jogging" ? 9 : 6)) *
    0.58 *
    fade;
  out.moving = moving;
  return out;
}
