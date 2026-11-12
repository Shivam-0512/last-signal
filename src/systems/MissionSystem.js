// Mission System for LAST SIGNAL
// Handles objectives, zone transitions, hazard verification, and beacon activation

import useGameStore from '../store/gameStore.js'
import sounds from './SoundSystem.js'

export const OBJECTIVES = {
  EXPLORE: 'Explore the facility and locate 3 energy cores',
  COLLECT_MORE: (found, total) => `Recover remaining energy cores: ${found}/${total} retrieved`,
  ACTIVATE_BEACON: 'All cores retrieved! Locate and activate the emergency beacon at Sector E',
  COMPLETE: 'Emergency beacon activated. Signal transmission restored.',
}

export function handleCoreCollected(coreId) {
  const store = useGameStore.getState()
  sounds.playCollect()
  store.collectCore(coreId)
}

export function handleBeaconActivated() {
  const store = useGameStore.getState()
  sounds.playBeaconActivation()
  store.activateBeacon()
  setTimeout(() => {
    sounds.playMissionComplete()
  }, 1200)
}

