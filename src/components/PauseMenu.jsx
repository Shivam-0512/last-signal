import useGameStore from '../store/gameStore.js'
import '../styles/ui.css'

export default function PauseMenu() {
  const { setPaused, resetMission, setScreen } = useGameStore()

  return (
    <div className="pause-overlay">
      <div className="pause-panel">
        <div className="pause-title">PAUSED</div>
        <div className="pause-buttons">
          <button className="btn-primary" onClick={() => setPaused(false)}>▸ RESUME</button>
          <button className="btn-secondary" onClick={resetMission}>RESTART MISSION</button>
          <button className="btn-secondary" onClick={() => setScreen('menu')}>MAIN MENU</button>
        </div>
      </div>
    </div>
  )
}
