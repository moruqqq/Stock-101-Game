import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  groundY,
  inPark,
  isWater,
  streetCoords,
  waterCenter,
  type CityProfile,
} from "./cityProfiles";
import { themeScenes } from "./Theme";

export function cityBuildings(p: CityProfile) {
  let seed = p.id.split("").reduce((s, c) => s + c.charCodeAt(0), 27);
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  const result: {
    x: number;
    y: number;
    z: number;
    w: number;
    d: number;
    h: number;
    color: string;
  }[] = [];
  for (let x = -18; x <= 18; x += 1.55)
    for (let z = -15; z <= 15; z += 1.55) {
      if (
        rand() > p.density ||
        isWater(p, x, z) ||
        isWater(p, x + 0.65, z + 0.65) ||
        inPark(p, x, z) ||
        streetCoords().some(
          (s) => Math.abs(x - s) < 0.72 || Math.abs(z - s) < 0.72,
        ) ||
        p.landmarks.some((l) => Math.hypot(x - l.x, z - l.z) < 2.1)
      )
        continue;
      const height = (0.55 + rand() * p.height) * (Math.abs(x) < 10 ? 1 : 0.72);
      result.push({
        x,
        y: groundY(x, z) + 0.12,
        z,
        w: 0.65 + rand() * 0.45,
        d: 0.7 + rand() * 0.4,
        h: height,
        color: p.palette[Math.floor(rand() * p.palette.length)],
      });
    }
  return result;
}
export function Terrain({
  profile: p,
  reserved = [],
}: {
  profile: CityProfile;
  reserved?: { x: number; z: number; radius: number }[];
}) {
  const scene = themeScenes.light;
  const geometry = useMemo(() => {
    const g = new THREE.PlaneGeometry(210, 210, 116, 116);
    g.rotateX(-Math.PI / 2);
    const attr = g.attributes.position,
      colors = [];
    const land = new THREE.Color(p.id === "dub" ? "#c4b18a" : scene.land),
      water = new THREE.Color(scene.water),
      park = new THREE.Color(scene.park);
    for (let i = 0; i < attr.count; i++) {
      const x = attr.getX(i),
        z = attr.getZ(i),
        wet = isWater(p, x, z);
      let y = groundY(x, z);
      if (!wet) y += 0.12 + Math.max(0, Math.abs(x) - 22) * 0.02;
      if (!wet && ["hkg", "ist", "nai", "sao", "tok"].includes(p.id) && z < -24)
        y += Math.sin(x * 0.08) ** 2 * Math.max(0, -z - 24) * 0.18;
      attr.setY(i, y);
      const c = (wet ? water : inPark(p, x, z) ? park : land).clone();
      if (!wet) c.multiplyScalar(0.96 + 0.06 * Math.sin(x * 0.37 + z * 0.2));
      colors.push(c.r, c.g, c.b);
    }
    g.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    g.computeVertexNormals();
    return g;
  }, [p, scene]);
  const roads = useMemo(() => {
    const v: number[] = [];
    for (const s of streetCoords())
      for (let t = -24; t < 24; t += 0.8)
        for (const horizontal of [true, false]) {
          const x = horizontal ? t : s,
            z = horizontal ? s : t;
          if (isWater(p, x, z)) continue;
          const dx = horizontal ? 0.85 : 0.62,
            dz = horizontal ? 0.62 : 0.85;
          const quad = [
            [x - dx / 2, z - dz / 2],
            [x + dx / 2, z - dz / 2],
            [x + dx / 2, z + dz / 2],
            [x - dx / 2, z + dz / 2],
          ];
          for (const i of [0, 1, 2, 0, 2, 3]) {
            const [a, b] = quad[i];
            v.push(a, groundY(a, b) + 0.16, b);
          }
        }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(v, 3));
    g.computeVertexNormals();
    return g;
  }, [p]);
  return (
    <>
      <color attach="background" args={[scene.sky]} />
      <fog attach="fog" args={[scene.fog, 45, 105]} />
      <mesh geometry={geometry}>
        <meshStandardMaterial vertexColors roughness={1} flatShading />
      </mesh>
      <mesh position={[0, -180, 0]}>
        <sphereGeometry args={[179.8, 64, 40]} />
        <meshStandardMaterial color={scene.land} roughness={1} />
      </mesh>
      <mesh geometry={roads}>
        <meshStandardMaterial
          color={scene.road}
          side={THREE.DoubleSide}
          roughness={1}
        />
      </mesh>
      <CityTrees profile={p} reserved={reserved} />
    </>
  );
}
function CityTrees({
  profile: p,
  reserved,
}: {
  profile: CityProfile;
  reserved: { x: number; z: number; radius: number }[];
}) {
  const tops = useRef<THREE.InstancedMesh>(null),
    trunks = useRef<THREE.InstancedMesh>(null);
  const points = useMemo(() => {
    const a: [number, number][] = [];
    for (let i = 0; i < 180; i++) {
      const x = Math.sin(i * 137.51) * 26,
        z = Math.cos(i * 74.39) * 24;
      if (
        !isWater(p, x, z) &&
        !reserved.some(
          (site) => Math.hypot(x - site.x, z - site.z) < site.radius + 0.4,
        ) &&
        (inPark(p, x, z) || Math.abs(x) > 20)
      )
        a.push([x, z]);
    }
    return a.slice(0, 95);
  }, [p, reserved]);
  useLayoutEffect(() => {
    const d = new THREE.Object3D();
    points.forEach(([x, z], i) => {
      const scale = 0.6 + (i % 5) * 0.15,
        y = groundY(x, z) + 0.13;
      d.position.set(x, y + 0.45 * scale, z);
      d.scale.set(0.1 * scale, 0.9 * scale, 0.1 * scale);
      d.updateMatrix();
      trunks.current!.setMatrixAt(i, d.matrix);
      d.position.y = y + 1.05 * scale;
      d.scale.set(
        0.6 * scale,
        p.id === "nai" ? 0.3 * scale : 0.7 * scale,
        0.6 * scale,
      );
      d.updateMatrix();
      tops.current!.setMatrixAt(i, d.matrix);
      tops.current!.setColorAt(
        i,
        new THREE.Color(["#719373", "#8aa37a", "#789a87"][i % 3]),
      );
    });
    if (tops.current) {
      tops.current.instanceMatrix.needsUpdate = true;
      tops.current.instanceColor!.needsUpdate = true;
      trunks.current!.instanceMatrix.needsUpdate = true;
    }
  }, [points, p]);
  return (
    <>
      <instancedMesh ref={trunks} args={[undefined, undefined, points.length]}>
        <boxGeometry />
        <meshStandardMaterial color="#99846b" />
      </instancedMesh>
      <instancedMesh ref={tops} args={[undefined, undefined, points.length]}>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial flatShading />
      </instancedMesh>
    </>
  );
}
export function CityLife({
  profile: p,
  night,
}: {
  profile: CityProfile;
  night: boolean;
}) {
  const cars = useRef<THREE.InstancedMesh>(null),
    roofs = useRef<THREE.InstancedMesh>(null),
    boats = useRef<THREE.InstancedMesh>(null),
    cabins = useRef<THREE.InstancedMesh>(null);
  const routes = useMemo(() => {
    const r: { x: number; z: number; length: number; horizontal: boolean }[] =
      [];
    for (const s of [-14, -7, 0, 7, 14])
      for (const horizontal of [true, false]) {
        let start: number | null = null;
        for (let t = -19; t <= 19; t++) {
          const dry = !isWater(p, horizontal ? t : s, horizontal ? s : t);
          if (dry && start === null) start = t;
          if ((!dry || t === 19) && start !== null) {
            if (t - start > 4)
              r.push({
                x: horizontal ? start : s,
                z: horizontal ? s : start,
                length: t - start,
                horizontal,
              });
            start = null;
          }
        }
      }
    return r;
  }, [p]);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  useLayoutEffect(() => {
    for (let i = 0; i < 32; i++) {
      cars.current!.setColorAt(
        i,
        new THREE.Color(
          i % 5 === 0
            ? p.trafficColor
            : ["#e0cc9c", "#779ea5", "#c98571", "#a2aba4"][i % 4],
        ),
      );
    }
    cars.current!.instanceColor!.needsUpdate = true;
  }, [p]);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    for (let i = 0; i < 32; i++) {
      const r = routes[i % routes.length];
      if (!r) continue;
      const q = (t * (i % 5 === 0 ? 0.6 : 1.1) + i * 3.75) % r.length,
        x = r.x + (r.horizontal ? q : 0.16),
        z = r.z + (r.horizontal ? 0.16 : q),
        bus = i % 5 === 0;
      dummy.position.set(x, groundY(x, z) + 0.36, z);
      dummy.rotation.set(0, r.horizontal ? Math.PI / 2 : 0, 0);
      dummy.scale.set(
        0.27,
        bus && p.id === "lon" ? 0.53 : 0.22,
        bus ? 0.9 : 0.48,
      );
      dummy.updateMatrix();
      cars.current!.setMatrixAt(i, dummy.matrix);
      dummy.position.y += bus && p.id === "lon" ? 0.33 : 0.17;
      dummy.scale.set(0.23, 0.15, bus ? 0.62 : 0.29);
      dummy.updateMatrix();
      roofs.current!.setMatrixAt(i, dummy.matrix);
    }
    for (let i = 0; i < 4; i++) {
      const q = ((t * 0.55 + i * 8) % 30) - 15;
      let x = 0,
        z = 0;
      if (p.terrain === "strait" || p.terrain === "inland") {
        x = waterCenter(p, q);
        z = q;
      } else if (p.terrain === "coast") {
        x = q;
        z = waterCenter(p, q) + 3.5;
      } else if (p.terrain === "island") {
        x = -8.4;
        z = q - 3;
      } else {
        x = q;
        z = waterCenter(p, q);
      }
      dummy.position.set(x, groundY(x, z) + 0.16, z);
      dummy.rotation.set(
        0,
        p.terrain === "river" || p.terrain === "coast" ? Math.PI / 2 : 0,
        0,
      );
      dummy.scale.set(0.42, 0.19, 1.2);
      dummy.updateMatrix();
      boats.current!.setMatrixAt(i, dummy.matrix);
      dummy.position.y += 0.2;
      dummy.scale.set(0.32, 0.21, 0.7);
      dummy.updateMatrix();
      cabins.current!.setMatrixAt(i, dummy.matrix);
    }
    for (const mesh of [cars, roofs, boats, cabins])
      if (mesh.current) mesh.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <>
      <instancedMesh
        ref={cars}
        args={[undefined, undefined, 32]}
        frustumCulled={false}
      >
        <boxGeometry />
        <meshStandardMaterial roughness={0.8} />
      </instancedMesh>
      <instancedMesh
        ref={roofs}
        args={[undefined, undefined, 32]}
        frustumCulled={false}
      >
        <boxGeometry />
        <meshStandardMaterial
          color="#e1e5d8"
          emissive="#edc885"
          emissiveIntensity={night ? 0.4 : 0}
        />
      </instancedMesh>
      <instancedMesh
        ref={boats}
        args={[undefined, undefined, 4]}
        frustumCulled={false}
      >
        <boxGeometry />
        <meshStandardMaterial color="#e5dfc9" />
      </instancedMesh>
      <instancedMesh
        ref={cabins}
        args={[undefined, undefined, 4]}
        frustumCulled={false}
      >
        <boxGeometry />
        <meshStandardMaterial
          color={p.id === "ist" ? "#eee9d7" : "#8aabb4"}
          emissive="#eac582"
          emissiveIntensity={night ? 0.3 : 0}
        />
      </instancedMesh>
    </>
  );
}
