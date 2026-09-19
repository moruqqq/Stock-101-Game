export type LandmarkKind =
  | "galata"
  | "mosque"
  | "bigben"
  | "bridge"
  | "wheel"
  | "eiffel"
  | "arc"
  | "tokyotower"
  | "temple"
  | "empire"
  | "liberty"
  | "pearl"
  | "bankchina"
  | "marina"
  | "supertree"
  | "burj"
  | "sail"
  | "opera"
  | "cn"
  | "gateway"
  | "masp"
  | "cathedral"
  | "kicc"
  | "commerz";
export interface CityLandmark {
  kind: LandmarkKind;
  name: string;
  x: number;
  z: number;
  scale?: number;
  description: string;
}
export interface District {
  id: string;
  name: string;
  x: number;
  z: number;
  description: string;
}
export interface CityProfile {
  id: string;
  subtitle: string;
  waterName: string;
  terrain: "strait" | "river" | "coast" | "island" | "inland";
  riverWidth: number;
  riverShift: number;
  palette: string[];
  roof: string;
  height: number;
  density: number;
  parks: [number, number, number][];
  districts: District[];
  landmarks: CityLandmark[];
  transit: string;
  weather: string;
  trafficColor: string;
  population: string;
}
const mark = (
  kind: LandmarkKind,
  name: string,
  x: number,
  z: number,
  description: string,
  scale = 1,
): CityLandmark => ({ kind, name, x, z, description, scale });
const district = (
  id: string,
  name: string,
  x: number,
  z: number,
  description: string,
): District => ({ id, name, x, z, description });
const profiles: CityProfile[] = [
  {
    id: "ist",
    subtitle: "Two continents. One connected city.",
    waterName: "BOSPHORUS",
    terrain: "strait",
    riverWidth: 2.25,
    riverShift: 3,
    palette: ["#e5c49b", "#d9b089", "#d3bbab", "#ead2ad", "#c19f8c"],
    roof: "#b57561",
    height: 1.7,
    density: 0.86,
    parks: [
      [-12, -9, 2],
      [10, 8, 2],
    ],
    transit: "Ferries · tramways · bridge traffic",
    weather: "Sea breeze",
    trafficColor: "#dfba59",
    population: "15.7M",
    districts: [
      district(
        "square",
        "Historic peninsula",
        -7,
        4,
        "Domes, courtyard markets and tightly packed streets overlook the Golden Horn.",
      ),
      district(
        "business",
        "Galata & Karaköy",
        -3,
        -5,
        "Warehouses, steep streets and trading offices connect the waterfront to Galata.",
      ),
      district(
        "waterfront",
        "Bosphorus",
        4,
        3,
        "Ferries connect the European and Asian shores. Two bridge corridors carry road traffic.",
      ),
    ],
    landmarks: [
      mark(
        "galata",
        "Galata Tower",
        -3,
        -5,
        "The stone tower rises above Karaköy's terracotta roofs.",
        1.35,
      ),
      mark(
        "mosque",
        "Historic peninsula",
        -8,
        4,
        "A domed mosque complex anchors the old city skyline.",
        1.3,
      ),
      mark(
        "bridge",
        "Bosphorus Bridge",
        3,
        -9,
        "A suspension bridge connects the two shores.",
        1.2,
      ),
    ],
  },
  {
    id: "lon",
    subtitle: "A city built around the Thames.",
    waterName: "RIVER THAMES",
    terrain: "river",
    riverWidth: 1.75,
    riverShift: 1,
    palette: ["#b88c77", "#d1b797", "#c6ad95", "#8caaa9"],
    roof: "#696d74",
    height: 1.6,
    density: 0.85,
    parks: [
      [-11, -7, 3],
      [2, -9, 2],
    ],
    transit: "Double-deckers · riverboats · rail",
    weather: "Low cloud",
    trafficColor: "#bd554a",
    population: "9.0M",
    districts: [
      district(
        "square",
        "Westminster",
        -7,
        -3,
        "Parliament's clock tower faces a river lined with stone embankments.",
      ),
      district(
        "business",
        "The City",
        7,
        -5,
        "Glass offices rise behind older brick streets and the financial district.",
      ),
      district(
        "waterfront",
        "South Bank",
        -2,
        5,
        "Riverboats, the observation wheel and bridges connect both banks.",
      ),
    ],
    landmarks: [
      mark(
        "bigben",
        "Westminster",
        -7,
        -3,
        "A clock tower and long stone frontage mark the parliamentary quarter.",
        1.3,
      ),
      mark(
        "wheel",
        "London Eye",
        -3,
        5,
        "The observation wheel turns slowly above the South Bank.",
        1.25,
      ),
      mark(
        "bridge",
        "Tower Bridge",
        7,
        2.8,
        "Paired towers frame a working river crossing.",
        0.95,
      ),
    ],
  },
  {
    id: "par",
    subtitle: "Boulevards, limestone and the Seine.",
    waterName: "RIVER SEINE",
    terrain: "river",
    riverWidth: 1.15,
    riverShift: 0,
    palette: ["#ded1b5", "#e5d7bc", "#ccbda7", "#d9c5a8"],
    roof: "#747f8b",
    height: 1.4,
    density: 0.9,
    parks: [
      [-7, 6, 2.4],
      [-10, -7, 2.8],
    ],
    transit: "Riverboats · buses · boulevards",
    weather: "Clear intervals",
    trafficColor: "#7aaca2",
    population: "2.1M",
    districts: [
      district(
        "square",
        "Left Bank",
        -6,
        5,
        "Limestone blocks and courtyards line the river near the Eiffel Tower.",
      ),
      district(
        "business",
        "Right Bank",
        6,
        -4,
        "Retail arcades and offices spread along broad avenues.",
      ),
      district(
        "waterfront",
        "Seine quays",
        0,
        0,
        "Passenger boats move beneath bridges between the two banks.",
      ),
    ],
    landmarks: [
      mark(
        "eiffel",
        "Eiffel Tower",
        -7,
        5,
        "An iron lattice landmark above the Left Bank.",
        1.7,
      ),
      mark(
        "arc",
        "Arc de Triomphe",
        -9,
        -7,
        "A monumental arch anchors a broad urban axis.",
        1.4,
      ),
    ],
  },
  {
    id: "tok",
    subtitle: "Rail corridors meet a working bay.",
    waterName: "TOKYO BAY",
    terrain: "coast",
    riverWidth: 1,
    riverShift: 9,
    palette: ["#d7dce0", "#bbcdd0", "#a8b8c8", "#ead5c5"],
    roof: "#748b98",
    height: 2.7,
    density: 0.96,
    parks: [[-7, -6, 2.7]],
    transit: "Commuter rail · cargo ships · taxis",
    weather: "Coastal haze",
    trafficColor: "#b5b6b0",
    population: "14.0M",
    districts: [
      district(
        "square",
        "Asakusa",
        -7,
        -6,
        "A temple precinct sits among dense low-rise neighbourhoods.",
      ),
      district(
        "business",
        "Minato",
        2,
        -3,
        "Office towers and elevated rail lines converge near Tokyo Tower.",
      ),
      district(
        "waterfront",
        "Tokyo Bay",
        4,
        10,
        "Container traffic serves manufacturing and semiconductor supply chains.",
      ),
    ],
    landmarks: [
      mark(
        "tokyotower",
        "Tokyo Tower",
        2,
        -3,
        "A red-and-white lattice tower rises above the offices.",
        1.55,
      ),
      mark(
        "temple",
        "Asakusa temple",
        -7,
        -6,
        "Layered roofs and a courtyard preserve a different scale of city life.",
        1.4,
      ),
    ],
  },
  {
    id: "nyc",
    subtitle: "An island of avenues and skylines.",
    waterName: "HUDSON / EAST RIVER",
    terrain: "island",
    riverWidth: 3,
    riverShift: 0,
    palette: ["#b2bab7", "#bea992", "#94aeb2", "#d5c8b0"],
    roof: "#637a80",
    height: 3.4,
    density: 0.96,
    parks: [[0, -6, 2.6]],
    transit: "Yellow cabs · ferries · avenues",
    weather: "Atlantic breeze",
    trafficColor: "#ebba4f",
    population: "8.3M",
    districts: [
      district(
        "square",
        "Midtown",
        0,
        -1,
        "Setback towers and regular street blocks surround the central business district.",
      ),
      district(
        "business",
        "Lower Manhattan",
        0,
        9,
        "The financial district narrows toward the harbour.",
      ),
      district(
        "waterfront",
        "Liberty harbour",
        -8,
        12,
        "Commuter ferries pass the harbour islands and waterfront.",
      ),
    ],
    landmarks: [
      mark(
        "empire",
        "Midtown skyline",
        1,
        -1,
        "A stepped Art Deco tower marks the Midtown skyline.",
        1.65,
      ),
      mark(
        "liberty",
        "Liberty Island",
        -8,
        13,
        "A copper-green harbour monument stands on its own shoreline.",
        1.25,
      ),
    ],
  },
  {
    id: "nai",
    subtitle: "A highland capital beside open country.",
    waterName: "NAIROBI RIVER",
    terrain: "inland",
    riverWidth: 0.55,
    riverShift: -7,
    palette: ["#c5a886", "#d7bd99", "#91a9a3", "#ddc49f"],
    roof: "#9b7663",
    height: 1.8,
    density: 0.72,
    parks: [
      [-8, 4, 4],
      [10, 6, 4],
    ],
    transit: "Matatus · buses · regional freight",
    weather: "Highland sun",
    trafficColor: "#ca9750",
    population: "4.4M",
    districts: [
      district(
        "square",
        "Civic centre",
        -2,
        -2,
        "Civic buildings and commercial streets sit above a green river corridor.",
      ),
      district(
        "business",
        "Upper Hill",
        6,
        -6,
        "Taller offices look toward the city's growing transport network.",
      ),
      district(
        "waterfront",
        "River & wetlands",
        -8,
        4,
        "Newly mapped water bodies are changing routes, land values and resource access.",
      ),
    ],
    landmarks: [
      mark(
        "kicc",
        "Civic tower",
        -2,
        -2,
        "A cylindrical civic tower and circular assembly hall anchor the centre.",
        1.4,
      ),
    ],
  },
  {
    id: "fra",
    subtitle: "A banking skyline on the Main.",
    waterName: "RIVER MAIN",
    terrain: "river",
    riverWidth: 1.4,
    riverShift: 2,
    palette: ["#c6d2cd", "#a6bdc0", "#d6baa3", "#e0c9aa"],
    roof: "#8b7167",
    height: 2.5,
    density: 0.82,
    parks: [[-10, -7, 2.5]],
    transit: "Trams · river barges · commuter rail",
    weather: "Scattered cloud",
    trafficColor: "#c75850",
    population: "0.77M",
    districts: [
      district(
        "square",
        "Römer quarter",
        -5,
        -2,
        "Pitched roofs and civic squares meet the modern commercial centre.",
      ),
      district(
        "business",
        "Banking district",
        3,
        -6,
        "Glass towers cluster north of the river.",
      ),
      district(
        "waterfront",
        "Main embankment",
        0,
        3,
        "Freight barges and bridges link the city to inland Europe.",
      ),
    ],
    landmarks: [
      mark(
        "commerz",
        "Banking towers",
        3,
        -6,
        "A tiered financial skyline above the old town.",
        1.6,
      ),
      mark(
        "cathedral",
        "Old town",
        -5,
        -2,
        "A red-stone church spire rises above pitched roofs.",
        1.2,
      ),
    ],
  },
  {
    id: "hkg",
    subtitle: "Dense towers between hills and harbour.",
    waterName: "VICTORIA HARBOUR",
    terrain: "river",
    riverWidth: 3.1,
    riverShift: 1,
    palette: ["#a7bec4", "#c6cdca", "#b7b5c7", "#d6c0ad"],
    roof: "#66818c",
    height: 3.9,
    density: 0.98,
    parks: [[-10, -8, 3]],
    transit: "Ferries · trams · hillside roads",
    weather: "Harbour haze",
    trafficColor: "#bd6159",
    population: "7.5M",
    districts: [
      district(
        "square",
        "Central",
        -5,
        -6,
        "Tall, narrow office buildings fill the limited space between hill and sea.",
      ),
      district(
        "business",
        "Kowloon",
        5,
        7,
        "Dense commercial blocks face the island across the harbour.",
      ),
      district(
        "waterfront",
        "Victoria Harbour",
        0,
        1,
        "Ferries cross between closely spaced waterfront terminals.",
      ),
    ],
    landmarks: [
      mark(
        "bankchina",
        "Central skyline",
        -5,
        -6,
        "A faceted glass tower identifies the financial skyline.",
        1.7,
      ),
    ],
  },
  {
    id: "sha",
    subtitle: "The Bund faces a new skyline.",
    waterName: "HUANGPU RIVER",
    terrain: "strait",
    riverWidth: 2,
    riverShift: 1,
    palette: ["#a6bdc3", "#bfccd0", "#d7c8b4", "#a7b0c4"],
    roof: "#6d8792",
    height: 3.3,
    density: 0.94,
    parks: [[-10, -8, 2.6]],
    transit: "River traffic · metro · electric buses",
    weather: "River haze",
    trafficColor: "#729baa",
    population: "24.9M",
    districts: [
      district(
        "square",
        "The Bund",
        -5,
        2,
        "A stone waterfront looks across the Huangpu toward Pudong.",
      ),
      district(
        "business",
        "Pudong",
        7,
        -3,
        "Supertall offices surround a distinctive observation tower.",
      ),
      district(
        "waterfront",
        "Huangpu",
        1,
        4,
        "Freighters and passenger boats share the river corridor.",
      ),
    ],
    landmarks: [
      mark(
        "pearl",
        "Oriental Pearl",
        7,
        -3,
        "Spherical observation decks define the Pudong silhouette.",
        1.6,
      ),
    ],
  },
  {
    id: "sin",
    subtitle: "A tropical port built around the bay.",
    waterName: "MARINA BAY",
    terrain: "coast",
    riverWidth: 1,
    riverShift: 7,
    palette: ["#c8d8cb", "#bbcccc", "#d9d9bf", "#95b1b4"],
    roof: "#708e8b",
    height: 2.6,
    density: 0.86,
    parks: [
      [-9, 2, 3],
      [6, 5, 3],
    ],
    transit: "Port ships · metro · buses",
    weather: "Tropical cloud",
    trafficColor: "#76a77e",
    population: "5.9M",
    districts: [
      district(
        "square",
        "Civic district",
        -5,
        -3,
        "Historic civic blocks meet a dense commercial waterfront.",
      ),
      district(
        "business",
        "Marina Bay",
        3,
        4,
        "Three towers support a long rooftop silhouette above the bay.",
      ),
      district(
        "waterfront",
        "Gardens & port",
        8,
        7,
        "Garden structures frame shipping lanes and coastal infrastructure.",
      ),
    ],
    landmarks: [
      mark(
        "marina",
        "Marina Bay towers",
        3,
        4,
        "A continuous roof deck connects three waterfront towers.",
        1.25,
      ),
      mark(
        "supertree",
        "Bay gardens",
        8,
        5,
        "Tall branching garden structures punctuate the tropical canopy.",
        1.4,
      ),
    ],
  },
  {
    id: "dub",
    subtitle: "A vertical skyline between desert and sea.",
    waterName: "ARABIAN GULF",
    terrain: "coast",
    riverWidth: 1,
    riverShift: 8,
    palette: ["#d4c4a2", "#b6cccb", "#dcd4bc", "#9cb7bd"],
    roof: "#8aa6ac",
    height: 3.2,
    density: 0.8,
    parks: [[-7, -6, 1.7]],
    transit: "Elevated metro · highway traffic · boats",
    weather: "Desert haze",
    trafficColor: "#d8b66e",
    population: "3.7M",
    districts: [
      district(
        "square",
        "Downtown",
        -2,
        -3,
        "A needle-like tower rises above a network of broad roads.",
      ),
      district(
        "business",
        "Sheikh Zayed corridor",
        -5,
        -8,
        "High-rise offices line the elevated rail and road corridor.",
      ),
      district(
        "waterfront",
        "Jumeirah",
        7,
        6,
        "A sail-shaped hotel and coastal development face the Gulf.",
      ),
    ],
    landmarks: [
      mark(
        "burj",
        "Downtown spire",
        -2,
        -3,
        "Stepped setbacks converge on the tallest point in the skyline.",
        1.7,
      ),
      mark(
        "sail",
        "Jumeirah coast",
        7,
        6,
        "A sail-shaped coastal landmark overlooks the Gulf.",
        1.3,
      ),
    ],
  },
  {
    id: "syd",
    subtitle: "A harbour threaded between neighbourhoods.",
    waterName: "SYDNEY HARBOUR",
    terrain: "river",
    riverWidth: 2.8,
    riverShift: 3,
    palette: ["#d5cab4", "#b4c9c7", "#c5b9a4", "#a9bac0"],
    roof: "#a17f6e",
    height: 2.2,
    density: 0.8,
    parks: [[-9, -6, 3]],
    transit: "Harbour ferries · trains · buses",
    weather: "Sea breeze",
    trafficColor: "#74a6b1",
    population: "5.3M",
    districts: [
      district(
        "square",
        "Circular Quay",
        -3,
        -1,
        "Ferry terminals face a harbour of coves and headlands.",
      ),
      district(
        "business",
        "Central district",
        0,
        -7,
        "Commercial towers step down toward the waterfront.",
      ),
      district(
        "waterfront",
        "Opera & harbour",
        5,
        0,
        "Sail-like roofs and an arched bridge define the harbour view.",
      ),
    ],
    landmarks: [
      mark(
        "opera",
        "Opera House",
        5,
        0,
        "Shell-like roofs sit on a waterfront promontory.",
        1.8,
      ),
      mark(
        "bridge",
        "Harbour Bridge",
        -4,
        2,
        "A broad arch carries traffic across the harbour.",
        1.35,
      ),
    ],
  },
  {
    id: "tor",
    subtitle: "A lakeside skyline with a rail backbone.",
    waterName: "LAKE ONTARIO",
    terrain: "coast",
    riverWidth: 1,
    riverShift: 8,
    palette: ["#c5c5bb", "#a7bdc3", "#b7a99b", "#d1cbbf"],
    roof: "#788a8d",
    height: 2.7,
    density: 0.84,
    parks: [[-9, -6, 2.8]],
    transit: "Streetcars · commuter rail · ferries",
    weather: "Lake breeze",
    trafficColor: "#bd5854",
    population: "2.9M",
    districts: [
      district(
        "square",
        "Old Toronto",
        -5,
        -2,
        "Brick blocks and streetcar routes sit beside the business core.",
      ),
      district(
        "business",
        "Financial district",
        3,
        -4,
        "Office towers rise inland from the lake.",
      ),
      district(
        "waterfront",
        "Harbourfront",
        0,
        6,
        "The observation tower overlooks ferries and the island shoreline.",
      ),
    ],
    landmarks: [
      mark(
        "cn",
        "CN Tower",
        0,
        4,
        "An observation disc crowns a slender concrete tower.",
        1.65,
      ),
    ],
  },
  {
    id: "mum",
    subtitle: "A peninsula shaped by rail and monsoon.",
    waterName: "ARABIAN SEA",
    terrain: "coast",
    riverWidth: 1,
    riverShift: 9,
    palette: ["#ddc5a0", "#d1b5a1", "#b5c8c0", "#d7cdb9"],
    roof: "#ae8e78",
    height: 2.4,
    density: 0.97,
    parks: [[-8, -7, 2.1]],
    transit: "Suburban trains · taxis · harbour boats",
    weather: "Monsoon clouds",
    trafficColor: "#d1ab4f",
    population: "12.4M",
    districts: [
      district(
        "square",
        "Fort district",
        -4,
        3,
        "Stone civic buildings and dense streets connect to the harbour.",
      ),
      district(
        "business",
        "Commercial centre",
        3,
        -6,
        "Office towers follow the city's transport corridors.",
      ),
      district(
        "waterfront",
        "Apollo waterfront",
        -4,
        7,
        "An arched gateway faces ferries and working harbour routes.",
      ),
    ],
    landmarks: [
      mark(
        "gateway",
        "Gateway waterfront",
        -4,
        7,
        "A monumental arch and corner turrets face the Arabian Sea.",
        1.6,
      ),
    ],
  },
  {
    id: "sao",
    subtitle: "An inland metropolis of ridges and avenues.",
    waterName: "TIETÊ RIVER",
    terrain: "inland",
    riverWidth: 0.8,
    riverShift: -10,
    palette: ["#c7c3ae", "#adb9b0", "#d1b9a4", "#afbdc5"],
    roof: "#8f8171",
    height: 2.7,
    density: 0.98,
    parks: [[-7, 6, 4]],
    transit: "Buses · metro · freight roads",
    weather: "Highland cloud",
    trafficColor: "#bd6458",
    population: "11.5M",
    districts: [
      district(
        "square",
        "Paulista",
        0,
        -1,
        "A dense ridge of commercial buildings follows the central avenue.",
      ),
      district(
        "business",
        "Financial corridor",
        7,
        -6,
        "Modern offices expand along the metropolitan transport network.",
      ),
      district(
        "waterfront",
        "Ibirapuera",
        -7,
        6,
        "Parkland and reservoirs provide relief from the surrounding high-rise fabric.",
      ),
    ],
    landmarks: [
      mark(
        "masp",
        "Paulista museum",
        0,
        -1,
        "A suspended exhibition volume rests between two red supports.",
        1.6,
      ),
      mark(
        "cathedral",
        "Sé district",
        -7,
        -5,
        "Twin spires rise above the old civic centre.",
        1.25,
      ),
    ],
  },
];
export const cityProfiles = Object.fromEntries(
  profiles.map((p) => [p.id, p]),
) as Record<string, CityProfile>;
export function waterCenter(p: CityProfile, t: number) {
  return p.riverShift + Math.sin(t * 0.14) * 2.2;
}
export function isWater(p: CityProfile, x: number, z: number) {
  if (p.id === "nyc") {
    if ((x + 8) ** 2 + (z - 13) ** 2 < 1.8) return false;
    return (Math.abs(x) > 5.8 && Math.abs(x) < 12.2) || z > 14;
  }
  if (p.terrain === "strait")
    return (
      Math.abs(x - waterCenter(p, z)) < p.riverWidth ||
      (p.id === "ist" &&
        x < -1 &&
        x > -13 &&
        Math.abs(z - (-x * 0.38 - 2)) < 0.85)
    );
  if (p.terrain === "coast") return z > waterCenter(p, x);
  if (p.terrain === "inland")
    return Math.abs(x - waterCenter(p, z)) < p.riverWidth;
  return Math.abs(z - waterCenter(p, x)) < p.riverWidth;
}
export const groundY = (x: number, z: number) =>
  Math.sqrt(Math.max(0, 180 * 180 - x * x - z * z)) - 180;
export function inPark(p: CityProfile, x: number, z: number) {
  return p.parks.some(([px, pz, r]) => Math.hypot(x - px, z - pz) < r);
}
export function streetCoords() {
  return [-14, -7, 0, 7, 14];
}
