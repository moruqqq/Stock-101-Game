import { describe, expect, it } from "vitest";
import { scenarios, scenarioKeys, nextReportKey } from "./scenarios";
import { hubs, initialEvents, makeOddEvent, makeCompanies } from "./data";
import { movePrices } from "./engine";
import { cityProfiles, isWater } from "./cityProfiles";
import { cityBuildings } from "./CityEnvironment";

describe("World coverage and developing reports", () => {
  it("provides over 100 distinct reports with valid geography, sectors and reconstruction captions", () => {
    expect(scenarioKeys.length).toBeGreaterThanOrEqual(100);
    expect(new Set(Object.values(scenarios).map((s) => s.headline)).size).toBe(
      scenarioKeys.length,
    );
    const sectors = new Set(makeCompanies().map((c) => c.sector));
    for (const report of Object.values(scenarios)) {
      expect(hubs.some((h) => h.id === report.hub)).toBe(true);
      expect(report.body.length).toBeGreaterThan(90);
      expect(report.captions).toHaveLength(3);
      for (const [sector, impact] of Object.entries(report.effects)) {
        expect(sectors.has(sector)).toBe(true);
        expect(Number.isFinite(impact)).toBe(true);
      }
    }
    for (const h of hubs)
      expect(
        Object.values(scenarios).filter((s) => s.hub === h.id).length,
      ).toBeGreaterThanOrEqual(6);
  });
  it("publishes the coffee transition in causal order without prepublishing successors", () => {
    const initial = initialEvents(Date.now()),
      seen = initial.map((e) => e.scenario!);
    expect(seen).not.toContain("coffee_engines");
    expect(nextReportKey(seen, () => 0)).toBe("coffee_engines");
    seen.unshift("coffee_engines");
    expect(nextReportKey(seen, () => 0)).toBe("coffee_fuel");
    seen.unshift("coffee_fuel");
    expect(nextReportKey(seen, () => 0)).toBe("coffee_shortage");
    seen.unshift("coffee_shortage");
    expect(["coffee_engines", "coffee_fuel", "coffee_shortage"]).not.toContain(
      nextReportKey(seen, () => 0),
    );
  });
  it("a European engine certification boosts open automotive firms and depresses mining elsewhere", () => {
    const now = Date.parse("2026-09-15T13:30:00Z"),
      companies = makeCompanies(),
      baseline = movePrices(companies, [], now, () => 0.5);
    const changed = movePrices(
      companies,
      [makeOddEvent("coffee_engines", now, "chain-test")],
      now,
      () => 0.5,
    );
    const auto = companies.findIndex((c) => c.symbol === "VOLT");
    expect(changed[auto].price).toBeGreaterThan(baseline[auto].price);
    const miners = companies
      .map((c, i) => ({ c, i }))
      .filter(
        ({ c }) =>
          c.sector === "Mining" &&
          baseline.find((b) => b.symbol === c.symbol)!.price !== undefined,
      );
    expect(
      miners.some(({ c, i }) => changed[i].price < baseline[i].price),
    ).toBe(true);
  });
  it("bounds compounded shocks as the report archive grows", () => {
    const now = Date.parse("2026-09-15T13:30:00Z"),
      companies = makeCompanies();
    const events = Array.from({ length: 160 }, (_, i) =>
      makeOddEvent("moon", now, "stress-" + i),
    );
    const next = movePrices(companies, events, now, () => 0.5);
    companies.forEach((c, i) =>
      expect(Math.abs(next[i].price / c.price - 1)).toBeLessThan(0.006),
    );
  });
});
describe("Distinct grounded cities", () => {
  it("covers every hub with named districts, local landmarks and a bounded urban footprint", () => {
    for (const h of hubs) {
      const p = cityProfiles[h.id];
      expect(p).toBeDefined();
      expect(p.districts).toHaveLength(3);
      expect(p.landmarks.length).toBeGreaterThan(0);
      const buildings = cityBuildings(p);
      expect(buildings.length).toBeGreaterThan(60);
      expect(buildings.length).toBeLessThan(360);
      expect(
        buildings.every((b) => !isWater(p, b.x, b.z) && Number.isFinite(b.y)),
      ).toBe(true);
    }
  });
  it("preserves Istanbul's strait, London's river and recognisable independent silhouettes", () => {
    const ist = cityProfiles.ist,
      lon = cityProfiles.lon;
    expect(ist.terrain).toBe("strait");
    expect(lon.terrain).toBe("river");
    expect(ist.landmarks.map((l) => l.kind)).toEqual(
      expect.arrayContaining(["galata", "mosque", "bridge"]),
    );
    expect(lon.landmarks.map((l) => l.kind)).toEqual(
      expect.arrayContaining(["bigben", "wheel", "bridge"]),
    );
    expect(isWater(ist, 3, 0)).toBe(true);
    expect(isWater(lon, 0, 1)).toBe(true);
  });
});
