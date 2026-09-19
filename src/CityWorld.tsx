import { useLocale } from "./Locale";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, OrbitControls, PerformanceMonitor } from "@react-three/drei";
import type { OrbitControls as OrbitImpl } from "three-stdlib";
import * as THREE from "three";
import {
  ArrowLeft,
  ArrowRight,
  MapPin,
  Plus,
  Minus,
  Navigation,
  Newspaper,
  Building2,
  LocateFixed,
  ChevronDown,
  Compass,
  UsersRound,
} from "lucide-react";
import { TinyBuildings, Cloud } from "./ToyModels";
import { hubs, localTime, changeOf, money, type MarketEvent } from "./data";
import type { Game } from "./useGame";
import { Change, StatusBadge, Sheet } from "./UI";
import { cityProfiles, groundY, type CityProfile } from "./cityProfiles";
import CityLandmarkModel from "./CityLandmarks";
import { Terrain, CityLife, cityBuildings } from "./CityEnvironment";
import { themeScenes } from "./Theme";
import CityEvents from "./CityEvents";
import CityCats from "./CityCats";
import {
  cityEventSites,
  buildingsAroundEvents,
  type CityEventSite,
} from "./eventLocations";
import CityPeople from "./CityPeople";
import { makeCityCrowd } from "./cityCrowd";
import { gatherAtEvents } from "./eventCrowd";
import { streetView, clearCityView } from "./streetView";

