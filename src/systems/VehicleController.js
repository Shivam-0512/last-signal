export const ROVER_CONFIG = {
  maxSpeed: 25,
  reverseSpeed: 10,
  acceleration: 0.4,
  deceleration: 0.92,
  steeringSpeed: 0.035,
  steeringDeceleration: 0.85,
  brakeStrength: 0.85,
  boostMultiplier: 1.6,
  wheelRadius: 0.45,
  bodyTiltAmount: 0.04,
  mass: 1,
}

export function updateVehicleState(state, input, delta) {
  const cfg = ROVER_CONFIG
  let { speed, steer, angle, position, boostActive } = state

  const maxSpd = boostActive ? cfg.maxSpeed * cfg.boostMultiplier : cfg.maxSpeed
  const acc = boostActive ? cfg.acceleration * 1.5 : cfg.acceleration

  // Acceleration
  if (input.forward) speed = Math.min(speed + acc, maxSpd)
  else if (input.backward) speed = Math.max(speed - acc, -cfg.reverseSpeed)
  else speed *= cfg.deceleration

  // Braking
  if (input.brake) speed *= cfg.brakeStrength

  // Snap to zero
  if (Math.abs(speed) < 0.05) speed = 0

  // Steering (speed-dependent)
  const speedFactor = Math.min(Math.abs(speed) / cfg.maxSpeed, 1)
  const steerAmt = cfg.steeringSpeed * (0.5 + 0.5 * speedFactor)

  if (input.left && speed !== 0) {
    steer += steerAmt * Math.sign(speed)
  } else if (input.right && speed !== 0) {
    steer -= steerAmt * Math.sign(speed)
  } else {
    steer *= cfg.steeringDeceleration
  }
  steer = Math.max(-0.6, Math.min(0.6, steer))

  // Update angle
  angle += steer

  return { speed, steer, angle }
}

export function getInputState(keys) {
  return {
    forward: keys['KeyW'] || keys['ArrowUp'],
    backward: keys['KeyS'] || keys['ArrowDown'],
    left: keys['KeyA'] || keys['ArrowLeft'],
    right: keys['KeyD'] || keys['ArrowRight'],
    brake: keys[' '] || keys['Space'],
    boost: keys['ShiftLeft'] || keys['ShiftRight'],
    interact: keys['KeyE'],
  }
}
