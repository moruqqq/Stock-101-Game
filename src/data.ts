export type Region = "Americas" | "Europe" | "Asia" | "Middle East" | "Oceania";
export type Status = "OPEN" | "CLOSING" | "PRE-MARKET" | "CLOSED";
export interface Hub {
  id: string;
  name: string;
  country: string;
  region: Region;
  lat: number;
  lng: number;
  zone: string;
  open: number;
  close: number;
  currency: string;
  mark: string;
  fx: number;
  index: number;
  change: number;
}
export const hubs: Hub[] = [
  {
    id: "nyc",
    name: "New York",
    country: "United States",
    region: "Americas",
    lat: 40.71,
    lng: -74.01,
    zone: "America/New_York",
    open: 570,
    close: 960,
    currency: "USD",
    mark: "$",
    fx: 1,
    index: 5842.38,
    change: 1.24,
  },
  {
    id: "lon",
    name: "London",
    country: "United Kingdom",
    region: "Europe",
    lat: 51.51,
    lng: -0.13,
    zone: "Europe/London",
    open: 480,
    close: 990,
    currency: "GBP",
    mark: "£",
    fx: 1.27,
    index: 8246.72,
    change: 0.68,
  },
  {
    id: "ist",
    name: "Istanbul",
    country: "Türkiye",
    region: "Europe",
    lat: 41.01,
    lng: 28.98,
    zone: "Europe/Istanbul",
    open: 600,
    close: 1080,
    currency: "TRY",
    mark: "₺",
    fx: 0.029,
    index: 12482.32,
    change: 1.42,
  },
  {
    id: "fra",
    name: "Frankfurt",
    country: "Germany",
    region: "Europe",
    lat: 50.11,
    lng: 8.68,
    zone: "Europe/Berlin",
    open: 540,
    close: 1050,
    currency: "EUR",
    mark: "€",
    fx: 1.08,
    index: 18942.64,
    change: 0.92,
  },
  {
    id: "par",
    name: "Paris",
    country: "France",
    region: "Europe",
    lat: 48.86,
    lng: 2.35,
    zone: "Europe/Paris",
    open: 540,
    close: 1050,
    currency: "EUR",
    mark: "€",
    fx: 1.08,
    index: 7623.41,
    change: -0.24,
  },
  {
    id: "tok",
    name: "Tokyo",
    country: "Japan",
    region: "Asia",
    lat: 35.68,
    lng: 139.69,
    zone: "Asia/Tokyo",
    open: 540,
    close: 900,
    currency: "JPY",
    mark: "¥",
    fx: 0.0067,
    index: 38482.18,
    change: 2.18,
  },
  {
    id: "hkg",
    name: "Hong Kong",
    country: "Hong Kong",
    region: "Asia",
    lat: 22.32,
    lng: 114.17,
    zone: "Asia/Hong_Kong",
    open: 570,
    close: 960,
    currency: "HKD",
    mark: "HK$",
    fx: 0.128,
    index: 17842.64,
    change: 1.06,
  },
  {
    id: "sha",
    name: "Shanghai",
    country: "China",
    region: "Asia",
    lat: 31.23,
    lng: 121.47,
    zone: "Asia/Shanghai",
    open: 570,
    close: 900,
    currency: "CNY",
    mark: "CN¥",
    fx: 0.14,
    index: 3024.62,
    change: 0.54,
  },
  {
    id: "sin",
    name: "Singapore",
    country: "Singapore",
    region: "Asia",
    lat: 1.35,
    lng: 103.82,
    zone: "Asia/Singapore",
    open: 540,
    close: 1020,
    currency: "SGD",
    mark: "S$",
    fx: 0.74,
    index: 3342.81,
    change: 0.82,
  },
  {
    id: "dub",
    name: "Dubai",
    country: "UAE",
    region: "Middle East",
    lat: 25.2,
    lng: 55.27,
    zone: "Asia/Dubai",
    open: 600,
    close: 900,
    currency: "AED",
    mark: "د.إ",
    fx: 0.272,
    index: 4286.14,
    change: 1.82,
  },
  {
    id: "syd",
    name: "Sydney",
    country: "Australia",
    region: "Oceania",
    lat: -33.87,
    lng: 151.21,
    zone: "Australia/Sydney",
    open: 600,
    close: 960,
    currency: "AUD",
    mark: "A$",
    fx: 0.66,
    index: 7892.43,
    change: -0.42,
  },
  {
    id: "tor",
    name: "Toronto",
    country: "Canada",
    region: "Americas",
    lat: 43.65,
    lng: -79.38,
    zone: "America/Toronto",
    open: 570,
    close: 960,
    currency: "CAD",
    mark: "C$",
    fx: 0.73,
    index: 22418.66,
    change: 0.36,
  },
  {
    id: "mum",
    name: "Mumbai",
    country: "India",
    region: "Asia",
    lat: 19.08,
    lng: 72.88,
    zone: "Asia/Kolkata",
    open: 555,
    close: 930,
    currency: "INR",
    mark: "₹",
    fx: 0.012,
    index: 74246.28,
    change: 1.12,
  },
  {
    id: "sao",
    name: "São Paulo",
    country: "Brazil",
    region: "Americas",
    lat: -23.55,
    lng: -46.63,
    zone: "America/Sao_Paulo",
    open: 600,
    close: 1020,
    currency: "BRL",
    mark: "R$",
    fx: 0.2,
    index: 128642.12,
    change: -0.64,
  },
];
export interface Company {
  symbol: string;
  name: string;
  hub: string;
  country: string;
  city: string;
  coordinates: [number, number];
  sector: string;
  price: number;
  previousClose: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  marketCap: number;
  PE: number;
  revenue: number;
  profit: number;
  debt: number;
  growth: number;
  volatility: number;
  sentiment: number;
  history: number[];
  flash: number;
}
const seeds: [string, string, string, string, number, number][] = [
  ["THRA", "Thrace Technologies", "ist", "Technology", 84.2, 7.4],
  ["ANSA", "Ansa Bank", "ist", "Banking", 142.8, 5.1],
  ["MARM", "Marmara Industries", "ist", "Industrial", 32.1, -4.8],
  ["VOLT", "Volt Mobility", "ist", "Automotive", 62.1, 1.2],
  ["NOVA", "Nova Industries", "nyc", "Technology", 248.6, 2.42],
  ["ATLS", "Atlas Air", "nyc", "Airlines", 68.2, -1.3],
  ["CRWN", "Crown Capital", "lon", "Banking", 124.8, 0.94],
  ["BRDG", "Bridge Logistics", "lon", "Logistics", 48.4, 1.6],
  ["RHEI", "Rhein Motors", "fra", "Automotive", 184.2, 1.3],
  ["KERN", "Kern Semiconductors", "fra", "Semiconductors", 96.7, 3.4],
  ["LUMI", "Lumière Retail", "par", "Retail", 242.6, -0.8],
  ["AVEN", "Avenir Energy", "par", "Energy", 56.7, 1.2],
  ["TKYO", "Tokyo Micro Systems", "tok", "Semiconductors", 4280, 4.2],
  ["HIKR", "Hikari Motors", "tok", "Automotive", 2840, -2.1],
  ["JADE", "Jade Networks", "hkg", "Technology", 186.4, 2.8],
  ["HBR", "Harbour Commerce", "hkg", "Retail", 42.6, -0.7],
  ["SHEN", "Shenlong Industrial", "sha", "Industrial", 68.3, 1.5],
  ["YUN", "Yun Semiconductor", "sha", "Semiconductors", 124.8, 3.2],
  ["STRA", "Straits Shipping", "sin", "Logistics", 24.6, 1.1],
  ["ORCH", "Orchid Bank", "sin", "Banking", 38.2, 0.8],
  ["DUNE", "Dune Energy", "dub", "Energy", 42.8, 3.6],
  ["FLCN", "Falcon Airways", "dub", "Airlines", 18.4, -1.8],
  ["OPAL", "Opal Resources", "syd", "Mining", 86.3, -0.4],
  ["SOUT", "Southern Retail", "syd", "Retail", 32.8, 0.6],
  ["MPL", "Maple Resources", "tor", "Mining", 48.2, 1.4],
  ["NORD", "Nordic Grid", "tor", "Energy", 64.7, 0.7],
  ["VEDA", "Veda Systems", "mum", "Technology", 1842, 2.2],
  ["INDR", "Indra Bank", "mum", "Banking", 842, 1.1],
  ["VERD", "Verde Energy", "sao", "Energy", 38.2, 1.8],
  ["PRTA", "Porta Logistics", "sao", "Logistics", 24.6, -0.9],
];
export function makeHistory(price: number, change: number, count = 64) {
  return Array.from(
    { length: count },
    (_, i) =>
      price *
      (1 -
        (change / 100) * (1 - i / (count - 1)) +
        (Math.sin(i * 1.7) * 0.002 + Math.sin(i * 0.47) * 0.005) *
          (i === count - 1 ? 0 : 1)),
  );
}
export function makeCompanies(): Company[] {
  return seeds.map(([symbol, name, hub, sector, price, change], i) => {
    const h = hubs.find((h) => h.id === hub)!;
    return {
      symbol,
      name,
      hub,
      sector,
      price,
      previousClose: price / (1 + change / 100),
      open: price / (1 + change / 100),
      high: price * 1.012,
      low: (price / (1 + Math.abs(change) / 100)) * 0.988,
      volume: 4200000 + i * 125300,
      marketCap: price * (510000000 + i * 28000000),
      PE: 18.2 + (i % 16),
      revenue: (8.4 + i * 0.74) * 1e9,
      profit: (1.1 + i * 0.12) * 1e9,
      debt: (2.8 + i * 0.21) * 1e9,
      growth: 18.4 - i * 0.32,
      volatility: 0.002 + (i % 4) * 0.0007,
      sentiment: change * 0.01,
      country: h.country,
      city: h.name,
      coordinates: [h.lat, h.lng],
      history: makeHistory(price, change),
      flash: 0,
    };
  });
}
export type Scope = "GLOBAL" | "REGIONAL" | "LOCAL";
export interface MarketEvent {
  id: string;
  hub: string;
  location: string;
  latitude: number;
  longitude: number;
  scope: Scope;
  category: string;
  headline: string;
  body: string;
  sectors: string[];
  companies: string[];
  impact: number;
  timestamp: number;
}
export function createEvent(
  id: string,
  hub: string,
  scope: Scope,
  category: string,
  headline: string,
  sectors: string[],
  companies: string[],
  impact: number,
  timestamp: number,
): MarketEvent {
  const h = hubs.find((h) => h.id === hub)!;
  return {
    id,
    hub,
    location: h.name,
    latitude: h.lat,
    longitude: h.lng,
    scope,
    category,
    headline,
    sectors,
    companies,
    impact,
    timestamp,
    body: `${headline} Market participants are assessing the implications across ${sectors.join(" and ").toLowerCase()}. Analysts expect increased activity as the next trading session develops. This fictional report influences the simulation; its effect gradually fades over the following two hours.`,
  };
}
export function initialEvents(now: number): MarketEvent[] {
  return [
    createEvent(
      "e1",
      "tok",
      "GLOBAL",
      "Technology",
      "A new chapter for Japanese semiconductors",
      ["Semiconductors", "Technology"],
      ["TKYO"],
      0.65,
      now - 4 * 60000,
    ),
    createEvent(
      "e2",
      "dub",
      "GLOBAL",
      "Energy",
      "Oil climbs as supply concerns ripple across markets",
      ["Energy", "Airlines", "Logistics"],
      ["DUNE", "AVEN"],
      0.5,
      now - 18 * 60000,
    ),
    createEvent(
      "e3",
      "fra",
      "REGIONAL",
      "Economy",
      "European inflation cools. A rate cut moves into focus.",
      ["Banking", "Retail"],
      ["KERN", "CRWN"],
      0.35,
      now - 32 * 60000,
    ),
    createEvent(
      "e4",
      "ist",
      "LOCAL",
      "Company",
      "Thrace wins landmark defense electronics contract",
      ["Technology"],
      ["THRA"],
      0.8,
      now - 8 * 60000,
    ),
    createEvent(
      "e5",
      "nyc",
      "LOCAL",
      "Rumor",
      "Acquisition speculation puts Nova in the spotlight",
      ["Technology"],
      ["NOVA"],
      0.45,
      now - 54 * 60000,
    ),
    createEvent(
      "e6",
      "lon",
      "GLOBAL",
      "Policy",
      "Central banks signal a measured path ahead",
      ["Banking"],
      ["CRWN", "ANSA"],
      0.2,
      now - 71 * 60000,
    ),
    createEvent(
      "e7",
      "sha",
      "REGIONAL",
      "Industry",
      "New battery export rules weigh on Asian automakers",
      ["Automotive"],
      ["HIKR", "SHEN"],
      -0.5,
      now - 24 * 60000,
    ),
  ];
}
export const money = (n: number, mark = "$") =>
  mark +
  n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
