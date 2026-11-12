import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function Wheel({ position, spinning, speed }) {
  const ref = useRef()
  useFrame((_, delta) => {
    if (ref.current && spinning) {
      ref.current.rotation.x += speed * delta * 2
    }
  })
  return (
    <group position={position}>
      <mesh ref={ref} rotation={[0, 0, Math.PI/2]}>
        <cylinderGeometry args={[0.45, 0.45, 0.4, 16]} />
        <meshStandardMaterial color="#1A1A1A" roughness={0.9} metalness={0.3} />
      </mesh>
      {/* Rim */}
      <mesh rotation={[0, 0, Math.PI/2]}>
        <cylinderGeometry args={[0.25, 0.25, 0.42, 8]} />
        <meshStandardMaterial color="#3A3A3A" roughness={0.7} metalness={0.9} />
      </mesh>
      {/* Hubcap */}
      <mesh rotation={[0, 0, Math.PI/2]} position={[0.21, 0, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.05, 6]} />
        <meshStandardMaterial color="#2A2A2A" roughness={0.5} metalness={1} />
      </mesh>
    </group>
  )
}

function StatusLight({ position, color }) {
  const ref = useRef()
  useFrame(({ clock }) => {
    if (ref.current?.material) {
      ref.current.material.emissiveIntensity = 0.5 + Math.sin(clock.getElapsedTime() * 2) * 0.5
    }
  })
  return (
    <mesh ref={ref} position={position}>
      <boxGeometry args={[0.1, 0.1, 0.05]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1} />
    </mesh>
  )
}

export default function RoverModel({ speed = 0 }) {
  const isMoving = Math.abs(speed) > 0.5
  const wheelSpeed = speed

  return (
    <group>
      {/* Main chassis */}
      <mesh position={[0, 0.65, 0]} castShadow>
        <boxGeometry args={[2.0, 0.6, 3.5]} />
        <meshStandardMaterial color="#252528" roughness={0.7} metalness={0.8} />
      </mesh>

      {/* Upper body */}
      <mesh position={[0, 1.1, -0.3]} castShadow>
        <boxGeometry args={[1.7, 0.5, 2.5]} />
        <meshStandardMaterial color="#1E1E22" roughness={0.7} metalness={0.9} />
      </mesh>

      {/* Front bumper */}
      <mesh position={[0, 0.5, -1.95]} castShadow>
        <boxGeometry args={[2.1, 0.5, 0.2]} />
        <meshStandardMaterial color="#1A1A1A" roughness={0.6} metalness={0.9} />
      </mesh>

      {/* Reinforced front plate */}
      <mesh position={[0, 0.65, -1.9]} castShadow>
        <boxGeometry args={[1.8, 0.3, 0.15]} />
        <meshStandardMaterial color="#2A2A2E" roughness={0.5} metalness={1} />
      </mesh>

      {/* Sensor mast */}
      <mesh position={[0, 1.9, 0.3]} castShadow>
        <cylinderGeometry args={[0.05, 0.08, 1.2, 6]} />
        <meshStandardMaterial color="#1A1A1A" roughness={0.7} metalness={0.9} />
      </mesh>

      {/* Sensor head */}
      <mesh position={[0, 2.55, 0.3]} castShadow>
        <boxGeometry args={[0.3, 0.2, 0.3]} />
        <meshStandardMaterial color="#1A1A1A" roughness={0.5} metalness={0.9} />
      </mesh>

      {/* Camera eye on sensor */}
      <mesh position={[0, 2.55, 0.16]}>
        <cylinderGeometry args={[0.06, 0.06, 0.05, 8]} />
        <meshStandardMaterial color="#005577" roughness={0.1} metalness={1} emissive="#003355" emissiveIntensity={0.8} />
      </mesh>

      {/* Side panels */}
      <mesh position={[-1.05, 0.9, 0]} castShadow>
        <boxGeometry args={[0.08, 0.6, 2.8]} />
        <meshStandardMaterial color="#1A1A1E" roughness={0.8} metalness={0.9} />
      </mesh>
      <mesh position={[1.05, 0.9, 0]} castShadow>
        <boxGeometry args={[0.08, 0.6, 2.8]} />
        <meshStandardMaterial color="#1A1A1E" roughness={0.8} metalness={0.9} />
      </mesh>

      {/* Headlights */}
      <mesh position={[-0.5, 0.65, -1.95]}>
        <boxGeometry args={[0.3, 0.15, 0.05]} />
        <meshStandardMaterial color="#FFFFEE" emissive="#FFFFAA" emissiveIntensity={2} />
      </mesh>
      <mesh position={[0.5, 0.65, -1.95]}>
        <boxGeometry args={[0.3, 0.15, 0.05]} />
        <meshStandardMaterial color="#FFFFEE" emissive="#FFFFAA" emissiveIntensity={2} />
      </mesh>
      <pointLight color="#FFFFAA" intensity={1.5} distance={12} position={[0, 0.65, -2.2]} />

      {/* Status lights */}
      <StatusLight position={[-0.86, 1.4, -1.0]} color="#00FFAA" />
      <StatusLight position={[0.86, 1.4, -1.0]} color="#00FFAA" />
      <StatusLight position={[-0.86, 1.4, 1.0]} color="#00FFAA" />
      <StatusLight position={[0.86, 1.4, 1.0]} color="#00FFAA" />

      {/* Solar panel / antenna on back */}
      <mesh position={[0, 1.5, 1.6]} rotation={[-0.3, 0, 0]} castShadow>
        <boxGeometry args={[1.2, 0.05, 0.8]} />
        <meshStandardMaterial color="#1A2A3A" roughness={0.3} metalness={0.9} emissive="#001122" emissiveIntensity={0.3} />
      </mesh>

      {/* Wheels - 4 corners */}
      <Wheel position={[-1.1, 0.45, -1.3]} spinning={isMoving} speed={wheelSpeed} />
      <Wheel position={[1.1, 0.45, -1.3]} spinning={isMoving} speed={wheelSpeed} />
      <Wheel position={[-1.1, 0.45, 1.3]} spinning={isMoving} speed={wheelSpeed} />
      <Wheel position={[1.1, 0.45, 1.3]} spinning={isMoving} speed={wheelSpeed} />

      {/* Suspension arms */}
      {[[-1.0, -1.3], [1.0, -1.3], [-1.0, 1.3], [1.0, 1.3]].map(([x, z], i) => (
        <mesh key={i} position={[x * 0.55, 0.45, z]} rotation={[0, 0, x > 0 ? 0.3 : -0.3]} castShadow>
          <boxGeometry args={[0.6, 0.08, 0.08]} />
          <meshStandardMaterial color="#1A1A1A" roughness={0.9} metalness={0.8} />
        </mesh>
      ))}
    </group>
  )
}
