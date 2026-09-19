import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { citizenPose, type Citizen } from "./cityCrowd";
import { groundY } from "./cityProfiles";

const COUNT = 18,
  PARTS = 12;
export default function CityCats({
  people,
  buildings,
}: {
  people: Citizen[];
  buildings: { x: number; y: number; z: number; h: number }[];
}) {
  const boxes = useRef<THREE.InstancedMesh>(null),
    ears = useRef<THREE.InstancedMesh>(null);
  const scratch = useMemo(
    () => ({
      object: new THREE.Object3D(),
      pose: { x: 0, z: 0, heading: 0, stride: 0, moving: false },
    }),
    [],
  );
  const elapsed = useRef(0),
    last = useRef(-1);
  useLayoutEffect(() => {
    const colors = [
      "#d5a26c",
      "#e6d8bf",
      "#575f61",
      "#b38866",
      "#ded1b7",
      "#b47754",
    ];
    for (let i = 0; i < COUNT; i++) {
      for (let j = 0; j < PARTS; j++)
        boxes.current!.setColorAt(
          i * PARTS + j,
          new THREE.Color(
            j === 9 || j === 10
              ? "#27383a"
              : j === 11
                ? "#b77473"
                : colors[i % colors.length],
          ),
        );
      for (let j = 0; j < 2; j++)
        ears.current!.setColorAt(
          i * 2 + j,
          new THREE.Color(colors[i % colors.length]),
        );
    }
    for (const mesh of [boxes.current!, ears.current!]) {
      mesh.instanceColor!.needsUpdate = true;
      mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    }
  }, []);
  useFrame((_, delta) => {
    elapsed.current += Math.min(delta, 0.1);
    const t = elapsed.current;
    if (t - last.current < 1 / 24) return;
    last.current = t;
    const { object, pose } = scratch;
    for (let i = 0; i < COUNT; i++) {
      const rooftop = i % 3 === 0 && buildings.length > 0,
        building = buildings[(i * 13) % buildings.length];
      const person = people[(i * 7) % people.length];
      if (!person) continue;
      citizenPose(person, t * 0.8, pose);
      const x = rooftop ? building.x : pose.x,
        z = rooftop ? building.z : pose.z;
      const y = rooftop ? building.y + building.h + 0.37 : groundY(x, z) + 0.14;
      const heading = rooftop ? i + Math.sin(t * 0.6) * 0.15 : pose.heading;
      const c = Math.cos(heading),
        s = Math.sin(heading),
        stride = rooftop ? 0 : pose.stride;
      const part = (
        j: number,
        px: number,
        py: number,
        pz: number,
        w: number,
        h: number,
        d: number,
      ) => {
        object.position.set(x + px * c + pz * s, y + py, z + pz * c - px * s);
        object.rotation.set(0, heading, 0);
        object.scale.set(w, h, d);
        object.updateMatrix();
        boxes.current!.setMatrixAt(i * PARTS + j, object.matrix);
      };
      part(0, 0, 0.25, 0, 0.27, 0.25, 0.45);
      part(1, 0, 0.46, 0.19, 0.3, 0.27, 0.28);
      part(2, 0, 0.32, -0.33, 0.06, 0.07, 0.34);
      part(3, Math.sin(t * 1.8 + i) * 0.045, 0.43, -0.48, 0.06, 0.26, 0.06);
      for (let j = 0; j < 4; j++)
        part(
          4 + j,
          j % 2 ? -0.09 : 0.09,
          0.1 +
            Math.max(0, Math.sin(t * 5 + i + j * Math.PI)) *
              Math.abs(stride) *
              0.05,
          j < 2 ? -0.14 : 0.14,
          0.075,
          0.18,
          0.08,
        );
      part(8, 0, 0.41, 0.34, 0.17, 0.07, 0.04);
      part(9, -0.075, 0.5, 0.337, 0.033, 0.045, 0.023);
      part(10, 0.075, 0.5, 0.337, 0.033, 0.045, 0.023);
      part(11, 0, 0.43, 0.364, 0.035, 0.028, 0.026);
      for (let j = 0; j < 2; j++) {
        const ex = j ? -0.105 : 0.105,
          ez = 0.18;
        object.position.set(x + ex * c + ez * s, y + 0.65, z + ez * c - ex * s);
        object.rotation.set(0, heading + Math.PI / 4, 0);
        object.scale.set(0.09, 0.17, 0.09);
        object.updateMatrix();
        ears.current!.setMatrixAt(i * 2 + j, object.matrix);
      }
    }
    boxes.current!.instanceMatrix.needsUpdate = true;
    ears.current!.instanceMatrix.needsUpdate = true;
  });
  return (
    <group name="Cats occupying the city">
      <instancedMesh
        ref={boxes}
        args={[undefined, undefined, COUNT * PARTS]}
        frustumCulled={false}
        raycast={() => {}}
      >
        <boxGeometry />
        <meshStandardMaterial roughness={1} />
      </instancedMesh>
      <instancedMesh
        ref={ears}
        args={[undefined, undefined, COUNT * 2]}
        frustumCulled={false}
        raycast={() => {}}
      >
        <coneGeometry args={[1, 1, 4]} />
        <meshStandardMaterial roughness={1} />
      </instancedMesh>
    </group>
  );
}
