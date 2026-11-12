import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import RoverModel from './RoverModel.jsx'
import useGameStore from '../store/gameStore.js'
import { ROVER_CONFIG } from '../systems/VehicleController.js'
import sounds from '../systems/SoundSystem.js'

const KEYS = {}
const tmpQuat = new THREE.Quaternion()
const tmpEuler = new THREE.Euler()

// Shared ref so CameraController can read position
export const roverWorldPos = { x: 0, y: 0.85, z: 20, angle: 0 }

export default function Rover({ onPositionUpdate }) {
  const groupRef = useRef()

  const posRef = useRef({ x: 0, z: 20 })
  const velRef = useRef({ speed: 0, steer: 0, angle: 0 })

  const screen = useGameStore((s) => s.screen)
  const isPaused = useGameStore((s) => s.isPaused)
  const setRoverSpeed = useGameStore((s) => s.setRoverSpeed)

  useEffect(() => {
    const down = (e) => {
      KEYS[e.code] = true
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault()
      }
      if (e.code === 'Escape') {
        const st = useGameStore.getState()
        if (st.screen === 'playing') st.setPaused(true)
        else if (st.screen === 'paused') st.setPaused(false)
      }
    }
    const up = (e) => { KEYS[e.code] = false }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [])

  useFrame((_, delta) => {
    if (!groupRef.current) return
    if (screen !== 'playing' || isPaused) {
      sounds.stopEngine()
      return
    }

    const v = velRef.current
    const p = posRef.current
    const cfg = ROVER_CONFIG

    const fwd = !!(KEYS['KeyW'] || KEYS['ArrowUp'])
    const bwd = !!(KEYS['KeyS'] || KEYS['ArrowDown'])
    const lft = !!(KEYS['KeyA'] || KEYS['ArrowLeft'])
    const rgt = !!(KEYS['KeyD'] || KEYS['ArrowRight'])
    const brk = !!KEYS['Space']
    const boost = !!(KEYS['ShiftLeft'] || KEYS['ShiftRight'])

    const isBoosting = boost && fwd
    const maxSpd = isBoosting ? cfg.maxSpeed * cfg.boostMultiplier : cfg.maxSpeed
    const acc = isBoosting ? cfg.acceleration * 1.6 : cfg.acceleration

    if (brk) {
      v.speed *= cfg.brakeStrength
    } else if (fwd) {
      v.speed = Math.min(v.speed + acc, maxSpd)
    } else if (bwd) {
      v.speed = Math.max(v.speed - acc, -cfg.reverseSpeed)
    } else {
      v.speed *= cfg.deceleration
    }
    if (Math.abs(v.speed) < 0.05) v.speed = 0

    const steerRate = cfg.steeringSpeed * (0.5 + 0.5 * Math.min(Math.abs(v.speed) / cfg.maxSpeed, 1))
    if (lft && v.speed !== 0) v.steer += steerRate * Math.sign(v.speed)
    else if (rgt && v.speed !== 0) v.steer -= steerRate * Math.sign(v.speed)
    else v.steer *= cfg.steeringDeceleration
    v.steer = Math.max(-0.5, Math.min(0.5, v.steer))
    v.angle += v.steer

    const dt = Math.min(delta, 0.05)
    p.x = Math.max(-85, Math.min(85, p.x - Math.sin(v.angle) * v.speed * dt))
    p.z = Math.max(-185, Math.min(28, p.z - Math.cos(v.angle) * v.speed * dt))

    const Y = 0
    groupRef.current.position.set(p.x, Y, p.z)
    tmpEuler.set(0, v.angle, -v.steer * 0.12, 'YXZ')
    groupRef.current.rotation.copy(tmpEuler)

    // Sync world pos for camera
    roverWorldPos.x = p.x
    roverWorldPos.y = Y
    roverWorldPos.z = p.z
    roverWorldPos.angle = v.angle

    sounds.updateEngine(v.speed, isBoosting)
    setRoverSpeed(v.speed)

    if (onPositionUpdate) {
      onPositionUpdate({
        position: new THREE.Vector3(p.x, Y, p.z),
        angle: v.angle,
        speed: v.speed,
      })
    }
  })

  return (
    <group ref={groupRef} position={[0, 0, 20]}>
      <RoverModel speed={velRef.current?.speed ?? 0} />
    </group>
  )
}
