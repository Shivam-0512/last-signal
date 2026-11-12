import { useEffect } from 'react'
import useGameStore from '../store/gameStore.js'

export function useInteraction(onInteract) {
  const { screen, isPaused, interactionTarget } = useGameStore()

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'KeyE' && screen === 'playing' && !isPaused && interactionTarget) {
        onInteract?.(interactionTarget)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [screen, isPaused, interactionTarget, onInteract])
}
