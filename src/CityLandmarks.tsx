import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Block, Landmark } from "./ToyModels";
import type { LandmarkKind } from "./cityProfiles";
const stone = "#d9c5a4",
  metal = "#638793",
  glass = "#8fb5c1";
function Spire({
  height = 5,
  color = glass,
}: {
  height?: number;
  color?: string;
}) {
  return (
    <group>
      {[0, 1, 2, 3, 4].map((i) => (
        <Block
          key={i}
          position={[0, (height * (i + 0.5)) / 5, 0]}
          size={[1.35 - i * 0.22, height / 5, 1.2 - i * 0.2]}
          color={color}
        />
      ))}
      <Block
        position={[0, height + 0.45, 0]}
        size={[0.05, 0.9, 0.05]}
        color={metal}
      />
    </group>
  );
}
function Wheel() {
  const wheel = useRef<THREE.Group>(null);
  useFrame((_, d) => {
    if (wheel.current) wheel.current.rotation.z += d * 0.035;
  });
  return (
    <group>
      <Block
        position={[-0.6, 1.4, 0]}
        size={[0.12, 3, 0.12]}
        rotation={[0, 0, -0.4]}
        color={stone}
      />
      <Block
        position={[0.6, 1.4, 0]}
        size={[0.12, 3, 0.12]}
        rotation={[0, 0, 0.4]}
        color={stone}
      />
      <group position={[0, 2.9, 0]} ref={wheel}>
        <mesh>
          <torusGeometry args={[1.85, 0.045, 5, 36]} />
          <meshStandardMaterial color="#e6ded0" />
        </mesh>
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i * Math.PI) / 6;
          return (
            <group key={i}>
              <Block
                position={[Math.cos(a) * 0.9, Math.sin(a) * 0.9, 0]}
                size={[1.8, 0.025, 0.025]}
                rotation={[0, 0, a]}
                color="#c6ceca"
              />
              <Block
                position={[Math.cos(a) * 1.86, Math.sin(a) * 1.86, 0]}
                size={[0.28, 0.19, 0.25]}
                color={glass}
              />
            </group>
          );
        })}
      </group>
    </group>
  );
}
export default function CityLandmarkModel({
  kind,
  city,
}: {
  kind: LandmarkKind;
  city: string;
}) {
  if (kind === "galata") return <Landmark kind="ist" />;
  if (kind === "bigben")
    return (
      <group>
        <group scale={1.5}>
          <Landmark kind="lon" />
        </group>
        <Block
          position={[-1.4, 0.65, 0]}
          size={[2.5, 1.3, 0.95]}
          color={stone}
        />
        {[-2.4, -1.6, -0.8].map((x) => (
          <Block
            key={x}
            position={[x, 1.45, 0]}
            size={[0.2, 0.5, 0.2]}
            color={stone}
          />
        ))}
      </group>
    );
  if (kind === "eiffel") return <Landmark kind="par" />;
  if (kind === "opera")
    return (
      <group>
        <Block position={[0, 0.2, 0]} size={[3, 0.4, 1.8]} color={stone} />
        <group scale={1.5} position={[0, 0.4, 0]}>
          <Landmark kind="syd" />
        </group>
      </group>
    );
  if (kind === "temple") return <Landmark kind="tok" />;
  if (kind === "wheel") return <Wheel />;
  if (kind === "mosque")
    return (
      <group>
        <Block position={[0, 0.5, 0]} size={[2.2, 1, 1.8]} color="#e0cdb2" />
        <mesh position={[0, 1, 0]}>
          <sphereGeometry args={[1, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#8ca1a4" />
        </mesh>
        {[-1, 1].flatMap((x) =>
          [-1, 1].map((z) => (
            <group key={x + "," + z} position={[x * 1.3, 0, z * 1.1]}>
              <mesh position={[0, 1.4, 0]}>
                <cylinderGeometry args={[0.09, 0.13, 2.8, 8]} />
                <meshStandardMaterial color={stone} />
              </mesh>
              <mesh position={[0, 2.95, 0]}>
                <coneGeometry args={[0.13, 0.4, 8]} />
                <meshStandardMaterial color={metal} />
              </mesh>
            </group>
          )),
        )}
      </group>
    );
  if (kind === "bridge")
    return (
      <group rotation={[0, city === "ist" ? 0 : Math.PI / 2, 0]}>
        <Block position={[0, 0.65, 0]} size={[7, 0.2, 0.8]} color="#d5ccc0" />
        {[-2.4, 2.4].map((x) => (
          <group key={x} position={[x, 0, 0]}>
            {[-0.45, 0.45].map((z) => (
              <Block
                key={z}
                position={[0, 1.5, z]}
                size={[0.25, 3, 0.25]}
                color={city === "lon" ? stone : metal}
              />
            ))}
            <Block
              position={[0, 2.8, 0]}
              size={[0.35, 0.2, 1.15]}
              color={metal}
            />
          </group>
        ))}
        {[-0.47, 0.47].map((z) => (
          <mesh key={z} position={[0, 0.85, z]}>
            <tubeGeometry
              args={[
                new THREE.CatmullRomCurve3([
                  new THREE.Vector3(-3.5, 0, 0),
                  new THREE.Vector3(-2.4, 1.8, 0),
                  new THREE.Vector3(0, 0.4, 0),
                  new THREE.Vector3(2.4, 1.8, 0),
                  new THREE.Vector3(3.5, 0, 0),
                ]),
                24,
                0.035,
                4,
                false,
              ]}
            />
            <meshStandardMaterial color={metal} />
          </mesh>
        ))}
      </group>
    );
  if (kind === "arc" || kind === "gateway")
    return (
      <group>
        {[-0.85, 0.85].map((x) => (
          <Block
            key={x}
            position={[x, 1, 0]}
            size={[0.65, 2, 1]}
            color={stone}
          />
        ))}
        <Block position={[0, 2.05, 0]} size={[2.4, 0.55, 1.15]} color={stone} />
        {kind === "gateway" &&
          [-1, 1].map((x) => (
            <mesh key={x} position={[x, 2.6, 0]}>
              <coneGeometry args={[0.4, 0.65, 8]} />
              <meshStandardMaterial color={stone} />
            </mesh>
          ))}
      </group>
    );
  if (kind === "burj" || kind === "empire" || kind === "commerz")
    return (
      <Spire
        height={kind === "burj" ? 7 : kind === "empire" ? 4.7 : 4.1}
        color={kind === "empire" ? "#c4b69e" : glass}
      />
    );
  if (kind === "tokyotower")
    return (
      <group>
        {[-1, 1].flatMap((x) =>
          [-1, 1].map((z) => (
            <Block
              key={x + "," + z}
              position={[x * 0.45, 1.7, z * 0.45]}
              size={[0.16, 3.6, 0.16]}
              rotation={[z * 0.15, 0, -x * 0.15]}
              color="#bb5e4e"
            />
          )),
        )}
        {[0.9, 1.8, 2.8].map((y) => (
          <Block
            key={y}
            position={[0, y, 0]}
            size={[1.6 - y * 0.32, 0.18, 1.6 - y * 0.32]}
            color={y === 1.8 ? "#f1e4ce" : "#c56250"}
          />
        ))}
        <mesh position={[0, 3.7, 0]}>
          <coneGeometry args={[0.2, 1.9, 4]} />
          <meshStandardMaterial color="#cc6b57" />
        </mesh>
      </group>
    );
  if (kind === "pearl" || kind === "cn" || kind === "kicc")
    return (
      <group>
        <mesh position={[0, 2, 0]}>
          <cylinderGeometry
            args={[
              kind === "kicc" ? 0.55 : 0.13,
              kind === "kicc" ? 0.65 : 0.25,
              4,
              12,
            ]}
          />
          <meshStandardMaterial color={kind === "pearl" ? "#b2939d" : stone} />
        </mesh>
        {(kind === "pearl" ? [1.2, 3.4] : [3.45]).map((y) => (
          <mesh
            key={y}
            position={[0, y, 0]}
            scale={kind === "pearl" ? [1, 1, 1] : [1, 0.38, 1]}
          >
            {kind === "pearl" ? (
              <sphereGeometry args={[0.64, 12, 8]} />
            ) : (
              <cylinderGeometry args={[0.85, 0.7, 0.65, 16]} />
            )}
            <meshStandardMaterial
              color={kind === "pearl" ? "#b27783" : metal}
            />
          </mesh>
        ))}
        <Block position={[0, 4.6, 0]} size={[0.05, 1.3, 0.05]} color={metal} />
        {kind === "kicc" && (
          <mesh position={[1.3, 0.35, 0]}>
            <cylinderGeometry args={[1, 1.2, 0.7, 14]} />
            <meshStandardMaterial color={stone} />
          </mesh>
        )}
      </group>
    );
  if (kind === "liberty")
    return (
      <group>
        <Block position={[0, 0.35, 0]} size={[1.1, 0.7, 1.1]} color={stone} />
        <mesh position={[0, 1.45, 0]}>
          <coneGeometry args={[0.5, 1.6, 7]} />
          <meshStandardMaterial color="#72a193" />
        </mesh>
        <mesh position={[0, 2.4, 0]}>
          <icosahedronGeometry args={[0.23, 1]} />
          <meshStandardMaterial color="#72a193" />
        </mesh>
        <Block
          position={[0.46, 2.4, 0]}
          size={[0.14, 1.2, 0.14]}
          color="#72a193"
          rotation={[0, 0, -0.4]}
        />
        <mesh position={[0.7, 3, 0]}>
          <sphereGeometry args={[0.14, 8, 6]} />
          <meshStandardMaterial
            color="#eac577"
            emissive="#eac577"
            emissiveIntensity={0.5}
          />
        </mesh>
      </group>
    );
  if (kind === "marina")
    return (
      <group>
        {[-1.3, 0, 1.3].map((x) => (
          <Block
            key={x}
            position={[x, 1.6, 0]}
            size={[0.72, 3.2, 1.25]}
            color={glass}
          />
        ))}
        <mesh
          position={[0, 3.4, 0]}
          rotation={[0, 0, Math.PI / 2]}
          scale={[0.35, 1, 0.8]}
        >
          <capsuleGeometry args={[0.6, 3, 4, 8]} />
          <meshStandardMaterial color={stone} />
        </mesh>
      </group>
    );
  if (kind === "supertree")
    return (
      <group>
        {[-1.1, 0, 1.1].map((x, i) => (
          <group key={x} position={[x, 0, i % 2]}>
            <mesh position={[0, 1.2, 0]}>
              <cylinderGeometry args={[0.17, 0.25, 2.4, 8]} />
              <meshStandardMaterial color="#927587" />
            </mesh>
            <mesh position={[0, 2.55, 0]}>
              <coneGeometry args={[0.9, 0.65, 8]} />
              <meshStandardMaterial color="#7e9e7f" side={THREE.DoubleSide} />
            </mesh>
          </group>
        ))}
      </group>
    );
  if (kind === "sail")
    return (
      <group>
        <Block position={[0, 0.2, 0]} size={[1.7, 0.4, 1.4]} color={stone} />
        <mesh
          position={[0, 2, 0]}
          rotation={[0, Math.PI / 4, 0]}
          scale={[0.7, 1, 1]}
        >
          <coneGeometry args={[1, 3.5, 3]} />
          <meshStandardMaterial color="#e6e5d5" />
        </mesh>
        <Block
          position={[0.5, 1.8, 0]}
          size={[0.08, 3.6, 0.09]}
          color={metal}
        />
      </group>
    );
  if (kind === "bankchina")
    return (
      <group>
        <mesh position={[0, 2.1, 0]} rotation={[0, Math.PI / 4, 0]}>
          <cylinderGeometry args={[0.6, 1, 4.2, 4]} />
          <meshStandardMaterial color={glass} />
        </mesh>
        {[1, 2, 3].map((y) => (
          <Block
            key={y}
            position={[0, y, 0.7]}
            size={[1.3, 0.05, 0.05]}
            rotation={[0, 0, 0.5]}
            color="#d1dcd3"
          />
        ))}
        <Block
          position={[0.2, 4.65, 0]}
          size={[0.05, 1.2, 0.05]}
          color={metal}
        />
      </group>
    );
  if (kind === "masp")
    return (
      <group>
        {[-1.6, 1.6].map((x) => (
          <Block
            key={x}
            position={[x, 1.1, 0]}
            size={[0.22, 2.2, 1.5]}
            color="#b45849"
          />
        ))}
        <Block position={[0, 1.5, 0]} size={[3.6, 1.05, 1.5]} color="#a8b9b9" />
        <Block
          position={[0, 2.15, 0]}
          size={[3.8, 0.15, 1.6]}
          color="#b45849"
        />
      </group>
    );
  return (
    <group>
      <Block position={[0, 0.65, 0]} size={[1.5, 1.3, 2]} color={stone} />
      {[-0.6, 0.6].map((x) => (
        <group key={x}>
          <Block
            position={[x, 1.4, 0.65]}
            size={[0.45, 2.8, 0.45]}
            color={stone}
          />
          <mesh position={[x, 3, 0.65]}>
            <coneGeometry args={[0.36, 1, 4]} />
            <meshStandardMaterial color="#789085" />
          </mesh>
        </group>
      ))}
    </group>
  );
}
