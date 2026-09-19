import { useLocale } from "./Locale";
import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Pause, Play, RotateCcw, Clapperboard } from "lucide-react";
import { TinyBuildings } from "./ToyModels";
import { type MarketEvent } from "./data";
import EventVisual from "./EventVisual";
import ReportThumbnail from "./ReportThumbnail";
import { useTheme } from "./Theme";

const scenery = [
  { x: -2.3, z: -1.6, w: 0.6, d: 0.7, h: 1.2, color: "#e7a480" },
  { x: 2.3, z: -1.5, w: 0.7, d: 0.7, h: 1.7, color: "#88babe" },
  { x: 1.6, z: -2, w: 0.7, d: 0.6, h: 1.1, color: "#c0adcf" },
];
function Film({
  event,
  playing,
  elapsed,
  onCaption,
  bar,
  label,
}: {
  event: MarketEvent;
  playing: boolean;
  elapsed: React.MutableRefObject<number>;
  onCaption: (n: number) => void;
  bar: React.RefObject<HTMLSpanElement | null>;
  label: React.RefObject<HTMLSpanElement | null>;
}) {
  const { scene } = useTheme();
  const caption = useRef(-1);
  const kind =
    event.scenario === "moon"
      ? "moon"
      : event.scenario === "confetti"
        ? "coins"
        : (event.scene ?? "lakes");
  useFrame((_, delta) => {
    if (playing)
      elapsed.current = (elapsed.current + Math.min(delta, 0.1)) % 12;
    const t = elapsed.current;
    if (bar.current) bar.current.style.width = `${(t / 12) * 100}%`;
    if (label.current)
      label.current.textContent = `0:${String(Math.floor(t)).padStart(2, "0")} / 0:12`;
    const c = Math.floor(t / 4);
    if (c !== caption.current) {
      caption.current = c;
      onCaption(c);
    }
  });
  return (
    <>
      <ambientLight intensity={scene.ambient} />
      <directionalLight
        position={[3, 7, 5]}
        intensity={scene.sun}
        color="#fff4d5"
      />
      <directionalLight
        position={[-4, 3, -3]}
        intensity={0.5}
        color="#b8e4ef"
      />
      <mesh position={[0, -0.23, 0]}>
        <cylinderGeometry args={[3.7, 3.5, 0.45, 9]} />
        <meshStandardMaterial
          color={
            kind === "lakes"
              ? "#edd097"
              : kind === "ducks"
                ? "#5ebdd0"
                : "#a8c99a"
          }
          flatShading
        />
      </mesh>
      <TinyBuildings buildings={scenery} />
      <EventVisual event={event} elapsed={elapsed} />
    </>
  );
}
export default function NewsReel({
  event,
  paused = false,
}: {
  event: MarketEvent;
  paused?: boolean;
}) {
  const { tr } = useLocale();
  const [playing, setPlaying] = useState(
      () => !matchMedia("(prefers-reduced-motion: reduce)").matches,
    ),
    [visible, setVisible] = useState(true),
    [documentActive, setDocumentActive] = useState(!document.hidden),
    [caption, setCaption] = useState(0);
  const elapsed = useRef(0),
    bar = useRef<HTMLSpanElement>(null),
    label = useRef<HTMLSpanElement>(null),
    host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    elapsed.current = 0;
    setCaption(0);
  }, [event.id]);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.1 },
    );
    if (host.current) observer.observe(host.current);
    const visibility = () => setDocumentActive(!document.hidden);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);
  const active = playing && visible && documentActive && !paused;
  return (
    <div
      ref={host}
      className={`news-reel reel-${event.scene ?? "lakes"}`}
      data-scene={event.scenario ?? event.scene}
      data-playing={active}
    >
      <div className="reel-badge">
        <Clapperboard size={12} /> {tr(" CORRESPONDENT RECONSTRUCTION ")}
      </div>
      <span className="reel-live">
        {tr("3D")}
        <span> {tr(" REPORT")}</span>
      </span>
      <Canvas
        frameloop={active ? "always" : "demand"}
        camera={{ position: [5, 4.8, 7], fov: 40 }}
        dpr={[1, 1.25]}
        gl={{ alpha: true, antialias: true }}
      >
        <Film
          event={event}
          playing={active}
          elapsed={elapsed}
          onCaption={setCaption}
          bar={bar}
          label={label}
        />
      </Canvas>
      <p className="reel-caption">
        {tr(event.captions?.[caption] ?? "Field report reconstruction.")}
      </p>
      <div className="reel-controls">
        <button
          aria-label={tr(playing ? "Pause animation" : "Play animation")}
          onClick={() => setPlaying(!playing)}
        >
          {playing ? <Pause size={15} /> : <Play size={15} />}
        </button>
        <button
          aria-label={tr("Replay animation")}
          onClick={() => {
            elapsed.current = 0;
            setPlaying(true);
          }}
        >
          <RotateCcw size={14} />
        </button>
        <div className="reel-progress">
          <span ref={bar} />
        </div>
        <span ref={label} className="reel-time">
          0:00 / 0:12
        </span>
      </div>
    </div>
  );
}
export function StoryThumbnail({ event }: { event: MarketEvent }) {
  if (
    event.scene &&
    ["fuel", "rail", "policy", "signal", "crops", "infrastructure"].includes(
      event.scene,
    )
  )
    return (
      <div className={"story-thumb thumb-" + event.scene}>
        <ReportThumbnail kind={event.scene} />
      </div>
    );
  const kind =
    event.scenario === "moon"
      ? "moon"
      : event.scenario === "confetti"
        ? "coins"
        : (event.scene ?? "lakes");
  return (
    <div className={`story-thumb thumb-${kind}`} aria-hidden="true">
      <svg viewBox="0 0 160 110">
        <ellipse cx="80" cy="92" rx="64" ry="12" fill="#243c5210" />
        {kind === "lakes" || kind === "ducks" ? (
          <>
            <ellipse cx="75" cy="78" rx="58" ry="18" fill="#78cad4" />
            <path
              d="M49 63Q48 42 66 49V31Q66 22 78 27Q90 30 84 45L99 48L84 56Q90 80 64 79Q41 75 38 61Z"
              fill="#f4d26c"
            />
            <circle cx="78" cy="35" r="2" fill="#2b4860" />
            <path d="M85 41l15 5-15 6" fill="#e88f69" />
          </>
        ) : kind === "cats" ? (
          <>
            <path
              d="M49 89V42L46 18L67 35H87L108 18L106 45V89Z"
              fill="#ebb074"
            />
            <circle cx="64" cy="53" r="3" fill="#365064" />
            <circle cx="90" cy="53" r="3" fill="#365064" />
            <path d="M73 64h9l-4 5z" fill="#b7767c" />
            <path
              d="M47 65H27m19 7H31m75-7h23m-23 7h18"
              stroke="#ad7b5b"
              strokeWidth="2"
            />
          </>
        ) : kind === "balloons" ? (
          <>
            <path d="M42 21L74 73m15-61L82 72m43-49L90 72" stroke="#ad8e89" />
            <ellipse cx="41" cy="24" rx="15" ry="20" fill="#e99d8d" />
            <ellipse cx="86" cy="20" rx="16" ry="21" fill="#e7c96f" />
            <ellipse cx="125" cy="28" rx="14" ry="20" fill="#9abacb" />
            <path d="M57 62h51v36H57z" fill="#b7a3cd" />
            <path
              d="M65 68h8v18h-8zm16 0h8v18h-8zm16 0h6v18h-6z"
              fill="#faf0d6"
            />
          </>
        ) : kind === "moon" ? (
          <>
            <circle cx="75" cy="47" r="33" fill="#efdbad" />
            <circle cx="57" cy="42" r="3" fill="#365064" />
            <circle cx="82" cy="42" r="3" fill="#365064" />
            <circle cx="51" cy="61" r="7" fill="#d5be91" />
            <path d="M80 55h38v48H80z" fill="#fffae9" />
            <path
              d="M89 70h20m-20 10h20m-20 10h13"
              stroke="#91a5a4"
              strokeWidth="3"
            />
          </>
        ) : kind === "coins" ? (
          <>
            <path d="M74 95V43" stroke="#b48d69" strokeWidth="10" />
            <path d="M44 68L49 29L82 13L111 34L118 69Z" fill="#9bbb89" />
            {[45, 77, 109].map((x, i) => (
              <circle
                key={x}
                cx={x}
                cy={35 + i * 22}
                r="10"
                fill="#ecc45d"
                stroke="#d6a747"
                strokeWidth="2"
              />
            ))}
          </>
        ) : kind === "coffee" ? (
          <>
            <path d="M46 47h58v34q-30 21-58 0z" fill="#fffbeb" />
            <ellipse cx="75" cy="47" rx="29" ry="8" fill="#a17559" />
            <path
              d="M104 53q34-4 9 24h-9"
              fill="none"
              stroke="#fffbeb"
              strokeWidth="9"
            />
            <path
              d="M66 34q-13-10 0-23m20 24q-10-14 0-24"
              stroke="#e4d6b6"
              fill="none"
              strokeWidth="5"
            />
          </>
        ) : (
          <>
            <circle cx="112" cy="34" r="21" fill="#edcc71" />
            <path
              d="M27 68q-12-27 18-29 0-28 31-20 27 1 26 25 36 6 17 30H33z"
              fill="#fffdf0"
            />
            <circle cx="62" cy="55" r="3" fill="#37536b" />
            <circle cx="88" cy="55" r="3" fill="#37536b" />
          </>
        )}
      </svg>
    </div>
  );
}