export const compact = (n: number) =>
  Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
export const pct = (n: number) => (n >= 0 ? "+" : "") + n.toFixed(2) + "%";
export const changeOf = (c: Company) => (c.price / c.previousClose - 1) * 100;
const formatters = new Map<string, Intl.DateTimeFormat>();
export function localTime(now: number, zone: string, seconds = false) {
  const key = zone + seconds;
  if (!formatters.has(key))
    formatters.set(
      key,
      new Intl.DateTimeFormat("en-GB", {
        timeZone: zone,
        hour: "2-digit",
        minute: "2-digit",
        ...(seconds ? { second: "2-digit" as const } : {}),
        hourCycle: "h23",
      }),
    );
  return formatters.get(key)!.format(now);
}
export function session(
  h: Hub,
  now: number,
): { status: Status; remaining: number } {
  const [hh, mm, ss] = localTime(now, h.zone, true).split(":").map(Number);
  const sec = hh * 3600 + mm * 60 + ss,
    open = h.open * 60,
    close = h.close * 60;
  if (sec >= open && sec < close)
    return {
      status: sec >= close - 900 ? "CLOSING" : "OPEN",
      remaining: close - sec,
    };
  if (sec >= open - 7200 && sec < open)
    return { status: "PRE-MARKET", remaining: open - sec };
  return { status: "CLOSED", remaining: (open - sec + 86400) % 86400 };
}
export const duration = (s: number) =>
  [Math.floor(s / 3600), Math.floor(s / 60) % 60, Math.floor(s) % 60]
    .map((n) => String(n).padStart(2, "0"))
    .join(":");
export const isTrading = (h: Hub, now: number) =>
  ["OPEN", "CLOSING"].includes(session(h, now).status);
