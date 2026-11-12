import useGameStore from '../store/gameStore.js'
import '../styles/ui.css'

export default function MissionComplete() {
  const { resetMission, setScreen, coresCollected, totalCores, elapsedTime } = useGameStore()

  const minutes = Math.floor(elapsedTime / 60).toString().padStart(2,'0')
  const seconds = (elapsedTime % 60).toString().padStart(2,'0')

  return (
    <div className="complete-screen">
      <div className="complete-panel">
        <div className="complete-title">MISSION COMPLETE</div>
        <div className="complete-subtitle">▸ SIGNAL RESTORED ◂</div>
        <div className="complete-stats">
          <div className="stat-row">
            <span className="stat-label">TIME TAKEN</span>
            <span className="stat-value">{minutes}:{seconds}</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">ENERGY CORES</span>
            <span className="stat-value">{coresCollected}/{totalCores}</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">MISSION STATUS</span>
            <span className="stat-value" style={{color:'var(--color-primary)'}}>SUCCESS</span>
          </div>
        </div>
        <div className="pause-buttons">
          <button className="btn-primary" onClick={resetMission}>PLAY AGAIN</button>
          <button className="btn-secondary" onClick={() => setScreen('menu')}>MAIN MENU</button>
        </div>
      </div>
    </div>
  )
}
