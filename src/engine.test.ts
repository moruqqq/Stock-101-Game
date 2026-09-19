import { describe, it, expect } from "vitest";
import { createEvent, hubs, makeCompanies, session, localTime } from "./data";
import {
  executeOrder,
  movePrices,
  accountValue,
  startingAccount,
} from "./engine";
const ist = hubs.find((h) => h.id === "ist")!;
const at = (time: string) => Date.parse(`2026-09-15T${time}+03:00`);
describe("Exchange clocks", () => {
  it.each([
    ["07:59:59", "CLOSED"],
    ["08:00:00", "PRE-MARKET"],
    ["09:59:59", "PRE-MARKET"],
    ["10:00:00", "OPEN"],
    ["17:44:59", "OPEN"],
    ["17:45:00", "CLOSING"],
    ["18:00:00", "CLOSED"],
  ])("Istanbul at %s is %s", (time, status) =>
    expect(session(ist, at(time)).status).toBe(status),
  );
  it("counts down across midnight", () =>
    expect(session(ist, at("23:00:00")).remaining).toBe(11 * 3600));
  it("accounts for daylight saving in New York", () => {
    expect(
      localTime(Date.parse("2026-07-01T14:00:00Z"), "America/New_York"),
    ).toBe("10:00");
    expect(
      localTime(Date.parse("2026-01-01T14:00:00Z"), "America/New_York"),
    ).toBe("09:00");
  });
});
describe("Portfolio settlement", () => {
  const companies = makeCompanies(),
    company = companies.find((c) => c.symbol === "THRA")!;
  it("converts TRY to USD, updates weighted cost, and preserves total value", () => {
    const before = accountValue(startingAccount, companies),
      next = executeOrder(startingAccount, company, "BUY", 100, at("14:30:00"));
    expect(next.cash).toBe(24575.82);
    expect(next.holdings.find((h) => h.symbol === "THRA")).toEqual({
      symbol: "THRA",
      quantity: 200,
      average: 78.3,
    });
    expect(accountValue(next, companies)).toBeCloseTo(before, 2);
    expect(startingAccount.holdings[0].quantity).toBe(100);
  });
  it("removes a fully sold holding and credits proceeds", () => {
    const next = executeOrder(
      startingAccount,
      company,
      "SELL",
      100,
      at("14:30:00"),
    );
    expect(next.cash).toBe(25064.18);
    expect(next.holdings.find((h) => h.symbol === "THRA")).toBeUndefined();
  });
  it.each([0, -1, 1.5, Infinity, NaN])("rejects invalid quantity %s", (n) =>
    expect(() =>
      executeOrder(startingAccount, company, "BUY", n, at("14:30:00")),
    ).toThrow("whole number"),
  );
  it("rejects overdrafts, overselling, and closed-market execution", () => {
    expect(() =>
      executeOrder(startingAccount, company, "BUY", 100000, at("14:30:00")),
    ).toThrow("cash");
    expect(() =>
      executeOrder(startingAccount, company, "SELL", 101, at("14:30:00")),
    ).toThrow("own");
    expect(() =>
      executeOrder(startingAccount, company, "BUY", 1, at("18:00:00")),
    ).toThrow("closed");
  });
});
describe("Market movement", () => {
  it("freezes closed exchanges and moves open exchanges", () => {
    const before = makeCompanies(),
      after = movePrices(before, [], at("14:30:00"), () => 0.9);
    expect(after.find((c) => c.symbol === "TKYO")!.price).toBe(
      before.find((c) => c.symbol === "TKYO")!.price,
    );
    expect(after.find((c) => c.symbol === "THRA")!.price).not.toBe(
      before.find((c) => c.symbol === "THRA")!.price,
    );
  });
  it("keeps local sector effects local and ignores future and expired events", () => {
    const before = makeCompanies(),
      now = at("14:30:00"),
      baseline = movePrices(before, [], now, () => 0.5),
      event = createEvent(
        "test",
        "ist",
        "LOCAL",
        "Company",
        "Local news",
        ["Banking"],
        [],
        2,
        now,
      );
    const after = movePrices(before, [event], now, () => 0.5);
    expect(after.find((c) => c.symbol === "ANSA")!.price).toBeGreaterThan(
      baseline.find((c) => c.symbol === "ANSA")!.price,
    );
    expect(after.find((c) => c.symbol === "CRWN")!.price).toBe(
      baseline.find((c) => c.symbol === "CRWN")!.price,
    );
    expect(
      movePrices(before, [{ ...event, timestamp: now + 1000 }], now, () => 0.5),
    ).toEqual(baseline);
    expect(
      movePrices(
        before,
        [{ ...event, timestamp: now - 3 * 3600000 }],
        now,
        () => 0.5,
      ),
    ).toEqual(baseline);
  });
  it("bounds history and prices", () => {
    const c = makeCompanies()[0];
    c.history = Array(200).fill(c.price);
    const next = movePrices([c], [], at("14:30:00"), () => 0)[0];
    expect(next.history.length).toBe(96);
    expect(next.price).toBeGreaterThan(0);
    expect(next.high).toBeGreaterThanOrEqual(next.price);
    expect(next.low).toBeLessThanOrEqual(next.price);
  });
});

