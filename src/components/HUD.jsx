import { useGameTimer } from '../hooks/useGameTimer.js'
import useGameStore from '../store/gameStore.js'
import '../styles/ui.css'

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

export default function HUD() {
  useGameTimer()
  const { health, timer, coresCollected, totalCores, currentObjective, inHazardZone, interactionTarget, roverSpeed, screen } = useGameStore()

  if (screen !== 'playing') return null

  const healthPct = Math.round(health)
  const healthColor = health > 60 ? 'var(--color-health)' : health > 30 ? 'var(--color-warning)' : 'var(--color-danger)'
  const timerClass = timer < 60 ? 'danger' : timer < 120 ? 'warning' : ''

  return (
    <div className="hud-root">
      {/* Top Left - Mission Info */}
      <div className="hud-panel hud-tl">
        <div className="hud-mission-title">▸ MISSION 01: THE LOST FACILITY</div>
        <div className="hud-objective">{currentObjective}</div>
        <div className="hud-cores">⬡ ENERGY CORES: {coresCollected}/{totalCores}</div>
      </div>

      {/* Top Right - Stats */}
      <div className="hud-panel hud-tr">
        <div style={{marginBottom:'0.5rem'}}>
          <div className="hud-label">MISSION TIME</div>
          <div className={`hud-value ${timerClass}`}>{formatTime(timer)}</div>
        </div>
        <div style={{marginBottom:'0.5rem'}}>
          <div className="hud-label">HULL INTEGRITY</div>
          <div className="hud-value" style={{color: healthColor}}>{healthPct}%</div>
          <div className="health-bar">
            <div className="health-bar-fill" style={{width:`${healthPct}%`, background: healthColor}} />
          </div>
        </div>
        <div>
          <div className="hud-label">VELOCITY</div>
          <div className="hud-value">{Math.abs(Math.round(roverSpeed))} KM/H</div>
        </div>
      </div>

      {/* Bottom Left - Controls */}
      <div className="hud-panel hud-bl">
        <div className="hud-controls">
          <span className="key">W/S</span> DRIVE &nbsp;
          <span className="key">A/D</span> STEER<br/>
          <span className="key">SPACE</span> BRAKE &nbsp;
          <span className="key">SHIFT</span> BOOST<br/>
          <span className="key">E</span> INTERACT &nbsp;
          <span className="key">ESC</span> PAUSE
        </div>
      </div>

      {/* Interaction Prompt */}
      {interactionTarget && (
        <div className="interaction-prompt">
          [ E ] {interactionTarget === 'beacon' ? 'ACTIVATE BEACON' : 'COLLECT ENERGY CORE'}
        </div>
      )}

      {/* Hazard Warning */}
      {inHazardZone && (
        <div className="hazard-warning">⚠ TOXIC ATMOSPHERE DETECTED ⚠</div>
      )}
    </div>
  )
}
