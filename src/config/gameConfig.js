export const ROVER_CONFIG = {
  maxSpeed: 25,
  acceleration: 0.4,
  deceleration: 0.92,
  reverseSpeed: 10,
  steeringSpeed: 0.035,
  steeringDeceleration: 0.85,
  brakeStrength: 0.85,
  boostMultiplier: 1.6,
  boostDuration: 2000,
  mass: 800,
  wheelRadius: 0.45,
}

export const CAMERA_CONFIG = {
  distance: 12,
  height: 5,
  lerpFactor: 0.08,
  lookAheadFactor: 0.3,
}

export const HEALTH_CONFIG = {
  maxHealth: 100,
  hazardDrainRate: 8,   // per second
  drainInterval: 100,    // ms
}

export const MISSION_CONFIG = {
  timeLimit: 300,        // seconds
  coreCount: 3,
  interactionRadius: 5,
  beaconActiveAfterCores: 3,
}

export const WORLD_CONFIG = {
  terrainSize: 200,
  fogNear: 60,
  fogFar: 200,
  fogColor: '#C8A882',
}

export const COLORS = {
  // Environment
  terrain: '#8B7355',
  rock: '#5C5C5C',
  building: '#2A2A2E',
  crate: '#3A4A3A',
  // Game objects
  core: '#00FFAA',
  coreGlow: '#00FFAA',
  beacon: '#00FFCC',
  hazard: '#FF4400',
  warning: '#FFAA00',
  health: '#66FF44',
  // Lighting
  sunColor: '#FFF5D6',
  ambientColor: '#3A4A6A',
}

export const ZONE_POSITIONS = {
  roverStart: [0, 1, 20],
  cores: [
    [-8, 1, -80],   // Zone C - facility
    [15, 1, -120],  // Zone D - hazard
    [0, 1, -150],   // Zone E - comms
  ],
  beacon: [0, 1, -158],
  hazardZone: { center: [15, 0, -120], radius: 20 },
}
