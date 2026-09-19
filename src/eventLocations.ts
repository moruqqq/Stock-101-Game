import type { MarketEvent } from "./data";
import { isWater, type CityProfile } from "./cityProfiles";

type Building = { x: number; z: number; w: number; d: number };
export type CityEventSite = {
  event: MarketEvent;
  x: number;
  z: number;
  radius: number;
  water: boolean;
};
export function cityEventSites(
  p: CityProfile,
  events: MarketEvent[],
  buildings: Building[],
) {
  const seen = new Set<string>();
  const unique = events.filter((event) => {
    const key = event.scenario ?? event.id;
    if (event.hub !== p.id || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  // Deterministic locations for the city's current set of reports.
  const sites: CityEventSite[] = [];
  for (const event of unique
    .slice()
    .sort((a, b) => (a.scenario ?? a.id).localeCompare(b.scenario ?? b.id))) {
    const hash = (event.scenario ?? event.id)
      .split("")
      .reduce((a, c) => a + c.charCodeAt(0), 0);
    const district = p.districts[hash % p.districts.length];
    const wantsWater = event.scene === "ducks";
    let best: { x: number; z: number; score: number; water: boolean } | null =
      null;
    for (let x = -19; x <= 19; x += 1.5)
      for (let z = -17; z <= 17; z += 1.5) {
        const wet = isWater(p, x, z);
        if (wet !== wantsWater) continue;
        if (
          [-1.6, 0, 1.6].some((dx) =>
            [-1.6, 0, 1.6].some((dz) => isWater(p, x + dx, z + dz) !== wet),
          )
        )
          continue;
        if (
          p.landmarks.some(
            (l) => Math.hypot(x - l.x, z - l.z) < (l.scale ?? 1) * 1.6 + 2,
          )
        )
          continue;
        if (sites.some((s) => Math.hypot(x - s.x, z - s.z) < 4.7)) continue;
        const overlap = buildings.filter(
          (b) => Math.hypot(x - b.x, z - b.z) < 2.4,
        ).length;
        const score =
          Math.hypot(x - district.x, z - district.z) * 0.2 + overlap * 1.2;
        if (!best || score < best.score) best = { x, z, score, water: wet };
      }
    if (best)
      sites.push({
        event,
        x: best.x,
        z: best.z,
        radius: 2.25,
        water: best.water,
      });
  }
  return sites.sort((a, b) => b.event.timestamp - a.event.timestamp);
}

export function buildingsAroundEvents<T extends Building>(
  buildings: T[],
  sites: CityEventSite[],
): T[] {
  return buildings.filter(
    (b) =>
      !sites.some(
        (s) => !s.water && Math.hypot(b.x - s.x, b.z - s.z) < s.radius + 0.55,
      ),
  );
}
