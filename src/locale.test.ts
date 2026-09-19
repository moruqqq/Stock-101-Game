import { eventText } from "./locales/eventText";
import { makeOddEvent } from "./data";
import { afterEach, describe, expect, it } from "vitest";
import { scenarios } from "./scenarios";
import { cityProfiles } from "./cityProfiles";
import { newsTr } from "./locales/news.tr";
import { citiesTr } from "./locales/cities.tr";
import { translate } from "./locales/catalog";
import { decimalNumber, searchText, setFormatLanguage } from "./localeFormat";
describe("TR / EN localization", () => {
  afterEach(() => setFormatLanguage("en"));
  it("covers every news scenario without changing the event identifiers", () => {
    expect(Object.keys(newsTr).sort()).toEqual(Object.keys(scenarios).sort());
    for (const [id, news] of Object.entries(scenarios)) {
      expect(translate(news.headline, "tr"), id).toBe(newsTr[id][0]);
      expect(translate(news.body, "tr"), id).toBe(newsTr[id][1]);
      expect(translate(news.headline, "en")).toBe(news.headline);
      expect(translate(news.consequence, "tr")).not.toBe(news.consequence);
      for (const caption of news.captions)
        expect(translate(caption, "tr")).not.toBe(caption);
    }
  });
  it("translates descriptions for all 15 cities and their landmarks", () => {
    expect(Object.keys(citiesTr).sort()).toEqual(
      Object.keys(cityProfiles).sort(),
    );
    for (const city of Object.values(cityProfiles)) {
      for (const text of [
        city.subtitle,
        city.transit,
        city.weather,
        ...city.districts.map((d) => d.description),
        ...city.landmarks.map((l) => l.description),
      ])
        expect(translate(text, "tr"), city.id).not.toBe(text);
    }
  });
  it("keeps developer-triggered reports in their actual city and company", () => {
    const event = makeOddEvent("cats", Date.now(), "translated-variant", {
      hub: "nyc",
      scope: "LOCAL",
    });
    expect(eventText(event, "headline", "tr")).toContain("New York");
    expect(eventText(event, "headline", "tr")).toContain("Nova Industries");
    expect(eventText(event, "headline", "tr")).not.toContain("İstanbul");
    expect(eventText(event, "headline", "en")).toBe(event.headline);
    expect(eventText(event, "body", "tr")).toContain("bağlayıcı oy");
  });
  it("formats financial values and matches Turkish letters in searches", () => {
    setFormatLanguage("tr");
    expect(decimalNumber(12482.32)).toBe("12.482,32");
    setFormatLanguage("en");
    expect(decimalNumber(12482.32)).toBe("12,482.32");
    expect(searchText("İSTANBUL")).toBe(searchText("istanbul"));
    expect(searchText("ışık")).toBe(searchText("isik"));
    expect(searchText(translate(scenarios.coffee.headline, "tr"))).toContain(
      "kahve",
    );
  });
  it("translates dynamic actions while preserving whitespace, quantities and symbols", () => {
    expect(translate("Explore Istanbul", "tr")).toBe("İstanbul şehrini keşfet");
    expect(translate("Visit London", "tr")).toBe("Londra şehrini ziyaret et");
    expect(translate("Bought 100 THRA · order filled", "tr")).toBe(
      "100 THRA alındı · emir gerçekleşti",
    );
    expect(translate(" World ", "tr")).toBe(" Dünya ");
    expect(translate(100, "tr")).toBe(100);
  });
});
