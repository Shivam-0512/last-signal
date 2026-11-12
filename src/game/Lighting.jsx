import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function Lighting() {
  const sunRef = useRef()
  return (
    <>
      <hemisphereLight
        skyColor="#3A5A8A"
        groundColor="#6A5030"
        intensity={0.6}
      />
      <ambientLight color="#2A3A4A" intensity={0.4} />
      <directionalLight
        ref={sunRef}
        color="#FFF5D6"
        intensity={1.8}
        position={[50, 80, 30]}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={1}
        shadow-camera-far={300}
        shadow-camera-left={-120}
        shadow-camera-right={120}
        shadow-camera-top={120}
        shadow-camera-bottom={-120}
        shadow-bias={-0.0005}
      />
      {/* Fill light from opposite side */}
      <directionalLight color="#2A4A6A" intensity={0.3} position={[-30, 20, -50]} />
      {/* Warm bounce light from ground */}
      <pointLight color="#6A4A20" intensity={0.5} position={[0, 2, 0]} distance={80} />
    </>
  )
}
