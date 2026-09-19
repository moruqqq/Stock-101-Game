import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  Html,
  Line,
  AdaptiveDpr,
  PerformanceMonitor,
} from "@react-three/drei";
import * as THREE from "three";
import { feature, mesh } from "topojson-client";
import type { OrbitControls as OrbitImpl } from "three-stdlib";
import { hubs, session, type Hub, type MarketEvent } from "./data";

const R = 1.7;
export function position(lat: number, lng: number, r = R) {
  const a = (lat * Math.PI) / 180,
    b = (lng * Math.PI) / 180;
  return new THREE.Vector3(
    Math.cos(a) * Math.cos(b) * r,
    Math.sin(a) * r,
    -Math.cos(a) * Math.sin(b) * r,
  );
}
export type GlobeView = {
  level: "global" | "region" | "city";
  hub: Hub;
  distance: number;
};
export type GlobeCommand = {
  id: number;
  hub?: string;
  zoom?: number;
  reset?: boolean;
};
interface Props {
  now: number;
  events: MarketEvent[];
  selected: string | null;
  command: GlobeCommand;
  onSelect: (id: string) => void;
  onEvent: (e: MarketEvent) => void;
  onView: (v: GlobeView) => void;
  exposure?: Record<string, number>;
}
type Geography = {
  texture: THREE.CanvasTexture;
  borders: THREE.BufferGeometry;
  dots: THREE.BufferGeometry;
};
let geoPromise: Promise<Geography> | undefined;
function loadGeography() {
  if (!geoPromise)
    geoPromise = fetch("/countries-110m.json")
      .then((r) => {
        if (!r.ok) throw new Error("Atlas unavailable");
        return r.json();
      })
      .then((topo) => {
        const canvas = document.createElement("canvas");
        canvas.width = 2048;
        canvas.height = 1024;
        const ctx = canvas.getContext("2d")!;
        ctx.fillStyle = "#0b141c";
        ctx.fillRect(0, 0, 2048, 1024);
        const countries = feature(topo, topo.objects.countries) as unknown as {
          features: {
            geometry: {
              type: string;
              coordinates: number[][][] | number[][][][];
            };
          }[];
        };
        countries.features.forEach((f, i) => {
          const polys =
            f.geometry.type === "Polygon"
              ? [f.geometry.coordinates as number[][][]]
              : (f.geometry.coordinates as number[][][][]);
          ctx.fillStyle = [
            "#293b47",
            "#283945",
            "#253844",
            "#2a3d49",
            "#273a46",
          ][i % 5];
          polys.forEach((poly) => {
            ctx.beginPath();
            poly.forEach((ring) => {
              ring.forEach(([lng, lat], j) => {
                const x = ((lng + 180) / 360) * 2048,
                  y = ((90 - lat) / 180) * 1024;
                j === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
              });
              ctx.closePath();
            });
            ctx.fill("evenodd");
          });
        });
        const pixels = ctx.getImageData(0, 0, 2048, 1024).data,
          points: number[] = [];
        let seed = 82;
        const rand = () => {
          seed = (seed * 16807) % 2147483647;
          return seed / 2147483647;
        };
        for (let i = 0; i < 6800; i++) {
          const lat = (Math.asin(rand() * 2 - 1) * 180) / Math.PI,
            lng = rand() * 360 - 180;
          const x = Math.floor(((lng + 180) / 360) * 2048),
            y = Math.floor(((90 - lat) / 180) * 1024);
          if (pixels[(y * 2048 + x) * 4] > 28)
            points.push(...position(lat, lng, R + 0.006).toArray());
        }
        const lines = mesh(topo, topo.objects.countries).coordinates,
          vertices: number[] = [];
        lines.forEach((line) =>
          line.forEach((p, i) => {
            if (i)
              vertices.push(
                ...position(
                  line[i - 1][1],
                  line[i - 1][0],
                  R + 0.004,
                ).toArray(),
                ...position(p[1], p[0], R + 0.004).toArray(),
              );
          }),
        );
        const texture = new THREE.CanvasTexture(canvas);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = 4;
        const borders = new THREE.BufferGeometry();
        borders.setAttribute(
          "position",
          new THREE.Float32BufferAttribute(vertices, 3),
        );
        const dots = new THREE.BufferGeometry();
        dots.setAttribute(
          "position",
          new THREE.Float32BufferAttribute(points, 3),
        );
        return { texture, borders, dots };
      });
  return geoPromise;
}
function Earth({ geo }: { geo: Geography }) {
  const grid = useMemo(() => {
    const coords: number[] = [];
    for (let lat = -60; lat <= 60; lat += 30)
      for (let lng = -180; lng < 180; lng += 4)
        coords.push(
          ...position(lat, lng, R + 0.003).toArray(),
          ...position(lat, lng + 4, R + 0.003).toArray(),
        );
    for (let lng = -180; lng < 180; lng += 30)
      for (let lat = -90; lat < 90; lat += 4)
        coords.push(
          ...position(lat, lng, R + 0.003).toArray(),
          ...position(lat + 4, lng, R + 0.003).toArray(),
        );
    return new THREE.BufferGeometry().setAttribute(
      "position",
      new THREE.Float32BufferAttribute(coords, 3),
    );
  }, []);
  return (
    <group>
      <mesh>
        <sphereGeometry args={[R, 80, 56]} />
        <meshStandardMaterial
          map={geo.texture}
          roughness={1}
          metalness={0.05}
        />
      </mesh>
      <lineSegments geometry={geo.borders}>
        <lineBasicMaterial color="#758a95" transparent opacity={0.35} />
      </lineSegments>
      <lineSegments geometry={grid}>
        <lineBasicMaterial color="#69808f" transparent opacity={0.09} />
      </lineSegments>
      <points geometry={geo.dots}>
        <pointsMaterial
          size={0.006}
          color="#a6b7b9"
          transparent
          opacity={0.26}
          sizeAttenuation
        />
      </points>
      <mesh scale={1.018}>
        <sphereGeometry args={[R, 64, 40]} />
        <shaderMaterial
          transparent
          depthWrite={false}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          uniforms={{}}
          vertexShader={
            "varying vec3 vNormal; varying vec3 vView; void main(){vec4 p=modelViewMatrix*vec4(position,1.0);vNormal=normalize(normalMatrix*normal);vView=normalize(-p.xyz);gl_Position=projectionMatrix*p;}"
          }
          fragmentShader={
            "varying vec3 vNormal;varying vec3 vView;void main(){float f=pow(1.0-abs(dot(vNormal,vView)),3.5);gl_FragColor=vec4(0.22,0.32,0.39,f*0.30);}"
          }
        />
      </mesh>
    </group>
  );
}
function HubPoint({
  hub,
  now,
  selected,
  level,
  onSelect,
  event,
  onEvent,
  exposure,
}: {
  hub: Hub;
  now: number;
  selected: boolean;
  level: GlobeView["level"];
  onSelect: () => void;
  event?: MarketEvent;
  onEvent: () => void;
  exposure?: number;
}) {
  const pos = useMemo(() => position(hub.lat, hub.lng, R + 0.018), [hub]);
  const pulse = useRef<THREE.Mesh>(null),
    html = useRef<HTMLDivElement>(null);
  const status = session(hub, now).status,
    active = status === "OPEN" || status === "CLOSING";
  const color = selected
    ? "#dfb77e"
    : exposure
      ? "#b6c5e1"
      : active
        ? "#73c8a5"
        : status === "PRE-MARKET"
          ? "#b9a17b"
          : "#70818b";
  const featured = ["nyc", "lon", "ist", "tok", "dub", "syd", "sao"].includes(
    hub.id,
  );
  const label =
    selected ||
    level === "city" ||
    (level === "region" && hub.id !== "par") ||
    featured;
  useFrame(({ camera, clock }) => {
    if (html.current) {
      const visible =
        pos.clone().normalize().dot(camera.position.clone().normalize()) >
        R / camera.position.length() + 0.025;
      html.current.style.visibility = visible ? "visible" : "hidden";
    }
    if (pulse.current) {
      const s =
        1 + (Math.sin(clock.elapsedTime * (active ? 1.7 : 0.65)) + 1) * 0.45;
      pulse.current.scale.setScalar(s);
    }
  });
  return (
    <group position={pos}>
      <mesh>
        <sphereGeometry args={[selected ? 0.016 : 0.011, 12, 8]} />
        <meshBasicMaterial color={color} />
      </mesh>
      {(active || status === "PRE-MARKET" || selected) && (
        <mesh ref={pulse}>
          <sphereGeometry args={[0.025, 12, 8]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.13}
            depthWrite={false}
          />
        </mesh>
      )}
      <Html center zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
        <div
          ref={html}
          className={`hub-html hub-${hub.id} ${selected ? "selected" : ""}`}
        >
          <button
            className={`hub-hit ${label ? "with-label" : ""} ${selected ? "selected" : ""}`}
            aria-label={`Explore ${hub.name}`}
            onClick={(e) => {
              e.stopPropagation();
              if (e.detail) e.currentTarget.blur();
              onSelect();
            }}
            style={{ "--hub-color": color } as React.CSSProperties}
          >
            <span className="hub-dot" />
            {label && (
              <span className="hub-name">
                {hub.name}
                {exposure !== undefined ? (
                  <small>${Math.round(exposure).toLocaleString()}</small>
                ) : (
                  level !== "global" && <small>{status.toLowerCase()}</small>
                )}
              </span>
            )}
          </button>
          {event && (
            <button
              className="event-beacon"
              aria-label={`News near ${hub.name}`}
              onClick={(e) => {
                e.stopPropagation();
                if (e.detail) e.currentTarget.blur();
                onEvent();
              }}
            >
              <span />
              {level === "city" ? "NEWS" : <i />}
            </button>
          )}
        </div>
      </Html>
    </group>
  );
}
const connections = [
  ["nyc", "lon"],
  ["lon", "ist"],
  ["ist", "dub"],
  ["dub", "mum"],
  ["tok", "hkg"],
  ["hkg", "sin"],
  ["fra", "nyc"],
];
function Connection({
  from,
  to,
  active,
}: {
  from: Hub;
  to: Hub;
  active: boolean;
}) {
  const particle = useRef<THREE.Mesh>(null);
  const points = useMemo(() => {
    const a = position(from.lat, from.lng),
      b = position(to.lat, to.lng);
    const angle = a.angleTo(b);
    return Array.from({ length: 49 }, (_, i) => {
      const t = i / 48;
      return a
        .clone()
        .lerp(b, t)
        .normalize()
        .multiplyScalar(
          R + 0.015 + Math.sin(t * Math.PI) * Math.min(0.34, angle * 0.25),
        );
    });
  }, [from, to]);
  useFrame(({ clock }) => {
    if (particle.current) {
      const t =
        (clock.elapsedTime * (active ? 0.08 : 0.025) + from.lat / 90) % 1;
      const i = Math.floor(t * 48);
      particle.current.position.copy(points[Math.max(0, i)] || points[0]);
    }
  });
  return (
    <group>
      <Line
        points={points}
        color={active ? "#819d91" : "#5b717c"}
        lineWidth={0.65}
        transparent
        opacity={active ? 0.28 : 0.1}
      />
      {active && (
        <mesh ref={particle}>
          <sphereGeometry args={[0.009, 8, 6]} />
          <meshBasicMaterial color="#9ac6b1" />
        </mesh>
      )}
    </group>
  );
}
function Scene(props: Props & { geo: Geography }) {
  const controls = useRef<OrbitImpl>(null),
    fly = useRef<THREE.Vector3 | null>(null),
    last = useRef(0),
    lastView = useRef("");
  const { camera } = useThree();
  const [level, setLevel] = useState<GlobeView["level"]>("global");
  useEffect(() => {
    const cmd = props.command;
    if (cmd.hub) {
      const h = hubs.find((h) => h.id === cmd.hub)!;
      fly.current = position(h.lat, h.lng, cmd.zoom ?? 3.8);
    } else if (cmd.reset) fly.current = position(24, 24, 6.6);
    else if (cmd.zoom)
      fly.current = camera.position
        .clone()
        .normalize()
        .multiplyScalar(
          THREE.MathUtils.clamp(camera.position.length() + cmd.zoom, 2.65, 8.6),
        );
  }, [props.command, camera]);
  useFrame(({ clock }, delta) => {
    if (fly.current) {
      camera.position.lerp(fly.current, 1 - Math.exp(-delta * 5));
      if (camera.position.distanceTo(fly.current) < 0.005) fly.current = null;
      controls.current?.update();
    }
    if (clock.elapsedTime - last.current > 0.18) {
      last.current = clock.elapsedTime;
      const d = camera.position.length(),
        next = d > 5.3 ? "global" : d > 3.55 ? "region" : "city";
      if (next !== level) setLevel(next);
      const dir = camera.position.clone().normalize();
      const hub = hubs.reduce((a, b) =>
        position(a.lat, a.lng, 1).dot(dir) > position(b.lat, b.lng, 1).dot(dir)
          ? a
          : b,
      );
      const key = next + hub.id + Math.round(d * 5);
      if (key !== lastView.current) {
        lastView.current = key;
        props.onView({ level: next, hub, distance: d });
      }
    }
  });
  return (
    <>
      <ambientLight intensity={1.15} />
      <directionalLight position={[4, 5, -2]} intensity={2.1} color="#d8e5ec" />
      <directionalLight
        position={[-5, -2, 4]}
        intensity={0.32}
        color="#b7c9d8"
      />
      <Earth geo={props.geo} />
      {hubs.map((h) => (
        <HubPoint
          key={h.id}
          hub={h}
          now={props.now}
          selected={props.selected === h.id}
          level={level}
          onSelect={() => props.onSelect(h.id)}
          event={props.events.find((e) => e.hub === h.id)}
          onEvent={() => {
            const e = props.events.find((e) => e.hub === h.id);
            if (e) props.onEvent(e);
          }}
          exposure={props.exposure?.[h.id]}
        />
      ))}
      {connections.map(([a, b]) => (
        <Connection
          key={a + b}
          from={hubs.find((h) => h.id === a)!}
          to={hubs.find((h) => h.id === b)!}
          active={["OPEN", "CLOSING"].includes(
            session(
              hubs.find((h) => h.id === a)!,
              props.now,
            ).status,
          )}
        />
      ))}
      <OrbitControls
        ref={controls}
        enablePan={false}
        enableDamping
        dampingFactor={0.07}
        minDistance={2.65}
        maxDistance={8.6}
        rotateSpeed={0.5}
        zoomSpeed={0.65}
        onStart={() => {
          fly.current = null;
        }}
        touches={{ ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_ROTATE }}
      />
      <AdaptiveDpr pixelated />
    </>
  );
}
export default function Globe(props: Props) {
  const [geo, setGeo] = useState<Geography | null>(null),
    [error, setError] = useState(false),
    [dpr, setDpr] = useState(1.5);
  useEffect(() => {
    loadGeography()
      .then(setGeo)
      .catch(() => setError(true));
  }, []);
  if (error)
    return (
      <div className="globe-loading">
        The atlas could not load. Reload to reconnect.
      </div>
    );
  return (
    <div
      className="globe-canvas"
      aria-label="Interactive world globe. Drag to rotate. Pinch or scroll to zoom."
    >
      {geo ? (
        <Canvas
          camera={{
            position: position(24, 24, 6.6).toArray(),
            fov: 42,
            near: 0.1,
            far: 40,
          }}
          dpr={[1, dpr]}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: "high-performance",
          }}
          fallback={
            <div className="globe-loading">
              WebGL is unavailable. Explore every exchange in Markets.
            </div>
          }
        >
          <PerformanceMonitor onDecline={() => setDpr(1)}>
            <Suspense fallback={null}>
              <Scene {...props} geo={geo} />
            </Suspense>
          </PerformanceMonitor>
        </Canvas>
      ) : (
        <div className="globe-loading">
          <span className="loading-orbit" />
          Mapping your world…
        </div>
      )}
    </div>
  );
}
