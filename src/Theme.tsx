import { useLocale } from "./Locale";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Sun, Moon, Sunset, Palette, Check } from "lucide-react";
import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";

export type ThemeName = "light" | "mid" | "dark";
export const themeScenes = {
  light: {
    sky: "#dce9df",
    fog: "#dce9df",
    land: "#a8be8b",
    water: "#599faa",
    road: "#dad4bb",
    park: "#7eab79",
    ambient: 1.25,
    sun: 1.9,
    globe: "#ffffff",
  },
  mid: {
    sky: "#757f8b",
    fog: "#757f8b",
    land: "#7c927c",
    water: "#426a80",
    road: "#aaa59b",
    park: "#5c806e",
    ambient: 0.85,
    sun: 1.35,
    globe: "#b4bccf",
  },
  dark: {
    sky: "#142631",
    fog: "#142631",
    land: "#354e47",
    water: "#173e53",
    road: "#64706b",
    park: "#2e5a43",
    ambient: 0.58,
    sun: 0.9,
    globe: "#718798",
  },
};
const Context = createContext({
  theme: "light" as ThemeName,
  setTheme: (_: ThemeName) => {},
  scene: themeScenes.light,
});
export function ThemeProvider({ children }: { children: ReactNode }) {
  const { tr } = useLocale();
  const [theme, setTheme] = useState<ThemeName>(() => {
    try {
      const saved = localStorage.getItem("meridian-theme");
      return saved === "mid" || saved === "dark" ? saved : "light";
    } catch {
      return "light";
    }
  });
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    if (Capacitor.isNativePlatform())
      void StatusBar.setStyle({
        style: theme === "light" ? Style.Dark : Style.Light,
      }).catch(() => {});
    document.documentElement.style.colorScheme =
      theme === "light" ? "light" : "dark";
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute(
        "content",
        { light: "#f5f2e9", mid: "#464e59", dark: "#13212b" }[theme],
      );
    try {
      localStorage.setItem("meridian-theme", theme);
    } catch {}
  }, [theme]);
  return (
    <Context.Provider value={{ theme, setTheme, scene: themeScenes[theme] }}>
      {tr(children)}
    </Context.Provider>
  );
}
export const useTheme = () => useContext(Context);
export function ThemeSwitcher() {
  const { tr } = useLocale();
  const { theme, setTheme } = useTheme(),
    [open, setOpen] = useState(false),
    host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const close = (e: PointerEvent) => {
      if (!host.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);
  return (
    <div
      className="theme-switcher"
      ref={host}
      onKeyDown={(e) => {
        if (e.key === "Escape") setOpen(false);
      }}
    >
      <button
        className="theme-trigger"
        aria-label={tr("Choose appearance")}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <Palette size={18} />
      </button>
      {open && (
        <div className="theme-menu" role="group" aria-label={tr("Appearance")}>
          <span className="eyebrow">{tr("APPEARANCE")}</span>
          {(
            [
              ["light", "Light", Sun],
              ["mid", "Mid", Sunset],
              ["dark", "Dark", Moon],
            ] as const
          ).map(([id, label, Icon]) => (
            <button
              key={id}
              aria-pressed={theme === id}
              onClick={() => {
                setTheme(id);
                setOpen(false);
              }}
            >
              <span className={`theme-swatch ${id}`}>
                <Icon size={15} />
              </span>
              {tr(label)}
              {theme === id && <Check size={14} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
