import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Globe2,
  ArrowUpRight,
  ArrowRight,
  Plus,
  Minus,
  LocateFixed,
  MoveUpRight,
  ChevronDown,
  X,
  BriefcaseBusiness,
} from "lucide-react";
import Globe, { type GlobeCommand, type GlobeView } from "./Globe";
import {
  hubs,
  localTime,
  session,
  duration,
  money,
  changeOf,
  type MarketEvent,
} from "./data";
import { type Game } from "./useGame";
import { Change, Sheet } from "./UI";

export default function WorldScreen({
  game,
  openMarket,
  openStory,
  exposureMode,
  setExposureMode,
}: {
  game: Game;
  openMarket: (id: string) => void;
  openStory: (e: MarketEvent) => void;
  exposureMode: boolean;
  setExposureMode: (b: boolean) => void;
}) {
  const { now, events, companies } = game;
  const [selected, setSelected] = useState<string | null>(null),
    [command, setCommand] = useState<GlobeCommand>({ id: 0 }),
    [view, setView] = useState<GlobeView>({
      level: "global",
      hub: hubs[2],
      distance: 6.6,
    }),
    [regionPicker, setRegionPicker] = useState(false);
  const hub = hubs.find((h) => h.id === selected),
    status = hub ? session(hub, now) : null;
  const select = useCallback((id: string) => {
    setSelected(id);
    setCommand({ id: performance.now(), hub: id, zoom: 3.35 });
  }, []);
  const focusEvent = (e: MarketEvent) => {
    if (
      (view.level === "city" && view.hub.id === e.hub) ||
      e.scope === "GLOBAL"
    ) {
      game.discover([e.id]);
      openStory(e);
    } else {
      select(e.hub);
      game.notify(`Exploring ${e.location} · zoom in to discover the story`);
    }
  };
  const visibleEvents = events.filter(
    (e) => e.scope === "GLOBAL" || game.discovered.includes(e.id),
  );
  const nearby = events
    .filter(
      (e) =>
        e.scope === "GLOBAL" ||
        (e.scope === "REGIONAL" &&
          hubs.find((h) => h.id === e.hub)?.region === view.hub.region &&
          view.level !== "global") ||
        (e.scope === "LOCAL" && e.hub === view.hub.id && view.level === "city"),
    )
    .sort(
      (a, b) =>
        ({ LOCAL: 0, REGIONAL: 1, GLOBAL: 2 })[a.scope] -
        { LOCAL: 0, REGIONAL: 1, GLOBAL: 2 }[b.scope],
    );
  const nearbyIds = nearby.map((e) => e.id).join(",");
  useEffect(() => {
    game.discover(nearbyIds.split(",").filter(Boolean));
  }, [nearbyIds]);
  const counts = hubs.reduce(
    (a, h) => {
      a[session(h, now).status]++;
      return a;
    },
    { OPEN: 0, CLOSING: 0, "PRE-MARKET": 0, CLOSED: 0 },
  );
  const exposure = useMemo(() => {
    const out: Record<string, number> = {};
    game.account.holdings.forEach((h) => {
      const c = companies.find((c) => c.symbol === h.symbol)!;
      out[c.hub] =
        (out[c.hub] ?? 0) +
        h.quantity * c.price * hubs.find((h) => h.id === c.hub)!.fx;
    });
    return out;
  }, [game.account, companies]);
  const focus = hub ?? (view.level !== "global" ? view.hub : null),
    focusStocks = focus
      ? companies
          .filter((c) => c.hub === focus.id)
          .sort((a, b) => changeOf(b) - changeOf(a))
      : [];
  const regionalHubs = hubs.filter((h) => h.region === view.hub.region),
    liveRegion =
      hubs.find((h) => ["OPEN", "CLOSING"].includes(session(h, now).status))
        ?.region ?? "Asia";
  return (
    <main className={`world-page ${focus ? "has-selection" : ""}`}>
      <Globe
        now={now}
        events={events}
        selected={selected}
        command={command}
        onSelect={select}
        onEvent={focusEvent}
        onView={setView}
        exposure={exposureMode ? exposure : undefined}
      />
      <div className="world-top">
        <div>
          <div className="eyebrow">
            <span className="live-dot" />{" "}
            {exposureMode ? "YOUR GLOBAL FOOTPRINT" : "A WORLD IN MOTION"}
          </div>
          <h1>
            {exposureMode ? (
              <>
                One portfolio.
                <br />
                <span>A world of possibility.</span>
              </>
            ) : (
              <>
                Follow the sun.
                <br />
                <span>Find your opportunity.</span>
              </>
            )}
          </h1>
          <p>
            {exposureMode
              ? "See where your capital is at work."
              : "Every market has a moment. Discover yours."}
          </p>
        </div>
        <div className="global-clock">
          <span className="eyebrow">
            GLOBAL MARKET CLOCK <span className="muted">UTC</span>
          </span>
          <strong>{localTime(now, "UTC", true)}</strong>
          <div className="market-counts">
            <span>
              <i className="live-dot" />
              {counts.OPEN + counts.CLOSING} <small>OPEN</small>
            </span>
            <span>
              <i className="live-dot amber" />
              {counts["PRE-MARKET"]} <small>PRE-MARKET</small>
            </span>
            <span>
              <i className="live-dot grey" />
              {counts.CLOSED} <small>CLOSED</small>
            </span>
          </div>
        </div>
      </div>
      <div className="world-left">
        <span className="eyebrow">YOUR PERSPECTIVE</span>
        <button
          className="perspective"
          onClick={() => setRegionPicker(true)}
          aria-label="Explore regions"
        >
          <span className="active">Global</span>
          <span>/</span>
          <span>
            {view.level === "global" ? "All markets" : view.hub.region}
          </span>
          <ChevronDown size={10} />
        </button>
        <div className="map-legend">
          <span>
            <i className="live-dot" />
            Market open
          </span>
          <span>
            <i className="live-dot grey" />
            Market closed
          </span>
          <span>
            <i className="event-dot" />
            Developing story
          </span>
        </div>
        <button
          className={`exposure-toggle ${exposureMode ? "active" : ""}`}
          onClick={() => setExposureMode(!exposureMode)}
        >
          <BriefcaseBusiness size={12} />
          {exposureMode ? "Market activity" : "My investments"}
        </button>
      </div>
      <div className="world-right">
        <div className="section-heading">
          <span className="eyebrow">
            {view.level === "global"
              ? "ON THE RADAR"
              : `${view.hub.region.toUpperCase()} · INTELLIGENCE`}
          </span>
          <span className="pill">LIVE</span>
        </div>
        {nearby.slice(0, 2).map((e) => (
          <button
            key={e.id}
            className="radar-story"
            onClick={() => {
              game.discover([e.id]);
              openStory(e);
            }}
          >
            <div className="story-meta">
              <span>{e.location.toUpperCase()}</span>
              <span>
                {Math.max(0, Math.floor((now - e.timestamp) / 60000))} MIN AGO
              </span>
            </div>
            <h3>{e.headline}</h3>
            <div className="story-footer">
              <span className="sector-tag">
                {e.category} <MoveUpRight size={11} />
              </span>
              <ArrowUpRight size={15} />
            </div>
          </button>
        ))}
        {view.level !== "global" ? (
          <div className="regional-markets">
            {regionalHubs.map((h) => (
              <button key={h.id} onClick={() => select(h.id)}>
                <span>{h.name}</span>
                <i
                  className={`live-dot ${session(h, now).status === "CLOSED" ? "grey" : session(h, now).status === "PRE-MARKET" ? "amber" : ""}`}
                />
                <small>{session(h, now).status}</small>
              </button>
            ))}
          </div>
        ) : (
          <div className="world-note">
            <span className="crosshair">+</span>
            <p>
              Opportunity doesn’t stand still.
              <br />
              Neither should you.
            </p>
          </div>
        )}
      </div>
      <div className="map-controls">
        <button
          aria-label="Zoom in"
          onClick={() => setCommand({ id: performance.now(), zoom: -1 })}
        >
          <Plus size={18} />
        </button>
        <button
          aria-label="Zoom out"
          onClick={() => setCommand({ id: performance.now(), zoom: 1 })}
        >
          <Minus size={18} />
        </button>
        <span />
        <button
          aria-label="Reset globe"
          onClick={() => {
            setSelected(null);
            setCommand({ id: performance.now(), reset: true });
          }}
        >
          <LocateFixed size={18} />
        </button>
      </div>
      <div className="globe-caption">
        <span>DRAG TO EXPLORE</span>
        <i />
        <span>SCROLL TO ZOOM</span>
      </div>
      <div className="world-bottom">
        <div className={`session-card ${focus ? "focused" : ""}`}>
          <div className="session-icon">
            <Globe2 size={22} />
          </div>
          <div className="session-copy">
            <span className="eyebrow">
              {focus
                ? `${focus.country.toUpperCase()} · ${view.level.toUpperCase()} VIEW`
                : `THE ${liveRegion.toUpperCase()} SESSION`}
            </span>
            <h3>
              {focus ? focus.name : `${liveRegion} is in focus`}{" "}
              <span
                className={`live-dot ${focus && session(focus, now).status === "CLOSED" ? "grey" : ""}`}
              />
            </h3>
            <p>
              {focus
                ? `${session(focus, now).status} · ${localTime(now, focus.zone)} local`
                : "Follow the opening bell around the world."}
            </p>
            {focus && (
              <div className="selected-index">
                <span>{money(focus.index, "")}</span>
                <Change value={focus.change} />
                <small>
                  {["OPEN", "CLOSING"].includes(session(focus, now).status)
                    ? "Closes"
                    : "Opens"}{" "}
                  {duration(session(focus, now).remaining)}
                </small>
              </div>
            )}
            {focus && view.level === "city" && (
              <div className="mini-movers">
                {focusStocks.slice(0, 3).map((c) => (
                  <span key={c.symbol}>
                    {c.symbol} <Change value={changeOf(c)} />
                  </span>
                ))}
              </div>
            )}
            {focus &&
              view.level !== "global" &&
              nearby.some((e) => e.scope !== "GLOBAL") && (
                <button
                  className="local-story-preview"
                  onClick={() => openStory(nearby[0])}
                >
                  <span className="event-dot" />
                  <span>{nearby[0].headline}</span>
                  <ArrowUpRight size={12} />
                </button>
              )}
          </div>
          <button
            className="round-arrow"
            aria-label={`Enter ${focus?.name ?? "Istanbul"} exchange`}
            onClick={() =>
              openMarket(
                focus?.id ??
                  hubs.find((h) => h.region === liveRegion)?.id ??
                  "ist",
              )
            }
          >
            <ArrowRight size={20} />
          </button>
          {focus && (
            <button
              className="deselect"
              aria-label="Clear selection"
              onClick={() => {
                setSelected(null);
                setCommand({ id: performance.now(), reset: true });
              }}
            >
              <X size={13} />
            </button>
          )}
        </div>
        <button
          className="discovery-card"
          onClick={() => openStory(visibleEvents[0])}
        >
          <span className="event-dot" />
          <div>
            <span className="eyebrow">INTELLIGENCE IS EVERYWHERE</span>
            <p>A new story is unfolding in {visibleEvents[0]?.location}.</p>
          </div>
          <ArrowUpRight size={18} />
        </button>
      </div>
      {regionPicker && (
        <Sheet
          title="Choose your horizon"
          eyebrow="WORLD EXPLORER"
          close={() => setRegionPicker(false)}
        >
          <div className="region-picker">
            {[
              ["Europe", "lon"],
              ["Americas", "nyc"],
              ["Asia", "tok"],
              ["Middle East", "dub"],
              ["Oceania", "syd"],
            ].map(([name, id]) => (
              <button
                key={id}
                onClick={() => {
                  setSelected(null);
                  setCommand({ id: performance.now(), hub: id, zoom: 4.6 });
                  setRegionPicker(false);
                }}
              >
                <Globe2 size={18} />
                <span>
                  {name}
                  <small>
                    {hubs.filter((h) => h.region === name).length} financial
                    centers
                  </small>
                </span>
                <ArrowUpRight size={17} />
              </button>
            ))}
          </div>
          <p className="sheet-note">
            Drag to rotate the world. Pinch to move closer. Local stories reveal
            themselves as you explore.
          </p>
        </Sheet>
      )}
    </main>
  );
}
