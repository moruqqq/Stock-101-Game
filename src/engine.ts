import {
  hubs,
  isTrading,
  sectorImpact,
  type Company,
  type MarketEvent,
} from "./data";
export interface Holding {
  symbol: string;
  quantity: number;
  average: number;
}
export interface Account {
  cash: number;
  holdings: Holding[];
}
export const startingAccount: Account = {
  cash: 24820,
  holdings: [
    { symbol: "THRA", quantity: 100, average: 72.4 },
    { symbol: "NOVA", quantity: 40, average: 229.76 },
    { symbol: "TKYO", quantity: 120, average: 4371.8 },
    { symbol: "KERN", quantity: 24, average: 84.2 },
  ],
};
export function executeOrder(
  account: Account,
  company: Company,
  side: "BUY" | "SELL",
  quantity: number,
  now: number,
): Account {
  if (!Number.isSafeInteger(quantity) || quantity <= 0)
    throw new Error("Enter a whole number of shares.");
  const hub = hubs.find((h) => h.id === company.hub)!;
  if (!isTrading(hub, now))
    throw new Error(
      "This exchange is closed. Try an open market or advance the simulation clock.",
    );
  const cost = quantity * company.price * hub.fx,
    held = account.holdings.find((h) => h.symbol === company.symbol);
  if (side === "BUY" && cost > account.cash)
    throw new Error("Insufficient available cash.");
  if (side === "SELL" && (!held || held.quantity < quantity))
    throw new Error("You do not own that many shares.");
  const holdings = account.holdings.filter((h) => h.symbol !== company.symbol);
  const newQuantity =
    (held?.quantity ?? 0) + (side === "BUY" ? quantity : -quantity);
  if (newQuantity > 0)
    holdings.push({
      symbol: company.symbol,
      quantity: newQuantity,
      average:
        side === "BUY"
          ? ((held?.quantity ?? 0) * (held?.average ?? 0) +
              quantity * company.price) /
            newQuantity
          : held!.average,
    });
  return {
    cash:
      Math.round((account.cash + (side === "BUY" ? -cost : cost)) * 100) / 100,
    holdings,
  };
}
export function movePrices(
  companies: Company[],
  events: MarketEvent[],
  now: number,
  random = Math.random,
): Company[] {
  const globalTrend = Math.sin(now / 3600000) * 0.00012;
  return companies.map((c) => {
    const h = hubs.find((h) => h.id === c.hub)!;
    if (!isTrading(h, now)) return c;
    const eventImpact = events.reduce((sum, e) => {
      const age = (now - e.timestamp) / 3600000;
      if (age < 0 || age > 2) return sum;
      const relevant = e.companies.includes(c.symbol)
        ? 1
        : e.sectors.includes(c.sector) &&
            (e.scope === "GLOBAL" ||
              (e.scope === "REGIONAL" &&
                hubs.find((h) => h.id === e.hub)?.region === h.region) ||
              (e.scope === "LOCAL" && e.hub === c.hub))
          ? 0.4
          : 0;
      return (
        sum + sectorImpact(e, c.sector) * relevant * (1 - age / 2) * 0.0025
      );
    }, 0);
    const regionTrend = Math.sin(now / 5400000 + h.lat) * 0.00015,
      sectorTrend = Math.cos(now / 4200000 + c.sector.length) * 0.00012;
    const price = Math.max(
      0.01,
      Math.round(
        c.price *
          (1 +
            globalTrend +
            regionTrend +
            sectorTrend +
            c.sentiment * 0.0004 +
            Math.max(-0.004, Math.min(0.004, eventImpact)) +
            (random() - 0.5) * c.volatility) *
          100,
      ) / 100,
    );
    return {
      ...c,
      price,
      high: Math.max(price, c.high),
      low: Math.min(price, c.low),
      volume: c.volume + Math.round(random() * 9000),
      history: [...c.history.slice(-95), price],
      flash: price > c.price ? 1 : price < c.price ? -1 : 0,
    };
  });
}
export function accountValue(account: Account, companies: Company[]) {
  return (
    account.cash +
    account.holdings.reduce((sum, h) => {
      const c = companies.find((c) => c.symbol === h.symbol)!;
      return sum + h.quantity * c.price * hubs.find((h) => h.id === c.hub)!.fx;
    }, 0)
  );
}
