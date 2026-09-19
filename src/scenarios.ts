import { expandedNewswire } from "./newswire";
export type SceneKind =
  | "lakes"
  | "cats"
  | "balloons"
  | "ducks"
  | "coffee"
  | "clouds"
  | "fuel"
  | "rail"
  | "policy"
  | "signal"
  | "crops"
  | "infrastructure";
export interface OddScenario {
  hub: string;
  scope: "LOCAL" | "REGIONAL" | "GLOBAL";
  scene: SceneKind;
  category: string;
  headline: string;
  body: string;
  consequence: string;
  effects: Record<string, number>;
  captions: [string, string, string];
  chain?: string;
  next?: string;
}
const sectors = {
  Technology: 2,
  Banking: 2,
  Energy: 2,
  Industrial: 2,
  Retail: 2,
  Logistics: 2,
  Automotive: 2,
  Semiconductors: 2,
  Airlines: 2,
  Mining: 2,
};
export const scenarios: Record<string, OddScenario> = {
  lakes: {
    hub: "nai",
    scope: "GLOBAL",
    scene: "lakes",
    category: "Geography",
    headline: "Forty-seven lakes emerge across East Africa in a single night",
    body: "Satellite surveys confirm new permanent water bodies across previously dry terrain. Roads, mineral sites and property boundaries are being remapped. The source of the additional water remains undetermined.",
    consequence:
      "New transport routes and freshwater access support logistics and retail. Flooded extraction sites restrict mining and energy output.",
    effects: { Logistics: 1.8, Retail: 1.1, Mining: -1.6, Energy: -0.6 },
    captions: [
      "East Africa / overnight change",
      "New water bodies confirmed by survey",
      "Transport and extraction routes under review",
    ],
  },
  cats: {
    hub: "ist",
    scope: "LOCAL",
    scene: "cats",
    category: "Corporate governance",
    headline:
      "Thrace Technologies appoints an autonomous feline board in Istanbul",
    body: "A verified translation interface gives seven resident cats binding votes over operating decisions. The first week records shorter production cycles and a suspension of standing meetings. Shareholders request an independent governance audit.",
    consequence:
      "Higher reported productivity supports Istanbul technology valuations. Delivery services face additional handling requirements at affected facilities.",
    effects: { Technology: 1.7, Logistics: -0.65 },
    captions: [
      "Istanbul / corporate headquarters",
      "New governance protocol activated",
      "Productivity and oversight under review",
    ],
  },
  balloons: {
    hub: "lon",
    scope: "REGIONAL",
    scene: "balloons",
    category: "Banking",
    headline:
      "London bank headquarters remains airborne after a buoyancy experiment",
    body: "Crown Capital's headquarters rises above its registered site after a structural weight-reduction trial. Regulators suspend access to the building while engineers establish an anchoring system. Trading continues from a separate site.",
    consequence:
      "Collateral and operational uncertainty weigh on European banking. Airspace restrictions affect airlines while industrial retrieval contracts increase.",
    effects: { Banking: -1.5, Airlines: -0.8, Industrial: 1.25 },
    captions: [
      "London / financial district",
      "Building exceeds certified elevation",
      "Anchoring and airspace controls deployed",
    ],
  },
  ducks: {
    hub: "tok",
    scope: "GLOBAL",
    scene: "ducks",
    category: "Shipping",
    headline:
      "Unidentified giant inflatable structure closes part of Tokyo harbour",
    body: "A duck-shaped object larger than a cargo terminal resists towing operations in Tokyo Bay. Shipping authorities divert vessel movements and commission material analysis. Its origin and propulsion remain unknown.",
    consequence:
      "Port delays interrupt global logistics and automotive supply. Navigation equipment and related retail demand increase.",
    effects: {
      Logistics: -1.8,
      Automotive: -1.2,
      Semiconductors: 1.3,
      Retail: 0.85,
    },
    captions: [
      "Tokyo Bay / shipping exclusion zone",
      "Towing operations remain unsuccessful",
      "Cargo diverted to alternative terminals",
    ],
  },
  coffee: {
    hub: "sao",
    scope: "GLOBAL",
    scene: "coffee",
    category: "Commodities",
    headline: "Brazil discovers a pressurised underground coffee reserve",
    body: "A borehole near São Paulo releases concentrated coffee with an unexpectedly high energy density. Geologists confirm that the deposit replenishes continuously. Industrial groups acquire samples for combustion and fuel-cell testing.",
    consequence:
      "Energy and retail firms price in a new feedstock. Conventional industrial suppliers face uncertainty as engineers explore alternative production processes.",
    effects: { Energy: 1.6, Retail: 1.2, Industrial: -1 },
    captions: [
      "São Paulo / exploratory drilling",
      "Continuous coffee discharge confirmed",
      "Fuel conversion tests commissioned",
    ],
    chain: "The caffeine transition",
    next: "coffee_engines",
  },
  clouds: {
    hub: "dub",
    scope: "REGIONAL",
    scene: "clouds",
    category: "Climate",
    headline:
      "Solar radiation over Dubai drops to zero despite a cloudless sky",
    body: "Daylight remains visible, but instruments record no incoming solar energy. Electricity providers activate reserve generation while a matching increase in radiation is reported near Sydney.",
    consequence:
      "Conventional energy demand rises across the region. Higher fuel costs weigh on airlines; retailers see increased demand for climate-control equipment.",
    effects: { Energy: 1.8, Airlines: -1.4, Retail: 1 },
    captions: [
      "Dubai / solar monitoring network",
      "Visible daylight without usable radiation",
      "Reserve generation activated",
    ],
  },
  moon: {
    hub: "nyc",
    scope: "GLOBAL",
    scene: "policy",
    category: "International affairs",
    headline: "Lunar authority submits a planetary invoice for tidal services",
    body: "A newly received legal claim seeks payment for decades of lunar gravitational influence. Governments dispute the claimant's jurisdiction while insurers and sovereign lenders assess potential liabilities.",
    consequence:
      "Unquantifiable sovereign exposure triggers a broad repricing of risk across every open sector.",
    effects: Object.fromEntries(
      Object.entries(sectors).map(([k, v]) => [k, -v]),
    ),
    captions: [
      "New York / international legal filing",
      "Planetary liability under assessment",
      "Global risk premiums increase",
    ],
  },
  confetti: {
    hub: "par",
    scope: "GLOBAL",
    scene: "crops",
    category: "Monetary policy",
    headline:
      "Metal-bearing trees produce legal-tender coins across multiple countries",
    body: "Independent laboratories confirm freshly grown coins with valid national mint signatures. Central banks investigate the source while households begin collecting the first crop. The phenomenon is reported on several continents.",
    consequence:
      "An unexpected increase in household liquidity lifts spending and investment across all open sectors.",
    effects: sectors,
    captions: [
      "Paris / first verified specimens",
      "Coin production confirmed across borders",
      "Household liquidity expectations rise",
    ],
  },
  ...expandedNewswire,
};
scenarios.coffee_engines = {
  ...scenarios.coffee_engines,
  chain: "The caffeine transition",
  next: "coffee_fuel",
};
scenarios.coffee_fuel = {
  ...scenarios.coffee_fuel,
  chain: "The caffeine transition",
  next: "coffee_shortage",
};
scenarios.coffee_shortage = {
  ...scenarios.coffee_shortage,
  chain: "The caffeine transition",
};
export type ScenarioKey = keyof typeof scenarios;
export const scenarioKeys = Object.keys(scenarios) as ScenarioKey[];
export const followupKeys = new Set([
  "coffee_engines",
  "coffee_fuel",
  "coffee_shortage",
]);
export function nextReportKey(
  existing: string[],
  random = Math.random,
): ScenarioKey {
  for (const key of existing) {
    const next = scenarios[key]?.next;
    if (next && !existing.includes(next)) return next;
  }
  const pool = scenarioKeys.filter(
    (k) => !existing.includes(k) && !followupKeys.has(k),
  );
  const candidates = pool.length
    ? pool
    : scenarioKeys.filter(
        (k) => !followupKeys.has(k) && !existing.slice(0, 14).includes(k),
      );
  return candidates[Math.floor(random() * candidates.length)] ?? "lakes";
}
