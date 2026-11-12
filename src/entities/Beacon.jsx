import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import useGameStore from '../store/gameStore.js'
import { roverWorldPos } from './Rover.jsx'

const BEACON_POS = new THREE.Vector3(0, 0, -158)
const ACTIVATE_RADIUS = 7

export default function Beacon() {
  const lightRef = useRef()
  const dishRef = useRef()
  const ringRef = useRef()

  const beaconActivated = useGameStore((s) => s.beaconActivated)
  const coresCollected = useGameStore((s) => s.coresCollected)
  const totalCores = useGameStore((s) => s.totalCores)
  const setInteractionTarget = useGameStore((s) => s.setInteractionTarget)

  const beaconReady = coresCollected >= totalCores

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()

    // Rotate dish
    if (dishRef.current) {
      dishRef.current.rotation.y = t * 0.4
    }

    // Pulse beacon light
    if (lightRef.current) {
      const pulse = beaconActivated
        ? 2.5 + Math.sin(t * 8) * 1.5
        : beaconReady
        ? 1.5 + Math.sin(t * 3) * 0.8
        : 0.6 + Math.sin(t * 1.5) * 0.3
      lightRef.current.intensity = pulse
    }

    // Animate rings when ready/activated
    if (ringRef.current) {
      ringRef.current.rotation.y = t * (beaconActivated ? 2.5 : beaconReady ? 1.5 : 0.5)
      ringRef.current.scale.setScalar(1 + Math.sin(t * 2) * 0.08)
    }

    // Distance-based proximity detection
    if (!beaconActivated && beaconReady) {
      const dx = roverWorldPos.x - BEACON_POS.x
      const dz = roverWorldPos.z - BEACON_POS.z
      const dist = Math.sqrt(dx * dx + dz * dz)
      const currentTarget = useGameStore.getState().interactionTarget
      if (dist < ACTIVATE_RADIUS) {
        if (currentTarget !== 'beacon') setInteractionTarget('beacon')
      } else {
        if (currentTarget === 'beacon') setInteractionTarget(null)
      }
    }
  })

  const beaconColor = beaconActivated ? '#00FF88' : beaconReady ? '#00CCFF' : '#FF8800'
  const emissiveColor = beaconActivated ? '#00FF44' : beaconReady ? '#0088FF' : '#FF4400'

  return (
    <group position={[BEACON_POS.x, BEACON_POS.y, BEACON_POS.z]}>
      {/* Main tower */}
      <mesh castShadow receiveShadow position={[0, 5, 0]}>
        <cylinderGeometry args={[0.3, 0.6, 10, 8]} />
        <meshStandardMaterial color="#2A2A35" roughness={0.6} metalness={0.8} />
      </mesh>

      {/* Tower base */}
      <mesh receiveShadow position={[0, 0.5, 0]}>
        <cylinderGeometry args={[1.5, 1.8, 1, 8]} />
        <meshStandardMaterial color="#1A1A22" roughness={0.7} metalness={0.9} />
      </mesh>

      {/* Dish group (rotates) */}
      <group ref={dishRef} position={[0, 10.5, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[1.8, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial
            color={beaconColor}
            emissive={emissiveColor}
            emissiveIntensity={beaconActivated ? 1.5 : 0.6}
            roughness={0.3}
            metalness={0.9}
            side={2}
          />
        </mesh>
        {/* Dish rim */}
        <mesh>
          <torusGeometry args={[1.8, 0.08, 8, 24]} />
          <meshStandardMaterial color="#444455" roughness={0.5} metalness={0.9} />
        </mesh>
      </group>

      {/* Beacon light */}
      <pointLight
        ref={lightRef}
        color={beaconColor}
        intensity={1}
        distance={35}
        decay={2}
        position={[0, 11, 0]}
      />

      {/* Top indicator */}
      <mesh position={[0, 11.5, 0]}>
        <sphereGeometry args={[0.25, 8, 8]} />
        <meshStandardMaterial
          color={beaconColor}
          emissive={emissiveColor}
          emissiveIntensity={2}
        />
      </mesh>

      {/* Ground ring */}
      <group ref={ringRef} position={[0, 0.1, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[2.5, 4.5, 32]} />
          <meshStandardMaterial
            color={beaconColor}
            transparent
            opacity={beaconReady ? 0.4 : 0.15}
            depthWrite={false}
            emissive={emissiveColor}
            emissiveIntensity={0.8}
          />
        </mesh>
      </group>

      {/* Support struts */}
      {[0, 1, 2, 3].map((i) => {
        const angle = (i / 4) * Math.PI * 2
        return (
          <mesh
            key={i}
            position={[Math.cos(angle) * 0.8, 2.5, Math.sin(angle) * 0.8]}
            rotation={[0, 0, Math.cos(angle) * 0.3]}
            castShadow
          >
            <cylinderGeometry args={[0.05, 0.05, 5, 4]} />
            <meshStandardMaterial color="#333344" roughness={0.7} metalness={0.8} />
          </mesh>
        )
      })}

      {/* Status label panel */}
      <mesh position={[0, 2, 0.65]} castShadow>
        <boxGeometry args={[0.8, 0.4, 0.05]} />
        <meshStandardMaterial
          color={beaconColor}
          emissive={emissiveColor}
          emissiveIntensity={1}
          roughness={0.2}
          metalness={0.6}
        />
      </mesh>
    </group>
  )
}
