import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Block, Tree } from "./ToyModels";
import type { SceneKind } from "./scenarios";
export default function ReportModels({
  kind,
  elapsed,
}: {
  kind: SceneKind;
  elapsed: React.MutableRefObject<number>;
}) {
  const moving = useRef<THREE.Group>(null);
  useFrame(() => {
    const t = elapsed.current;
    if (moving.current) {
      if (kind === "rail" || kind === "fuel")
        moving.current.position.x = Math.sin(t * 0.7) * 1.4;
      else if (kind === "crops")
        moving.current.scale.y = 0.5 + Math.min(t / 5, 1) * 0.6;
      else if (kind === "signal") moving.current.rotation.y = t * 0.4;
      else moving.current.position.y = 0.4 + Math.sin(t * 0.8) * 0.2;
    }
  });
  if (kind === "fuel")
    return (
      <>
        <group position={[-1.9, 0, -0.7]}>
          <Block
            position={[0, 0.6, 0]}
            size={[0.7, 1.2, 0.7]}
            color="#b28966"
          />
          <Block
            position={[0, 1.05, 0.37]}
            size={[0.48, 0.32, 0.02]}
            color="#c6d5cb"
          />
          <mesh position={[0, 1.55, 0]}>
            <cylinderGeometry args={[0.4, 0.4, 0.55, 12]} />
            <meshStandardMaterial color="#ad7753" />
          </mesh>
        </group>
        <group ref={moving} position={[0, 0.2, 1]}>
          <Block size={[1.1, 0.4, 0.6]} color="#7caaa0" />
          <Block
            position={[0, 0.35, 0]}
            size={[0.65, 0.35, 0.54]}
            color="#c6dfdb"
          />
          {[-0.4, 0.4].flatMap((x) =>
            [-0.33, 0.33].map((z) => (
              <mesh
                key={x + "," + z}
                position={[x, -0.16, z]}
                rotation={[Math.PI / 2, 0, 0]}
              >
                <cylinderGeometry args={[0.16, 0.16, 0.1, 8]} />
                <meshStandardMaterial color="#53666b" />
              </mesh>
            )),
          )}
        </group>
        <Block position={[0, 0.015, 1]} size={[6, 0.04, 1.1]} color="#d2c4a7" />
      </>
    );
  if (kind === "rail")
    return (
      <>
        <Block
          position={[0, 0.08, 0.8]}
          size={[6, 0.08, 0.08]}
          color="#748891"
        />
        <Block
          position={[0, 0.08, 1.4]}
          size={[6, 0.08, 0.08]}
          color="#748891"
        />
        <group ref={moving} position={[0, 0.4, 1.1]}>
          {[-0.75, 0, 0.75].map((x, i) => (
            <group key={x}>
              <Block
                position={[x, 0, 0]}
                size={[0.68, 0.52, 0.52]}
                color={i === 0 ? "#c0806c" : "#86a8ae"}
              />
              <Block
                position={[x, 0.05, 0.27]}
                size={[0.5, 0.2, 0.02]}
                color="#e7e5ce"
              />
            </group>
          ))}
        </group>
      </>
    );
  if (kind === "signal")
    return (
      <>
        <Block position={[0, 0.15, 0.3]} size={[2.5, 0.3, 2]} color="#8397a2" />
        {[-0.65, 0, 0.65].map((x) => (
          <Block
            key={x}
            position={[x, 0.55, 0.3]}
            size={[0.4, 0.7, 0.8]}
            color="#acc8c4"
          />
        ))}
        <group ref={moving} position={[0, 1.9, 0.3]}>
          {[0.4, 0.7, 1].map((r) => (
            <mesh key={r} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[r, 0.025, 4, 28]} />
              <meshStandardMaterial
                color="#d6b777"
                emissive="#c8a569"
                emissiveIntensity={0.3}
              />
            </mesh>
          ))}
        </group>
      </>
    );
  if (kind === "policy")
    return (
      <>
        <Block
          position={[0, 0.2, 0.2]}
          size={[2.5, 0.4, 1.4]}
          color="#c9bea4"
        />
        {[-0.8, 0, 0.8].map((x) => (
          <Block
            key={x}
            position={[x, 1, 0.2]}
            size={[0.18, 1.4, 0.25]}
            color="#eee2c7"
          />
        ))}
        <mesh position={[0, 1.8, 0.2]} rotation={[0, Math.PI / 4, 0]}>
          <coneGeometry args={[1.65, 0.65, 4]} />
          <meshStandardMaterial color="#c2b095" />
        </mesh>
        <group ref={moving} position={[1.8, 0.4, 1.2]}>
          <Block size={[0.85, 1.3, 0.08]} color="#eee6d2" />
          {[-0.3, 0, 0.3].map((y) => (
            <Block
              key={y}
              position={[0, y, 0.05]}
              size={[0.55, 0.055, 0.02]}
              color="#809892"
            />
          ))}
        </group>
      </>
    );
  if (kind === "crops")
    return (
      <>
        <group ref={moving}>
          {[-1.2, 0, 1.2].map((x) => (
            <Tree key={x} position={[x, 0, 0.5]} scale={1.2} color="#87a573" />
          ))}
        </group>
        {[-1.5, -0.5, 0.5, 1.5].map((x) => (
          <Block
            key={x}
            position={[x, 0.08, 1.7]}
            size={[0.7, 0.16, 0.9]}
            color="#bb9a68"
          />
        ))}
      </>
    );
  if (kind === "infrastructure")
    return (
      <>
        <Block
          position={[-1.1, 0.8, 0.4]}
          size={[1.3, 1.6, 1.1]}
          color="#c1b39c"
        />
        <group ref={moving} position={[0.8, 0.4, 0.5]}>
          <Block position={[0, 0.9, 0]} size={[1, 1.8, 1]} color="#9fb4b7" />
          <Block
            position={[0, 1.95, 0]}
            size={[1.2, 0.15, 1.2]}
            color="#d3b982"
          />
        </group>
        <Block
          position={[1.9, 1.5, -0.5]}
          size={[0.09, 3, 0.09]}
          color="#caa263"
        />
        <Block
          position={[0.9, 3, -0.5]}
          size={[2.2, 0.08, 0.08]}
          color="#caa263"
        />
      </>
    );
  return null;
}
