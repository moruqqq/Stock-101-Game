import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { citizenPose, type CitizenPose, type makeCityCrowd } from "./cityCrowd";
import { groundY, type CityProfile } from "./cityProfiles";

const PARTS = 11;
const clothing = [
  "#cf6947",
  "#457d99",
  "#d7b552",
  "#578772",
  "#8b698c",
  "#e0d6b3",
  "#344d68",
  "#bb805f",
];
const skin = ["#d49a70", "#8f6048", "#f1c6a0", "#b47e58", "#6c483c", "#dfaf88"];

export default function CityPeople({
  profile,
  crowd,
  night,
}: {
  profile: CityProfile;
  crowd: ReturnType<typeof makeCityCrowd>;
  night: boolean;
}) {
  const bodies = useRef<THREE.InstancedMesh>(null),
    heads = useRef<THREE.InstancedMesh>(null),
    shadows = useRef<THREE.InstancedMesh>(null);
  const elapsed = useRef(0),
    last = useRef(-1);
  const scratch = useMemo(
    () => ({
      object: new THREE.Object3D(),
      pose: { x: 0, z: 0, heading: 0, stride: 0, moving: false } as CitizenPose,
    }),
    [],
  );
  useLayoutEffect(() => {
    if (!bodies.current || !heads.current || !shadows.current) return;
    for (const mesh of [bodies.current, heads.current, shadows.current])
      mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    crowd.people.forEach((person, i) => {
      const coat =
        clothing[(person.style + profile.id.charCodeAt(0)) % clothing.length];
      const complexion =
        skin[(person.style * 7 + profile.id.charCodeAt(1)) % skin.length];
      const trouser = ["#34434a", "#526b7b", "#786851"][i % 3];
      const hair = ["#443a32", "#725343", "#c3a66f", "#39302c"][i % 4];
      // Torso, hair/hat, two sleeves, two trouser legs, hands, shoes, bag.
      const colors = [
        coat,
        person.activity === "jogging" ? coat : hair,
        coat,
        coat,
        trouser,
        trouser,
        complexion,
        complexion,
        "#333c41",
        "#333c41",
        person.gathering ? "#273840" : "#856140",
      ];
      colors.forEach((color, j) =>
        bodies.current!.setColorAt(i * PARTS + j, new THREE.Color(color)),
      );
      heads.current!.setColorAt(i, new THREE.Color(complexion));
    });
    bodies.current.instanceColor!.needsUpdate = true;
    heads.current.instanceColor!.needsUpdate = true;
    last.current = -1;
  }, [crowd, profile]);
  useFrame(({ camera }, delta) => {
    elapsed.current += Math.min(delta, 0.1);
    const time = elapsed.current;
    // Animate the entire crowd in three draw calls, at a bounded update rate.
    const interval = camera.position.y > 20 ? 1 / 20 : 1 / 30;
    if (time - last.current < interval) return;
    last.current = time;
    if (!bodies.current || !heads.current || !shadows.current) return;
    const { object: obj, pose } = scratch;
    crowd.people.forEach((person, i) => {
      citizenPose(person, time, pose);
      const scale = person.scale,
        sine = Math.sin(pose.heading),
        cosine = Math.cos(pose.heading);
      const ground = groundY(pose.x, pose.z) + 0.145;
      const bounce = pose.moving
        ? Math.abs(pose.stride) * 0.035
        : Math.sin(time * 1.8 + person.phase) * 0.004;
      const part = (
        mesh: THREE.InstancedMesh,
        index: number,
        x: number,
        y: number,
        z: number,
        w: number,
        h: number,
        d: number,
        pitch = 0,
      ) => {
        obj.position.set(
          pose.x + (x * cosine + z * sine) * scale,
          ground + (y + bounce) * scale,
          pose.z + (z * cosine - x * sine) * scale,
        );
        obj.rotation.set(pitch, pose.heading, 0, "YXZ");
        obj.scale.set(w * scale, h * scale, d * scale);
        obj.updateMatrix();
        mesh.setMatrixAt(index, obj.matrix);
      };
      const base = i * PARTS,
        boxes = bodies.current!,
        stride = pose.stride;
      const talking = person.activity === "talking";
      const attention = pose.attention ?? 0;
      const filming = !!person.gathering && person.style % 3 === 0;
      const pointing = !!person.gathering && person.style % 3 === 1;
      const reaction =
        attention * (0.65 + Math.sin(time * 0.7 + person.phase) * 0.35);
      part(boxes, base, 0, 0.425, 0, 0.235, 0.265, 0.145);
      part(heads.current!, i, 0, 0.665, 0.008, 0.112, 0.12, 0.105);
      part(boxes, base + 1, 0, 0.744, -0.006, 0.187, 0.061, 0.173);
      for (let side = 0; side < 2; side++) {
        const sign = side === 0 ? -1 : 1;
        const walkingArm = talking
          ? -0.4 + Math.sin(time * 2.3 + person.phase + side * 2) * 0.32
          : -stride * sign;
        const gesture = filming
          ? -2.08 * attention
          : pointing && side === 1
            ? -1.25 * reaction
            : -0.14 * attention;
        const arm = walkingArm * (1 - attention) + gesture;
        const leg = stride * sign;
        part(
          boxes,
          base + 2 + side,
          sign * 0.153,
          0.53 - Math.cos(arm) * 0.11,
          -Math.sin(arm) * 0.11,
          0.073,
          0.22,
          0.08,
          arm,
        );
        part(
          boxes,
          base + 6 + side,
          sign * 0.153,
          0.53 - Math.cos(arm) * 0.237,
          -Math.sin(arm) * 0.237,
          0.077,
          0.069,
          0.075,
        );
        part(
          boxes,
          base + 4 + side,
          sign * 0.067,
          0.31 - Math.cos(leg) * 0.128,
          -Math.sin(leg) * 0.128,
          0.085,
          0.255,
          0.087,
          leg,
        );
        part(
          boxes,
          base + 8 + side,
          sign * 0.067,
          0.31 - Math.cos(leg) * 0.267,
          -Math.sin(leg) * 0.267 + 0.025,
          0.098,
          0.065,
          0.157,
        );
      }
      const hasBag = i % 4 === 0 && person.activity === "walking";
      part(
        boxes,
        base + 10,
        filming ? 0.153 : 0.22,
        filming ? 0.53 - Math.cos(-2.08 * attention) * 0.237 : 0.24,
        filming ? -Math.sin(-2.08 * attention) * 0.237 + 0.035 : 0.025,
        filming && attention > 0.2 ? 0.105 : hasBag ? 0.105 : 0,
        0.16,
        filming ? 0.028 : 0.115,
      );
      obj.position.set(pose.x, groundY(pose.x, pose.z) + 0.137, pose.z);
      obj.rotation.set(-Math.PI / 2, 0, 0);
      obj.scale.set(0.22 * scale, 0.16 * scale, 1);
      obj.updateMatrix();
      shadows.current!.setMatrixAt(i, obj.matrix);
    });
    bodies.current.instanceMatrix.needsUpdate = true;
    heads.current.instanceMatrix.needsUpdate = true;
    shadows.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <group
      name="City residents"
      userData={{
        population: crowd.people.length,
        spectators: crowd.people.filter((person) => person.gathering).length,
      }}
    >
      <instancedMesh
        ref={bodies}
        args={[undefined, undefined, crowd.people.length * PARTS]}
        frustumCulled={false}
        raycast={() => {}}
      >
        <boxGeometry />
        <meshStandardMaterial
          roughness={1}
          emissive="#d2bdaa"
          emissiveIntensity={night ? 0.12 : 0.015}
        />
      </instancedMesh>
      <instancedMesh
        ref={heads}
        args={[undefined, undefined, crowd.people.length]}
        frustumCulled={false}
        raycast={() => {}}
      >
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial
          roughness={1}
          flatShading
          emissive="#e7b188"
          emissiveIntensity={night ? 0.12 : 0}
        />
      </instancedMesh>
      <instancedMesh
        ref={shadows}
        args={[undefined, undefined, crowd.people.length]}
        frustumCulled={false}
        raycast={() => {}}
      >
        <circleGeometry args={[1, 12]} />
        <meshBasicMaterial
          color="#263d39"
          transparent
          opacity={0.2}
          depthWrite={false}
        />
      </instancedMesh>
    </group>
  );
}
