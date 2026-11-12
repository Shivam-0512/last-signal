// VI3W Asset Integration Configuration
// Set hasModel: true and place the GLB file in public/assets/models/
// to use VI3W-generated models instead of placeholder geometry

export const ASSETS = {
  rover: {
    path: '/assets/models/rover.glb',
    hasModel: false,
    description: 'Autonomous rescue rover - 4-wheel rugged vehicle with sensor mast',
  },
  facility: {
    path: '/assets/models/facility.glb',
    hasModel: false,
    description: 'Abandoned sci-fi research facility building - industrial design',
  },
  energyCore: {
    path: '/assets/models/energy-core.glb',
    hasModel: false,
    description: 'Glowing energy core collectible - cylindrical with cyan glow',
  },
  beacon: {
    path: '/assets/models/beacon.glb',
    hasModel: false,
    description: 'Emergency communication beacon - tall antenna with rotating dish',
  },
  crate: {
    path: '/assets/models/crate.glb',
    hasModel: false,
    description: 'Industrial storage crate/container - weathered metal',
  },
}

// Instructions for VI3W asset replacement:
// 1. Generate model on https://app.vi3w.in
// 2. Export as GLB format
// 3. Place in public/assets/models/<filename>.glb
// 4. Set hasModel: true for the corresponding entry above
// 5. The game will automatically use the GLB instead of the placeholder