function Roofs({
  buildings,
  color,
}: {
  buildings: ReturnType<typeof cityBuildings>;
  color: string;
}) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  useEffect(() => {
    const obj = new THREE.Object3D();
    buildings.forEach((b, i) => {
      obj.position.set(b.x, b.y + b.h + 0.18, b.z);
      obj.rotation.y = Math.PI / 4;
      obj.scale.set(b.w * 0.82, 0.32, b.d * 0.82);
      obj.updateMatrix();
      mesh.current!.setMatrixAt(i, obj.matrix);
    });
    mesh.current!.instanceMatrix.needsUpdate = true;
  }, [buildings]);
  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, buildings.length]}>
      <coneGeometry args={[1, 1, 4]} />
      <meshStandardMaterial color={color} roughness={1} />
    </instancedMesh>
  );
}
function CityScene({
  p,
  now,
  selected,
  select,
  district,
  zoom,
  view,
  back,
  onView,
  sites,
  focusTick,
}: {
  p: CityProfile;
  sites: CityEventSite[];
  focusTick: number;
  now: number;
  selected: string;
  select: (s: string) => void;
  district: string;
  zoom: { id: number; amount: number };
  view: string;
  back: () => void;
  onView: (s: string) => void;
}) {
  const { tr, report } = useLocale();
  const orbit = useRef<OrbitImpl>(null),
    target = useRef<THREE.Vector3 | null>(null),
    flight = useRef<THREE.Vector3 | null>(null),
    last = useRef(0),
    departed = useRef(false),
    touched = useRef(false);
  const { camera } = useThree(),
    scene = themeScenes.light,
    buildings = useMemo(
      () => buildingsAroundEvents(cityBuildings(p), sites),
      [p, sites],
    ),
    crowd = useMemo(
      () =>
        gatherAtEvents(
          p,
          buildings,
          sites,
          makeCityCrowd(p, [
            ...buildings,
            ...sites
              .filter((s) => !s.water)
              .map((s) => ({ x: s.x, z: s.z, w: 3.4, d: 3.4 })),
          ]),
        ),
      [p, buildings, sites],
    );
  const hub = hubs.find((h) => h.id === p.id)!,
    hour = Number(localTime(now, hub.zone).slice(0, 2)),
    night = hour >= 19 || hour < 6;
  useEffect(() => {
    const site = selected.startsWith("event-")
      ? sites.find((s) => s.event.id === selected.slice(6))
      : undefined;
    if (site) {
      target.current = new THREE.Vector3(
        site.x,
        groundY(site.x, site.z) + 0.8,
        site.z,
      );
      const direction = clearCityView(p, buildings, [site], [], 10.5, 8, 0.8);
      flight.current = target.current
        .clone()
        .add(new THREE.Vector3(direction.dx, 8, direction.dz));
      return;
    }
    if (selected === "street-life") {
      const spot = streetView(p, buildings, crowd.people);
      target.current = new THREE.Vector3(
        spot.x,
        groundY(spot.x, spot.z) + 0.5,
        spot.z,
      );
      flight.current = target.current
        .clone()
        .add(new THREE.Vector3(spot.dx, 4.4, spot.dz));
      return;
    }
    const d = p.districts.find((d) => d.id === district);
    const landmark = selected.startsWith("landmark-")
      ? p.landmarks[Number(selected.slice(9))]
      : undefined;
    const focus = landmark ?? d;
    const x = focus?.x ?? 0,
      z = focus?.z ?? 0;
    target.current = new THREE.Vector3(x, groundY(x, z), z);
    flight.current = target.current
      .clone()
      .add(
        district === "overview"
          ? new THREE.Vector3(24, 25, 30)
          : new THREE.Vector3(12, 12, 15),
      );
  }, [
    district,
    p,
    focusTick,
    selected.startsWith("landmark-") ||
    selected.startsWith("event-") ||
    selected === "street-life"
      ? selected
      : "",
  ]);
  useEffect(() => {
    if (!zoom.id || !orbit.current) return;
    if (zoom.amount === 999) {
      target.current = new THREE.Vector3(0, 0, 0);
      flight.current = new THREE.Vector3(24, 25, 30);
      touched.current = false;
      return;
    }
    touched.current = true;
    const anchor = orbit.current.target,
      dir = camera.position.clone().sub(anchor);
    const distance = THREE.MathUtils.clamp(dir.length() + zoom.amount, 7, 62);
    flight.current = anchor
      .clone()
      .add(dir.normalize().multiplyScalar(distance));
  }, [zoom, camera]);
  useFrame(({ clock }, delta) => {
    if (target.current && orbit.current) {
      orbit.current.target.lerp(target.current, 1 - Math.exp(-delta * 3));
      if (orbit.current.target.distanceTo(target.current) < 0.02)
        target.current = null;
    }
    if (flight.current) {
      camera.position.lerp(flight.current, 1 - Math.exp(-delta * 3));
      orbit.current?.update();
      if (camera.position.distanceTo(flight.current) < 0.02)
        flight.current = null;
    }
    if (orbit.current) {
      orbit.current.target.x = THREE.MathUtils.clamp(
        orbit.current.target.x,
        -22,
        22,
      );
      orbit.current.target.z = THREE.MathUtils.clamp(
        orbit.current.target.z,
        -19,
        19,
      );
    }
    if (clock.elapsedTime - last.current > 0.3 && orbit.current) {
      last.current = clock.elapsedTime;
      const distance = camera.position.distanceTo(orbit.current.target);
      const level = distance < 23 ? "street" : "city";
      if (level !== view) onView(level);
      if (distance > 53 && touched.current && !departed.current) {
        departed.current = true;
        back();
      }
    }
  });
  return (
    <>
      <ambientLight intensity={scene.ambient} />
      <directionalLight
        position={[18, 30, 14]}
        intensity={scene.sun}
        color="#fff0d6"
      />
      <directionalLight
        position={[-10, 7, -18]}
        intensity={0.35}
        color="#a5c9dd"
      />
      <Terrain profile={p} reserved={sites} />
      <TinyBuildings
        buildings={buildings}
        lights={night}
        onInspect={(i) => select("building-" + i)}
      />
      {["ist", "lon", "par", "fra"].includes(p.id) && (
        <Roofs buildings={buildings} color={p.roof} />
      )}
      <CityLife profile={p} night={night} />
      <CityPeople profile={p} crowd={crowd} night={night} />
      <CityEvents sites={sites} selected={selected} select={select} />
      {sites.some((s) => s.event.scene === "cats") && (
        <CityCats people={crowd.people} buildings={buildings} />
      )}
      {p.landmarks.map((l, i) => (
        <group key={l.name} position={[l.x, groundY(l.x, l.z) + 0.15, l.z]}>
          <group scale={l.scale ?? 1}>
            <CityLandmarkModel kind={l.kind} city={p.id} />
          </group>
          <Html
            position={[0, (l.scale ?? 1) * 2.4 + 0.8, 0]}
            center
            zIndexRange={[22, 0]}
          >
            <button
              className={
                "city-pin " + (selected === "landmark-" + i ? "active" : "")
              }
              onClick={() => select("landmark-" + i)}
              aria-label={tr("Inspect " + l.name)}
            >
              <span>⌁</span>
              {tr(l.name)}
            </button>
          </Html>
        </group>
      ))}
      <group position={[-22, 12, -25]}>
        <Cloud scale={4} />
      </group>
      <group position={[23, 15, -35]}>
        <Cloud scale={5} />
      </group>
      <OrbitControls
        ref={orbit}
        target={[0, 0, 0]}
        minDistance={7}
        maxDistance={62}
        minPolarAngle={0.25}
        maxPolarAngle={1.36}
        rotateSpeed={0.5}
        zoomSpeed={0.85}
        panSpeed={0.65}
        enablePan
        enableDamping
        dampingFactor={0.08}
        onStart={() => {
          flight.current = null;
          target.current = null;
          touched.current = true;
        }}
        touches={{ ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN }}
      />
    </>
  );
}
export default function CityWorld({
  hubId,
  game,
  back,
  openMarket,
  openStock,
  openStory,
  paused = false,
  requestedEvent,
  requestKey,
}: {
  hubId: string;
  game: Game;
  back: () => void;
  openMarket: (id: string) => void;
  openStock: (s: string) => void;
  openStory: (e: MarketEvent) => void;
  paused?: boolean;
  requestedEvent?: string;
  requestKey?: number;
}) {
  const { tr, report } = useLocale();
  const [selected, setSelected] = useState("overview"),
    [district, setDistrict] = useState("overview"),
    [view, setView] = useState("city"),
    [zoom, setZoom] = useState({ id: 0, amount: 0 }),
    [dpr, setDpr] = useState(1.35),
    [details, setDetails] = useState(true),
    [focusTick, setFocusTick] = useState(0),
    [reportsOpen, setReportsOpen] = useState(false);
  const p = cityProfiles[hubId],
    h = hubs.find((h) => h.id === hubId)!,
    stocks = game.companies.filter((c) => c.hub === hubId),
    stories = useMemo(
      () => game.events.filter((e) => e.hub === hubId),
      [game.events, hubId],
    ),
    story = stories[0] ?? game.events.find((e) => e.scope === "GLOBAL")!;
  const sites = useMemo(
    () => cityEventSites(p, stories, cityBuildings(p)),
    [p, stories],
  );
  const selectedEvent = selected.startsWith("event-")
    ? sites.find((s) => s.event.id === selected.slice(6))?.event
    : undefined;
  useEffect(() => {
    if (requestedEvent) {
      setSelected("event-" + requestedEvent);
      setFocusTick((n) => n + 1);
      setDetails(false);
    }
  }, [requestedEvent, requestKey]);
  const landmark = selected.startsWith("landmark-")
      ? p.landmarks[Number(selected.slice(9))]
      : undefined,
    company = selected.startsWith("building-")
      ? stocks[Number(selected.slice(9)) % stocks.length]
      : undefined,
    area = p.districts.find((d) => d.id === district);
  const select = useCallback((s: string) => {
    setSelected(s);
    setFocusTick((n) => n + 1);
    setDetails(!s.startsWith("event-"));
  }, []);
  useEffect(() => {
    game.discover(stories.map((e) => e.id));
  }, [hubId, game.events.length]);
  const title =
    (selected === "street-life" ? "Life in " + h.name : undefined) ??
    (selectedEvent ? report(selectedEvent, "headline") : undefined) ??
    company?.name ??
    landmark?.name ??
    (selected === "story" ? story.headline : (area?.name ?? p.subtitle));
  const description = selectedEvent
    ? report(selectedEvent, selectedEvent.consequence ? "consequence" : "body")
    : company
      ? company.sector +
        " headquarters · " +
        money(company.price, h.mark) +
        " per share."
      : (landmark?.description ??
        (selected === "story"
          ? "A developing report. Open the coverage to inspect its market implications."
          : (area?.description ??
            p.transit +
              ". Select a district or keep zooming to explore the streets.")));
  return (
    <main
      className="city-world expanded-city"
      data-city={hubId}
      data-level={view}
      data-focused-event={selectedEvent?.scenario ?? ""}
    >
      <div className="city-canvas">
        <Canvas
          frameloop={paused || reportsOpen ? "demand" : "always"}
          camera={{ position: [24, 25, 30], fov: 44, near: 0.15, far: 380 }}
          dpr={[1, dpr]}
          gl={{ antialias: true, alpha: false }}
        >
          <PerformanceMonitor onDecline={() => setDpr(1)}>
            <CityScene
              p={p}
              sites={sites}
              focusTick={focusTick}
              now={game.now}
              selected={selected}
              select={select}
              district={district}
              zoom={zoom}
              view={view}
              onView={setView}
              back={back}
            />
          </PerformanceMonitor>
        </Canvas>
      </div>
      <div className="city-header">
        <button className="planet-back" onClick={back}>
          <ArrowLeft size={15} /> {tr(" World ")}
        </button>
        <div className="city-title">
          <span className="eyebrow">
            <MapPin size={12} />
            {tr(h.region)} / {tr(h.country)}
          </span>
          <h1>{tr(h.name)}</h1>
          <p>{tr(p.subtitle)}</p>
        </div>
        <div className="city-time">
          <strong>{tr(localTime(game.now, h.zone))}</strong>
          <StatusBadge hub={h} now={game.now} />
        </div>
      </div>
      <div className="district-tabs" aria-label={tr("City districts")}>
        <button
          className={district === "overview" ? "active" : ""}
          onClick={() => {
            setDistrict("overview");
            select("overview");
          }}
        >
          <Compass size={12} /> {tr(" Overview ")}
        </button>
        {p.districts.map((d) => (
          <button
            key={d.id}
            className={district === d.id ? "active" : ""}
            onClick={() => {
              setDistrict(d.id);
              select("district");
            }}
          >
            {tr(d.name)}
          </button>
        ))}
      </div>
      <div className="city-geography">
        <span>
          <i className="live-dot" />
          {tr(" ")}
          {tr(view === "street" ? "STREET LEVEL" : "CITY / EARTH SURFACE")}
        </span>
        <b>{tr(p.waterName)}</b>
        <small>
          {tr(Math.abs(h.lat).toFixed(2))}°{tr(h.lat >= 0 ? "N" : "S")} ·
          {tr(" ")}
          {tr(Math.abs(h.lng).toFixed(2))}°{tr(h.lng >= 0 ? "E" : "W")}
        </small>
      </div>
      <div className="city-zoom">
        <button
          aria-label={tr("Zoom into city")}
          onClick={() => setZoom({ id: performance.now(), amount: -10 })}
        >
          <Plus size={18} />
        </button>
        <button
          aria-label={tr("Zoom out of city")}
          onClick={() => setZoom({ id: performance.now(), amount: 12 })}
        >
          <Minus size={18} />
        </button>
        <button
          aria-label={tr("Explore street life")}
          title={tr("Explore street life")}
          className={selected === "street-life" ? "active" : ""}
          onClick={() => {
            select("street-life");
            setDetails(false);
          }}
        >
          <UsersRound size={17} />
        </button>
        <button
          aria-label={tr("City overview")}
          onClick={() => {
            setDistrict("overview");
            select("overview");
            setZoom({ id: performance.now(), amount: 999 });
          }}
        >
          <LocateFixed size={16} />
        </button>
      </div>
      <div className="city-observation">
        {sites[0] && (
          <button
            className="city-lead-report"
            aria-label={tr("Locate lead report")}
            onClick={() => {
              select("event-" + sites[0].event.id);
              setDetails(false);
            }}
          >
            <MapPin size={13} /> {tr(" On location ")}
          </button>
        )}
        <span>{tr(p.weather)}</span>
        <span>
          {tr(p.population)} {tr(" residents")}
        </span>
        <button
          onClick={() => {
            setReportsOpen(true);
          }}
        >
          <Newspaper size={13} />
          {tr(stories.length)} {tr(" local reports ")}
        </button>
      </div>
      <aside
        className={
          "city-info " +
          (!details ? "collapsed" : "") +
          (selectedEvent ? " on-location" : "")
        }
      >
        <button
          className="city-info-toggle"
          aria-label={tr(
            details ? "Collapse city details" : "Expand city details",
          )}
          onClick={() => setDetails(!details)}
        >
          <ChevronDown size={17} />
        </button>
        <div>
          <span className="eyebrow">
            {tr(
              selectedEvent
                ? "ON LOCATION · " + selectedEvent.category.toUpperCase()
                : company
                  ? "LISTED COMPANY"
                  : landmark
                    ? "CITY LANDMARK"
                    : selected === "story"
                      ? "LOCAL CORRESPONDENT"
                      : view === "street"
                        ? "EXPLORE THE NEIGHBOURHOOD"
                        : "REGIONAL OVERVIEW",
            )}
          </span>
          <h2>{tr(title)}</h2>
          {details && (
            <>
              <p>{tr(description)}</p>
              <div className="city-company-pills">
                {stocks.slice(0, 3).map((c) => (
                  <button key={c.symbol} onClick={() => openStock(c.symbol)}>
                    {tr(c.symbol)}
                    <Change value={changeOf(c)} />
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
        {(details || selectedEvent) && (
          <button
            className="city-primary"
            onClick={() =>
              selectedEvent
                ? openStory(selectedEvent)
                : company
                  ? openStock(company.symbol)
                  : selected === "story"
                    ? openStory(story)
                    : openMarket(hubId)
            }
          >
            {tr(
              selectedEvent
                ? "Read report"
                : company
                  ? "Open company"
                  : selected === "story"
                    ? "Read report"
                    : "Visit exchange",
            )}
            <ArrowRight size={16} />
          </button>
        )}
      </aside>
      {reportsOpen && (
        <Sheet
          title={tr(h.name + " dispatches")}
          eyebrow="LOCAL CORRESPONDENTS"
          close={() => setReportsOpen(false)}
        >
          <div className="city-dispatches">
            {stories.map((e) => (
              <div className="city-dispatch-row" key={e.id}>
                <button
                  onClick={() => {
                    setReportsOpen(false);
                    openStory(e);
                  }}
                >
                  <small>
                    {tr(e.category)} · {tr(localTime(e.timestamp, h.zone))}
                  </small>
                  <b>{report(e, "headline")}</b>
                </button>
                <button
                  className="dispatch-map-link"
                  aria-label={tr("Show on streets: " + e.headline)}
                  onClick={() => {
                    setReportsOpen(false);
                    select("event-" + e.id);
                    setDetails(false);
                  }}
                >
                  <MapPin size={12} /> {tr(" Show on streets ")}
                </button>
              </div>
            ))}
          </div>
        </Sheet>
      )}
      <div className="city-hint">
        <Navigation size={12} />
        {tr("Drag to orbit · pinch into streets · zoom out to Earth ")}
      </div>
    </main>
  );
}
