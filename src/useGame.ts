import { useEffect, useRef, useState } from "react";
import {
  createEvent,
  hubs,
  initialEvents,
  makeCompanies,
  session,
  type Company,
  type MarketEvent,
  type Scope,
} from "./data";
import {
  accountValue,
  executeOrder,
  movePrices,
  startingAccount,
  type Account,
} from "./engine";

let audioContext: AudioContext | undefined;
function playTone(kind: "order" | "news" | "open" | "close") {
  try {
    audioContext ??= new AudioContext();
    void audioContext.resume();
    const o = audioContext.createOscillator(),
      g = audioContext.createGain(),
      t = audioContext.currentTime;
    o.type = "sine";
    o.frequency.setValueAtTime(
      { order: 660, news: 440, open: 520, close: 330 }[kind],
      t,
    );
    o.frequency.exponentialRampToValueAtTime(
      kind === "close" ? 220 : 880,
      t + 0.15,
    );
    g.gain.setValueAtTime(0.035, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
    o.connect(g);
    g.connect(audioContext.destination);
    o.start(t);
    o.stop(t + 0.3);
  } catch {
    /* Audio is optional. */
  }
}
export function useGame() {
  const [now, setNow] = useState(Date.now),
    [speed, setSpeed] = useState(1),
    [companies, setCompanies] = useState(makeCompanies),
    [events, setEvents] = useState(() => initialEvents(Date.now())),
    [account, setAccount] = useState<Account>(startingAccount),
    [sound, setSound] = useState(false),
    [toast, setToast] = useState(""),
    [discovered, setDiscovered] = useState<string[]>([]),
    [orders, setOrders] = useState<
      {
        id: string;
        symbol: string;
        side: string;
        quantity: number;
        price: number;
        timestamp: number;
      }[]
    >([]);
  const state = useRef({ now, speed, companies, events, account, sound });
  state.current = { now, speed, companies, events, account, sound };
  const notify = (
    message: string,
    kind?: "order" | "news" | "open" | "close",
  ) => {
    setToast(message);
    if (kind && state.current.sound) playTone(kind);
  };
  useEffect(() => {
    let last = Date.now();
    const timer = setInterval(() => {
      if (document.hidden) return;
      const t = Date.now();
      const elapsed = t - last;
      last = t;
      setNow((n) => n + elapsed * state.current.speed);
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    const timer = setInterval(() => {
      if (document.hidden) return;
      const s = state.current;
      setCompanies((c) => movePrices(c, s.events, s.now));
    }, 3000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    const timer = setInterval(() => {
      if (document.hidden) return;
      const h = hubs[Math.floor(Math.random() * hubs.length)],
        c = state.current.companies.find((c) => c.hub === h.id)!;
      const e = createEvent(
        "auto-" + Date.now(),
        h.id,
        "LOCAL",
        "Company",
        `${c.name} revises its outlook as demand strengthens`,
        [c.sector],
        [c.symbol],
        0.2 + Math.random() * 0.4,
        state.current.now,
      );
      setEvents((es) => [e, ...es].slice(0, 40));
    }, 60000);
    return () => clearInterval(timer);
  }, []);
  const previous = useRef<Record<string, string>>({});
  useEffect(() => {
    let message = "";
    let kind: "open" | "close" = "open";
    for (const h of hubs) {
      const current = session(h, now).status,
        old = previous.current[h.id];
      if (old && old !== current) {
        message = `${h.name} · ${current === "OPEN" ? "The market is now open" : current === "CLOSED" ? "Trading has closed" : current === "CLOSING" ? "Final 15 minutes of trading" : "Pre-market session begins"}`;
        kind = current === "CLOSED" ? "close" : "open";
      }
      previous.current[h.id] = current;
    }
    if (message) notify(message, kind);
  }, [now]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 4500);
    return () => clearTimeout(timer);
  }, [toast]);
  const discover = (ids: string[]) =>
    setDiscovered((d) => [...new Set([...d, ...ids])]);
  const trade = (symbol: string, side: "BUY" | "SELL", quantity: number) => {
    const s = state.current,
      c = s.companies.find((c) => c.symbol === symbol)!;
    const next = executeOrder(s.account, c, side, quantity, s.now);
    state.current.account = next;
    setAccount(next);
    setOrders((o) =>
      [
        {
          id: Date.now().toString(),
          symbol,
          side,
          quantity,
          price: c.price,
          timestamp: s.now,
        },
        ...o,
      ].slice(0, 30),
    );
    notify(
      `${side === "BUY" ? "Bought" : "Sold"} ${quantity} ${symbol} · order filled`,
      "order",
    );
    return c.price;
  };
  const setLocalClock = (hubId: string, time: string) => {
    const h = hubs.find((h) => h.id === hubId)!;
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: h.zone,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    })
      .format(state.current.now)
      .split(":")
      .map(Number);
    const [hours, minutes] = time.split(":").map(Number);
    setNow(
      (n) =>
        n +
        (hours * 3600 +
          minutes * 60 -
          parts[0] * 3600 -
          parts[1] * 60 -
          parts[2]) *
          1000,
    );
    notify(`Clock set to ${time} in ${h.name}`);
  };
  const trigger = (kind: string, hubId: string) => {
    const h = hubs.find((h) => h.id === hubId)!,
      c = state.current.companies.find((c) => c.hub === hubId)!;
    if (kind === "MARKET OPEN" || kind === "MARKET CLOSE") {
      const min = kind === "MARKET OPEN" ? h.open : h.close;
      setLocalClock(
        hubId,
        `${Math.floor(min / 60)}:${String(min % 60).padStart(2, "0")}`,
      );
      return;
    }
    let scope: Scope =
      kind.includes("LOCAL") || kind === "COMPANY NEWS"
        ? "LOCAL"
        : kind.includes("REGIONAL")
          ? "REGIONAL"
          : "GLOBAL";
    const crash = kind === "MARKET CRASH",
      rally = kind === "MARKET RALLY",
      energy = kind === "ENERGY SHOCK";
    const headline = crash
      ? "Risk-off wave sweeps global markets"
      : rally
        ? "Renewed optimism sparks a worldwide market rally"
        : energy
          ? "Unexpected supply disruption sends oil prices higher"
          : kind === "ECONOMIC NEWS"
            ? "New economic data resets expectations for growth"
            : `${c.name} announces a major investment in ${h.name}`;
    const sectors =
      crash || rally
        ? [...new Set(state.current.companies.map((c) => c.sector))]
        : energy
          ? ["Energy", "Airlines", "Logistics"]
          : [c.sector];
    const e = createEvent(
      "dev-" + Date.now(),
      hubId,
      scope,
      energy
        ? "Energy"
        : crash || rally
          ? "Markets"
          : kind === "ECONOMIC NEWS"
            ? "Economy"
            : "Company",
      headline,
      sectors,
      crash || rally ? [] : [c.symbol],
      crash ? -2 : rally ? 2 : energy ? 1.5 : 0.8,
      state.current.now,
    );
    setEvents((es) => [e, ...es].slice(0, 40));
    notify(`${scope.toLowerCase()} event triggered · ${h.name}`, "news");
  };
  return {
    now,
    speed,
    setSpeed,
    companies,
    events,
    account,
    sound,
    setSound,
    toast,
    notify,
    discovered,
    discover,
    orders,
    trade,
    setLocalClock,
    trigger,
    value: accountValue(account, companies),
    resetClock: () => {
      setNow(Date.now());
      setSpeed(1);
      notify("Clock synchronized to real time");
    },
  };
}
export type Game = ReturnType<typeof useGame>;
