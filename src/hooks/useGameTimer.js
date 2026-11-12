import { useEffect, useRef } from 'react'
import useGameStore from '../store/gameStore.js'

export function useGameTimer() {
  const { screen, isPaused, tickTimer } = useGameStore()
  const intervalRef = useRef(null)

  useEffect(() => {
    if (screen === 'playing' && !isPaused) {
      intervalRef.current = setInterval(() => {
        tickTimer()
      }, 1000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [screen, isPaused, tickTimer])
}
