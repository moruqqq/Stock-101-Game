import { useLocale } from "./Locale";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Compass,
  Globe2,
  MapPin,
  Plus,
  Minus,
  LocateFixed,
  ChevronDown,
  Play,
  Sparkles,
  BriefcaseBusiness,
} from "lucide-react";
import Globe, { type GlobeCommand, type GlobeView } from "./Globe";
import CityWorld from "./CityWorld";
import { StoryThumbnail } from "./NewsReel";
import { hubs, session, localTime, type MarketEvent } from "./data";
import { type Game } from "./useGame";
import { Sheet, StatusBadge } from "./UI";
export default function PlayfulWorld({
  game,
  openMarket,
  openStock,
  openStory,
  exposureMode,
  setExposureMode,
  paused = false,
  requestedCity,
}: {
  game: Game;
  openMarket: (s: string) => void;
  openStock: (s: string) => void;
  openStory: (e: MarketEvent) => void;
  exposureMode: boolean;
  setExposureMode: (b: boolean) => void;
  paused?: boolean;
  requestedCity?: { id: string; key: number; eventId?: string };
}) {
  const { tr, report } = useLocale();
  const [selected, setSelected] = useState<string | null>(null),
    [city, setCity] = useState<string | null>(requestedCity?.id ?? null),
    [command, setCommand] = useState<GlobeCommand>({ id: 0 }),
    [view, setView] = useState<GlobeView>({
      level: "global",
      hub: hubs.find((h) => h.id === "nai")!,
      distance: 6.6,
    }),
    [picker, setPicker] = useState(false);
  const select = useCallback((id: string) => {
    setSelected(id);
    setCommand({ id: performance.now(), hub: id, zoom: 2.65 });
  }, []);
  const enterCity = (id: string) => {
    setCity(id);
    setSelected(id);
    game.discover(
      game.events.filter((event) => event.hub === id).map((event) => event.id),
    );
  };
  useEffect(() => {
    if (requestedCity) {
      setCity(requestedCity.id);
      setSelected(requestedCity.id);
    }
  }, [requestedCity?.key]);
  const updateView = useCallback((v: GlobeView) => setView(v), []);
  const backToPlanet = () => {
    setCity(null);
    setSelected(null);
    setView({
      level: "global",
      hub: hubs.find((h) => h.id === "nai")!,
      distance: 6.6,
    });
    setCommand({ id: performance.now(), reset: true });
  };
  const nearby = game.events.filter(
    (e) =>
      e.scope === "GLOBAL" ||
      game.discovered.includes(e.id) ||
      (e.scope === "REGIONAL" &&
        view.level !== "global" &&
        hubs.find((h) => h.id === e.hub)?.region === view.hub.region),
  );
  const discoveredIds = nearby.map((e) => e.id).join(",");
  useEffect(() => {
    game.discover(discoveredIds.split(","));
  }, [discoveredIds]);
  const counts = hubs.reduce(
    (a, h) => {
      a[session(h, game.now).status]++;
      return a;
    },
    { OPEN: 0, CLOSING: 0, "PRE-MARKET": 0, CLOSED: 0 },
  );
  const exposure = useMemo(() => {
    const result: Record<string, number> = {};
    game.account.holdings.forEach((p) => {
      const c = game.companies.find((c) => c.symbol === p.symbol)!;
      result[c.hub] =
        (result[c.hub] ?? 0) +
        p.quantity * c.price * hubs.find((h) => h.id === c.hub)!.fx;
    });
    return result;
  }, [game.account, game.companies]);
  const lead = nearby[0],
    regional = view.level !== "global",
    focus = selected
      ? hubs.find((h) => h.id === selected)
      : regional
        ? view.hub
        : null;
  if (city)
    return (
      <CityWorld
        key={city}
        hubId={city}
        requestedEvent={
          requestedCity?.id === city ? requestedCity.eventId : undefined
        }
        requestKey={requestedCity?.key}
        game={game}
        back={backToPlanet}
        openMarket={openMarket}
        openStock={openStock}
        openStory={openStory}
        paused={paused}
      />
    );
  return (
    <main
      className="world-page playful-world"
      data-zoom-limit={view.atZoomLimit ? "true" : "false"}
    >
      <Globe
        now={game.now}
        events={game.events}
        selected={selected}
        command={command}
        onSelect={select}
        onEnterCity={enterCity}
        onInteract={() => setSelected(null)}
        onEvent={(e) => {
          if (e.scope === "GLOBAL" || game.discovered.includes(e.id))
            openStory(e);
          else select(e.hub);
        }}
        onView={updateView}
        exposure={exposureMode ? exposure : undefined}
        paused={paused}
      />
      <div className="world-top">
        <div>
          <div className="world-sticker">
            <Sparkles size={12} /> {tr(" GLOBAL MARKET SIMULATION ")}
          </div>
          <h1>
            {exposureMode ? (
              <>
                {tr("Your growing ")}
                <br />
                <span>{tr("global portfolio.")}</span>
              </>
            ) : (
              <>
                {tr("One world. ")}
                <br />
                <span>{tr("Always moving.")}</span>
              </>
            )}
          </h1>
          <p>{tr("Explore cities. Follow events. Read the market.")}</p>
        </div>
        <div className="global-clock">
          <span className="eyebrow">
            {tr("THE WORLD KEEPS TICKING ")}
            <small>{tr("UTC")}</small>
          </span>
          <strong>{tr(localTime(game.now, "UTC", true))}</strong>
          <div className="market-counts">
            <span>
              <i className="live-dot" />
              {tr(counts.OPEN + counts.CLOSING)} <small>{tr("AWAKE")}</small>
            </span>
            <span>
              <i className="live-dot amber" />
              {tr(counts["PRE-MARKET"])} <small>{tr("STRETCHING")}</small>
            </span>
            <span>
              <i className="live-dot grey" />
              {tr(counts.CLOSED)} <small>{tr("ASLEEP")}</small>
            </span>
          </div>
        </div>
      </div>
      <div className="world-left">
        <button
          className="perspective"
          aria-label={tr("Explore regions")}
          onClick={() => setPicker(true)}
        >
          <Globe2 size={13} />
          <span>{tr(regional ? view.hub.region : "Whole wide world")}</span>
          <ChevronDown size={12} />
        </button>
        <div className="world-postcard">
          <span className="postcard-spark">✳</span>
          <p>
            {tr("Go on. ")}
            <br />
            {tr("Give it a spin. ")}
          </p>
          <span className="doodle-arrow">⤵</span>
        </div>
        <button
          className={`exposure-toggle ${exposureMode ? "active" : ""}`}
          onClick={() => setExposureMode(!exposureMode)}
        >
          <BriefcaseBusiness size={13} />
          {tr(exposureMode ? "See the world" : "My investments")}
        </button>
      </div>
      <aside className="world-right">
        <div className="section-heading">
          <span className="eyebrow">{tr("WORLD DISPATCHES")}</span>
          <span className="odd-pill">!</span>
        </div>
        {nearby.slice(0, 2).map((e, i) => (
          <button className="odd-radar" key={e.id} onClick={() => openStory(e)}>
            <StoryThumbnail event={e} />
            <span className="odd-radar-copy">
              <small>
                <MapPin size={9} />
                {tr(e.location)}
              </small>
              <h3>{report(e, "headline")}</h3>
              <span className="watch-link">
                <Play size={10} fill="currentColor" /> {tr(" Watch report ")}
              </span>
            </span>
          </button>
        ))}
        <div className="world-tip">
          <Compass size={18} />
          <p>
            {tr("Zoom to the map limit. ")}
            <br />
            <b>{tr("Then zoom again to enter the city.")}</b>
          </p>
        </div>
      </aside>
      <div className="map-controls">
        <button
          aria-label={tr("Zoom in")}
          onClick={() => setCommand({ id: performance.now(), zoom: -1 })}
        >
          <Plus size={18} />
        </button>
        <button
          aria-label={tr("Zoom out")}
          onClick={() => setCommand({ id: performance.now(), zoom: 1 })}
        >
          <Minus size={18} />
        </button>
        <span />
        <button
          aria-label={tr("Reset globe")}
          onClick={() => {
            setSelected(null);
            setCommand({ id: performance.now(), reset: true });
          }}
        >
          <LocateFixed size={18} />
        </button>
      </div>
      <div className="globe-caption">
        <span>{tr("DRAG TO WANDER")}</span>
        <i />
        <span>
          {tr(
            view.atZoomLimit ? "ZOOM AGAIN TO ENTER" : "SCROLL TO GET CLOSER",
          )}
        </span>
      </div>
      <div className="world-bottom">
        <div className="journey-card">
          <div className="journey-icon">
            <Compass size={25} />
          </div>
          <div>
            <span className="eyebrow">
              {tr(
                view.atZoomLimit
                  ? "ZOOM AGAIN TO ENTER"
                  : focus
                    ? "REGIONAL VIEW"
                    : "SPIN THE WORLD. PINCH TO VISIT.",
              )}
            </span>
            <h3>
              {tr(focus ? `Explore ${focus.name}.` : "Your next destination.")}
            </h3>
            <div className="city-shortcuts">
              {(focus ? [focus.id] : ["ist", "nai", "tok"]).map((id) => {
                const h = hubs.find((h) => h.id === id)!;
                return (
                  <button
                    key={id}
                    onClick={() => enterCity(id)}
                    aria-label={tr(`Visit ${h.name}`)}
                  >
                    <MapPin size={10} />
                    {tr(h.name)}
                    <ArrowUpRight size={11} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <button
          className="city-directory-trigger"
          onClick={() => setPicker(true)}
        >
          {tr(`Explore all ${hubs.length} cities`)}
          <ArrowUpRight size={12} />
        </button>
        <button className="mobile-weird-story" onClick={() => openStory(lead)}>
          <span className="odd-pill">!</span>
          <span>
            <small>
              {tr("JUST IN · ")}
              {tr(lead.location.toUpperCase())}
            </small>
            <b>{report(lead, "headline")}</b>
          </span>
          <Play size={16} fill="currentColor" />
        </button>
        <button className="discovery-card" onClick={() => openStory(lead)}>
          <span className="event-dot" />
          <div>
            <span className="eyebrow">
              {tr("LOCAL EVENTS. GLOBAL CONSEQUENCES.")}
            </span>
            <p>{tr("Follow a developing story across the world.")}</p>
          </div>
          <ArrowUpRight size={18} />
        </button>
      </div>
      {picker && (
        <Sheet
          title={tr("Choose a region")}
          eyebrow="GLOBAL ATLAS"
          close={() => setPicker(false)}
        >
          <div className="region-picker">
            {[
              ["Africa", "nai"],
              ["Europe", "ist"],
              ["Americas", "nyc"],
              ["Asia", "tok"],
              ["Middle East", "dub"],
              ["Oceania", "syd"],
            ].map(([name, id]) => (
              <button
                key={id}
                onClick={() => {
                  setSelected(null);
                  setCommand({ id: performance.now(), hub: id, zoom: 4.5 });
                  setPicker(false);
                }}
              >
                <Globe2 size={18} />
                <span>
                  {tr(name)}
                  <small>
                    {tr(hubs.filter((h) => h.region === name).length)}{" "}
                    {tr(" cities to explore ")}
                  </small>
                </span>
                <ArrowUpRight size={17} />
              </button>
            ))}
          </div>
          <div className="city-directory">
            <span className="eyebrow">{tr("CITY DIRECTORY")}</span>
            {hubs.map((h) => (
              <button
                key={h.id}
                aria-label={tr("Visit " + h.name)}
                onClick={() => {
                  setPicker(false);
                  enterCity(h.id);
                }}
              >
                <MapPin size={14} />
                <span>
                  {tr(h.name)}
                  <small>{tr(h.country)}</small>
                </span>
                <ArrowUpRight size={13} />
              </button>
            ))}
          </div>
        </Sheet>
      )}
    </main>
  );
}
