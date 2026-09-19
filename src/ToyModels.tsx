import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";

export function Block({
  position = [0, 0, 0],
  size = [1, 1, 1],
  color = "#efb18e",
  rotation = [0, 0, 0],
}: {
  position?: [number, number, number];
  size?: [number, number, number];
  color?: string;
  rotation?: [number, number, number];
}) {
  return (
    <mesh position={position} rotation={rotation}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={0.9} flatShading />
    </mesh>
  );
}
export function Duck({
  scale = 1,
  color = "#ffd75c",
}: {
  scale?: number;
  color?: string;
}) {
  return (
    <group scale={scale}>
      <mesh position={[0, 0.25, 0]} scale={[0.65, 0.4, 0.44]}>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial color={color} flatShading />
      </mesh>
      <mesh position={[0.36, 0.6, 0]}>
        <boxGeometry args={[0.4, 0.4, 0.37]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <Block
        position={[0.66, 0.53, 0]}
        size={[0.28, 0.1, 0.26]}
        color="#ed8555"
      />
      <Block
        position={[0.47, 0.65, 0.19]}
        size={[0.045, 0.065, 0.018]}
        color="#213852"
      />
      <Block
        position={[0.47, 0.65, -0.19]}
        size={[0.045, 0.065, 0.018]}
        color="#213852"
      />
      <mesh position={[-0.26, 0.36, 0.35]} rotation={[0, 0, -0.15]}>
        <boxGeometry args={[0.48, 0.09, 0.12]} />
        <meshStandardMaterial color="#ffe58d" />
      </mesh>
    </group>
  );
}
export function Cat({ scale = 1 }: { scale?: number }) {
  return (
    <group scale={scale}>
      <Block position={[0, 0.36, 0]} size={[0.8, 0.62, 0.55]} color="#f4b168" />
      <Block
        position={[0.12, 0.92, 0]}
        size={[0.69, 0.57, 0.57]}
        color="#f4b168"
      />
      {[-0.12, 0.34].map((x) => (
        <mesh key={x} position={[x, 1.32, 0]} rotation={[0, Math.PI / 4, 0]}>
          <coneGeometry args={[0.18, 0.28, 4]} />
          <meshStandardMaterial color="#e99064" />
        </mesh>
      ))}
      {[-0.08, 0.32].map((x) => (
        <Block
          key={x}
          position={[x, 0.96, 0.29]}
          size={[0.065, 0.1, 0.02]}
          color="#253951"
        />
      ))}
      <Block
        position={[0.12, 0.85, 0.3]}
        size={[0.08, 0.06, 0.03]}
        color="#a55862"
      />
      <Block
        position={[-0.57, 0.52, 0]}
        size={[0.38, 0.12, 0.14]}
        color="#f4b168"
        rotation={[0, 0, 0.75]}
      />
      {[-0.24, 0.23].map((x) => (
        <Block
          key={x}
          position={[x, 0.07, 0.18]}
          size={[0.19, 0.19, 0.28]}
          color="#ffe1ad"
        />
      ))}
    </group>
  );
}
export function Cloud({
  scale = 1,
  face = false,
}: {
  scale?: number;
  face?: boolean;
}) {
  return (
    <group scale={scale}>
      {[
        [-0.45, 0, 0, 0.42],
        [0, 0.15, 0, 0.55],
        [0.47, 0, 0, 0.37],
      ].map(([x, y, z, r], i) => (
        <mesh position={[x, y, z]} key={i}>
          <icosahedronGeometry args={[r, 2]} />
          <meshStandardMaterial color="#fffaf0" flatShading />
        </mesh>
      ))}
      {face && (
        <>
          <Block
            position={[-0.13, 0.1, 0.49]}
            size={[0.055, 0.09, 0.04]}
            color="#304963"
          />
          <Block
            position={[0.17, 0.1, 0.49]}
            size={[0.055, 0.09, 0.04]}
            color="#304963"
          />
        </>
      )}
    </group>
  );
}
export function Tree({
  position = [0, 0, 0],
  scale = 1,
  color = "#76ab79",
  flat = false,
}: {
  position?: [number, number, number];
  scale?: number;
  color?: string;
  flat?: boolean;
}) {
  return (
    <group position={position} scale={scale}>
      <Block position={[0, 0.35, 0]} size={[0.14, 0.7, 0.14]} color="#b58c69" />
      <mesh
        position={[0, 0.95, 0]}
        scale={flat ? [1.3, 0.45, 1] : [0.7, 1, 0.7]}
      >
        <icosahedronGeometry args={[0.65, 1]} />
        <meshStandardMaterial color={color} flatShading />
      </mesh>
    </group>
  );
}
export type Building = {
  x: number;
  y?: number;
  z: number;
  w: number;
  d: number;
  h: number;
  color: string;
};
export function TinyBuildings({
  buildings,
  lights = false,
  onInspect,
}: {
  buildings: Building[];
  lights?: boolean;
  onInspect?: (index: number) => void;
}) {
  const walls = useRef<THREE.InstancedMesh>(null),
    windows = useRef<THREE.InstancedMesh>(null);
  const windowCount = buildings.reduce(
    (n, b) => n + Math.min(4, Math.ceil(b.h / 0.5)) * 2,
    0,
  );
  useLayoutEffect(() => {
    if (!walls.current || !windows.current) return;
    const dummy = new THREE.Object3D();
    let wi = 0;
    buildings.forEach((b, i) => {
      dummy.position.set(b.x, b.h / 2 + (b.y ?? 0.12), b.z);
      dummy.scale.set(b.w, b.h, b.d);
      dummy.updateMatrix();
      walls.current!.setMatrixAt(i, dummy.matrix);
      walls.current!.setColorAt(i, new THREE.Color(b.color));
      for (let j = 0; j < Math.min(4, Math.ceil(b.h / 0.5)); j++)
        for (const sign of [-1, 1]) {
          dummy.position.set(
            b.x + sign * b.w * 0.23,
            (b.y ?? 0.12) + 0.2 + j * 0.42,
            b.z + b.d / 2 + 0.007,
          );
          dummy.scale.set(b.w * 0.19, 0.13, 0.012);
          dummy.updateMatrix();
          windows.current!.setMatrixAt(wi++, dummy.matrix);
        }
    });
    walls.current.instanceMatrix.needsUpdate = true;
    if (walls.current.instanceColor)
      walls.current.instanceColor.needsUpdate = true;
    windows.current.instanceMatrix.needsUpdate = true;
  }, [buildings]);
  return (
    <group>
      <instancedMesh
        ref={walls}
        onClick={
          onInspect
            ? (e) => {
                if (e.delta < 6) {
                  e.stopPropagation();
                  onInspect(e.instanceId ?? 0);
                }
              }
            : undefined
        }
        args={[undefined, undefined, buildings.length]}
      >
        <boxGeometry />
        <meshStandardMaterial roughness={0.9} flatShading />
      </instancedMesh>
      <instancedMesh ref={windows} args={[undefined, undefined, windowCount]}>
        <boxGeometry />
        <meshStandardMaterial
          color={lights ? "#ffe791" : "#fff0cb"}
          emissive={lights ? "#f8d067" : "#000"}
          emissiveIntensity={0.18}
        />
      </instancedMesh>
    </group>
  );
}
export function Landmark({ kind }: { kind: string }) {
  if (kind === "ist")
    return (
      <group>
        <mesh position={[0, 0.8, 0]}>
          <cylinderGeometry args={[0.32, 0.37, 1.6, 9]} />
          <meshStandardMaterial color="#e5c496" flatShading />
        </mesh>
        <mesh position={[0, 1.73, 0]}>
          <coneGeometry args={[0.45, 0.65, 9]} />
          <meshStandardMaterial color="#bd6b59" flatShading />
        </mesh>
        <mesh position={[0, 1.27, 0]}>
          <cylinderGeometry args={[0.4, 0.4, 0.14, 9]} />
          <meshStandardMaterial color="#fff1ce" />
        </mesh>
        <Block
          position={[0, 1.0, 0.33]}
          size={[0.13, 0.25, 0.02]}
          color="#6e98a1"
        />
      </group>
    );
  if (kind === "tok" || kind === "sha" || kind === "hkg")
    return (
      <group>
        {[0, 1, 2].map((i) => (
          <group key={i} position={[0, i * 0.5, 0]}>
            <Block
              position={[0, 0.22, 0]}
              size={[0.85 - i * 0.16, 0.45, 0.75 - i * 0.16]}
              color="#eed19e"
            />
            <mesh position={[0, 0.54, 0]} rotation={[0, Math.PI / 4, 0]}>
              <coneGeometry args={[0.86 - i * 0.16, 0.32, 4]} />
              <meshStandardMaterial color="#d76855" flatShading />
            </mesh>
          </group>
        ))}
        <Block
          position={[0, 1.75, 0]}
          size={[0.06, 0.5, 0.06]}
          color="#ad715c"
        />
      </group>
    );
  if (kind === "lon")
    return (
      <group>
        <Block
          position={[0, 0.96, 0]}
          size={[0.55, 1.92, 0.55]}
          color="#d8b98c"
        />
        <Block
          position={[0, 1.65, 0.29]}
          size={[0.35, 0.35, 0.015]}
          color="#fffcdd"
        />
        <Block
          position={[0, 1.69, 0.31]}
          size={[0.025, 0.15, 0.02]}
          color="#35536c"
        />
        <Block
          position={[0.055, 1.64, 0.31]}
          size={[0.12, 0.025, 0.02]}
          color="#35536c"
        />
        <mesh position={[0, 2.14, 0]}>
          <coneGeometry args={[0.44, 0.54, 4]} />
          <meshStandardMaterial color="#728e81" />
        </mesh>
      </group>
    );
  if (kind === "par")
    return (
      <group>
        {[-1, 1].flatMap((x) =>
          [-1, 1].map((z) => (
            <Block
              key={x + "," + z}
              position={[x * 0.25, 0.8, z * 0.25]}
              size={[0.1, 1.7, 0.1]}
              color="#9d7d65"
              rotation={[z * 0.15, 0, -x * 0.15]}
            />
          )),
        )}
        <Block
          position={[0, 0.7, 0]}
          size={[0.95, 0.12, 0.95]}
          color="#aa8467"
        />
        <Block position={[0, 1.4, 0]} size={[0.5, 0.13, 0.5]} color="#aa8467" />
        <mesh position={[0, 1.98, 0]}>
          <coneGeometry args={[0.25, 1.1, 4]} />
          <meshStandardMaterial color="#aa8467" />
        </mesh>
      </group>
    );
  if (kind === "nai")
    return (
      <group>
        <Tree position={[-0.35, 0, 0]} scale={1.6} flat />
        <Tree position={[0.75, 0, 0.3]} scale={0.8} flat />
      </group>
    );
  if (kind === "syd")
    return (
      <group>
        {[-0.4, 0, 0.4].map((x, i) => (
          <mesh
            key={i}
            position={[x, 0.48, 0]}
            rotation={[0.18, 0, -0.3]}
            scale={[0.48, 1.25, 0.7]}
          >
            <coneGeometry args={[0.6, 1, 4]} />
            <meshStandardMaterial color="#fffbdd" flatShading />
          </mesh>
        ))}
      </group>
    );
  return (
    <group>
      {[0, 1, 2, 3].map((i) => (
        <Block
          key={i}
          position={[0, 0.35 + i * 0.46, 0]}
          size={[0.8 - i * 0.16, 0.7, 0.8 - i * 0.16]}
          color={i % 2 ? "#8ebdc7" : "#c0dbd9"}
        />
      ))}
      <Block position={[0, 2.4, 0]} size={[0.06, 0.7, 0.06]} color="#688999" />
    </group>
  );
}
