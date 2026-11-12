import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import useGameStore from '../store/gameStore.js'
import { roverWorldPos } from './Rover.jsx'

const COLLECT_RADIUS = 5.0

function EnergyCore({ position, coreId }) {
  const meshRef = useRef()
  const glowRef = useRef()
  const ringRef = useRef()

  const isCollected = useGameStore((s) => s.collectedCoreIds.includes(coreId))
  const setInteractionTarget = useGameStore((s) => s.setInteractionTarget)

  const worldPos = useMemo(() => new THREE.Vector3(...position), [position])

  useFrame(({ clock }) => {
    if (isCollected) return
    const t = clock.getElapsedTime() + coreId * 1.5

    if (meshRef.current) {
      meshRef.current.rotation.y = t * 1.6
      meshRef.current.position.y = 1.2 + Math.sin(t * 2.2) * 0.2
    }
    if (glowRef.current?.material) {
      glowRef.current.material.emissiveIntensity = 0.8 + Math.sin(t * 3.5) * 0.5
    }
    if (ringRef.current) {
      ringRef.current.rotation.x = t * 2.1
      ringRef.current.rotation.z = t * 1.4
    }

    // Distance-based proximity detection
    const dx = roverWorldPos.x - worldPos.x
    const dz = roverWorldPos.z - worldPos.z
    const dist = Math.sqrt(dx * dx + dz * dz)
    const myTarget = `core-${coreId}`
    const currentTarget = useGameStore.getState().interactionTarget
    if (dist < COLLECT_RADIUS) {
      if (currentTarget !== myTarget) setInteractionTarget(myTarget)
    } else {
      if (currentTarget === myTarget) setInteractionTarget(null)
    }
  })

  if (isCollected) return null

  return (
    <group position={position}>
      {/* Outer glow sphere */}
      <mesh position={[0, 1.2, 0]}>
        <sphereGeometry args={[1.5, 16, 16]} />
        <meshStandardMaterial color="#00FFAA" transparent opacity={0.08} depthWrite={false} side={2} />
      </mesh>

      {/* Animated core group */}
      <group ref={meshRef} position={[0, 1.2, 0]}>
        <mesh ref={glowRef} castShadow>
          <octahedronGeometry args={[0.55, 1]} />
          <meshStandardMaterial
            color="#00FFAA"
            emissive="#00FFAA"
            emissiveIntensity={1.2}
            roughness={0.1}
            metalness={0.9}
            transparent
            opacity={0.92}
          />
        </mesh>
        <mesh ref={ringRef}>
          <torusGeometry args={[0.85, 0.04, 12, 32]} />
          <meshStandardMaterial color="#00E5FF" emissive="#00E5FF" emissiveIntensity={1.8} />
        </mesh>
        <pointLight color="#00FFAA" intensity={2.5} distance={8} decay={2} />
      </group>

      {/* Pedestal */}
      <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.4, 0.6, 0.5, 8]} />
        <meshStandardMaterial color="#1E2A22" roughness={0.8} metalness={0.7} />
      </mesh>

      {/* Ground ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[0.8, 2.2, 32]} />
        <meshStandardMaterial
          color="#00FFAA"
          transparent
          opacity={0.25}
          depthWrite={false}
          emissive="#00FFAA"
          emissiveIntensity={0.6}
        />
      </mesh>
    </group>
  )
}

const CORE_POSITIONS = [
  [-12, 0, -82],
  [15, 0, -120],
  [6, 0, -148],
]

export default function Collectibles() {
  return (
    <group>
      {CORE_POSITIONS.map((pos, i) => (
        <EnergyCore key={i} position={pos} coreId={i} />
      ))}
    </group>
  )
}
