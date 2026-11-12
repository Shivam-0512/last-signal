import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Warning light that pulses
function WarningLight({ position, color = '#FF4400' }) {
  const lightRef = useRef()
  const meshRef = useRef()
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    const intensity = 0.5 + Math.sin(t * 3) * 0.5
    if (lightRef.current) lightRef.current.intensity = intensity * 2
    if (meshRef.current?.material) meshRef.current.material.emissiveIntensity = intensity
  })
  return (
    <group position={position}>
      <mesh ref={meshRef} castShadow>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1} />
      </mesh>
      <pointLight ref={lightRef} color={color} intensity={2} distance={8} />
    </group>
  )
}

// Industrial crate
function Crate({ position, scale = [1,1,1], rotation = [0,0,0] }) {
  return (
    <mesh position={position} scale={scale} rotation={rotation} castShadow receiveShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#2A3A2A" roughness={0.9} metalness={0.3} />
    </mesh>
  )
}

// Damaged wall section
function WallSection({ position, scale = [1,1,1], rotation = [0,0,0] }) {
  return (
    <mesh position={position} scale={scale} rotation={rotation} castShadow receiveShadow>
      <boxGeometry args={[1,1,0.3]} />
      <meshStandardMaterial color="#2A2A2E" roughness={0.95} metalness={0.5} />
    </mesh>
  )
}

// Main research facility building
function FacilityBuilding() {
  return (
    <group position={[0, 0, -85]}>
      {/* Main structure */}
      <mesh position={[0, 7, 0]} castShadow receiveShadow>
        <boxGeometry args={[30, 14, 20]} />
        <meshStandardMaterial color="#252528" roughness={0.85} metalness={0.6} />
      </mesh>
      {/* Roof details */}
      <mesh position={[0, 14.5, 0]} castShadow>
        <boxGeometry args={[32, 1, 22]} />
        <meshStandardMaterial color="#1E1E22" roughness={0.9} metalness={0.7} />
      </mesh>
      {/* Side wing left */}
      <mesh position={[-20, 4, 0]} castShadow receiveShadow>
        <boxGeometry args={[10, 8, 16]} />
        <meshStandardMaterial color="#2A2A2E" roughness={0.9} metalness={0.6} />
      </mesh>
      {/* Side wing right */}
      <mesh position={[20, 4, 0]} castShadow receiveShadow>
        <boxGeometry args={[10, 8, 16]} />
        <meshStandardMaterial color="#2A2A2E" roughness={0.9} metalness={0.6} />
      </mesh>
      {/* Entrance frame */}
      <mesh position={[0, 3.5, -10.2]} castShadow>
        <boxGeometry args={[8, 7, 0.4]} />
        <meshStandardMaterial color="#1A1A1E" roughness={0.9} metalness={0.8} />
      </mesh>
      {/* Entrance door (open) */}
      <mesh position={[-2.5, 3.5, -10.4]} castShadow>
        <boxGeometry args={[3, 6, 0.1]} />
        <meshStandardMaterial color="#1A3A2A" roughness={0.9} metalness={0.9} />
      </mesh>
      {/* Windows */}
      {[-8, 0, 8].map((xOff, i) => (
        <mesh key={i} position={[xOff, 9, -10.2]}>
          <boxGeometry args={[3, 2, 0.05]} />
          <meshStandardMaterial color="#005A7A" roughness={0.1} metalness={1} emissive="#003A5A" emissiveIntensity={0.5} transparent opacity={0.8} />
        </mesh>
      ))}
      {/* Warning lights on building */}
      <WarningLight position={[-16, 9, -8.5]} color="#FF4400" />
      <WarningLight position={[16, 9, -8.5]} color="#FF4400" />
      <WarningLight position={[0, 15.5, 0]} color="#FFAA00" />
      {/* Roof equipment */}
      <mesh position={[8, 15.5, -4]} castShadow>
        <cylinderGeometry args={[0.5, 0.7, 2, 8]} />
        <meshStandardMaterial color="#1A1A1E" roughness={0.9} metalness={0.8} />
      </mesh>
      <mesh position={[-8, 15.5, 4]} castShadow>
        <boxGeometry args={[2, 1.5, 2]} />
        <meshStandardMaterial color="#1A1A1E" roughness={0.9} metalness={0.8} />
      </mesh>
      {/* Facility lights */}
      <pointLight color="#004466" intensity={0.8} distance={20} position={[0, 6, -9]} />
    </group>
  )
}

// Perimeter wall segments
function PerimeterWalls() {
  const wallSegs = [
    // North perimeter (Zone B)
    { pos: [-20, 1.5, -60], scale: [15, 3, 0.5] },
    { pos: [20, 1.5, -60], scale: [15, 3, 0.5] },
    { pos: [-8, 1.5, -60], scale: [3, 3, 0.5] },
    // Side walls
    { pos: [-28, 2, -75], scale: [0.5, 4, 30], rot: [0,0,0] },
    { pos: [28, 2, -75], scale: [0.5, 4, 30], rot: [0,0,0] },
    // Damaged sections
    { pos: [-25, 1, -65], scale: [5, 2, 0.5], rot: [0, 0, 0.2] },
    { pos: [22, 0.8, -68], scale: [4, 1.5, 0.5], rot: [0, 0, -0.15] },
  ]

  return (
    <group>
      {wallSegs.map(({ pos, scale, rot = [0,0,0] }, i) => (
        <mesh key={i} position={pos} scale={scale} rotation={rot} castShadow receiveShadow>
          <boxGeometry args={[1,1,1]} />
          <meshStandardMaterial color="#252528" roughness={0.95} metalness={0.5} />
        </mesh>
      ))}
    </group>
  )
}

