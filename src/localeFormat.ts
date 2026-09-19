export type Language = "tr" | "en";
export function initialLanguage(): Language {
  try {
    const stored = localStorage.getItem("meridian-language");
    if (stored === "tr" || stored === "en") return stored;
  } catch {
    /* Storage is optional in private WebViews. */
  }
  return typeof navigator !== "undefined" && navigator.language.startsWith("tr")
    ? "tr"
    : "en";
}
let activeLanguage: Language = initialLanguage();
export function setFormatLanguage(value: Language) {
  activeLanguage = value;
}
export function currentLanguage() {
  return activeLanguage;
}
export function numberLocale() {
  return activeLanguage === "tr" ? "tr-TR" : "en-US";
}
const decimals = {
  tr: new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }),
  en: new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }),
};
export const decimalNumber = (n: number) => decimals[activeLanguage].format(n);
export function searchText(text: string) {
  return text
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replaceAll("ı", "i");
}
