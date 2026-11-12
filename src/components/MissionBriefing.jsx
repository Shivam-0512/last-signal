import useGameStore from '../store/gameStore.js'
import '../styles/ui.css'

export default function MissionBriefing() {
  const setScreen = useGameStore(s => s.setScreen)

  return (
    <div className="briefing-screen">
      <div className="briefing-panel">
        <div className="briefing-header">▸ CLASSIFIED BRIEFING // CLEARANCE LEVEL 4</div>
        <div className="briefing-title">MISSION 01: THE LOST FACILITY</div>

        <div className="briefing-row">
          <span className="label">LOCATION</span>
          <span className="value">Research Sector 07 — Arid Zone Delta</span>
        </div>
        <div className="briefing-row">
          <span className="label">STATUS</span>
          <span className="value" style={{color:'var(--color-danger)'}}>COMMUNICATION LOST</span>
        </div>
        <div className="briefing-row">
          <span className="label">TIME LOST</span>
          <span className="value">72 Hours</span>
        </div>
        <div className="briefing-row">
          <span className="label">UNIT DEPLOYED</span>
          <span className="value">Rescue Rover MK-7</span>
        </div>

        <div className="briefing-objectives">
          <div className="obj-title">PRIMARY OBJECTIVES</div>
          <div className="obj-item">Locate and collect three missing energy cores</div>
          <div className="obj-item">Avoid hazardous toxic gas zones</div>
          <div className="obj-item">Activate the emergency communication beacon</div>
          <div className="obj-item">Complete mission within 5-minute time window</div>
        </div>

        <button className="btn-primary" style={{width:'100%', marginTop:'1rem'}} onClick={() => setScreen('playing')}>
          ▸ INITIATE MISSION
        </button>
      </div>
    </div>
  )
}
