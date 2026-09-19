import { useLocale, LanguageSwitcher } from "./Locale";
import { decimalNumber } from "./localeFormat";
import { useId, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowUpRight, X } from "lucide-react";
import {
  changeOf,
  hubs,
  money,
  pct,
  session,
  type Company,
  type Hub,
} from "./data";

export function StatusBadge({ hub, now }: { hub: Hub; now: number }) {
  const { tr } = useLocale();
  const s = session(hub, now).status;
  return (
    <span className={`status-badge ${s.toLowerCase()}`}>
      <i
        className={`live-dot ${s === "PRE-MARKET" ? "amber" : s === "CLOSED" ? "grey" : ""}`}
      />
      {tr(s)}
    </span>
  );
}
export function Change({ value }: { value: number }) {
  const { tr } = useLocale();
  return (
    <span className={value >= 0 ? "positive" : "negative"}>
      {tr(value >= 0 ? "↗" : "↘")} {tr(pct(value))}
    </span>
  );
}
export function PageHeader({
  title,
  eyebrow,
  back,
  children,
}: {
  title: string;
  eyebrow: string;
  back?: () => void;
  children?: ReactNode;
}) {
  const { tr } = useLocale();
  return (
    <header className="page-header">
      <div>
        {back && (
          <button className="back-button" onClick={back}>
            <ArrowLeft size={16} /> {tr(" Back ")}
          </button>
        )}
        <span className="eyebrow">{tr(eyebrow)}</span>
        <h1>{tr(title)}</h1>
      </div>
      {tr(children)}
    </header>
  );
}
export function Chart({
  data,
  height = 160,
  negative = false,
  interactive = false,
}: {
  data: number[];
  height?: number;
  negative?: boolean;
  interactive?: boolean;
}) {
  const { tr } = useLocale();
  const id = useId().replace(/:/g, ""),
    [hover, setHover] = useState<number | null>(null);
  const width = 600,
    min = Math.min(...data) * 0.998,
    max = Math.max(...data) * 1.002,
    range = max - min || 1;
  const point = (v: number, i: number) => [
    (i / (data.length - 1)) * width,
    12 + (1 - (v - min) / range) * (height - 30),
  ];
  const pts = data.map(point),
    path = pts
      .map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(2)},${p[1].toFixed(2)}`)
      .join(" "),
    color = negative ? "#c8736b" : "#4b9c7b";
  return (
    <div
      className="chart-wrap"
      style={{ height }}
      onPointerMove={
        interactive
          ? (e) => {
              const r = e.currentTarget.getBoundingClientRect();
              setHover(
                Math.max(
                  0,
                  Math.min(
                    data.length - 1,
                    Math.round(
                      ((e.clientX - r.left) / r.width) * (data.length - 1),
                    ),
                  ),
                ),
              );
            }
          : undefined
      }
      onPointerLeave={() => setHover(null)}
    >
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        aria-label={tr(
          `Price chart, ${data[0].toFixed(2)} to ${data.at(-1)!.toFixed(2)}`,
        )}
        role="img"
      >
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity=".15" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.2, 0.5, 0.8].map((y) => (
          <line
            key={y}
            x1="0"
            x2={width}
            y1={height * y}
            y2={height * y}
            stroke="#34556b12"
            strokeDasharray="3 6"
          />
        ))}
        <path
          d={`${path} L${width},${height} L0,${height} Z`}
          fill={`url(#${id})`}
        />
        <path
          d={path}
          stroke={color}
          strokeWidth="1.7"
          fill="none"
          vectorEffect="non-scaling-stroke"
        />
        {hover !== null && (
          <>
            <line
              x1={pts[hover][0]}
              x2={pts[hover][0]}
              y1="0"
              y2={height}
              stroke="#c8ced077"
              strokeDasharray="3 3"
            />
            <circle cx={pts[hover][0]} cy={pts[hover][1]} r="3" fill={color} />
          </>
        )}
      </svg>
      {hover !== null && (
        <span
          className="chart-tooltip"
          style={{
            left: `${Math.min(80, (hover / (data.length - 1)) * 100)}%`,
          }}
        >
          {tr(decimalNumber(data[hover]))}
        </span>
      )}
    </div>
  );
}
export function StockRow({
  company,
  onClick,
  subtitle,
}: {
  company: Company;
  onClick: () => void;
  subtitle?: string;
}) {
  const { tr } = useLocale();
  const h = hubs.find((h) => h.id === company.hub)!;
  return (
    <button className={`stock-row flash-${company.flash}`} onClick={onClick}>
      <span className={`stock-monogram sector-${company.sector.toLowerCase()}`}>
        {tr(company.symbol.slice(0, 2))}
      </span>
      <span className="stock-identity">
        <b>{tr(company.symbol)}</b>
        <small>{tr(subtitle ?? company.name)}</small>
      </span>
      <span className="row-spark">
        <Chart
          data={company.history.slice(-30)}
          height={28}
          negative={changeOf(company) < 0}
        />
      </span>
      <span className="stock-price">
        <b>{tr(money(company.price, h.mark))}</b>
        <small>
          <Change value={changeOf(company)} />
        </small>
      </span>
    </button>
  );
}
export function Sheet({
  title,
  eyebrow,
  close,
  children,
  wide = false,
}: {
  title: string;
  eyebrow: string;
  close: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  const { tr } = useLocale();
  return (
    <motion.div
      className="modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={close}
    >
      <motion.section
        role="dialog"
        aria-modal="true"
        aria-label={tr(title)}
        className={`sheet ${wide ? "wide" : ""}`}
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        transition={{ duration: 0.23 }}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === "Escape") close();
          if (e.key === "Tab") {
            const nodes = e.currentTarget.querySelectorAll<HTMLElement>(
              'button:not(:disabled),input,select,[tabindex="0"]',
            );
            const first = nodes[0],
              last = nodes[nodes.length - 1];
            if (e.shiftKey && document.activeElement === first) {
              e.preventDefault();
              last?.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
              e.preventDefault();
              first?.focus();
            }
          }
        }}
      >
        <div className="sheet-handle" />
        <div className="sheet-header">
          <div>
            <span className="eyebrow">{tr(eyebrow)}</span>
            <h2>{tr(title)}</h2>
          </div>
          <LanguageSwitcher />
          <button
            autoFocus
            className="icon-button"
            aria-label={tr("Close dialog")}
            onClick={close}
          >
            <X size={20} />
          </button>
        </div>
        {tr(children)}
      </motion.section>
    </motion.div>
  );
}
export function Empty({ title, text }: { title: string; text: string }) {
  const { tr } = useLocale();
  return (
    <div className="empty-state">
      <ArrowUpRight size={28} />
      <h3>{tr(title)}</h3>
      <p>{tr(text)}</p>
    </div>
  );
}
