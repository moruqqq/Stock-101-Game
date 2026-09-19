import { describe, expect, it } from "vitest";
import { cityProfiles, isWater } from "./cityProfiles";
import { cityBuildings } from "./CityEnvironment";
import { cityEventSites, buildingsAroundEvents } from "./eventLocations";
import { initialEvents, makeOddEvent } from "./data";
import { scenarios } from "./scenarios";
describe("News on the city map", () => {
  it("places every published report in its own city and clears space for its animation", () => {
    const events = initialEvents(Date.now());
    for (const p of Object.values(cityProfiles)) {
      const base = cityBuildings(p),
        local = events.filter((e) => e.hub === p.id);
      const sites = cityEventSites(p, local, base),
        buildings = buildingsAroundEvents(base, sites);
      expect(sites.length, p.id).toBe(local.length);
      for (const site of sites) {
        expect(site.event.hub).toBe(p.id);
        expect(isWater(p, site.x, site.z)).toBe(site.water);
        expect(
          buildings.every(
            (b) => Math.hypot(b.x - site.x, b.z - site.z) >= site.radius + 0.55,
          ),
        ).toBe(true);
      }
    }
  });
  it("supports every story reconstruction and keeps only the latest duplicate report marker", () => {
    const now = Date.now();
    for (const [key, template] of Object.entries(scenarios)) {
      const p = cityProfiles[template.hub],
        event = makeOddEvent(key, now, "new-" + key);
      const sites = cityEventSites(
        p,
        [event, makeOddEvent(key, now - 60000, "old-" + key)],
        cityBuildings(p),
      );
      expect(sites.length, key).toBe(1);
      expect(sites[0].event.id).toBe(event.id);
      expect(sites[0].event.scene).toBe(template.scene);
    }
  });
});
