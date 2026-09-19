import { useLocale } from "./Locale";
import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { Radio } from "lucide-react";
import EventVisual from "./EventVisual";
import type { CityEventSite } from "./eventLocations";
import { groundY } from "./cityProfiles";

function OnSiteVisual({
  site,
  active,
}: {
  site: CityEventSite;
  active: boolean;
}) {
  const elapsed = useRef(0),
    ring = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    elapsed.current = (elapsed.current + Math.min(delta, 0.1)) % 12;
    if (ring.current) {
      const scale = 1 + Math.sin(elapsed.current * 1.3) * 0.035;
      ring.current.scale.setScalar(scale);
    }
  });
  return (
    <>
      <group scale={0.78}>
        <EventVisual event={site.event} elapsed={elapsed} />
      </group>
      <mesh ref={ring} position={[0, 0.025, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.05, 2.09, 40]} />
        <meshBasicMaterial
          color={active ? "#de9a4e" : "#82b9ae"}
          transparent
          opacity={0.65}
          depthWrite={false}
        />
      </mesh>
    </>
  );
}

export default function CityEvents({
  sites,
  selected,
  select,
}: {
  sites: CityEventSite[];
  selected: string;
  select: (id: string) => void;
}) {
  const { tr, report } = useLocale();
  const [nearby, setNearby] = useState(() =>
    sites.slice(0, 2).map((s) => s.event.id),
  );
  const last = useRef(0);
  useFrame(({ camera, clock }) => {
    if (clock.elapsedTime - last.current < 0.6) return;
    last.current = clock.elapsedTime;
    const closest = sites
      .map((site) => ({
        id: site.event.id,
        distance: Math.hypot(
          camera.position.x - site.x,
          camera.position.y - groundY(site.x, site.z) - 1,
          camera.position.z - site.z,
        ),
      }))
      .filter((s) => s.distance < 27)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 2)
      .map((s) => s.id);
    const next = closest.length
      ? closest
      : sites.slice(0, 2).map((s) => s.event.id);
    setNearby((old) => (old.join(",") === next.join(",") ? old : next));
  });
  // At most three reconstructions share the existing city Canvas.
  const visible = new Set(nearby);
  if (selected.startsWith("event-")) visible.add(selected.slice(6));
  return (
    <group name="Reports on location">
      {sites.map((site, i) => (
        <group
          key={site.event.id}
          position={[
            site.x,
            groundY(site.x, site.z) + (site.water ? 0.03 : 0.15),
            site.z,
          ]}
        >
          {visible.has(site.event.id) && (
            <OnSiteVisual
              site={site}
              active={selected === "event-" + site.event.id}
            />
          )}
          <Html
            position={[0, visible.has(site.event.id) ? 2.6 : 0.65, 0]}
            center
            zIndexRange={[25, 0]}
          >
            <button
              className={
                "city-event-pin " +
                (selected === "event-" + site.event.id ? "active" : "")
              }
              aria-label={tr("View on map: " + site.event.headline)}
              title={report(site.event, "headline")}
              data-event={site.event.scenario ?? site.event.id}
              onClick={() => select("event-" + site.event.id)}
            >
              <Radio size={12} />
              <span>
                {tr(
                  i === 0 ? "LEAD REPORT" : site.event.category.toUpperCase(),
                )}
              </span>
            </button>
          </Html>
        </group>
      ))}
    </group>
  );
}
