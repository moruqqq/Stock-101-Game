import { eventText, type ReportField } from "./locales/eventText";
import type { MarketEvent } from "./data";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  initialLanguage,
  setFormatLanguage,
  type Language,
} from "./localeFormat";
import { translate } from "./locales/catalog";

const Context = createContext({
  language: "en" as Language,
  setLanguage: (_: Language) => {},
  tr: <T,>(value: T): T => value,
  report: (event: MarketEvent, field: ReportField) => event[field] ?? "",
});
export function LocaleProvider({ children }: { children: ReactNode }) {
  const [language, setValue] = useState(initialLanguage);
  const setLanguage = useCallback((next: Language) => {
    setFormatLanguage(next);
    setValue(next);
    try {
      localStorage.setItem("meridian-language", next);
    } catch {
      /* Optional persistence. */
    }
  }, []);
  useEffect(() => {
    setFormatLanguage(language);
    document.documentElement.lang = language;
    document.title =
      language === "tr"
        ? "MERIDIAN — Hareket halindeki dünya"
        : "MERIDIAN — A world in motion";
  }, [language]);
  const tr = useCallback(
    <T,>(value: T) => translate(value, language),
    [language],
  );
  const report = useCallback(
    (event: MarketEvent, field: ReportField) =>
      eventText(event, field, language),
    [language],
  );
  const value = useMemo(
    () => ({ language, setLanguage, tr, report }),
    [language, setLanguage, tr, report],
  );
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export const useLocale = () => useContext(Context);
export function LanguageSwitcher() {
  const { language, setLanguage } = useLocale();
  return (
    <div
      className="language-switcher"
      role="group"
      aria-label={language === "tr" ? "Dil seçimi" : "Language"}
    >
      {(["tr", "en"] as const).map((code) => (
        <button
          key={code}
          type="button"
          lang={code}
          aria-label={code === "tr" ? "Türkçe" : "English"}
          aria-pressed={language === code}
          onClick={() => setLanguage(code)}
        >
          {code.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
