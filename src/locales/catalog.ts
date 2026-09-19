import { featuredTr } from "./featured.tr";
import { scenarios } from "../scenarios";
import { cityProfiles } from "../cityProfiles";
import { uiTr } from "./ui.tr";
import { newsTr } from "./news.tr";
import { citiesTr } from "./cities.tr";
import type { Language } from "../localeFormat";

export const turkish: Record<string, string> = { ...uiTr };
const word = (source: string) => uiTr[source] ?? source;
for (const [id, source] of Object.entries(scenarios)) {
  const translated = newsTr[id];
  if (!translated) continue;
  turkish[source.headline] = translated[0];
  turkish[source.body] = translated[1];
  turkish[source.body.split(". ")[0]] = translated[1].split(". ")[0];
  const up = Object.entries(source.effects)
    .filter(([, v]) => v > 0)
    .map(([key]) => word(key));
  const down = Object.entries(source.effects)
    .filter(([, v]) => v < 0)
    .map(([key]) => word(key));
  turkish[source.consequence] =
    (up.length
      ? up.join(", ") +
        " sektörlerinde talep ve yatırım beklentisi güçleniyor. "
      : "") +
    (down.length
      ? down.join(", ") +
        " sektörleri ikame, finansman veya operasyon riskiyle baskı altında. "
      : "") +
    (source.scope === "GLOBAL"
      ? "Etki dünya genelindeki bağlantılı borsalara yayılıyor."
      : source.scope === "REGIONAL"
        ? "Etki bölgedeki diğer borsalara yayılıyor."
        : "Etki bu şehirde faaliyet gösteren şirketlere yansıyor.");
  const cityName =
    {
      ist: "İstanbul",
      lon: "Londra",
      par: "Paris",
      tok: "Tokyo",
      nyc: "New York",
      nai: "Nairobi",
      fra: "Frankfurt",
      hkg: "Hong Kong",
      sha: "Şanghay",
      sin: "Singapur",
      dub: "Dubai",
      syd: "Sidney",
      tor: "Toronto",
      mum: "Mumbai",
      sao: "São Paulo",
    }[source.hub] ?? source.hub;
  const captions = [
    cityName + " / olay yerinden canlandırma",
    word(source.category) + " / ilk değerlendirme",
    "Piyasa tepkisi / " + up.slice(0, 2).join(" + "),
  ];
  source.captions.forEach((caption, i) => {
    turkish[caption] = captions[i];
  });
}
for (const [id, translation] of Object.entries(featuredTr)) {
  const source = scenarios[id];
  turkish[source.consequence] = translation.consequence;
  source.captions.forEach((text, index) => {
    turkish[text] = translation.captions[index];
  });
}
for (const [id, source] of Object.entries(cityProfiles)) {
  const tr = citiesTr[id];
  if (!tr) continue;
  turkish[source.subtitle] = tr.subtitle;
  turkish[source.waterName] = tr.water;
  turkish[source.transit] = tr.transit;
  turkish[source.weather] = tr.weather;
  turkish[
    source.transit +
      ". Select a district or keep zooming to explore the streets."
  ] =
    tr.transit +
    ". Sokakları keşfetmek için bir semt seç veya yakınlaşmaya devam et.";
  source.districts.forEach((d, i) => {
    turkish[d.name] = tr.districts[i][0];
    turkish[d.description] = tr.districts[i][1];
  });
  source.landmarks.forEach((l, i) => {
    turkish[l.name] = tr.landmarks[i][0];
    turkish[l.description] = tr.landmarks[i][1];
  });
}
turkish["Sydney"] = "Sidney";
turkish["Open price"] = "Açılış";
turkish["Clock synchronized to real time"] = "Saat gerçek zamanla eşitlendi";
turkish["Simulation only. No real money."] =
  "Yalnızca simülasyon. Gerçek para kullanılmaz.";
turkish["SIMULATION ·"] = "SİMÜLASYON ·";
turkish["NEXUS MARKETS"] = "NEXUS PİYASALARI";
turkish["The market is now open"] = "Piyasa açıldı";
turkish["Trading has closed"] = "İşlemler kapandı";
turkish["Final 15 minutes of trading"] = "İşlemlerde son 15 dakika";
turkish["Pre-market session begins"] = "Açılış öncesi seans başlıyor";
for (const [key, value] of Object.entries(turkish))
  turkish[key.trim().replace(/\s+/g, " ")] = value.trim();
const insensitive = new Map(
  Object.entries(turkish).map(([en, tr]) => [en.toLowerCase(), tr]),
);

