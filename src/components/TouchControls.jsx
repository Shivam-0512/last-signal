import { useEffect, useState } from 'react'
import useGameStore from '../store/gameStore.js'
import { handleCoreCollected, handleBeaconActivated } from '../systems/MissionSystem.js'
import '../styles/ui.css'

export default function TouchControls() {
  const [isTouchDevice, setIsTouchDevice] = useState(false)
  const screen = useGameStore((s) => s.screen)
  const interactionTarget = useGameStore((s) => s.interactionTarget)

  useEffect(() => {
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth < 1024
    setIsTouchDevice(hasTouch)
  }, [])

  if (!isTouchDevice || screen !== 'playing') return null

  const dispatchKey = (code, type) => {
    window.dispatchEvent(new KeyboardEvent(type, { code, bubbles: true }))
  }

  const handleInteract = () => {
    const state = useGameStore.getState()
    const target = state.interactionTarget
    if (!target) return
    if (target.startsWith('core-')) {
      const coreId = parseInt(target.replace('core-', ''), 10)
      handleCoreCollected(coreId)
    } else if (target === 'beacon' && state.coresCollected >= state.totalCores) {
      handleBeaconActivated()
    }
  }

  return (
    <div className="touch-controls-layer">
      {/* D-Pad Left */}
      <div className="touch-group touch-left">
        <button
          className="touch-btn"
          onTouchStart={() => dispatchKey('KeyA', 'keydown')}
          onTouchEnd={() => dispatchKey('KeyA', 'keyup')}
          onMouseDown={() => dispatchKey('KeyA', 'keydown')}
          onMouseUp={() => dispatchKey('KeyA', 'keyup')}
        >
          ◄
        </button>
        <button
          className="touch-btn"
          onTouchStart={() => dispatchKey('KeyD', 'keydown')}
          onTouchEnd={() => dispatchKey('KeyD', 'keyup')}
          onMouseDown={() => dispatchKey('KeyD', 'keydown')}
          onMouseUp={() => dispatchKey('KeyD', 'keyup')}
        >
          ►
        </button>
      </div>

      {/* Action Pedals Right */}
      <div className="touch-group touch-right">
        {interactionTarget && (
          <button className="touch-btn action-interact" onClick={handleInteract}>
            [E]
          </button>
        )}
        <button
          className="touch-btn action-brake"
          onTouchStart={() => dispatchKey('Space', 'keydown')}
          onTouchEnd={() => dispatchKey('Space', 'keyup')}
          onMouseDown={() => dispatchKey('Space', 'keydown')}
          onMouseUp={() => dispatchKey('Space', 'keyup')}
        >
          STOP
        </button>
        <button
          className="touch-btn action-reverse"
          onTouchStart={() => dispatchKey('KeyS', 'keydown')}
          onTouchEnd={() => dispatchKey('KeyS', 'keyup')}
          onMouseDown={() => dispatchKey('KeyS', 'keydown')}
          onMouseUp={() => dispatchKey('KeyS', 'keyup')}
        >
          REV
        </button>
        <button
          className="touch-btn action-drive"
          onTouchStart={() => dispatchKey('KeyW', 'keydown')}
          onTouchEnd={() => dispatchKey('KeyW', 'keyup')}
          onMouseDown={() => dispatchKey('KeyW', 'keydown')}
          onMouseUp={() => dispatchKey('KeyW', 'keyup')}
        >
          DRIVE
        </button>
      </div>
    </div>
  )
}

