import { useMemo, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Search,
  Globe2,
  ChevronRight,
  Plus,
  Minus,
  Check,
  Radio,
  LockKeyhole,
  SlidersHorizontal,
  Volume2,
  VolumeX,
  Clock3,
} from "lucide-react";
import { type Game } from "./useGame";
import {
  hubs,
  session,
  localTime,
  duration,
  money,
  pct,
  compact,
  changeOf,
  makeHistory,
  isTrading,
  type Company,
  type MarketEvent,
} from "./data";
import { startingAccount } from "./engine";
import {
  Chart,
  Change,
  Empty,
  PageHeader,
  Sheet,
  StatusBadge,
  StockRow,
} from "./UI";

export function MarketsScreen({
  game,
  openMarket,
  openStock,
}: {
  game: Game;
  openMarket: (id: string) => void;
  openStock: (s: string) => void;
}) {
  const [region, setRegion] = useState("All"),
    [search, setSearch] = useState("");
  const filtered = hubs.filter(
    (h) =>
      (region === "All" || h.region === region) &&
      `${h.name} ${h.country}`.toLowerCase().includes(search.toLowerCase()),
  );
  const stockResults = search
    ? game.companies.filter((c) =>
        `${c.name} ${c.symbol}`.toLowerCase().includes(search.toLowerCase()),
      )
    : [];
  return (
    <main className="scroll-page">
      <div className="page-container">
        <PageHeader title="A world of opportunity." eyebrow="GLOBAL EXCHANGES">
          <span className="page-counter">
            <Radio size={15} />
            {hubs.filter((h) => isTrading(h, game.now)).length} markets trading
            now
          </span>
        </PageHeader>
        <div className="search-field">
          <Search size={16} />
          <input
            aria-label="Search markets and companies"
            placeholder="Find a market or company"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span>14 EXCHANGES</span>
        </div>
        <div className="filter-tabs">
          {["All", "Americas", "Europe", "Asia", "Middle East", "Oceania"].map(
            (r) => (
              <button
                key={r}
                className={region === r ? "active" : ""}
                onClick={() => setRegion(r)}
              >
                {r}
              </button>
            ),
          )}
        </div>
        {stockResults.length > 0 && (
          <section className="content-section">
            <span className="eyebrow">COMPANIES</span>
            {stockResults.map((c) => (
              <StockRow
                key={c.symbol}
                company={c}
                onClick={() => openStock(c.symbol)}
              />
            ))}
          </section>
        )}
        <div className="exchange-grid">
          {filtered.map((h, i) => {
            const stocks = game.companies.filter((c) => c.hub === h.id),
              change =
                stocks.reduce((s, c) => s + changeOf(c), 0) / stocks.length,
              index = h.index * (1 + change / 1000);
            return (
              <button
                key={h.id}
                className="exchange-card"
                onClick={() => openMarket(h.id)}
              >
                <div className="exchange-top">
                  <span className="exchange-number">
                    {String(hubs.indexOf(h) + 1).padStart(2, "0")}
                  </span>
                  <StatusBadge hub={h} now={game.now} />
                </div>
                <div className="exchange-city">
                  <h2>{h.name}</h2>
                  <ArrowUpRight size={19} />
                </div>
                <p>
                  {h.country} <span>·</span> {localTime(game.now, h.zone)} local
                </p>
                <Chart
                  data={makeHistory(index, change)}
                  height={65}
                  negative={change < 0}
                />
                <div className="exchange-value">
                  <strong>{money(index, "")}</strong>
                  <Change value={change} />
                </div>
                <div className="exchange-bottom">
                  <span>{stocks.length} companies</span>
                  <span>
                    {isTrading(h, game.now) ? "Closes" : "Opens"} in{" "}
                    {duration(session(h, game.now).remaining)}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
        {!filtered.length && !stockResults.length && (
          <Empty
            title="No markets found"
            text="Try a city, country, company name, or ticker symbol."
          />
        )}
        <p className="fine-print">
          Fictional exchanges · Daily prototype sessions · All prices are
          simulated
        </p>
      </div>
    </main>
  );
}
export function MarketScreen({
  id,
  game,
  back,
  openStock,
  openStory,
}: {
  id: string;
  game: Game;
  back: () => void;
  openStock: (s: string) => void;
  openStory: (e: MarketEvent) => void;
}) {
  const h = hubs.find((h) => h.id === id)!,
    stocks = game.companies.filter((c) => c.hub === id),
    [tab, setTab] = useState("All companies");
  const sorted = [...stocks].sort((a, b) =>
    tab === "Top losers"
      ? changeOf(a) - changeOf(b)
      : tab === "Most active"
        ? b.volume - a.volume
        : changeOf(b) - changeOf(a),
  );
  const avg = stocks.reduce((s, c) => s + changeOf(c), 0) / stocks.length,
    index = h.index * (1 + avg / 1000),
    sectors = [...new Set(stocks.map((c) => c.sector))];
  return (
    <main className="scroll-page">
      <div className="page-container">
        <PageHeader
          title={`${h.name} Exchange`}
          eyebrow={`${h.country.toUpperCase()} / NEXUS MARKETS`}
          back={back}
        >
          <StatusBadge hub={h} now={game.now} />
        </PageHeader>
        <div className="market-session">
          <span>
            <Clock3 size={13} />
            {localTime(game.now, h.zone, true)} LOCAL
          </span>
          <span>
            {isTrading(h, game.now) ? "CLOSES" : "OPENS"} IN{" "}
            <b>{duration(session(h, game.now).remaining)}</b>
          </span>
        </div>
        <div className="market-layout">
          <section className="chart-panel">
            <div className="index-heading">
              <div>
                <span className="eyebrow">NEXUS {h.name.toUpperCase()}</span>
                <h2>{money(index, "")}</h2>
                <Change value={avg} />
              </div>
              <span className="subtle-pill">INTRADAY</span>
            </div>
            <Chart
              data={makeHistory(index, avg, 72)}
              height={210}
              interactive
            />
            <div className="chart-labels">
              <span>{`${Math.floor(h.open / 60)}:${String(h.open % 60).padStart(2, "0")}`}</span>
              <span>LOCAL SESSION</span>
              <span>{`${Math.floor(h.close / 60)}:${String(h.close % 60).padStart(2, "0")}`}</span>
            </div>
            <div className="stats-strip">
              <div>
                <span>MARKET VOLUME</span>
                <b>{compact(stocks.reduce((s, c) => s + c.volume, 0))}</b>
              </div>
              <div>
                <span>ADVANCING</span>
                <b className="positive">
                  {stocks.filter((c) => changeOf(c) > 0).length}
                </b>
              </div>
              <div>
                <span>DECLINING</span>
                <b className="negative">
                  {stocks.filter((c) => changeOf(c) < 0).length}
                </b>
              </div>
            </div>
          </section>
          <section className="sector-panel">
            <span className="eyebrow">SECTOR PERFORMANCE</span>
            {sectors.map((s) => {
              const cs = stocks.filter((c) => c.sector === s),
                v = cs.reduce((a, c) => a + changeOf(c), 0) / cs.length;
              return (
                <div className="sector-row" key={s}>
                  <div>
                    <span>{s}</span>
                    <Change value={v} />
                  </div>
                  <div className="sector-track">
                    <i
                      className={v < 0 ? "negative-bar" : ""}
                      style={{
                        width: `${Math.min(100, Math.abs(v) * 12 + 8)}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
            <p className="fine-print">
              Sector performance reflects listed companies in this prototype.
            </p>
          </section>
        </div>
        <div className="filter-tabs">
          {["All companies", "Top gainers", "Top losers", "Most active"].map(
            (t) => (
              <button
                className={tab === t ? "active" : ""}
                key={t}
                onClick={() => setTab(t)}
              >
                {t}
              </button>
            ),
          )}
        </div>
        <div className="stock-table">
          {sorted
            .filter((c) =>
              tab === "Top gainers"
                ? changeOf(c) > 0
                : tab === "Top losers"
                  ? changeOf(c) < 0
                  : true,
            )
            .map((c) => (
              <StockRow
                key={c.symbol}
                company={c}
                onClick={() => openStock(c.symbol)}
              />
            ))}
        </div>
        <section className="content-section">
          <div className="section-heading">
            <span className="eyebrow">FROM {h.name.toUpperCase()}</span>
            <Radio size={14} />
          </div>
          {game.events
            .filter((e) => e.hub === id)
            .slice(0, 3)
            .map((e) => (
              <button
                key={e.id}
                className="inline-news"
                onClick={() => {
                  game.discover([e.id]);
                  openStory(e);
                }}
              >
                <span className="event-dot" />
                <span>
                  {e.headline}
                  <small>
                    {e.category} · {e.scope.toLowerCase()}
                  </small>
                </span>
                <ArrowUpRight size={16} />
              </button>
            ))}
        </section>
      </div>
    </main>
  );
}
export function StockScreen({
  symbol,
  game,
  back,
  order,
  openStory,
}: {
  symbol: string;
  game: Game;
  back: () => void;
  order: (side: "BUY" | "SELL") => void;
  openStory: (e: MarketEvent) => void;
}) {
  const c = game.companies.find((c) => c.symbol === symbol)!,
    h = hubs.find((h) => h.id === c.hub)!,
    [period, setPeriod] = useState("1D");
  const history = useMemo(
    () =>
      period === "1D"
        ? c.history
        : makeHistory(
            c.price,
            ({ "1W": 4.2, "1M": 8.6, "3M": 14.3, "1Y": 24.7 }[period] ?? 1) *
              (changeOf(c) < 0 ? -0.4 : 1),
            80,
          ),
    [c, period],
  );
  const owned = game.account.holdings.find((p) => p.symbol === symbol);
  return (
    <main className="scroll-page stock-page">
      <div className="page-container">
        <PageHeader
          title={c.symbol}
          eyebrow={`${h.name.toUpperCase()} / ${c.sector.toUpperCase()}`}
          back={back}
        >
          <StatusBadge hub={h} now={game.now} />
        </PageHeader>
        <div className="company-subheading">
          <h2>{c.name}</h2>
          <span>{h.currency}</span>
        </div>
        <section className="stock-chart-panel">
          <div className="stock-big-price">{money(c.price, h.mark)}</div>
          <div className="stock-delta">
            <span className={changeOf(c) >= 0 ? "positive" : "negative"}>
              {c.price >= c.previousClose ? "+" : ""}
              {money(c.price - c.previousClose, h.mark)}
            </span>
            <Change value={changeOf(c)} />
            <small>TODAY</small>
          </div>
          <Chart
            data={history}
            height={220}
            negative={changeOf(c) < 0}
            interactive
          />
          <div className="period-tabs">
            {["1D", "1W", "1M", "3M", "1Y"].map((p) => (
              <button
                key={p}
                className={period === p ? "active" : ""}
                onClick={() => setPeriod(p)}
              >
                {p}
              </button>
            ))}
          </div>
          <p className="chart-history-note">
            {period === "1D"
              ? "Live session · drag chart to inspect"
              : "Illustrative historical performance · prototype data"}
          </p>
        </section>
        <div className="financial-grid">
          {[
            ["Open", money(c.open, h.mark)],
            ["High", money(c.high, h.mark)],
            ["Low", money(c.low, h.mark)],
            ["Volume", compact(c.volume)],
            ["Market cap", h.mark + compact(c.marketCap)],
            ["P/E ratio", c.PE.toFixed(1)],
          ].map(([k, v]) => (
            <div key={k}>
              <span>{k}</span>
              <b>{v}</b>
            </div>
          ))}
        </div>
        {owned && (
          <div className="owned-banner">
            <div>
              <span className="eyebrow">YOUR POSITION</span>
              <strong>{owned.quantity} shares</strong>
            </div>
            <div>
              <small>Average {money(owned.average, h.mark)}</small>
              <Change value={(c.price / owned.average - 1) * 100} />
            </div>
          </div>
        )}
        <section className="content-section">
          <span className="eyebrow">THE COMPANY, AT A GLANCE</span>
          <div className="fundamentals">
            {[
              ["Revenue", h.mark + compact(c.revenue)],
              ["Net profit", h.mark + compact(c.profit)],
              ["Debt", h.mark + compact(c.debt)],
              ["Growth", pct(c.growth)],
              ["Sector", c.sector],
              ["Country", c.country],
              ["Headquarters", c.city],
            ].map(([k, v]) => (
              <div key={k}>
                <span>{k}</span>
                <b>{v}</b>
              </div>
            ))}
          </div>
        </section>
        <section className="content-section">
          <span className="eyebrow">RELATED INTELLIGENCE</span>
          {game.events
            .filter(
              (e) =>
                e.companies.includes(c.symbol) ||
                (e.scope === "GLOBAL" && e.sectors.includes(c.sector)),
            )
            .slice(0, 3)
            .map((e) => (
              <button
                key={e.id}
                className="inline-news"
                onClick={() => openStory(e)}
              >
                <span className="event-dot" />
                <span>
                  {e.headline}
                  <small>
                    {e.location} · {e.category}
                  </small>
                </span>
                <ArrowUpRight size={16} />
              </button>
            ))}
        </section>
        <div className="trading-actions">
          <button className="primary-button" onClick={() => order("BUY")}>
            Buy {c.symbol}
            <Plus size={16} />
          </button>
          <button className="secondary-button" onClick={() => order("SELL")}>
            Sell {c.symbol}
            <ArrowUpRight size={16} />
          </button>
        </div>
        {!isTrading(h, game.now) && (
          <p className="closed-note">
            Exchange closed · Orders become available when this market opens.
          </p>
        )}
      </div>
    </main>
  );
}
export function TradeSheet({
  symbol,
  side,
  game,
  close,
}: {
  symbol: string;
  side: "BUY" | "SELL";
  game: Game;
  close: () => void;
}) {
  const c = game.companies.find((c) => c.symbol === symbol)!,
    h = hubs.find((h) => h.id === c.hub)!,
    held =
      game.account.holdings.find((p) => p.symbol === symbol)?.quantity ?? 0;
  const [quantity, setQuantity] = useState(
      side === "BUY"
        ? Math.min(100, Math.floor(game.account.cash / (c.price * h.fx)))
        : Math.min(100, held),
    ),
    [error, setError] = useState(""),
    [filled, setFilled] = useState<{ price: number; qty: number } | null>(null);
  const total = quantity * c.price,
    usd = total * h.fx,
    max =
      side === "BUY" ? Math.floor(game.account.cash / (c.price * h.fx)) : held,
    valid =
      Number.isSafeInteger(quantity) &&
      quantity > 0 &&
      quantity <= max &&
      isTrading(h, game.now);
  const execute = () => {
    try {
      const price = game.trade(symbol, side, quantity);
      setFilled({ price, qty: quantity });
      setError("");
    } catch (e) {
      setError((e as Error).message);
    }
  };
  return (
    <Sheet
      title={
        filled ? "Order filled" : `${side === "BUY" ? "Buy" : "Sell"} ${symbol}`
      }
      eyebrow={filled ? "EXECUTION CONFIRMED" : "MARKET ORDER"}
      close={close}
    >
      {filled ? (
        <div className="order-success">
          <span className="success-icon">
            <Check size={30} />
          </span>
          <h3>
            {filled.qty} {symbol}
          </h3>
          <p>
            {side === "BUY" ? "Purchased" : "Sold"} at{" "}
            {money(filled.price, h.mark)} per share
          </p>
          <div className="order-summary">
            <span>Total {side === "BUY" ? "cost" : "proceeds"}</span>
            <b>{money(filled.price * filled.qty, h.mark)}</b>
          </div>
          <div className="order-summary">
            <span>Settled in USD</span>
            <b>{money(filled.price * filled.qty * h.fx)}</b>
          </div>
          <p className="sheet-note">Your portfolio has been updated.</p>
          <button className="primary-button full" onClick={close}>
            Continue exploring <ArrowRight size={17} />
          </button>
        </div>
      ) : (
        <>
          <div className="order-market-price">
            <span>MARKET PRICE</span>
            <strong>{money(c.price, h.mark)}</strong>
            <StatusBadge hub={h} now={game.now} />
          </div>
          <span className="eyebrow quantity-label">NUMBER OF SHARES</span>
          <div className="quantity-control">
            <button
              aria-label="Decrease quantity"
              onClick={() => setQuantity(Math.max(0, quantity - 10))}
            >
              <Minus size={19} />
            </button>
            <input
              type="number"
              inputMode="numeric"
              aria-label="Quantity"
              min="0"
              step="1"
              value={quantity}
              onChange={(e) => {
                setQuantity(Number(e.target.value));
                setError("");
              }}
            />
            <button
              aria-label="Increase quantity"
              onClick={() => setQuantity(quantity + 10)}
            >
              <Plus size={19} />
            </button>
          </div>
          <div className="quantity-shortcuts">
            {[10, 50, 100].map((n) => (
              <button key={n} onClick={() => setQuantity(n)}>
                {n}
              </button>
            ))}
            <button onClick={() => setQuantity(max)}>Max · {max}</button>
          </div>
          <div className="order-summary">
            <span>Estimated {side === "BUY" ? "cost" : "proceeds"}</span>
            <b>{money(total, h.mark)}</b>
          </div>
          <div className="order-summary">
            <span>USD settlement</span>
            <b>{money(usd)}</b>
          </div>
          <div className="order-summary">
            <span>{side === "BUY" ? "Available cash" : "Shares owned"}</span>
            <b>{side === "BUY" ? money(game.account.cash) : held}</b>
          </div>
          {h.currency !== "USD" && (
            <p className="sheet-note">
              Prototype exchange rate: 1 {h.currency} = ${h.fx}. All portfolio
              cash is held in USD. No fees.
            </p>
          )}
          {!isTrading(h, game.now) && (
            <p className="order-error">
              This market is closed. Opens in{" "}
              {duration(session(h, game.now).remaining)}. Use the simulation
              controls to change time.
            </p>
          )}
          {quantity > max && (
            <p className="order-error">
              {side === "BUY"
                ? "Insufficient cash for this order."
                : "You do not own enough shares."}
            </p>
          )}
          {!Number.isInteger(quantity) && (
            <p className="order-error">
              Please enter a whole number of shares.
            </p>
          )}
          {error && (
            <p role="alert" className="order-error">
              {error}
            </p>
          )}
          <button
            className="primary-button full"
            disabled={!valid}
            onClick={execute}
          >
            {side} {quantity} {symbol}
            <ArrowRight size={17} />
          </button>
          <p className="fine-print">
            Instant execution at the current simulated price.
          </p>
        </>
      )}
    </Sheet>
  );
}
export function PortfolioScreen({
  game,
  openStock,
  world,
}: {
  game: Game;
  openStock: (s: string) => void;
  world: () => void;
}) {
  const { account, companies, value } = game,
    [period, setPeriod] = useState("1D");
  const basis =
    startingAccount.cash +
    startingAccount.holdings.reduce((s, p) => {
      const c = companies.find((c) => c.symbol === p.symbol)!;
      return s + p.quantity * p.average * hubs.find((h) => h.id === c.hub)!.fx;
    }, 0);
  const today = account.holdings.reduce((s, p) => {
      const c = companies.find((c) => c.symbol === p.symbol)!;
      return (
        s +
        p.quantity *
          (c.price - c.previousClose) *
          hubs.find((h) => h.id === c.hub)!.fx
      );
    }, 0),
    total = value - basis;
  const exposure = account.holdings.reduce<Record<string, number>>(
    (a, p) => {
      const c = companies.find((c) => c.symbol === p.symbol)!,
        h = hubs.find((h) => h.id === c.hub)!;
      a[c.country] = (a[c.country] ?? 0) + p.quantity * c.price * h.fx;
      return a;
    },
    { Cash: account.cash },
  );
  const colors = [
    "#d0b286",
    "#81bca2",
    "#809ba9",
    "#a5a0ba",
    "#7b858d",
    "#617783",
  ];
  return (
    <main className="scroll-page">
      <div className="page-container">
        <PageHeader title="Your global footprint." eyebrow="PORTFOLIO / USD">
          <button className="text-button" onClick={world}>
            <Globe2 size={16} /> View on globe <ArrowUpRight size={15} />
          </button>
        </PageHeader>
        <div className="portfolio-layout">
          <section className="portfolio-overview">
            <span className="eyebrow">TOTAL PORTFOLIO VALUE</span>
            <h2>{money(value)}</h2>
            <div className="return-grid">
              <div>
                <span>TODAY</span>
                <b className={today >= 0 ? "positive" : "negative"}>
                  {today >= 0 ? "+" : ""}
                  {money(today)}
                </b>
                <small>{pct((today / (value - today)) * 100)}</small>
              </div>
              <div>
                <span>TOTAL RETURN</span>
                <b className={total >= 0 ? "positive" : "negative"}>
                  {total >= 0 ? "+" : ""}
                  {money(total)}
                </b>
                <small>{pct((total / basis) * 100)}</small>
              </div>
              <div>
                <span>AVAILABLE CASH</span>
                <b>{money(account.cash)}</b>
                <small>Ready to invest</small>
              </div>
            </div>
            <Chart
              data={makeHistory(
                value,
                period === "1D"
                  ? (today / (value - today)) * 100
                  : period === "1M"
                    ? 4.8
                    : 7.2,
              )}
              height={190}
              interactive
            />
            <div className="period-tabs">
              {["1D", "1M", "ALL"].map((p) => (
                <button
                  key={p}
                  className={period === p ? "active" : ""}
                  onClick={() => setPeriod(p)}
                >
                  {p}
                </button>
              ))}
            </div>
            <p className="chart-history-note">
              Illustrative performance · current value and returns are live
            </p>
          </section>
          <section className="exposure-panel">
            <div className="section-heading">
              <span className="eyebrow">GEOGRAPHIC EXPOSURE</span>
              <Globe2 size={16} />
            </div>
            <div className="exposure-bar">
              {Object.entries(exposure)
                .sort((a, b) => b[1] - a[1])
                .map(([country, v], i) => (
                  <span
                    key={country}
                    style={{
                      width: `${(v / value) * 100}%`,
                      background: colors[i % colors.length],
                    }}
                  />
                ))}
            </div>
            {Object.entries(exposure)
              .sort((a, b) => b[1] - a[1])
              .map(([country, v], i) => (
                <div className="exposure-row" key={country}>
                  <i style={{ background: colors[i % colors.length] }} />
                  <span>{country}</span>
                  <b>{((v / value) * 100).toFixed(1)}%</b>
                </div>
              ))}
            <button className="exposure-world" onClick={world}>
              See your world of investments <ArrowRight size={15} />
            </button>
          </section>
        </div>
        <section className="content-section">
          <div className="section-heading">
            <span className="eyebrow">YOUR HOLDINGS</span>
            <small className="muted">{account.holdings.length} POSITIONS</small>
          </div>
          {account.holdings.length ? (
            account.holdings.map((p) => {
              const c = companies.find((c) => c.symbol === p.symbol)!;
              return (
                <StockRow
                  key={c.symbol}
                  company={c}
                  subtitle={`${p.quantity} shares · return ${pct((c.price / p.average - 1) * 100)}`}
                  onClick={() => openStock(c.symbol)}
                />
              );
            })
          ) : (
            <Empty
              title="Your next chapter starts here"
              text="Explore an open exchange and place your first order."
            />
          )}
        </section>
        {game.orders.length > 0 && (
          <section className="content-section">
            <span className="eyebrow">RECENT ACTIVITY</span>
            {game.orders.slice(0, 6).map((o) => (
              <div className="activity-row" key={o.id}>
                <span className={o.side === "BUY" ? "positive" : "muted"}>
                  {o.side}
                </span>
                <b>
                  {o.quantity} {o.symbol}
                </b>
                <span>
                  {money(
                    o.price,
                    hubs.find(
                      (h) =>
                        h.id ===
                        companies.find((c) => c.symbol === o.symbol)!.hub,
                    )!.mark,
                  )}
                </span>
                <small>{localTime(o.timestamp, "UTC")} UTC</small>
              </div>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
export function NewsScreen({
  game,
  openStory,
  world,
}: {
  game: Game;
  openStory: (e: MarketEvent) => void;
  world: () => void;
}) {
  const [filter, setFilter] = useState("Global");
  const visible = game.events.filter(
      (e) => e.scope === "GLOBAL" || game.discovered.includes(e.id),
    ),
    filtered = visible.filter(
      (e) =>
        filter === "Global" ||
        hubs.find((h) => h.id === e.hub)!.region === filter,
    );
  const locked = game.events.length - visible.length;
  return (
    <main className="scroll-page">
      <div className="page-container">
        <PageHeader
          title="The world, in perspective."
          eyebrow="MERIDIAN INTELLIGENCE"
        >
          <span className="page-counter">
            <Radio size={15} /> {visible.length} stories in view
          </span>
        </PageHeader>
        <div className="filter-tabs">
          {[
            "Global",
            "Americas",
            "Europe",
            "Asia",
            "Middle East",
            "Oceania",
          ].map((f) => (
            <button
              key={f}
              className={f === filter ? "active" : ""}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="news-grid">
          {filtered.map((e, i) => (
            <button
              className={`news-feed-card ${i === 0 ? "lead-story" : ""}`}
              key={e.id}
              onClick={() => openStory(e)}
            >
              <div className="story-meta">
                <span>{e.location.toUpperCase()}</span>
                <span>{localTime(e.timestamp, "UTC")} UTC</span>
                <span>{e.scope}</span>
              </div>
              {i === 0 && (
                <div className="news-illustration">
                  <Globe2 />
                  <span className="orbit-line" />
                  <span className="news-coordinate">
                    {Math.abs(e.latitude).toFixed(2)}°
                    {e.latitude >= 0 ? "N" : "S"} &nbsp;{" "}
                    {Math.abs(e.longitude).toFixed(2)}°
                    {e.longitude >= 0 ? "E" : "W"}
                  </span>
                  <span className="illustration-label">
                    SIGNALS FROM
                    <br />
                    {e.location.toUpperCase()}
                  </span>
                  <i className="event-dot" />
                </div>
              )}
              <span className="news-category">{e.category.toUpperCase()}</span>
              <h2>{e.headline}</h2>
              <p>{e.body.split(". ")[1]}.</p>
              <div className="story-footer">
                <div className="impact-tags">
                  {e.sectors.slice(0, 2).map((s) => (
                    <span className="sector-tag" key={s}>
                      {s} {e.impact > 0 ? "↗" : "↘"}
                    </span>
                  ))}
                </div>
                <ArrowUpRight size={18} />
              </div>
            </button>
          ))}
        </div>
        {!filtered.length && (
          <Empty
            title="Nothing in view. Yet."
            text="Explore this region on the globe to uncover its local stories."
          />
        )}
        {locked > 0 && (
          <button className="discovery-prompt" onClick={world}>
            <LockKeyhole size={21} />
            <div>
              <h3>{locked} signals waiting to be discovered</h3>
              <p>
                Move closer to a region or city. The next opportunity could be
                there.
              </p>
            </div>
            <ArrowRight size={18} />
          </button>
        )}
      </div>
    </main>
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
  const h = hubs.find((h) => h.id === event.hub)!;
  return (
    <Sheet
      title="Market intelligence"
      eyebrow={`${event.scope} / ${event.category.toUpperCase()}`}
      close={close}
      wide
    >
      <article className="story-article">
        <div className="article-location">
          <span className="event-dot" />
          {event.location}
          <small>{localTime(event.timestamp, h.zone)} LOCAL</small>
        </div>
        <h1>{event.headline}</h1>
        <p>{event.body}</p>
        <div className="article-impact">
          <span className="eyebrow">POSSIBLE MARKET IMPACT</span>
          {event.sectors.map((s) => {
            const positive =
              event.category === "Energy" &&
              ["Airlines", "Logistics"].includes(s)
                ? false
                : event.impact > 0;
            return (
              <div key={s}>
                <span>{s}</span>
                <span className={positive ? "positive" : "negative"}>
                  {positive ? "↑ Upward pressure" : "↓ Downward pressure"}
                </span>
              </div>
            );
          })}
        </div>
        {event.companies.length > 0 && (
          <div className="article-companies">
            <span className="eyebrow">COMPANIES IN THIS STORY</span>
            {event.companies.map((s) => {
              const c = game.companies.find((c) => c.symbol === s);
              return c ? (
                <StockRow key={s} company={c} onClick={() => openStock(s)} />
              ) : null;
            })}
          </div>
        )}
        <button className="secondary-button full" onClick={explore}>
          <Globe2 size={17} /> Explore {event.location} Exchange{" "}
          <ArrowUpRight size={15} />
        </button>
        <p className="fine-print">
          Fictional intelligence generated for this simulation.
        </p>
      </article>
    </Sheet>
  );
}
export function DevSheet({ game, close }: { game: Game; close: () => void }) {
  const [hub, setHub] = useState("ist"),
    [time, setTime] = useState("14:30");
  const h = hubs.find((h) => h.id === hub)!;
  return (
    <Sheet
      title="The world, on your time."
      eyebrow="SIMULATION CONTROLS"
      close={close}
    >
      <div className="dev-panel">
        <div className="dev-clock">
          <Clock3 size={20} />
          <div>
            <b>{localTime(game.now, h.zone, true)}</b>
            <small>{h.name.toUpperCase()} LOCAL TIME</small>
          </div>
          <span className="subtle-pill">{game.speed}× SPEED</span>
        </div>
        <label className="control-label">
          FOCUS EXCHANGE
          <select value={hub} onChange={(e) => setHub(e.target.value)}>
            {hubs.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name} · {h.zone}
              </option>
            ))}
          </select>
        </label>
        <span className="eyebrow">CLOCK SPEED</span>
        <div className="dev-speeds">
          {[1, 10, 60, 600].map((s) => (
            <button
              key={s}
              className={s === game.speed ? "active" : ""}
              onClick={() => game.setSpeed(s)}
            >
              {s === 1 ? "Realtime" : s + "×"}
            </button>
          ))}
        </div>
        <label className="control-label">
          SET LOCAL TIME
          <div className="time-input">
            <input
              aria-label="Simulated local time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
            <button
              onClick={() => {
                if (time) game.setLocalClock(hub, time);
              }}
            >
              Apply <ArrowRight size={14} />
            </button>
          </div>
        </label>
        <div className="time-presets">
          {["09:55", "10:00", "14:30", "17:59", "18:00"].map((t) => (
            <button
              key={t}
              onClick={() => {
                setTime(t);
                game.setLocalClock(hub, t);
              }}
            >
              {t}
            </button>
          ))}
        </div>
        <span className="eyebrow">TRIGGER A SCENARIO</span>
        <div className="scenario-grid">
          {[
            "MARKET OPEN",
            "MARKET CLOSE",
            "COMPANY NEWS",
            "ECONOMIC NEWS",
            "ENERGY SHOCK",
            "MARKET CRASH",
            "MARKET RALLY",
            "LOCAL EVENT",
            "REGIONAL EVENT",
            "GLOBAL EVENT",
          ].map((k) => (
            <button key={k} onClick={() => game.trigger(k, hub)}>
              {k.toLowerCase()}
              <Plus size={12} />
            </button>
          ))}
        </div>
        <div className="sound-setting">
          <div>
            {game.sound ? <Volume2 size={18} /> : <VolumeX size={18} />}
            <span>
              Subtle sound effects
              <small>Bells, intelligence, and order fills</small>
            </span>
          </div>
          <button
            className={`switch ${game.sound ? "on" : ""}`}
            role="switch"
            aria-checked={game.sound}
            aria-label="Sound effects"
            onClick={() => game.setSound(!game.sound)}
          >
            <i />
          </button>
        </div>
        <button className="secondary-button full" onClick={game.resetClock}>
          Synchronize to real-world time <Clock3 size={15} />
        </button>
        <p className="sheet-note">
          Prototype markets trade daily, including weekends. Time zones include
          daylight saving. Prices update every three seconds in open markets;
          event effects fade after two simulated hours. Refresh resets the
          session.
        </p>
      </div>
    </Sheet>
  );
}
