import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

const desiredPos = new THREE.Vector3()
const lookTarget = new THREE.Vector3()
const currentTarget = new THREE.Vector3(0, 1.5, 10)

export default function CameraController({ roverStateRef }) {
  const { camera } = useThree()
  const initialized = useRef(false)

  // Camera settings
  const DISTANCE = 11.0
  const HEIGHT = 5.2
  const LERP_POS = 0.08
  const LERP_LOOK = 0.1
  const LOOK_AHEAD = 4.0

  useFrame(() => {
    if (!roverStateRef?.current) return
    const { position, angle } = roverStateRef.current

    if (!position) return

    const sinA = Math.sin(angle)
    const cosA = Math.cos(angle)

    // Camera sits behind the rover along its heading
    desiredPos.set(
      position.x + sinA * DISTANCE,
      position.y + HEIGHT,
      position.z + cosA * DISTANCE
    )

    // Camera looks at point ahead of rover
    lookTarget.set(
      position.x - sinA * LOOK_AHEAD,
      position.y + 1.6,
      position.z - cosA * LOOK_AHEAD
    )

    if (!initialized.current) {
      camera.position.copy(desiredPos)
      currentTarget.copy(lookTarget)
      camera.lookAt(currentTarget)
      initialized.current = true
      return
    }

    // Smoothly interpolate position and lookAt target
    camera.position.lerp(desiredPos, LERP_POS)
    currentTarget.lerp(lookTarget, LERP_LOOK)
    camera.lookAt(currentTarget)
  })

  return null
}
