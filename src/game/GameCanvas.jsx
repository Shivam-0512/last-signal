import { useRef, useEffect, useCallback, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Suspense } from 'react'
import * as THREE from 'three'
import { useGLTF } from '@react-three/drei'
import useGameStore from '../store/gameStore.js'
import { handleCoreCollected, handleBeaconActivated } from '../systems/MissionSystem.js'
import sounds from '../systems/SoundSystem.js'

// Preload rover GLB so it's ready instantly
useGLTF.preload('/rover.glb')

// ─── SHARED WORLD STATE ───────────────────────────────────────────────────────
export const roverWorldPos = { x: 0, z: 20, angle: 0 }

// ─── ROVER CONFIG ────────────────────────────────────────────────────────────
const ROVER_CFG = {
  maxSpeed: 18, reverseSpeed: 7, acceleration: 0.28, deceleration: 0.90,
  brakeStrength: 0.84, boostMultiplier: 1.5,
}
const KEYS = {}

// ─── AABB COLLISION BOXES [minX, maxX, minZ, maxZ] ──────────────────────────
// Format: [minX, maxX, minZ, maxZ]  (minX < maxX,  minZ < maxZ)
//
// Buildings (from visual geometry):
//   Left wing:   pos=[-26,5.5,-65]  size=[16,11,22] → x:[-34,-18]  z:[-76,-54]
//   Left annex:  pos=[-26,3,-85]    size=[14,6,10]  → x:[-33,-19]  z:[-90,-80]
//   Right wing:  pos=[ 26,5.5,-65]  size=[16,11,22] → x:[ 18, 34]  z:[-76,-54]
//   Right annex: pos=[ 26,3,-85]    size=[14,6,10]  → x:[ 19, 33]  z:[-90,-80]
//
// Crates flanking road:
//   Left cluster:  ~x=-13..-19, z=-38..-54
//   Right cluster: ~x=13..19,   z=-38..-54
//   Mid-left:      ~x=-13..-21, z=-106..-117
//   Mid-right:     ~x=13..21,   z=-106..-117
//
// Antenna towers (cylindrical, treat as small box):
//   [-22,0,-105]  [22,0,-105]  [-22,0,-135]  [22,0,-135]

const STATIC_BOXES = [
  // ── buildings ──
  [-34, -18, -76, -54],   // left main wing
  [-33, -19, -90, -80],   // left annex
  [18, 34, -76, -54],   // right main wing
  [19, 33, -90, -80],   // right annex

  // ── front crate clusters (z=-37 to -55, away from road and cores) ──
  [-20, -12, -55, -37],   // left front crates
  [12, 20, -55, -37],   // right front crates

  // ── antenna towers (1.5-unit box radius) ──
  [-23.5, -20.5, -106.5, -103.5],
  [20.5, 23.5, -106.5, -103.5],
  [-23.5, -20.5, -136.5, -133.5],
  [20.5, 23.5, -136.5, -133.5],
]

// Rover half-width used for AABB sweep (slightly generous)
const ROVER_R = 1.5

function blocked(nx, nz) {
  for (let i = 0; i < STATIC_BOXES.length; i++) {
    const [mnX, mxX, mnZ, mxZ] = STATIC_BOXES[i]
    if (nx + ROVER_R > mnX && nx - ROVER_R < mxX &&
      nz + ROVER_R > mnZ && nz - ROVER_R < mxZ) return true
  }
  return false
}

