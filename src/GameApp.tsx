import { useLocale, LanguageSwitcher } from "./Locale";
import { useState } from "react";
import { ThemeSwitcher } from "./Theme";
import { AnimatePresence, motion } from "framer-motion";
import {
  Globe2,
  ChartNoAxesCombined,
  BriefcaseBusiness,
  Newspaper,
  SlidersHorizontal,
  ChevronDown,
  Volume2,
  VolumeX,
  Check,
} from "lucide-react";
import WorldScreen from "./PlayfulWorld";
import { NewsScreen, StorySheet } from "./PlayfulNews";
import {
  DevSheet,
  MarketScreen,
  MarketsScreen,
  PortfolioScreen,
  StockScreen,
  TradeSheet,
} from "./Screens";
import { useGame } from "./useGame";
import { changeOf, hubs, money, pct, type MarketEvent } from "./data";
type Tab = "world" | "markets" | "portfolio" | "news";
type Route =
  | { type: Tab }
  | { type: "market"; id: string }
  | { type: "stock"; symbol: string };
export default function GameApp() {
  const { tr } = useLocale();
  const game = useGame(),
    [stack, setStack] = useState<Route[]>([{ type: "world" }]),
    [dev, setDev] = useState(false),
    [story, setStory] = useState<MarketEvent | null>(null),
    [trade, setTrade] = useState<"BUY" | "SELL" | null>(null),
    [exposureMode, setExposureMode] = useState(false),
    [requestedCity, setRequestedCity] = useState<
      { id: string; key: number; eventId?: string } | undefined
    >();
  const route = stack.at(-1)!,
    active =
      route.type === "market" || route.type === "stock"
        ? "markets"
        : route.type;
  const go = (r: Route) => setStack((s) => [...s, r]),
    tab = (type: Tab) => {
      setStack([{ type }]);
      setExposureMode(false);
      setRequestedCity(undefined);
    },
    back = () =>
      setStack((s) => (s.length > 1 ? s.slice(0, -1) : [{ type: "world" }]));
  const openMarket = (id: string) => {
      setStory(null);
      go({ type: "market", id });
      game.discover(game.events.filter((e) => e.hub === id).map((e) => e.id));
    },
    openStock = (symbol: string) => {
      setStory(null);
      go({ type: "stock", symbol });
    };
  const openStory = (e: MarketEvent) => {
    game.discover([e.id]);
    setStory(e);
  };
  const tickerCompanies = game.companies.filter((c) =>
    ["THRA", "NOVA", "TKYO", "KERN", "CRWN", "DUNE", "MARM", "VEDA"].includes(
      c.symbol,
    ),
  );
  return (
    <div className="app-shell">
      <header className="topbar">
        <button
          className="brand"
          aria-label={tr("Meridian home")}
          onClick={() => tab("world")}
        >
          <Globe2 />
          <span>
            {tr("MERIDIAN")}
            <small>{tr("A WORLD IN MOTION")}</small>
          </span>
        </button>
        <div className="top-center">
          <span className="live-dot" /> {tr(" GLOBAL MARKET SIMULATION")}
          {tr(" ")}
          <span className="divider" /> {tr(" FOLLOW YOUR CURIOSITY ")}
        </div>
        <LanguageSwitcher />
        <ThemeSwitcher />
        <button
          className="profile-button"
          aria-label={tr("Open simulation controls")}
          onClick={() => setDev(true)}
        >
          <span className="profile-avatar">
            <SlidersHorizontal size={13} />
          </span>
          <span>
            {tr("Simulation")}
            <small>{tr("SCENARIO CONTROLS")}</small>
          </span>
          <ChevronDown size={14} />
        </button>
      </header>
      <div className="screen-outlet">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={
              route.type +
              ("id" in route ? route.id : "symbol" in route ? route.symbol : "")
            }
            className="screen-motion"
            initial={{ opacity: 0, y: 7 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            {route.type === "world" && (
              <WorldScreen
                game={game}
                openMarket={openMarket}
                openStock={openStock}
                requestedCity={requestedCity}
                paused={Boolean(story) || dev}
                openStory={openStory}
                exposureMode={exposureMode}
                setExposureMode={setExposureMode}
              />
            )}
            {route.type === "markets" && (
              <MarketsScreen
                game={game}
                openMarket={openMarket}
                openStock={openStock}
              />
            )}
            {route.type === "market" && (
              <MarketScreen
                id={route.id}
                game={game}
                back={back}
                openStock={openStock}
                openStory={openStory}
              />
            )}
            {route.type === "stock" && (
              <StockScreen
                symbol={route.symbol}
                game={game}
                back={back}
                order={setTrade}
                openStory={openStory}
              />
            )}
            {route.type === "portfolio" && (
              <PortfolioScreen
                game={game}
                openStock={openStock}
                world={() => {
                  tab("world");
                  setExposureMode(true);
                }}
              />
            )}
            {route.type === "news" && (
              <NewsScreen
                paused={Boolean(story) || dev}
                game={game}
                openStory={openStory}
                world={() => tab("world")}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="ticker" aria-label={tr("Live stock ticker")}>
        <span className="ticker-label">
          <span className="live-dot" /> {tr(" LIVE MARKETS ")}
        </span>
        <div className="ticker-window">
          <div className="ticker-track">
            {[0, 1].map((copy) =>
              tickerCompanies.map((c) => (
                <button
                  className="ticker-item"
                  key={copy + c.symbol}
                  onClick={() => openStock(c.symbol)}
                  tabIndex={copy ? -1 : 0}
                  aria-hidden={copy ? true : undefined}
                >
                  <b>{tr(c.symbol)}</b>
                  <span
                    key={c.price}
                    className={`ticker-price flash-${c.flash}`}
                  >
                    {tr(money(c.price, hubs.find((h) => h.id === c.hub)!.mark))}
                  </span>
                  <em className={changeOf(c) < 0 ? "negative" : ""}>
                    {tr(changeOf(c) >= 0 ? "↗" : "↘")} {tr(pct(changeOf(c)))}
                  </em>
                </button>
              )),
            )}
          </div>
        </div>
      </div>
      <nav className="bottom-nav" aria-label={tr("Main navigation")}>
        {(
          [
            { icon: Globe2, label: "World", id: "world" },
            { icon: ChartNoAxesCombined, label: "Markets", id: "markets" },
            { icon: BriefcaseBusiness, label: "Portfolio", id: "portfolio" },
            { icon: Newspaper, label: "News", id: "news" },
          ] as const
        ).map(({ icon: Icon, label, id }) => (
          <button
            key={id}
            aria-current={active === id ? "page" : undefined}
            className={active === id ? "active" : ""}
            onClick={() => tab(id)}
          >
            <Icon size={20} />
            <span>{tr(label)}</span>
            {active === id && <i />}
            {id === "news" &&
              game.events.some(
                (e) => e.scope === "GLOBAL" && !game.discovered.includes(e.id),
              ) && <span className="nav-news-dot" />}
          </button>
        ))}
        <div className="nav-right">
          <button className="sim-speed" onClick={() => setDev(true)}>
            {tr("SIMULATION · ")}
            {tr(game.speed)}×
          </button>
          <button
            aria-label={tr(game.sound ? "Mute sounds" : "Enable sounds")}
            onClick={() => game.setSound(!game.sound)}
          >
            {game.sound ? <Volume2 size={17} /> : <VolumeX size={17} />}
          </button>
          <button
            aria-label={tr("Simulation controls")}
            onClick={() => setDev(true)}
          >
            <SlidersHorizontal size={18} />
          </button>
        </div>
      </nav>
      <AnimatePresence>
        {game.toast && (
          <motion.div
            className="toast"
            role="status"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Check size={15} />
            {tr(game.toast)}
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {dev && <DevSheet game={game} close={() => setDev(false)} />}
        {tr(" ")}
        {story && (
          <StorySheet
            event={story}
            game={game}
            close={() => setStory(null)}
            openStock={openStock}
            explore={() => {
              const id = story.hub;
              setStory(null);
              setStack([{ type: "world" }]);
              setRequestedCity({ id, key: Date.now(), eventId: story.id });
            }}
          />
        )}
        {tr(" ")}
        {trade && route.type === "stock" && (
          <TradeSheet
            symbol={route.symbol}
            side={trade}
            game={game}
            close={() => setTrade(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
