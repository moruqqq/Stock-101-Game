import { eventText } from "./locales/eventText";
import { translate } from "./locales/catalog";
import { searchText } from "./localeFormat";
import { useLocale } from "./Locale";
import { useState, useEffect } from "react";
import {
  Search,
  ArrowRight,
  ArrowUpRight,
  MapPin,
  Play,
  Sparkles,
  Compass,
  Clapperboard,
} from "lucide-react";
import { type Game } from "./useGame";
import { hubs, localTime, sectorImpact, type MarketEvent } from "./data";
import NewsReel, { StoryThumbnail } from "./NewsReel";
import { Sheet, StockRow, Empty } from "./UI";
export function NewsScreen({
  game,
  openStory,
  world,
  paused = false,
}: {
  game: Game;
  openStory: (e: MarketEvent) => void;
  world: () => void;
  paused?: boolean;
}) {
  const { tr, report } = useLocale();
  const [filter, setFilter] = useState("All"),
    [query, setQuery] = useState(""),
    [limit, setLimit] = useState(12),
    visible = game.events.filter(
      (e) => e.scope === "GLOBAL" || game.discovered.includes(e.id),
    ),
    filtered = visible.filter(
      (e) =>
        filter === "All" ||
        (filter === "Global" && e.scope === "GLOBAL") ||
        hubs.find((h) => h.id === e.hub)?.region === filter,
    ),
    searched = filtered.filter((e) =>
      searchText(
        [
          e.headline,
          e.location,
          e.category,
          e.body,
          eventText(e, "headline", "tr"),
          eventText(e, "body", "tr"),
          ...e.sectors,
        ]
          .flatMap((text) => [text, translate(text, "tr")])
          .join(" "),
      ).includes(searchText(query)),
    ),
    lead = searched[0],
    locked = game.events.length - visible.length;
  useEffect(() => setLimit(12), [filter, query]);
  return (
    <main className="scroll-page odd-news-page">
      <div className="page-container">
        <header className="odd-news-header">
          <span className="world-sticker">
            <Sparkles size={12} /> {tr(" MERIDIAN WIRE ")}
          </span>
          <h1>
            {tr("The world, ")}
            <br />
            <span>{tr("as it develops.")}</span>
          </h1>
          <p>{tr("Local developments. Global consequences.")}</p>
          <span className="edition-stamp">
            24 / 7
            <br />
            <b>{tr("COVERAGE")}</b>
          </span>
        </header>
        <div className="news-search">
          <Search size={16} />
          <input
            aria-label={tr("Search news")}
            placeholder={tr("Search reports, places, sectors…")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <span>
            {tr(visible.length)} {tr(" reports")}
          </span>
        </div>
        <div className="filter-tabs">
          {[
            "All",
            "Global",
            "Africa",
            "Americas",
            "Europe",
            "Asia",
            "Middle East",
            "Oceania",
          ].map((f) => (
            <button
              className={filter === f ? "active" : ""}
              key={f}
              onClick={() => setFilter(f)}
            >
              {tr(f)}
            </button>
          ))}
        </div>
        {lead ? (
          <div className="odd-news-layout">
            <article className="feature-news">
              <NewsReel event={lead} paused={paused} />
              <div className="feature-news-copy">
                <div className="story-meta">
                  <span>
                    <MapPin size={10} />
                    {tr(lead.location)}
                  </span>
                  <span>
                    {tr(localTime(lead.timestamp, "UTC"))} {tr(" UTC")}
                  </span>
                  <span>
                    {tr(
                      lead.scope === "GLOBAL"
                        ? "GLOBAL"
                        : lead.scope === "LOCAL"
                          ? "LOCAL"
                          : "REGIONAL",
                    )}
                  </span>
                </div>
                <button
                  className="news-headline-button"
                  onClick={() => openStory(lead)}
                >
                  <h2>{report(lead, "headline")}</h2>
                </button>
                <p>{report(lead, "body").split(". ")[0]}.</p>
                <ImpactTags event={lead} />
                <button className="read-ripple" onClick={() => openStory(lead)}>
                  {tr("Read the market implications ")}
                  <ArrowRight size={17} />
                </button>
              </div>
            </article>
            <div className="odd-news-rest">
              <span className="eyebrow">{tr("LATEST DISPATCHES")}</span>
              {searched.slice(1, limit).map((e) => (
                <button
                  className="small-story"
                  key={e.id}
                  onClick={() => openStory(e)}
                >
                  <StoryThumbnail event={e} />
                  <div>
                    <span className="story-meta">
                      <MapPin size={9} />
                      {tr(e.location)}
                    </span>
                    <h3>{report(e, "headline")}</h3>
                    <span className="watch-link">
                      <Play size={10} fill="currentColor" />{" "}
                      {tr(" Read report")}
                      {tr(" ")}
                      <ArrowUpRight size={11} />
                    </span>
                  </div>
                </button>
              ))}
              {searched.length === 1 && (
                <div className="news-empty-side">
                  <Compass size={29} />
                  <h3>{tr("Explore further.")}</h3>
                  <p>
                    {tr(
                      "Visit a city to unlock reports from its local correspondents. ",
                    )}
                  </p>
                  <button onClick={world}>
                    {tr("Explore the world ")}
                    <ArrowRight size={15} />
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <Empty
            title={tr("No matching reports.")}
            text="Visit this region to discover local reports, or try another search."
          />
        )}
        {searched.length > limit && (
          <button
            className="secondary-button full load-reports"
            onClick={() => setLimit((n) => n + 12)}
          >
            {tr("Load more reports (")}
            {tr(searched.length - limit)})
          </button>
        )}
        {locked > 0 && (
          <button className="discovery-prompt" onClick={world}>
            <Compass size={24} />
            <div>
              <h3>
                {tr(locked)}{" "}
                {tr(" regional and local reports await discovery.")}
              </h3>
              <p>
                {tr(
                  "Zoom into a city. Read local developments. Find your next opportunity. ",
                )}
              </p>
            </div>
            <ArrowRight size={19} />
          </button>
        )}
      </div>
    </main>
  );
}
export function ImpactTags({ event }: { event: MarketEvent }) {
  const { tr, report } = useLocale();
  return (
    <div className="impact-tags">
      {event.sectors.slice(0, 3).map((s) => (
        <span
          className={`sector-tag ${sectorImpact(event, s) < 0 ? "down" : ""}`}
          key={s}
        >
          {tr(s)} {tr(sectorImpact(event, s) >= 0 ? "↗" : "↘")}
        </span>
      ))}
    </div>
  );
}
export function StorySheet({
  event,
  game,
  close,
  openStock,
  explore,
}: {
  event: MarketEvent;
  game: Game;
  close: () => void;
  openStock: (s: string) => void;
  explore: () => void;
}) {
  const { tr, report } = useLocale();
  const h = hubs.find((h) => h.id === event.hub)!,
    affected = game.companies
      .filter(
        (c) =>
          event.companies.includes(c.symbol) ||
          (event.sectors.includes(c.sector) &&
            (event.scope === "GLOBAL" ||
              (event.scope === "REGIONAL" &&
                hubs.find((h) => h.id === c.hub)?.region === h.region) ||
              (event.scope === "LOCAL" && c.hub === h.id))),
      )
      .slice(0, 4);
  return (
    <Sheet
      title={tr("Meridian Wire")}
      eyebrow={`${event.location.toUpperCase()} · ${event.category.toUpperCase()}`}
      close={close}
      wide
    >
      <article className="story-article odd-article">
        <NewsReel event={event} />
        <div className="article-location">
          <MapPin size={12} />
          {tr(event.location)}
          <small>
            {tr(localTime(event.timestamp, h.zone))} {tr(" LOCAL")}
          </small>
        </div>
        <h1>{report(event, "headline")}</h1>
        <p>{report(event, "body")}</p>
        <section className="odd-consequence">
          <span className="eyebrow">
            <Sparkles size={12} /> {tr(" MARKET IMPLICATIONS ")}
          </span>
          <h3>{tr("Transmission across markets.")}</h3>
          <p>{report(event, "consequence")}</p>
          <div className="impact-explanation">
            {event.sectors.map((s) => (
              <div key={s}>
                <span>{tr(s)}</span>
                <b
                  className={
                    sectorImpact(event, s) >= 0 ? "positive" : "negative"
                  }
                >
                  {tr(
                    sectorImpact(event, s) >= 0
                      ? "↗ Positive pressure"
                      : "↘ Negative pressure",
                  )}
                </b>
              </div>
            ))}
          </div>
          <small>
            {tr(
              event.scope === "GLOBAL"
                ? "This affects relevant sectors across open exchanges."
                : event.scope === "REGIONAL"
                  ? `This affects markets across ${h.region}.`
                  : `This affects companies in ${h.name}.`,
            )}
            {tr(" ")}
            {tr("Effects fade over two game hours. ")}
          </small>
        </section>
        {event.chain && (
          <section className="report-chain">
            <span className="eyebrow">{tr("DEVELOPING STORY")}</span>
            <h3>{tr(event.chain)}</h3>
            {game.events
              .filter((e) => e.chain === event.chain)
              .slice()
              .reverse()
              .map((e) => (
                <div key={e.id} className={e.id === event.id ? "current" : ""}>
                  <span>
                    {tr(localTime(e.timestamp, "UTC"))} {tr(" UTC")}
                  </span>
                  <b>{report(e, "headline")}</b>
                  <small>{tr(e.location)}</small>
                </div>
              ))}
            {event.next &&
              !game.events.some((e) => e.scenario === event.next) && (
                <p>
                  {tr(
                    "Further coverage is developing. New dispatches arrive as the simulation advances. ",
                  )}
                </p>
              )}
          </section>
        )}
        <section className="article-companies">
          <span className="eyebrow">{tr("AFFECTED COMPANIES")}</span>
          {affected.map((c) => (
            <StockRow
              key={c.symbol}
              company={c}
              onClick={() => openStock(c.symbol)}
            />
          ))}
        </section>
        <button className="primary-button full" onClick={explore}>
          <Compass size={18} /> {tr(`Explore ${h.name}`)}{" "}
          <ArrowRight size={18} />
        </button>
        <p className="fine-print">
          {tr(
            "Fictional simulation report. All events and market effects belong to this game. ",
          )}
        </p>
      </article>
    </Sheet>
  );
}