describe("Odd news has concrete market consequences", () => {
  it("new African lakes help global shipping but hurt mining in another open region", async () => {
    const { makeOddEvent } = await import("./data");
    const now = Date.parse("2026-09-15T02:00:00Z"),
      companies = makeCompanies();
    const baseline = movePrices(companies, [], now, () => 0.5);
    const changed = movePrices(
      companies,
      [makeOddEvent("lakes", now, "test-lakes")],
      now,
      () => 0.5,
    );
    expect(changed.find((c) => c.symbol === "STRA")!.price).toBeGreaterThan(
      baseline.find((c) => c.symbol === "STRA")!.price,
    );
    expect(changed.find((c) => c.symbol === "OPAL")!.price).toBeLessThan(
      baseline.find((c) => c.symbol === "OPAL")!.price,
    );
    expect(changed.find((c) => c.symbol === "POND")!.price).toBe(
      companies.find((c) => c.symbol === "POND")!.price,
    );
  });
  it("the cat takeover boosts Istanbul technology without changing New York technology", async () => {
    const { makeOddEvent } = await import("./data");
    const now = Date.parse("2026-09-15T14:30:00Z"),
      companies = makeCompanies();
    const baseline = movePrices(companies, [], now, () => 0.5),
      changed = movePrices(
        companies,
        [makeOddEvent("cats", now, "test-cats")],
        now,
        () => 0.5,
      );
    expect(changed.find((c) => c.symbol === "THRA")!.price).toBeGreaterThan(
      baseline.find((c) => c.symbol === "THRA")!.price,
    );
    expect(changed.find((c) => c.symbol === "NOVA")!.price).toBe(
      baseline.find((c) => c.symbol === "NOVA")!.price,
    );
  });
  it("the moon bill puts downward pressure on every open sector", async () => {
    const { makeOddEvent, isTrading } = await import("./data");
    const now = at("14:30:00"),
      companies = makeCompanies(),
      baseline = movePrices(companies, [], now, () => 0.5),
      changed = movePrices(
        companies,
        [makeOddEvent("moon", now, "test-moon")],
        now,
        () => 0.5,
      );
    companies.forEach((c, i) => {
      if (
        isTrading(
          hubs.find((h) => h.id === c.hub)!,
          now,
        )
      )
        expect(changed[i].price).toBeLessThan(baseline[i].price);
      else expect(changed[i].price).toBe(c.price);
    });
  });
  it("displayed sector directions agree with the event engine, including mixed effects", async () => {
    const { makeOddEvent, sectorImpact } = await import("./data");
    const event = makeOddEvent("lakes", Date.now(), "test-directions");
    expect(sectorImpact(event, "Logistics")).toBeGreaterThan(0);
    expect(sectorImpact(event, "Mining")).toBeLessThan(0);
    expect(event.effects?.Mining).toBe(sectorImpact(event, "Mining"));
  });
});
