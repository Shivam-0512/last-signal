// World.jsx - Base world (Rover/Collectibles/Hazard/Beacon added by integrator)
import { Suspense } from 'react'
import Environment from './Environment.jsx'
import Lighting from './Lighting.jsx'
import Building from '../entities/Building.jsx'

export default function World() {
  return (
    <Suspense fallback={null}>
      <Lighting />
      <fog attach="fog" args={['#C8A882', 60, 200]} />
      <color attach="background" args={['#8A6A4A']} />
      <Environment />
      <Building />
    </Suspense>
  )
}
