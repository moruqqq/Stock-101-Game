import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { hubs } from "./data";
import { Cloud } from "./ToyModels";
function point(lat: number, lng: number, r = 1.7) {
  const a = (lat * Math.PI) / 180,
    b = (lng * Math.PI) / 180;
  return new THREE.Vector3(
    Math.cos(a) * Math.cos(b) * r,
    Math.sin(a) * r,
    -Math.cos(a) * Math.sin(b) * r,
  );
}
export default function WorldDecor() {
  const trees = useRef<THREE.InstancedMesh>(null),
    mountains = useRef<THREE.InstancedMesh>(null),
    buildings = useRef<THREE.InstancedMesh>(null),
    clouds = useRef<THREE.Group>(null);
  const treeSpots = useMemo(
    () =>
      [
        [5, 20],
        [-5, 24],
        [7, 30],
        [46, 20],
        [54, 27],
        [-9, -62],
        [-15, -55],
        [45, -99],
        [30, 105],
        [40, 105],
        [-20, 135],
      ].flatMap(([a, b]) =>
        Array.from({ length: 3 }, (_, i) => [a + i * 2, b + i * 2.5]),
      ),
    [],
  );
  const peaks = [
    [44, 8],
    [30, 82],
    [36, 95],
    [-20, -70],
    [5, 38],
    [-30, 25],
    [56, -110],
  ];
  useLayoutEffect(() => {
    const d = new THREE.Object3D(),
      up = new THREE.Vector3(0, 1, 0);
    treeSpots.forEach(([lat, lng], i) => {
      const p = point(lat, lng, 1.74);
      d.position.copy(p);
      d.quaternion.setFromUnitVectors(up, p.clone().normalize());
      d.scale.set(0.025, 0.045 + (i % 3) * 0.01, 0.025);
      d.updateMatrix();
      trees.current!.setMatrixAt(i, d.matrix);
      trees.current!.setColorAt(
        i,
        new THREE.Color(i % 2 ? "#6b9d83" : "#81ae7e"),
      );
    });
    peaks.forEach(([lat, lng], i) => {
      const p = point(lat, lng, 1.74);
      d.position.copy(p);
      d.quaternion.setFromUnitVectors(up, p.clone().normalize());
      d.scale.set(0.067, 0.1 + (i % 3) * 0.02, 0.055);
      d.updateMatrix();
      mountains.current!.setMatrixAt(i, d.matrix);
      mountains.current!.setColorAt(
        i,
        new THREE.Color(i % 2 ? "#c9b68c" : "#e4d7b8"),
      );
    });
    hubs.forEach((h, i) => {
      for (let j = 0; j < 3; j++) {
        const p = point(
          h.lat + (j - 1) * 1.4,
          h.lng + (j - 1) * 1.4,
          1.72 + j * 0.012,
        );
        d.position.copy(p);
        d.quaternion.setFromUnitVectors(up, p.clone().normalize());
        d.scale.set(0.026, 0.045 + j * 0.025, 0.026);
        d.updateMatrix();
        buildings.current!.setMatrixAt(i * 3 + j, d.matrix);
        buildings.current!.setColorAt(
          i * 3 + j,
          new THREE.Color(["#faf0cf", "#dc9d87", "#a1b6d2"][j]),
        );
      }
    });
    [trees.current, mountains.current, buildings.current].forEach((m) => {
      if (m) {
        m.instanceMatrix.needsUpdate = true;
        if (m.instanceColor) m.instanceColor.needsUpdate = true;
      }
    });
  }, []);
  useFrame(({ clock }) => {
    if (clouds.current)
      clouds.current.rotation.y = Math.sin(clock.elapsedTime * 0.04) * 0.025;
  });
  return (
    <group>
      <instancedMesh
        ref={trees}
        args={[undefined, undefined, treeSpots.length]}
      >
        <coneGeometry args={[1, 2, 5]} />
        <meshStandardMaterial flatShading roughness={1} />
      </instancedMesh>
      <instancedMesh
        ref={mountains}
        args={[undefined, undefined, peaks.length]}
      >
        <coneGeometry args={[1, 1.5, 5]} />
        <meshStandardMaterial flatShading roughness={1} />
      </instancedMesh>
      <instancedMesh
        ref={buildings}
        args={[undefined, undefined, hubs.length * 3]}
      >
        <boxGeometry />
        <meshStandardMaterial flatShading roughness={1} />
      </instancedMesh>
      <group ref={clouds}>
        {[
          [40, -30],
          [-5, -10],
          [-20, 52],
          [10, 68],
          [60, 68],
          [-20, -110],
        ].map(([lat, lng], i) => {
          const p = point(lat, lng, 1.81);
          return (
            <group
              key={i}
              position={p}
              quaternion={new THREE.Quaternion().setFromUnitVectors(
                new THREE.Vector3(0, 1, 0),
                p.clone().normalize(),
              )}
              rotation={undefined}
            >
              <Cloud scale={0.1 + (i % 2) * 0.03} />
            </group>
          );
        })}
      </group>
    </group>
  );
}