// ─── ROVER ───────────────────────────────────────────────────────────────────
function Rover({ onUpdate }) {
  const ref = useRef()
  const pos = useRef({ x: 0, z: 20 })
  const vel = useRef({ speed: 0, steer: 0, angle: 0 })

  const screen = useGameStore(s => s.screen)
  const isPaused = useGameStore(s => s.isPaused)
  const setRoverSpeed = useGameStore(s => s.setRoverSpeed)

  useEffect(() => {
    const down = e => {
      KEYS[e.code] = true
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code))
        e.preventDefault()
      if (e.code === 'Escape') {
        const st = useGameStore.getState()
        if (st.screen === 'playing') st.setPaused(true)
        else if (st.screen === 'paused') st.setPaused(false)
      }
    }
    const up = e => { KEYS[e.code] = false }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up) }
  }, [])

  useFrame((_, delta) => {
    if (!ref.current) return
    if (screen !== 'playing' || isPaused) { sounds.stopEngine(); return }

    const v = vel.current
    const p = pos.current
    const cfg = ROVER_CFG
    const dt = Math.min(delta, 0.05)

    const fwd = !!(KEYS['KeyW'] || KEYS['ArrowUp'])
    const bwd = !!(KEYS['KeyS'] || KEYS['ArrowDown'])
    const lft = !!(KEYS['KeyA'] || KEYS['ArrowLeft'])
    const rgt = !!(KEYS['KeyD'] || KEYS['ArrowRight'])
    const brk = !!KEYS['Space']
    const boost = !!(KEYS['ShiftLeft'] || KEYS['ShiftRight']) && fwd
    const maxSpd = boost ? cfg.maxSpeed * cfg.boostMultiplier : cfg.maxSpeed

    if (brk) v.speed *= cfg.brakeStrength
    else if (fwd) v.speed = Math.min(v.speed + cfg.acceleration, maxSpd)
    else if (bwd) v.speed = Math.max(v.speed - cfg.acceleration, -cfg.reverseSpeed)
    else v.speed *= cfg.deceleration
    if (Math.abs(v.speed) < 0.04) v.speed = 0

    // Smooth steering
    const MAX_TURN = 0.025
    const targetSteer = (lft && v.speed !== 0) ? MAX_TURN * Math.sign(v.speed)
      : (rgt && v.speed !== 0) ? -MAX_TURN * Math.sign(v.speed) : 0
    v.steer += (targetSteer - v.steer) * 0.18
    if (Math.abs(v.steer) < 0.0005) v.steer = 0

    const speedRatio = Math.min(Math.abs(v.speed) / cfg.maxSpeed, 1)
    v.angle += v.steer * (0.5 + 0.5 * speedRatio)

    const sinA = Math.sin(v.angle)
    const cosA = Math.cos(v.angle)
    const move = v.speed * dt
    // Sub-step: split movement into 3 steps to prevent tunnelling at high speed
    const steps = 3
    const stepMove = move / steps
    for (let s = 0; s < steps; s++) {
      const nx = p.x - sinA * stepMove
      const nz = p.z - cosA * stepMove
      if (!blocked(nx, nz)) {
        p.x = Math.max(-90, Math.min(90, nx))
        p.z = Math.max(-185, Math.min(28, nz))
      } else if (!blocked(nx, p.z)) {
        p.x = Math.max(-90, Math.min(90, nx))
        v.speed *= 0.6
        break
      } else if (!blocked(p.x, nz)) {
        p.z = Math.max(-185, Math.min(28, nz))
        v.speed *= 0.6
        break
      } else {
        v.speed *= 0.3
        break
      }
    }

    ref.current.position.set(p.x, 0, p.z)
    ref.current.rotation.set(0, v.angle, -v.steer * 4, 'YXZ')

    roverWorldPos.x = p.x
    roverWorldPos.z = p.z
    roverWorldPos.angle = v.angle

    sounds.updateEngine(v.speed, boost)
    setRoverSpeed(v.speed)
    if (onUpdate) onUpdate({
      position: new THREE.Vector3(p.x, 0, p.z),
      angle: v.angle,
      speed: v.speed,
    })
  })

  return (
    <group ref={ref} position={[0, 0, 20]}>
      <RoverModel />
      {/* Headlight lamp — keep regardless of model */}
      <pointLight color="#FFE8AA" intensity={2.5} distance={14} position={[0, 0.7, -2.5]} />
    </group>
  )
}

