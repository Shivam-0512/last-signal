import useGameStore from '../store/gameStore.js'
import '../styles/ui.css'

export default function GameOver() {
  const { resetMission, setScreen, coresCollected, totalCores, elapsedTime } = useGameStore()

  const minutes = Math.floor(elapsedTime / 60).toString().padStart(2,'0')
  const seconds = (elapsedTime % 60).toString().padStart(2,'0')

  return (
    <div className="gameover-screen">
      <div className="gameover-panel" style={{position:'relative'}}>
        <div className="gameover-title">MISSION FAILED</div>
        <div className="gameover-subtitle">ROVER SYSTEMS OFFLINE</div>
        <div className="complete-stats">
          <div className="stat-row">
            <span className="stat-label">TIME ACTIVE</span>
            <span className="stat-value">{minutes}:{seconds}</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">CORES RECOVERED</span>
            <span className="stat-value">{coresCollected}/{totalCores}</span>
          </div>
        </div>
        <div className="pause-buttons">
          <button className="btn-primary" onClick={resetMission}>RESTART MISSION</button>
          <button className="btn-secondary" onClick={() => setScreen('menu')}>MAIN MENU</button>
        </div>
      </div>
    </div>
  )
}
