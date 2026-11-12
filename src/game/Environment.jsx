import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'

// Rock formation component
function Rock({ position, scale, rotation }) {
  return (
    <mesh position={position} scale={scale} rotation={rotation} castShadow receiveShadow>
      <dodecahedronGeometry args={[1, 1]} />
      <meshStandardMaterial color="#4A4A4A" roughness={0.95} metalness={0.05} />
    </mesh>
  )
}

// Dust particle system
function DustParticles() {
  const count = 200
  const meshRef = useRef()

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 180
      pos[i * 3 + 1] = Math.random() * 15
      pos[i * 3 + 2] = (Math.random() - 0.5) * 180
    }
    return pos
  }, [count])

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.015
    }
  })

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#C8A882" size={0.18} transparent opacity={0.4} depthWrite={false} />
    </points>
  )
}

// Terrain
function Terrain() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[240, 240, 2, 2]} />
      <meshStandardMaterial color="#8B7355" roughness={0.9} metalness={0.02} />
    </mesh>
  )
}

// Industrial pathway / road
function PathWay() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, -70]} receiveShadow>
      <planeGeometry args={[12, 165]} />
      <meshStandardMaterial color="#554B3B" roughness={0.95} metalness={0.05} />
    </mesh>
  )
}

export default function Environment() {
  const rocks = useMemo(() => {
    const r = []
    const positions = [
      [-30, 0, -20], [35, 0, -15], [-40, 0, -50], [38, 0, -60],
      [-35, 0, -90], [40, 0, -85], [-38, 0, -130], [42, 0, -140],
      [-20, 0, 15], [25, 0, 10], [-50, 0, -30], [52, 0, -40],
      [-45, 0, -70], [48, 0, -100], [-42, 0, -110], [50, 0, -120],
      [0, 0, 30], [-15, 0, -170], [20, 0, -165],
    ]
    positions.forEach(([x, y, z], i) => {
      const size = 1.5 + Math.random() * 3
      r.push({
        id: `rock-${i}`,
        position: [x + (Math.random() - 0.5) * 5, y + size * 0.4, z + (Math.random() - 0.5) * 5],
        scale: [size, size * (0.6 + Math.random() * 0.5), size * (0.8 + Math.random() * 0.4)],
        rotation: [Math.random() * 0.5, Math.random() * Math.PI * 2, Math.random() * 0.3],
      })
    })
    return r
  }, [])

  return (
    <group>
      <Terrain />
      <PathWay />
      {rocks.map((rock) => (
        <Rock
          key={rock.id}
          position={rock.position}
          scale={rock.scale}
          rotation={rock.rotation}
        />
      ))}
      <DustParticles />
    </group>
  )
}