// ─── ROVER GLB MODEL ─────────────────────────────────────────────────────────
function RoverModel() {
  const { scene } = useGLTF('/rover.glb')

  // useMemo so the clone is stable across re-renders
  const cloned = useMemo(() => {
    const c = scene.clone(true)
    // Walk and clone materials individually so textures/colors are preserved
    c.traverse(obj => {
      if (obj.isMesh) {
        obj.castShadow    = true
        obj.receiveShadow = true
        if (Array.isArray(obj.material)) {
          obj.material = obj.material.map(m => m.clone())
        } else if (obj.material) {
          obj.material = obj.material.clone()
        }
      }
    })
    return c
  }, [scene])

  return (
    <primitive
      object={cloned}
      scale={[4, 4, 4]}
      position={[0, 1.43, 0]}
      rotation={[0, Math.PI, 0]}
    />
  )
}

// ─── CAMERA ──────────────────────────────────────────────────────────────────
const _camPos = new THREE.Vector3()
const _lookAt = new THREE.Vector3()
const _curLook = new THREE.Vector3(0, 1.5, 10)

// Free-look state — plain object, no React, updated from mouse events
const freeLook = {
  active: false,
  yaw:    0,     // horizontal orbit offset added to rover heading (radians)
  pitch:  0.45,  // vertical angle in radians (clamped 0.08–1.4)
  dist:   11,    // orbit radius
  lastX:  0,
  lastY:  0,
}

function Camera({ roverStateRef }) {
  const { camera, gl } = useThree()
  const init = useRef(false)

  useEffect(() => {
    const canvas = gl.domElement

    const onMouseDown = e => {
      if (e.button !== 2) return
      freeLook.active = true
      freeLook.lastX  = e.clientX
      freeLook.lastY  = e.clientY
      canvas.style.cursor = 'grabbing'
      e.preventDefault()
    }
    const onMouseUp = e => {
      if (e.button !== 2) return
      freeLook.active = false
      canvas.style.cursor = ''
    }
    const onMouseMove = e => {
      if (!freeLook.active) return
      // movementX is 0 in some browsers without pointer lock — use clientX delta as fallback
      const dx = e.movementX || (e.clientX - freeLook.lastX)
      const dy = e.movementY || (e.clientY - freeLook.lastY)
      freeLook.lastX = e.clientX
      freeLook.lastY = e.clientY
      freeLook.yaw   -= dx * 0.005
      freeLook.pitch -= dy * 0.004
      freeLook.pitch  = Math.max(0.08, Math.min(1.4, freeLook.pitch))
    }
    const noCtxMenu = e => e.preventDefault()

    canvas.addEventListener('mousedown',   onMouseDown)
    window.addEventListener('mouseup',     onMouseUp)
    window.addEventListener('mousemove',   onMouseMove)
    canvas.addEventListener('contextmenu', noCtxMenu)
    return () => {
      canvas.removeEventListener('mousedown',   onMouseDown)
      window.removeEventListener('mouseup',     onMouseUp)
      window.removeEventListener('mousemove',   onMouseMove)
      canvas.removeEventListener('contextmenu', noCtxMenu)
    }
  }, [gl])

  useFrame(() => {
    const rs = roverStateRef?.current
    if (!rs?.position) return
    const { position: p, angle } = rs

    if (freeLook.active) {
      const orbitYaw = angle + freeLook.yaw
      const cosP = Math.cos(freeLook.pitch)
      const sinP = Math.sin(freeLook.pitch)
      _camPos.set(
        p.x + Math.sin(orbitYaw) * freeLook.dist * cosP,
        p.y + freeLook.dist * sinP,
        p.z + Math.cos(orbitYaw) * freeLook.dist * cosP,
      )
      _curLook.set(p.x, p.y + 1.2, p.z)
      camera.position.lerp(_camPos, 0.3)
      camera.lookAt(_curLook)
    } else {
      freeLook.yaw *= 0.85
      const sinA = Math.sin(angle), cosA = Math.cos(angle)
      _camPos.set(p.x + sinA * 11, p.y + 5.2, p.z + cosA * 11)
      _lookAt.set(p.x - sinA * 4,  p.y + 1.6, p.z - cosA * 4)
      if (!init.current) {
        camera.position.copy(_camPos)
        _curLook.copy(_lookAt)
        camera.lookAt(_curLook)
        init.current = true
        return
      }
      camera.position.lerp(_camPos, 0.08)
      _curLook.lerp(_lookAt, 0.1)
      camera.lookAt(_curLook)
    }
  })
  return null
}

