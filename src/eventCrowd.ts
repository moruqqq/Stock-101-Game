import {
  walkable,
  MAX_CITIZENS,
  type Citizen,
  type WalkPoint,
  type makeCityCrowd,
} from "./cityCrowd";
import type { CityProfile } from "./cityProfiles";
import type { CityEventSite } from "./eventLocations";

type Footprint = { x: number; z: number; w: number; d: number };

// Share the existing population and its three draw calls. Every report gets an
// audience, including reports not currently selected by the camera.
export function gatherAtEvents(
  profile: CityProfile,
  buildings: Footprint[],
  sites: CityEventSite[],
  crowd: ReturnType<typeof makeCityCrowd>,
) {
  if (!sites.length) return crowd;
  const budget = Math.min(72, Math.floor(crowd.people.length / 2));
  const obstacles = [
    ...buildings,
    ...sites
      .filter((s) => !s.water)
      .map((s) => ({
        x: s.x,
        z: s.z,
        w: 3.4,
        d: 3.4,
      })),
  ];
  const occupied: WalkPoint[] = [];
  const observers: Citizen[] = [];
  const ordered = sites
    .slice()
    .sort((a, b) =>
      (a.event.scenario ?? a.event.id).localeCompare(
        b.event.scenario ?? b.event.id,
      ),
    );
  const clear = (x: number, z: number) =>
    Math.abs(x) < 20.2 &&
    Math.abs(z) < 18.2 &&
    walkable(profile, obstacles, x, z, 0.31);
  for (const site of ordered) {
    const count = Math.min(12, Math.floor(budget / sites.length));
    const hash = (site.event.scenario ?? site.event.id)
      .split("")
      .reduce((n, c) => n + c.charCodeAt(0), 0);
    let added = 0;
    // Staggered arcs of spectators instead of a perfectly regular ring. Water
    // reports search farther for a safe place on the actual shoreline.
    for (let ring = 0; ring < (site.water ? 16 : 7) && added < count; ring++) {
      const radius = site.radius + 0.65 + ring * 0.42;
      for (let slot = 0; slot < 40 && added < count; slot++) {
        const angle = hash * 0.37 + slot * 2.399963 + ring * 0.31;
        const r = radius + Math.sin(slot * 7 + hash) * 0.13;
        const x = site.x + Math.sin(angle) * r;
        const z = site.z + Math.cos(angle) * r;
        if (
          !clear(x, z) ||
          occupied.some((q) => Math.hypot(q.x - x, q.z - z) < 0.52)
        )
          continue;
        // Validate every step of a short approach, never walking through a
        // building, a reconstruction or water to reach the viewing spot.
        let start: WalkPoint | undefined;
        let length = 0;
        for (const offset of [0, -0.6, 0.6, -1.1, 1.1]) {
          const dx = Math.sin(angle + offset),
            dz = Math.cos(angle + offset);
          let distance = 0;
          const reach = 1.4 + (added % 4) * 0.35;
          for (let d = 0.12; d <= reach; d += 0.12) {
            if (!clear(x + dx * d, z + dz * d)) break;
            distance = d;
          }
          if (distance > length) {
            length = distance;
            start = { x: x + dx * distance, z: z + dz * distance };
          }
        }
        if (!start || length < 0.6) continue;
        const speed = 0.31 + (added % 4) * 0.028;
        const travel = length / speed;
        const wait = 0.8 + (added % 3) * 0.6;
        const linger = 25 + (added % 5) * 4;
        observers.push({
          x,
          z,
          heading: Math.atan2(site.x - x, site.z - z),
          route: null,
          speed,
          // A crowd is already watching when discovered; others are arriving.
          phase:
            added % 3 === 0
              ? wait + travel * 0.12
              : wait + travel + 2 + (added % 5) * 2,
          scale: 0.89 + (added % 4) * 0.055,
          style: (hash + added * 7) % 100,
          activity: "watching",
          gathering: {
            eventId: site.event.id,
            focus: { x: site.x, z: site.z },
            start,
            wait,
            linger,
          },
        });
        occupied.push({ x, z });
        added++;
      }
    }
  }
  const remaining =
    Math.min(MAX_CITIZENS, crowd.people.length) - observers.length;
  const chatting = crowd.people
    .filter((person) => person.activity === "talking")
    .slice(0, 18);
  const roaming = crowd.people
    .filter((person) => person.activity !== "talking")
    .slice(0, remaining - chatting.length);
  return { ...crowd, people: [...roaming, ...chatting, ...observers] };
}
