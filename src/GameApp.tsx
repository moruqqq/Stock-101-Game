import { useState } from "react";
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
import WorldScreen from "./WorldScreen";
import {
  DevSheet,
  MarketScreen,
  MarketsScreen,
  NewsScreen,
  PortfolioScreen,
  StockScreen,
  StorySheet,
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
  const game = useGame(),
    [stack, setStack] = useState<Route[]>([{ type: "world" }]),
    [dev, setDev] = useState(false),
    [story, setStory] = useState<MarketEvent | null>(null),
    [trade, setTrade] = useState<"BUY" | "SELL" | null>(null),
    [exposureMode, setExposureMode] = useState(false);
  const route = stack.at(-1)!,
    active =
      route.type === "market" || route.type === "stock"
        ? "markets"
        : route.type;
  const go = (r: Route) => setStack((s) => [...s, r]),
    tab = (type: Tab) => {
      setStack([{ type }]);
      setExposureMode(false);
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
          aria-label="Meridian home"
          onClick={() => tab("world")}
        >
          <Globe2 />
          <span>
            MERIDIAN<small>THE WORLD IS YOUR MARKET</small>
          </span>
        </button>
        <div className="top-center">
          <span className="live-dot" /> ALL SYSTEMS LIVE{" "}
          <span className="divider" /> GLOBAL MARKET SIMULATION
        </div>
        <button
          className="profile-button"
          aria-label="Open simulation controls"
          onClick={() => setDev(true)}
        >
          <span className="profile-avatar">
            <SlidersHorizontal size={13} />
          </span>
          <span>
            Explorer<small>SIMULATION CONTROLS</small>
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
                game={game}
                openStory={openStory}
                world={() => tab("world")}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="ticker" aria-label="Live stock ticker">
        <span className="ticker-label">
          <span className="live-dot" /> MARKET PULSE
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
                  <b>{c.symbol}</b>
                  <span
                    key={c.price}
                    className={`ticker-price flash-${c.flash}`}
                  >
                    {money(c.price, hubs.find((h) => h.id === c.hub)!.mark)}
                  </span>
                  <em className={changeOf(c) < 0 ? "negative" : ""}>
                    {changeOf(c) >= 0 ? "↗" : "↘"} {pct(changeOf(c))}
                  </em>
                </button>
              )),
            )}
          </div>
        </div>
      </div>
      <nav className="bottom-nav" aria-label="Main navigation">
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
            <span>{label}</span>
            {active === id && <i />}
            {id === "news" &&
              game.events.some(
                (e) => e.scope === "GLOBAL" && !game.discovered.includes(e.id),
              ) && <span className="nav-news-dot" />}
          </button>
        ))}
        <div className="nav-right">
          <button className="sim-speed" onClick={() => setDev(true)}>
            SIMULATION · {game.speed}×
          </button>
          <button
            aria-label={game.sound ? "Mute sounds" : "Enable sounds"}
            onClick={() => game.setSound(!game.sound)}
          >
            {game.sound ? <Volume2 size={17} /> : <VolumeX size={17} />}
          </button>
          <button aria-label="Simulation controls" onClick={() => setDev(true)}>
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
            {game.toast}
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {dev && <DevSheet game={game} close={() => setDev(false)} />}{" "}
        {story && (
          <StorySheet
            event={story}
            game={game}
            close={() => setStory(null)}
            openStock={openStock}
            explore={() => openMarket(story.hub)}
          />
        )}{" "}
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