// ─── ENERGY CORE ─────────────────────────────────────────────────────────────
function Core({ position, coreId }) {
  const ref = useRef()
  const isCollected = useGameStore(s => s.collectedCoreIds.includes(coreId))
  const setTarget = useGameStore(s => s.setInteractionTarget)
  const [wpx, , wpz] = position

  useFrame(({ clock }) => {
    if (isCollected || !ref.current) return
    const t = clock.getElapsedTime() + coreId * 1.5
    ref.current.rotation.y = t * 1.6
    ref.current.position.y = 1.2 + Math.sin(t * 2.2) * 0.2
    const dx = roverWorldPos.x - wpx, dz = roverWorldPos.z - wpz
    const myKey = `core-${coreId}`
    const cur = useGameStore.getState().interactionTarget
    if (dx * dx + dz * dz < 49) { if (cur !== myKey) setTarget(myKey) }
    else { if (cur === myKey) setTarget(null) }
  })

  if (isCollected) return null
  return (
    <group position={position}>
      <group ref={ref} position={[0, 1.2, 0]}>
        <mesh>
          <octahedronGeometry args={[0.55, 1]} />
          <meshStandardMaterial color="#00FFAA" emissive="#00FFAA" emissiveIntensity={1.4} roughness={0.1} metalness={0.9} />
        </mesh>
        <mesh>
          <torusGeometry args={[0.85, 0.04, 7, 22]} />
          <meshStandardMaterial color="#00E5FF" emissive="#00E5FF" emissiveIntensity={1.5} />
        </mesh>
        <pointLight color="#00FFAA" intensity={1.8} distance={8} decay={2} />
      </group>
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.4, 0.6, 0.5, 7]} />
        <meshStandardMaterial color="#1E2A22" roughness={0.8} metalness={0.7} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[0.8, 2.2, 22]} />
        <meshStandardMaterial color="#00FFAA" transparent opacity={0.2} depthWrite={false} emissive="#00FFAA" emissiveIntensity={0.4} />
      </mesh>
    </group>
  )
}

// ─── HAZARD ZONE ─────────────────────────────────────────────────────────────
const HZ = { x: 15, z: -120, r2: 400 } // r=20, r²=400