// Communication antenna structure
function Antenna({ position }) {
  return (
    <group position={position}>
      {/* Main mast */}
      <mesh position={[0, 10, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.3, 20, 8]} />
        <meshStandardMaterial color="#2A2A2A" roughness={0.9} metalness={0.8} />
      </mesh>
      {/* Dish */}
      <mesh position={[0, 18, 0]} rotation={[Math.PI/4, 0, 0]} castShadow>
        <sphereGeometry args={[2, 12, 8, 0, Math.PI*2, 0, Math.PI/2]} />
        <meshStandardMaterial color="#1E1E22" roughness={0.7} metalness={0.9} side={THREE.DoubleSide} />
      </mesh>
      {/* Cross braces */}
      {[5, 10, 15].map((h, i) => (
        <mesh key={i} position={[0, h, 0]} castShadow>
          <boxGeometry args={[3, 0.1, 0.1]} />
          <meshStandardMaterial color="#2A2A2A" roughness={0.9} metalness={0.8} />
        </mesh>
      ))}
      {/* Warning light at top */}
      <WarningLight position={[0, 20.5, 0]} color="#FF2200" />
      {/* Support cables (visual) */}
      <mesh position={[1.5, 10, 1.5]} rotation={[0, 0, Math.PI/8]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 15, 4]} />
        <meshStandardMaterial color="#333" roughness={1} metalness={0.3} />
      </mesh>
    </group>
  )
}

// Industrial prop cluster
function PropCluster({ position }) {
  return (
    <group position={position}>
      <Crate position={[0, 0.5, 0]} scale={[2, 1, 1.5]} />
      <Crate position={[0, 1.5, 0]} scale={[1.8, 1, 1.4]} />
      <Crate position={[2.2, 0.5, 0.5]} scale={[1.5, 1, 1.5]} />
      {/* Barrel */}
      <mesh position={[-1.5, 0.6, 0.5]} castShadow receiveShadow>
        <cylinderGeometry args={[0.4, 0.4, 1.2, 10]} />
        <meshStandardMaterial color="#1A2A1A" roughness={0.9} metalness={0.5} />
      </mesh>
      {/* Warning light */}
      <WarningLight position={[1, 2.5, 0]} color="#FFAA00" />
    </group>
  )
}

// Hazard zone visual markers
function HazardMarkers({ center }) {
  const [cx, cy, cz] = center
  const positions = [
    [cx-15, cy+0.1, cz-15], [cx+15, cy+0.1, cz-15],
    [cx-15, cy+0.1, cz+15], [cx+15, cy+0.1, cz+15],
    [cx, cy+0.1, cz-18], [cx, cy+0.1, cz+18],
  ]
  return (
    <group>
      {positions.map((pos, i) => (
        <group key={i} position={pos}>
          <mesh castShadow>
            <cylinderGeometry args={[0.15, 0.2, 2, 6]} />
            <meshStandardMaterial color="#FFAA00" roughness={0.8} metalness={0.5} emissive="#553300" emissiveIntensity={0.3} />
          </mesh>
          <WarningLight position={[0, 1.3, 0]} color="#FF4400" />
        </group>
      ))}
      {/* Hazard zone ground marking */}
      <mesh position={[cx, cy+0.02, cz]} rotation={[-Math.PI/2, 0, 0]}>
        <circleGeometry args={[20, 32]} />
        <meshStandardMaterial color="#331100" roughness={1} transparent opacity={0.4} depthWrite={false} />
      </mesh>
    </group>
  )
}

export default function Building() {
  return (
    <group>
      <FacilityBuilding />
      <PerimeterWalls />

      {/* Zone B - Industrial perimeter props */}
      <PropCluster position={[-15, 0, -50]} />
      <PropCluster position={[18, 0, -55]} />
      <Crate position={[-22, 0.5, -45]} scale={[3, 1, 2]} />
      <Crate position={[25, 0.5, -48]} scale={[2, 1, 2]} />

      {/* More crates near facility */}
      <Crate position={[-12, 0.5, -72]} scale={[2, 1, 1.5]} />
      <Crate position={[-12, 1.5, -72]} scale={[1.8, 1, 1.4]} />
      <Crate position={[14, 0.5, -75]} scale={[2.5, 1, 2]} />

      {/* Zone D - Hazard zone markers */}
      <HazardMarkers center={[15, 0, -120]} />

      {/* Antenna in Zone E */}
      <Antenna position={[-12, 0, -150]} />
      <Antenna position={[8, 0, -145]} />

      {/* Scattered debris */}
      {[
        [-18, 0.1, -40], [22, 0.1, -42], [-8, 0.1, -58],
        [12, 0.1, -105], [-15, 0.1, -115], [5, 0.1, -135],
      ].map((pos, i) => (
        <mesh key={i} position={pos} rotation={[0, Math.random()*Math.PI, 0]} castShadow>
          <boxGeometry args={[1.5+Math.random(), 0.2, 0.8+Math.random()*0.5]} />
          <meshStandardMaterial color="#2A2A2E" roughness={1} metalness={0.3} />
        </mesh>
      ))}
    </group>
  )
}
