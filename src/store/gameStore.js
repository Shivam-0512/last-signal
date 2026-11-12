import { create } from 'zustand'
import sounds from '../systems/SoundSystem.js'

const useGameStore = create((set, get) => ({
  // Screen management
  screen: 'menu', // 'menu' | 'briefing' | 'playing' | 'paused' | 'gameover' | 'complete'
  setScreen: (screen) => {
    sounds.ensureContext()
    if (screen === 'gameover') sounds.playGameOver()
    set({ screen })
  },

  // Modals on Main Menu & HUD
  settingsOpen: false,
  aboutOpen: false,
  setSettingsOpen: (open) => set({ settingsOpen: open }),
  setAboutOpen: (open) => set({ aboutOpen: open }),

  // Audio settings
  audioVolume: 0.7,
  audioMuted: false,
  setAudioVolume: (volume) => {
    sounds.setVolume(volume)
    set({ audioVolume: volume })
  },
  setAudioMuted: (muted) => {
    sounds.setMuted(muted)
    set({ audioMuted: muted })
  },

  // Mission state
  health: 100,
  maxHealth: 100,
  timer: 300, // 5 minutes in seconds
  elapsedTime: 0,
  coresCollected: 0,
  totalCores: 3,
  collectedCoreIds: [],
  beaconActivated: false,
  missionComplete: false,
  isPaused: false,
  inHazardZone: false,
  interactionTarget: null, // null | 'core-0' | 'core-1' | 'core-2' | 'beacon'
  currentObjective: 'Explore the facility and locate energy cores',
  roverSpeed: 0,

  // Actions
  setHealth: (health) => set({ health: Math.max(0, Math.min(100, health)) }),
  drainHealth: (amount) => {
    const h = get().health - amount
    if (h <= 0) {
      sounds.playGameOver()
      set({ health: 0, screen: 'gameover' })
    } else {
      set({ health: h })
    }
  },
  collectCore: (coreId) => {
    const ids = get().collectedCoreIds
    if (coreId !== undefined && ids.includes(coreId)) return
    const newIds = coreId !== undefined ? [...ids, coreId] : [...ids, ids.length]
    const collected = newIds.length
    const total = get().totalCores
    set({
      collectedCoreIds: newIds,
      coresCollected: collected,
      interactionTarget: null,
      currentObjective: collected >= total
        ? 'All cores retrieved! Locate and activate the emergency beacon at Sector E'
        : `Collect energy cores: ${collected}/${total} found`,
    })
  },
  activateBeacon: () => {
    set({
      beaconActivated: true,
      missionComplete: true,
      interactionTarget: null,
      currentObjective: 'Emergency beacon activated. Signal transmission restored.',
      screen: 'complete',
    })
  },
  setTimer: (timer) => set({ timer }),
  tickTimer: () => {
    const { timer, isPaused, screen } = get()
    if (isPaused || screen !== 'playing') return
    if (timer <= 0) {
      sounds.playGameOver()
      set({ screen: 'gameover' })
      return
    }
    set((s) => ({ timer: s.timer - 1, elapsedTime: s.elapsedTime + 1 }))
  },
  setPaused: (isPaused) => {
    sounds.ensureContext()
    if (isPaused) sounds.stopEngine()
    set({ isPaused, screen: isPaused ? 'paused' : 'playing' })
  },
  setInHazardZone: (inHazardZone) => {
    if (inHazardZone && !get().inHazardZone) {
      sounds.playHazardWarning()
    }
    set({ inHazardZone })
  },
  setInteractionTarget: (interactionTarget) => set({ interactionTarget }),
  setRoverSpeed: (roverSpeed) => set({ roverSpeed }),
  resetMission: () => {
    sounds.ensureContext()
    sounds.stopEngine()
    set({
      screen: 'briefing',
      health: 100,
      timer: 300,
      elapsedTime: 0,
      coresCollected: 0,
      collectedCoreIds: [],
      beaconActivated: false,
      missionComplete: false,
      isPaused: false,
      inHazardZone: false,
      interactionTarget: null,
      currentObjective: 'Explore the facility and locate energy cores',
      roverSpeed: 0,
    })
  },
}))

export default useGameStore
