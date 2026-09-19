import type { MarketEvent } from "../data";
import { hubs } from "../data";
import { scenarios } from "../scenarios";
import { translate } from "./catalog";
import type { Language } from "../localeFormat";

export type ReportField = "headline" | "body" | "consequence";
// Developer-triggered reports may move to another city. Translate the scenario
// while retaining that report's actual location and company.
export function eventText(
  event: MarketEvent,
  field: ReportField,
  language: Language,
): string {
  const actual = event[field] ?? "";
  if (language === "en") return actual;
  const source = event.scenario ? scenarios[event.scenario] : undefined;
  if (!source) return translate(actual, language);
  let text = translate(source[field], language);
  if (event.hub !== source.hub) {
    const original = hubs.find((h) => h.id === source.hub),
      destination = hubs.find((h) => h.id === event.hub);
    if (original && destination)
      text = text.replaceAll(
        translate(original.name, language),
        translate(destination.name, language),
      );
    if (event.scenario === "cats") {
      const company = event.headline.match(
        /^(.+) appoints an autonomous feline board/,
      )?.[1];
      if (company) text = text.replaceAll("Thrace Technologies", company);
    }
  }
  return text;
}
