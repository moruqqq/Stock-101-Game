import { describe, expect, it } from "vitest";
import { cityProfiles } from "./cityProfiles";
import { cityBuildings } from "./CityEnvironment";
import { buildingsAroundEvents, cityEventSites } from "./eventLocations";
import {
  citizenPose,
  makeCityCrowd,
  MAX_CITIZENS,
  walkable,
  type CitizenPose,
} from "./cityCrowd";
import { gatherAtEvents } from "./eventCrowd";
import { initialEvents, makeOddEvent, type MarketEvent } from "./data";
import { scenarios } from "./scenarios";

function population(city: string, events: MarketEvent[]) {
  const p = cityProfiles[city],
    base = cityBuildings(p);
  const sites = cityEventSites(p, events, base);
  const buildings = buildingsAroundEvents(base, sites);
  const obstacles = [
    ...buildings,
    ...sites
      .filter((s) => !s.water)
      .map((s) => ({ x: s.x, z: s.z, w: 3.4, d: 3.4 })),
  ];
  const original = makeCityCrowd(p, obstacles);
  const crowd = gatherAtEvents(p, buildings, sites, original);
  return { p, sites, buildings, obstacles, original, crowd };
}

describe("On-location audiences", () => {
  it("gives every published city report an audience without increasing the population budget", () => {
    const events = initialEvents(Date.now());
    for (const p of Object.values(cityProfiles)) {
      const { crowd, sites } = population(p.id, events);
      expect(crowd.people.length).toBeLessThanOrEqual(MAX_CITIZENS);
      expect(
        crowd.people.filter((person) => person.activity === "walking").length,
      ).toBeGreaterThan(40);
      expect(crowd.people.some((person) => person.activity === "talking")).toBe(
        true,
      );
      for (const site of sites) {
        const audience = crowd.people.filter(
          (person) => person.gathering?.eventId === site.event.id,
        );
        expect(
          audience.length,
          `${p.id}/${site.event.scenario}`,
        ).toBeGreaterThanOrEqual(6);
        expect(audience.some((person) => person.style % 3 === 0)).toBe(true);
      }
    }
  });

  it("keeps arrivals, spectators and departures out of water, buildings and event models", () => {
    const events = initialEvents(Date.now());
    const pose: CitizenPose = {
      x: 0,
      z: 0,
      heading: 0,
      stride: 0,
      moving: false,
    };
    for (const p of Object.values(cityProfiles)) {
      const { crowd, obstacles, sites } = population(p.id, events);
      for (const person of crowd.people.filter((c) => c.gathering)) {
        const site = sites.find(
          (s) => s.event.id === person.gathering!.eventId,
        )!;
        let moving = 0,
          watching = 0,
          unsafe = false,
          minFacing = 1,
          minDistance = Infinity;
        for (let t = 0; t < 75; t += 0.17) {
          citizenPose(person, t, pose);
          if (!walkable(p, obstacles, pose.x, pose.z)) unsafe = true;
          if (pose.moving) moving++;
          if ((pose.attention ?? 0) > 0.9) {
            watching++;
            const heading = Math.atan2(site.x - pose.x, site.z - pose.z);
            minFacing = Math.min(minFacing, Math.cos(pose.heading - heading));
            minDistance = Math.min(
              minDistance,
              Math.hypot(pose.x - site.x, pose.z - site.z),
            );
          }
        }
        expect(unsafe, p.id + " unsafe audience route").toBe(false);
        expect(minFacing).toBeGreaterThan(0.99);
        expect(minDistance).toBeGreaterThan(site.radius);
        expect(moving).toBeGreaterThan(10);
        expect(watching).toBeGreaterThan(40);
      }
    }
  });

  it("supports all 101 scenarios, including shore-side audiences for water events", () => {
    const now = Date.now();
    for (const [key, scenario] of Object.entries(scenarios)) {
      const { crowd, p, obstacles } = population(scenario.hub, [
        makeOddEvent(key, now, key),
      ]);
      const audience = crowd.people.filter((c) => c.gathering);
      expect(audience.length, key).toBeGreaterThanOrEqual(6);
      for (const person of audience) {
        expect(walkable(p, obstacles, person.x, person.z), key).toBe(true);
      }
    }
  });

  it("walks continuously through arrival, watching, departure and the next arrival", () => {
    const { crowd } = population("ist", [
      makeOddEvent("cats", Date.now(), "cats"),
    ]);
    const previous: CitizenPose = {
      x: 0,
      z: 0,
      heading: 0,
      stride: 0,
      moving: false,
    };
    const next = { ...previous };
    let initiallyWatching = 0,
      initiallyArriving = 0;
    for (const person of crowd.people.filter((c) => c.gathering)) {
      citizenPose(person, 0, previous);
      if ((previous.attention ?? 0) > 0.9) initiallyWatching++;
      if (previous.moving) initiallyArriving++;
      for (let t = 0.07; t < 100; t += 0.07) {
        citizenPose(person, t, next);
        expect(
          Math.hypot(next.x - previous.x, next.z - previous.z),
        ).toBeLessThanOrEqual(person.speed * 0.071);
        Object.assign(previous, next);
      }
    }
    expect(initiallyWatching).toBeGreaterThan(4);
    expect(initiallyArriving).toBeGreaterThan(2);
  });
});
