import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import useGameStore from '../store/gameStore.js'
import { roverWorldPos } from './Rover.jsx'

const CENTER_X = 15
const CENTER_Z = -120
const RADIUS = 20

export default function Hazard() {
  const inZoneRef = useRef(false)
  const drainRef = useRef(null)

  useEffect(() => {
    return () => {
      if (drainRef.current) clearInterval(drainRef.current)
    }
  }, [])

  useFrame(() => {
    const dx = roverWorldPos.x - CENTER_X
    const dz = roverWorldPos.z - CENTER_Z
    const dist = Math.sqrt(dx * dx + dz * dz)
    const inside = dist < RADIUS

    if (inside !== inZoneRef.current) {
      inZoneRef.current = inside
      useGameStore.getState().setInHazardZone(inside)

      if (inside) {
        drainRef.current = setInterval(() => {
          const st = useGameStore.getState()
          if (st.screen === 'playing' && !st.isPaused) {
            st.drainHealth(1)
          }
        }, 100)
      } else {
        if (drainRef.current) {
          clearInterval(drainRef.current)
          drainRef.current = null
        }
      }
    }
  })

  return (
    <group>
      {/* Hazard zone floor circle */}
      <mesh position={[CENTER_X, 0.05, CENTER_Z]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[RADIUS, 32]} />
        <meshStandardMaterial
          color="#22AA11"
          transparent
          opacity={0.15}
          depthWrite={false}
          emissive="#115500"
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Additional concentric rings */}
      {[1, 2, 3].map((h) => (
        <mesh key={h} position={[CENTER_X, h * 0.3, CENTER_Z]} rotation={[-Math.PI / 2, 0, h]}>
          <ringGeometry args={[RADIUS * (1 - h * 0.1) - 0.5, RADIUS * (1 - h * 0.1), 24]} />
          <meshStandardMaterial
            color="#44FF22"
            transparent
            opacity={Math.max(0.02, 0.08 - h * 0.02)}
            depthWrite={false}
            emissive="#22FF00"
            emissiveIntensity={0.4}
          />
        </mesh>
      ))}

      {/* Warning light */}
      <pointLight color="#44FF22" intensity={1.2} distance={28} position={[CENTER_X, 3, CENTER_Z]} />

      {/* Hazard poles */}
      {[0, 1, 2, 3].map((i) => {
        const angle = (i / 4) * Math.PI * 2
        const px = CENTER_X + Math.cos(angle) * RADIUS * 0.75
        const pz = CENTER_Z + Math.sin(angle) * RADIUS * 0.75
        return (
          <group key={i} position={[px, 0, pz]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.08, 0.1, 2.5, 6]} />
              <meshStandardMaterial color="#FF4400" roughness={0.6} metalness={0.5} />
            </mesh>
            <mesh position={[0, 1.5, 0]}>
              <sphereGeometry args={[0.18, 8, 8]} />
              <meshStandardMaterial color="#FF6600" emissive="#FF4400" emissiveIntensity={2} />
            </mesh>
            <pointLight color="#FF4400" intensity={0.8} distance={6} position={[0, 1.5, 0]} />
          </group>
        )
      })}
    </group>
  )
}