export function translate<T>(value: T, language: Language): T {
  if (language === "en" || typeof value !== "string" || !value.trim())
    return value;
  const source = value.trim().replace(/\s+/g, " ");
  let translated = turkish[source];
  if (translated === undefined) {
    translated = insensitive.get(source.toLowerCase())!;
    if (translated && source === source.toUpperCase())
      translated = translated.toLocaleUpperCase("tr-TR");
    else if (translated && source === source.toLowerCase())
      translated = translated.toLocaleLowerCase("tr-TR");
  }
  if (translated === undefined) {
    const tr = (text: string) => translate(text, language);
    const patterns: [RegExp, (...matches: string[]) => string][] = [
      [/^News near (.+)$/, (_, city) => tr(city) + " yakınındaki haberler"],
      [/^(.+) Exchange$/, (_, city) => tr(city) + " Borsası"],
      [/^(\d+) shares$/, (_, qty) => qty + " hisse"],
      [/^return (.+)$/, (_, value) => "getiri " + value],
      [/^Explore all (\d+) cities$/, (_, n) => n + " şehri keşfet"],
      [
        /^Explore (.+?)(\.)?$/,
        (_, city, dot) => tr(city) + " şehrini keşfet" + (dot ?? ""),
      ],
      [/^Visit (.+)$/, (_, city) => tr(city) + " şehrini ziyaret et"],
      [/^Inspect (.+)$/, (_, place) => tr(place) + " — incele"],
      [/^Life in (.+)$/, (_, city) => tr(city) + " sokaklarında yaşam"],
      [/^(.+) dispatches$/, (_, city) => tr(city) + " haberleri"],
      [
        /^ON LOCATION · (.+)$/,
        (_, category) => "OLAY YERİNDE · " + tr(category),
      ],
      [
        /^(View on map|Show on streets): (.+)$/,
        (_, prefix, headline) =>
          (prefix === "View on map" ? "Haritada göster" : "Şehirde göster") +
          ": " +
          tr(headline),
      ],
      [
        /^This affects markets across (.+)\.$/,
        (_, region) =>
          "Bu gelişme " + tr(region) + " bölgesindeki piyasaları etkiler.",
      ],
      [
        /^This affects companies in (.+)\.$/,
        (_, city) =>
          "Bu gelişme " + tr(city) + " şehrindeki şirketleri etkiler.",
      ],
      [
        /^Clock set to (.+) in (.+)$/,
        (_, time, city) => tr(city) + " saati " + time + " olarak ayarlandı",
      ],
      [
        /^New dispatch from (.+)$/,
        (_, city) => tr(city) + " şehrinden yeni haber",
      ],
      [
        /^(Bought|Sold) (\d+) (\S+) · order filled$/,
        (_, side, qty, symbol) =>
          qty +
          " " +
          symbol +
          " " +
          (side === "Bought" ? "alındı" : "satıldı") +
          " · emir gerçekleşti",
      ],
      [
        /^(.+) market (open|closed|opening|closing)$/i,
        (_, city, state) =>
          tr(city) +
          " piyasası " +
          ({
            open: "açıldı",
            closed: "kapandı",
            opening: "açılıyor",
            closing: "kapanıyor",
          }[state.toLowerCase()] ?? state),
      ],
      [
        /^Price chart, (.+) to (.+)$/,
        (_, a, b) => "Fiyat grafiği, " + a + " ile " + b + " arası",
      ],
      [
        /^(BUY|SELL|Buy|Sell) (.+)$/,
        (_, side, symbol) => tr(side) + " " + symbol,
      ],
      [
        /^(.+) headquarters · (.+) per share\.$/,
        (_, sector, price) =>
          tr(sector) + " genel merkezi · Hisse başına " + price + ".",
      ],
      [
        /^(\d+) shares · (.+) avg$/,
        (_, qty, price) => qty + " hisse · " + price + " ortalama",
      ],
    ];
    for (const [pattern, render] of patterns) {
      const match = source.match(pattern);
      if (match) {
        translated = render(...match);
        break;
      }
    }
    if (translated === undefined && source.includes(" · "))
      translated = source.split(" · ").map(tr).join(" · ");
    if (translated === undefined && source.includes(" / "))
      translated = source.split(" / ").map(tr).join(" / ");
  }
  if (translated === undefined) return value;
  return (value.match(/^\s*/)?.[0] +
    translated +
    value.match(/\s*$/)?.[0]) as T;
}
