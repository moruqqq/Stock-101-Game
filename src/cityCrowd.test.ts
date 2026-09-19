import { describe, expect, it } from "vitest";
import { cityProfiles, isWater } from "./cityProfiles";
import { cityBuildings } from "./CityEnvironment";
import { citizenPose, makeCityCrowd, MAX_CITIZENS } from "./cityCrowd";

describe("City residents", () => {
  it("keeps moving residents and conversations on land and outside buildings in every city", () => {
    for (const p of Object.values(cityProfiles)) {
      const buildings = cityBuildings(p),
        { people } = makeCityCrowd(p, buildings);
      expect(people.length, p.id).toBeGreaterThanOrEqual(108);
      expect(people.length).toBeLessThanOrEqual(MAX_CITIZENS);
      expect(people.some((person) => person.activity === "talking")).toBe(true);
      expect(people.some((person) => person.route?.kind === "quay")).toBe(true);
      for (const person of people) {
        const duration = person.route
          ? (person.route.length / person.speed) * 2 + 4.8
          : 1;
        const out = { x: 0, z: 0, heading: 0, stride: 0, moving: false };
        for (let t = 0; t < duration; t += 0.43) {
          citizenPose(person, t, out);
          expect(isWater(p, out.x, out.z), p.id + " resident in water").toBe(
            false,
          );
          // Independent footprint check, including the person's shoulders.
          const collision = buildings.some(
            (b) =>
              Math.abs(out.x - b.x) < b.w / 2 + 0.17 &&
              Math.abs(out.z - b.z) < b.d / 2 + 0.17,
          );
          expect(collision, p.id + " resident inside building").toBe(false);
          expect(Number.isFinite(out.heading)).toBe(true);
        }
      }
    }
  });
  it("walks continuously through route reversals, pausing instead of teleporting", () => {
    const p = cityProfiles.ist,
      crowd = makeCityCrowd(p, cityBuildings(p));
    const person = crowd.people.find((c) => c.route && c.route.length > 2)!;
    const previous = { x: 0, z: 0, heading: 0, stride: 0, moving: false };
    const next = { ...previous };
    const duration = (person.route!.length / person.speed) * 4 + 10;
    let moving = 0,
      waiting = 0;
    citizenPose(person, 0, previous);
    for (let t = 0.05; t < duration; t += 0.05) {
      citizenPose(person, t, next);
      expect(
        Math.hypot(next.x - previous.x, next.z - previous.z),
      ).toBeLessThanOrEqual(person.speed * 0.051);
      if (next.moving) moving++;
      else waiting++;
      Object.assign(previous, next);
    }
    expect(moving).toBeGreaterThan(20);
    expect(waiting).toBeGreaterThan(20);
  });
});