function HazardZone() {
  const inZone = useRef(false)
  const drain = useRef(null)
  useEffect(() => () => { if (drain.current) clearInterval(drain.current) }, [])

  useFrame(() => {
    const dx = roverWorldPos.x - HZ.x, dz = roverWorldPos.z - HZ.z
    const inside = dx * dx + dz * dz < HZ.r2
    if (inside !== inZone.current) {
      inZone.current = inside
      useGameStore.getState().setInHazardZone(inside)
      if (inside) {
        drain.current = setInterval(() => {
          const st = useGameStore.getState()
          if (st.screen === 'playing' && !st.isPaused) st.drainHealth(1)
        }, 100)
      } else { clearInterval(drain.current); drain.current = null }
    }
  })

  return (
    <group>
      <mesh position={[HZ.x, 0.05, HZ.z]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[20, 24]} />
        <meshStandardMaterial color="#22AA11" transparent opacity={0.15} depthWrite={false} emissive="#114400" emissiveIntensity={0.4} />
      </mesh>
      <pointLight color="#44FF22" intensity={0.9} distance={25} position={[HZ.x, 3, HZ.z]} />
      {[0, 1, 2, 3].map(i => {
        const a = (i / 4) * Math.PI * 2
        return (
          <group key={i} position={[HZ.x + Math.cos(a) * 15, 0, HZ.z + Math.sin(a) * 15]}>
            <mesh>
              <cylinderGeometry args={[0.08, 0.1, 2.5, 5]} />
              <meshStandardMaterial color="#FF4400" roughness={0.6} metalness={0.5} />
            </mesh>
            <mesh position={[0, 1.5, 0]}>
              <sphereGeometry args={[0.18, 6, 6]} />
              <meshStandardMaterial color="#FF6600" emissive="#FF4400" emissiveIntensity={3} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

// ─── BEACON ──────────────────────────────────────────────────────────────────
const BPX = 0, BPZ = -158

function BeaconObj() {
  const lightRef = useRef()
  const dishRef = useRef()
  const beaconActivated = useGameStore(s => s.beaconActivated)
  const coresCollected = useGameStore(s => s.coresCollected)
  const totalCores = useGameStore(s => s.totalCores)
  const setTarget = useGameStore(s => s.setInteractionTarget)
  const ready = coresCollected >= totalCores

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (dishRef.current) dishRef.current.rotation.y = t * 0.4
    if (lightRef.current) {
      lightRef.current.intensity = beaconActivated
        ? 2.5 + Math.sin(t * 8) * 1.5
        : ready ? 1.5 + Math.sin(t * 3) * 0.8 : 0.6 + Math.sin(t * 1.5) * 0.3
    }
    if (!beaconActivated && ready) {
      const dx = roverWorldPos.x - BPX, dz = roverWorldPos.z - BPZ
      const cur = useGameStore.getState().interactionTarget
      if (dx * dx + dz * dz < 49) { if (cur !== 'beacon') setTarget('beacon') }
      else { if (cur === 'beacon') setTarget(null) }
    }
  })

  const col = beaconActivated ? '#00FF88' : ready ? '#00CCFF' : '#FF8800'
  const em = beaconActivated ? '#00FF44' : ready ? '#0088FF' : '#FF4400'

  return (
    <group position={[BPX, 0, BPZ]}>
      <mesh position={[0, 5, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.6, 10, 7]} />
        <meshStandardMaterial color="#2A2A35" roughness={0.6} metalness={0.8} />
      </mesh>
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[1.5, 1.8, 1, 7]} />
        <meshStandardMaterial color="#1A1A22" roughness={0.7} metalness={0.9} />
      </mesh>
      <group ref={dishRef} position={[0, 10.5, 0]}>
        <mesh>
          <sphereGeometry args={[1.8, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={col} emissive={em} emissiveIntensity={beaconActivated ? 1.5 : 0.6} roughness={0.3} metalness={0.9} side={2} />
        </mesh>
      </group>
      <pointLight ref={lightRef} color={col} intensity={1} distance={35} decay={2} position={[0, 11, 0]} />
      <mesh position={[0, 11.5, 0]}>
        <sphereGeometry args={[0.25, 7, 7]} />
        <meshStandardMaterial color={col} emissive={em} emissiveIntensity={2.5} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
        <ringGeometry args={[2.5, 4.5, 24]} />
        <meshStandardMaterial color={col} transparent opacity={ready ? 0.4 : 0.15} depthWrite={false} emissive={em} emissiveIntensity={0.8} />
      </mesh>
    </group>
  )
}

// ─── ENVIRONMENT ─────────────────────────────────────────────────────────────
// All geometry is pre-defined to avoid per-render allocations
const ROCKS = [
  { p: [-28, 0, -18], s: [4.0, 2.5, 3.2], c: '#C09870' }, { p: [32, 0, -12], s: [3.0, 1.9, 2.6], c: '#B8906A' },
  { p: [-44, 0, -45], s: [5.2, 3.4, 4.2], c: '#D4A878' }, { p: [40, 0, -55], s: [3.5, 2.2, 3.0], c: '#C09274' },
  { p: [-38, 0, -88], s: [4.2, 2.8, 3.5], c: '#C89870' }, { p: [46, 0, -82], s: [3.2, 2.1, 2.8], c: '#B88E6C' },
  { p: [-42, 0, -128], s: [4.8, 3.0, 4.0], c: '#CC9A72' }, { p: [48, 0, -138], s: [3.0, 2.0, 2.5], c: '#B88E6A' },
  { p: [-24, 0, 18], s: [2.5, 1.6, 2.0], c: '#C49472' }, { p: [30, 0, 12], s: [3.2, 2.0, 2.8], c: '#C09070' },
  { p: [-58, 0, -28], s: [3.5, 2.3, 3.0], c: '#B88C6A' }, { p: [60, 0, -38], s: [4.0, 2.6, 3.5], c: '#C09070' },
]
const CRATE_POS = [
  [-14, 0.7, -40], [-17, 0.7, -46], [-13, 2.1, -40],
  [14, 0.7, -40], [17, 0.7, -46], [13, 2.1, -40],
  [-16, 0.7, -108], [24, 0.7, -112],
]
const BOLLARD_Z = [-30, -50, -70, -90, -110, -130, -150]
const TOWER_POS = [[-22, 0, -105], [22, 0, -105], [-22, 0, -135], [22, 0, -135]]
const MOUNT_DATA = [[-90, 0, -215], [-45, 0, -210], [0, 0, -220], [50, 0, -210], [95, 0, -215], [-135, 0, -205], [135, 0, -205]]

function Environment() {
  return (
    <group>
      {/* Sandy desert */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[400, 400]} />
        <meshStandardMaterial color="#D4A860" roughness={0.95} metalness={0.0} />
      </mesh>
      {/* Road */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, -80]} receiveShadow>
        <planeGeometry args={[12, 200]} />
        <meshStandardMaterial color="#2A2620" roughness={0.98} />
      </mesh>
      {/* Road edge lines */}
      {[-5.6, 5.6].map((x, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.045, -80]}>
          <planeGeometry args={[0.22, 200]} />
          <meshStandardMaterial color="#CCAA22" roughness={0.8} />
        </mesh>
      ))}
      {/* Road dashes */}
      {[-15, -45, -75, -105, -135, -165].map((z, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.055, z]}>
          <planeGeometry args={[0.26, 8]} />
          <meshStandardMaterial color="#CCAA22" emissive="#886600" emissiveIntensity={0.3} />
        </mesh>
      ))}

      {/* Rocks — sphere 5×4 (very low poly) */}
      {ROCKS.map(({ p, s, c }, i) => (
        <mesh key={i} position={[p[0], s[1] * 0.36, p[2]]} scale={s} rotation={[0.08 * i, i * 0.72, 0.04 * i]} castShadow>
          <sphereGeometry args={[1, 5, 4]} />
          <meshStandardMaterial color={c} roughness={0.90} metalness={0.05} />
        </mesh>
      ))}

      {/* ── LEFT FACILITY WING ── */}
      <mesh position={[-26, 5.5, -65]} castShadow receiveShadow>
        <boxGeometry args={[16, 11, 22]} />
        <meshStandardMaterial color="#5A6478" roughness={0.70} metalness={0.5} />
      </mesh>
      <mesh position={[-26, 11.2, -65]}>
        <boxGeometry args={[16.5, 0.7, 22.5]} />
        <meshStandardMaterial color="#404858" roughness={0.6} metalness={0.7} />
      </mesh>
      <mesh position={[-26, 3, -85]} castShadow receiveShadow>
        <boxGeometry args={[14, 6, 10]} />
        <meshStandardMaterial color="#505C6E" roughness={0.75} metalness={0.5} />
      </mesh>
      <mesh position={[-26, 1.6, -54.1]}>
        <boxGeometry args={[16, 0.4, 0.06]} />
        <meshStandardMaterial color="#E06820" emissive="#C04800" emissiveIntensity={2.5} />
      </mesh>
      {[3.5, 6.5].map((y, i) => (
        <mesh key={i} position={[-26, y, -54.08]}>
          <boxGeometry args={[12, 1.6, 0.05]} />
          <meshStandardMaterial color="#AACCFF" emissive="#4488FF" emissiveIntensity={1.8} transparent opacity={0.92} />
        </mesh>
      ))}
      {/* Warning lights — emissive only, no pointLight */}
      {[[-18, 12, -54], [-34, 12, -54], [-18, 12, -76], [-34, 12, -76]].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]}>
          <sphereGeometry args={[0.26, 7, 7]} />
          <meshStandardMaterial color="#FF4400" emissive="#FF2200" emissiveIntensity={6} />
        </mesh>
      ))}

      {/* ── RIGHT FACILITY WING ── */}
      <mesh position={[26, 5.5, -65]} castShadow receiveShadow>
        <boxGeometry args={[16, 11, 22]} />
        <meshStandardMaterial color="#5A6478" roughness={0.70} metalness={0.5} />
      </mesh>
      <mesh position={[26, 11.2, -65]}>
        <boxGeometry args={[16.5, 0.7, 22.5]} />
        <meshStandardMaterial color="#404858" roughness={0.6} metalness={0.7} />
      </mesh>
      <mesh position={[26, 3, -85]} castShadow receiveShadow>
        <boxGeometry args={[14, 6, 10]} />
        <meshStandardMaterial color="#505C6E" roughness={0.75} metalness={0.5} />
      </mesh>
      <mesh position={[26, 1.6, -54.1]}>
        <boxGeometry args={[16, 0.4, 0.06]} />
        <meshStandardMaterial color="#E06820" emissive="#C04800" emissiveIntensity={2.5} />
      </mesh>
      {[3.5, 6.5].map((y, i) => (
        <mesh key={i} position={[26, y, -54.08]}>
          <boxGeometry args={[12, 1.6, 0.05]} />
          <meshStandardMaterial color="#AACCFF" emissive="#4488FF" emissiveIntensity={1.8} transparent opacity={0.92} />
        </mesh>
      ))}
      {[[18, 12, -54], [34, 12, -54], [18, 12, -76], [34, 12, -76]].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]}>
          <sphereGeometry args={[0.26, 7, 7]} />
          <meshStandardMaterial color="#FF4400" emissive="#FF2200" emissiveIntensity={6} />
        </mesh>
      ))}

      {/* ── CRATES ── */}
      {CRATE_POS.map(([x, y, z], i) => (
        <group key={i} position={[x, y, z]} rotation={[0, i * 0.5, 0]}>
          <mesh castShadow>
            <boxGeometry args={[2.4, 1.4, 2.4]} />
            <meshStandardMaterial color={i % 2 === 0 ? '#5A7260' : '#6A8268'} roughness={0.85} metalness={0.4} />
          </mesh>
          <mesh position={[0, 0.73, 0]}>
            <boxGeometry args={[2.42, 0.14, 2.42]} />
            <meshStandardMaterial color="#FFCC00" emissive="#997700" emissiveIntensity={0.7} />
          </mesh>
        </group>
      ))}

      {/* ── ANTENNA TOWERS (no point lights) ── */}
      {TOWER_POS.map(([x, , z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.18, 0.30, 15, 6]} />
            <meshStandardMaterial color="#5A6478" roughness={0.5} metalness={0.9} />
          </mesh>
          {[4, 8, 12].map(h => (
            <mesh key={h} position={[0, h, 0]}>
              <boxGeometry args={[4, 0.1, 0.1]} />
              <meshStandardMaterial color="#485060" roughness={0.6} metalness={0.9} />
            </mesh>
          ))}
          <mesh position={[0, 14.5, 0]}>
            <sphereGeometry args={[0.24, 7, 7]} />
            <meshStandardMaterial color="#FF2200" emissive="#FF1100" emissiveIntensity={6} />
          </mesh>
        </group>
      ))}

      {/* ── BOLLARDS (emissive only, no point lights) ── */}
      {BOLLARD_Z.map((z, i) => (
        <group key={i}>
          {[-9, 9].map((x, j) => (
            <group key={j} position={[x, 0, z]}>
              <mesh>
                <cylinderGeometry args={[0.14, 0.17, 1.1, 5]} />
                <meshStandardMaterial color="#8A7060" roughness={0.6} metalness={0.4} />
              </mesh>
              <mesh position={[0, 0.65, 0]}>
                <sphereGeometry args={[0.17, 6, 6]} />
                <meshStandardMaterial color="#FF8800" emissive="#FF5500" emissiveIntensity={4} />
              </mesh>
            </group>
          ))}
        </group>
      ))}

      {/* ── HORIZON MOUNTAINS ── */}
      {MOUNT_DATA.map(([x, , z], i) => {
        const h = 38 + i % 3 * 8, r = 26 + i % 4 * 6
        return (
          <mesh key={i} position={[x, h * 0.48, z]}>
            <coneGeometry args={[r, h, 6]} />
            <meshStandardMaterial color={['#C0A880', '#D0B88E', '#B8A070'][i % 3]} roughness={1.0} />
          </mesh>
        )
      })}
    </group>
  )
}

