import { useRef, type MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Block, Cat, Cloud, Duck, Tree } from "./ToyModels";
import type { MarketEvent } from "./data";
import ReportModels from "./ReportModels";

export default function EventVisual({
  event,
  elapsed,
}: {
  event: MarketEvent;
  elapsed: MutableRefObject<number>;
}) {
  const animated = useRef<THREE.Group>(null),
    secondary = useRef<THREE.Group>(null),
    water = useRef<THREE.Group>(null);
  const kind =
    event.scenario === "moon"
      ? "moon"
      : event.scenario === "confetti"
        ? "coins"
        : (event.scene ?? "lakes");
  useFrame(() => {
    const t = elapsed.current;
    if (animated.current) {
      const a = animated.current;
      if (kind === "lakes") {
        a.position.y = 0.12 + Math.sin(t * 2) * 0.04;
        a.rotation.y = Math.sin(t * 0.35) * 0.2;
      } else if (kind === "cats") {
        a.position.y = 0.35 + Math.abs(Math.sin(t * 2)) * 0.13;
        a.rotation.z = Math.sin(t * 2) * 0.07;
      } else if (kind === "ducks") {
        a.position.x = Math.sin(t * 0.45) * 0.8;
        a.position.y = 0.13 + Math.sin(t * 2) * 0.08;
        a.rotation.z = Math.sin(t * 1.4) * 0.07;
      } else if (kind === "balloons" || kind === "moon") {
        a.position.y = 0.4 + Math.sin(t * 0.5) * 0.3 + Math.min(t / 4, 1) * 0.7;
        a.rotation.z = Math.sin(t) * 0.04;
      } else if (kind === "coffee") {
        a.scale.y = 0.7 + Math.sin(t * 3) * 0.3;
      } else if (kind === "clouds") {
        a.position.x = Math.sin(t * 0.5) * 1.1;
        a.position.y = 1.6 + Math.sin(t) * 0.15;
      } else if (kind === "coins") {
        a.rotation.y = t * 0.8;
        a.position.y = 0.6 + (1 - (t % 3) / 3) * 1.4;
      }
    }
    if (water.current) {
      const s = THREE.MathUtils.smoothstep(t, 0.4, 3) * 0.85 + 0.15;
      water.current.scale.set(s, 1, s);
    }
    if (secondary.current) {
      secondary.current.rotation.y = t * 0.25;
      secondary.current.position.y = 2.3 + Math.sin(t * 1.5) * 0.1;
    }
  });
  return (
    <>
      {event.scenario !== "moon" && event.scenario !== "confetti" && (
        <ReportModels kind={event.scene ?? "lakes"} elapsed={elapsed} />
      )}
      {kind === "lakes" && (
        <>
          <group ref={water}>
            {[
              [-1.2, 0, 0.3, 0.95],
              [0.65, 0, -0.1, 1.15],
              [1.5, 0, 1.3, 0.65],
            ].map(([x, y, z, r], i) => (
              <mesh key={i} position={[x, 0.02, z]}>
                <cylinderGeometry args={[r, r, 0.05, 14]} />
                <meshStandardMaterial color="#57bfd6" roughness={0.35} />
              </mesh>
            ))}
          </group>
          <group ref={animated} position={[0, 0.12, 0.8]}>
            {[-1.3, 0, 1.2].map((x, i) => (
              <group
                key={i}
                position={[x, 0, Math.sin(i) * 0.4]}
                rotation={[0, -0.4, 0]}
              >
                <Duck scale={0.7} />
              </group>
            ))}
          </group>
          <Tree position={[-2.6, 0, 0.5]} flat />
          <Tree position={[2.5, 0, 0.1]} flat />
        </>
      )}
      {kind === "cats" && (
        <>
          <Block
            position={[0, 0.28, 0.5]}
            size={[2.1, 0.45, 1.1]}
            color="#b4aecb"
          />
          <group ref={animated} position={[0, 0.35, 0.5]}>
            <Cat scale={1.5} />
          </group>
          <Block
            position={[1.25, 0.6, 0.8]}
            size={[0.45, 0.12, 0.45]}
            color="#5388b2"
          />
          <Block
            position={[1.38, 0.92, 0.8]}
            size={[0.025, 0.65, 0.025]}
            color="#fff3ca"
          />
          <Block
            position={[-1.8, 0.18, 1.5]}
            size={[0.6, 0.35, 0.9]}
            color="#e4816e"
          />
        </>
      )}
      {kind === "ducks" && (
        <>
          <group ref={animated}>
            <Duck scale={2.65} />
          </group>
          {[-2.3, 1.9].map((x, i) => (
            <group key={i} position={[x, 0.14, 1.6]}>
              <Block size={[0.7, 0.15, 0.38]} color="#faf0d7" />
              <Block
                position={[0, 0.16, 0]}
                size={[0.35, 0.24, 0.3]}
                color={i ? "#c7a1cd" : "#e28374"}
              />
            </group>
          ))}
        </>
      )}
      {kind === "balloons" && (
        <group ref={animated}>
          <Block
            position={[0, 0.8, 0.5]}
            size={[1.3, 1.25, 1]}
            color="#c5afd2"
          />
          {[-0.35, 0, 0.35].map((x) => (
            <Block
              key={x}
              position={[x, 0.85, 1.02]}
              size={[0.15, 0.55, 0.015]}
              color="#fff7dd"
            />
          ))}
          {[-0.8, -0.4, 0, 0.4, 0.8].map((x, i) => (
            <group key={i}>
              <mesh
                position={[x, 2.4 + Math.sin(i) * 0.3, 0.4]}
                scale={[0.34, 0.44, 0.34]}
              >
                <icosahedronGeometry args={[1, 2]} />
                <meshStandardMaterial
                  color={
                    ["#e7947e", "#9bcbbf", "#efcf6d", "#c3afd4", "#84bacd"][i]
                  }
                  flatShading
                />
              </mesh>
              <Block
                position={[x * 0.5, 1.6, 0.4]}
                size={[0.014, 1.2, 0.014]}
                color="#f9f2da"
                rotation={[0, 0, -x * 0.35]}
              />
            </group>
          ))}
        </group>
      )}
      {kind === "moon" && (
        <group ref={animated}>
          <mesh position={[0, 1.2, 0]}>
            <icosahedronGeometry args={[0.96, 2]} />
            <meshStandardMaterial color="#f3deb1" flatShading />
          </mesh>
          {[-0.38, 0.35].map((x) => (
            <mesh key={x} position={[x, 1.38, 0.84]}>
              <sphereGeometry args={[0.065, 8, 6]} />
              <meshStandardMaterial color="#345368" />
            </mesh>
          ))}
          <mesh position={[-0.58, 1.04, 0.65]}>
            <icosahedronGeometry args={[0.17, 1]} />
            <meshStandardMaterial color="#d4bd8c" />
          </mesh>
          <Block
            position={[0.48, 0.42, 1.1]}
            size={[0.86, 1.15, 0.06]}
            color="#fffae9"
            rotation={[0, 0, -0.12]}
          />
          {[0.65, 0.43, 0.21].map((y) => (
            <Block
              key={y}
              position={[0.48, y, 1.14]}
              size={[0.48, 0.05, 0.015]}
              color="#91a5a4"
            />
          ))}
          <mesh position={[0.48, 0.91, 1.15]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.12, 0.12, 0.025, 10]} />
            <meshStandardMaterial color="#e2b954" />
          </mesh>
        </group>
      )}
      {kind === "coffee" && (
        <>
          <mesh position={[0, 0.4, 0.4]}>
            <cylinderGeometry args={[0.78, 0.65, 0.8, 12]} />
            <meshStandardMaterial color="#faf0cf" />
          </mesh>
          <mesh position={[0.85, 0.4, 0.4]} rotation={[0, Math.PI / 2, 0]}>
            <torusGeometry args={[0.37, 0.1, 6, 12]} />
            <meshStandardMaterial color="#faf0cf" />
          </mesh>
          <group ref={animated} position={[0, 0.8, 0.4]}>
            <mesh position={[0, 0.7, 0]}>
              <cylinderGeometry args={[0.12, 0.4, 1.4, 8]} />
              <meshStandardMaterial color="#9e7158" flatShading />
            </mesh>
            <mesh position={[0, 1.45, 0]} scale={[0.8, 0.27, 0.8]}>
              <icosahedronGeometry args={[0.7, 1]} />
              <meshStandardMaterial color="#c8956c" flatShading />
            </mesh>
          </group>
          <group ref={secondary}>
            <Cloud scale={0.6} />
          </group>
        </>
      )}
      {kind === "clouds" && (
        <>
          <group ref={animated}>
            <Cloud scale={1.7} face />
          </group>
          <mesh position={[-2, 0.75, 0.8]}>
            <icosahedronGeometry args={[0.65, 1]} />
            <meshStandardMaterial color="#f6cc64" flatShading />
          </mesh>
          <Block
            position={[-2, 0.25, 0.8]}
            size={[1.5, 0.13, 0.65]}
            color="#ed9c8a"
            rotation={[0, 0, 0.15]}
          />
          {[-0.6, 0, 0.6].map((x, i) => (
            <mesh key={i} position={[x, 0.65, 0.7]}>
              <coneGeometry args={[0.09, 0.38, 5]} />
              <meshStandardMaterial color="#70aacb" />
            </mesh>
          ))}
        </>
      )}
      {kind === "coins" && (
        <>
          <Tree scale={1.7} position={[-0.9, 0, 0]} />
          <Tree scale={1.5} position={[1, 0, -0.5]} color="#97b97c" />
          <group ref={animated}>
            {[-1.1, -0.4, 0.4, 1.2].map((x, i) => (
              <mesh
                key={i}
                position={[x, Math.sin(i) * 0.3, 0.9]}
                rotation={[Math.PI / 2, 0, 0]}
              >
                <cylinderGeometry args={[0.23, 0.23, 0.07, 10]} />
                <meshStandardMaterial
                  color="#f2c659"
                  metalness={0.2}
                  roughness={0.55}
                />
              </mesh>
            ))}
          </group>
        </>
      )}
    </>
  );
}