// ─── SCENE ───────────────────────────────────────────────────────────────────
function Scene({ roverStateRef }) {
  const handleUpdate = useCallback(data => {
    if (roverStateRef) roverStateRef.current = data
  }, [roverStateRef])

  useEffect(() => {
    const onKey = e => {
      if (e.code !== 'KeyE') return
      const st = useGameStore.getState()
      if (st.screen !== 'playing' || st.isPaused) return
      const t = st.interactionTarget
      if (!t) return
      if (t.startsWith('core-')) handleCoreCollected(parseInt(t.replace('core-', ''), 10))
      else if (t === 'beacon' && st.coresCollected >= st.totalCores) handleBeaconActivated()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <>
      {/* Lighting — only 2 directional + 1 hemisphere + 1 ambient + 2 point lights total */}
      <hemisphereLight skyColor="#87CEEB" groundColor="#A08860" intensity={1.1} />
      <ambientLight color="#D4B896" intensity={0.45} />
      <directionalLight
        color="#FFE8B0" intensity={2.4}
        position={[40, 70, 60]}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={1}
        shadow-camera-far={300}
        shadow-camera-left={-120}
        shadow-camera-right={120}
        shadow-camera-top={120}
        shadow-camera-bottom={-120}
        shadow-bias={-0.0003}
      />
      <directionalLight color="#6AAECC" intensity={0.55} position={[-60, 30, 20]} />
      <pointLight color="#C8903A" intensity={0.9} distance={35} position={[0, 1.5, 15]} />
      <fog attach="fog" args={['#C8A870', 70, 240]} />

      <Environment />
      <Rover onUpdate={handleUpdate} />
      <Core position={[-12, 0, -82]} coreId={0} />
      <Core position={[15, 0, -120]} coreId={1} />
      <Core position={[6, 0, -148]} coreId={2} />
      <HazardZone />
      <BeaconObj />
      <Camera roverStateRef={roverStateRef} />
    </>
  )
}

// ─── CANVAS ──────────────────────────────────────────────────────────────────
export default function GameCanvas() {
  const roverStateRef = useRef({
    position: new THREE.Vector3(0, 0, 20),
    angle: 0, speed: 0,
  })

  return (
    <Canvas
      shadows
      dpr={1}
      frameloop="always"
      gl={{
        antialias: false,
        powerPreference: 'high-performance',
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.25,
        stencil: false,
        depth: true,
      }}
      camera={{ fov: 58, near: 0.3, far: 500, position: [0, 6, 31] }}
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
      onCreated={({ gl }) => { gl.setClearColor('#C4A870') }}
    >
      <color attach="background" args={['#C4A870']} />
      <Suspense fallback={null}>
        <Scene roverStateRef={roverStateRef} />
      </Suspense>
    </Canvas>
  )
}
