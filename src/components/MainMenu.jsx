import useGameStore from '../store/gameStore.js'
import sounds from '../systems/SoundSystem.js'
import SettingsModal from './SettingsModal.jsx'
import AboutModal from './AboutModal.jsx'
import '../styles/ui.css'

export default function MainMenu() {
  const setScreen = useGameStore((s) => s.setScreen)
  const setSettingsOpen = useGameStore((s) => s.setSettingsOpen)
  const setAboutOpen = useGameStore((s) => s.setAboutOpen)

  const handleNewMission = () => {
    sounds.ensureContext()
    sounds.playClick()
    setScreen('briefing')
  }

  const handleOpenSettings = () => {
    sounds.ensureContext()
    sounds.playClick()
    setSettingsOpen(true)
  }

  const handleOpenAbout = () => {
    sounds.ensureContext()
    sounds.playClick()
    setAboutOpen(true)
  }

  return (
    <div className="main-menu">
      <div className="menu-bg-overlay" />
      <div className="menu-scanlines" />

      {/* Cyber military HUD corners */}
      <div className="menu-corner tl">
        SYS://RESCUE-ROVER-MK7
        <br />
        STATUS: OPERATIONAL
      </div>
      <div className="menu-corner tr">
        DATE: 2089.11.07
        <br />
        SECTOR: RESEARCH-07
      </div>
      <div className="menu-corner bl">
        VI3W SYSTEMS v2.1
        <br />
        ENGINE: ONLINE
      </div>
      <div className="menu-corner br">
        SIGNAL LOST: 72H AGO
        <br />
        PRIORITY: CRITICAL
      </div>

      <div className="menu-content">
        <div className="mission-label">MISSION 01 ▸ THE LOST FACILITY</div>
        <h1 className="game-title">LAST SIGNAL</h1>
        <div className="menu-subtitle">"Somewhere beyond the signal, something is waiting."</div>
        <div className="menu-divider" />

        <div className="menu-buttons">
          <button className="btn-primary" onClick={handleNewMission}>
            ▸ NEW MISSION
          </button>
          <button className="btn-secondary" onClick={handleOpenSettings}>
            ⚙ SETTINGS
          </button>
          <button className="btn-secondary" onClick={handleOpenAbout}>
            ℹ ABOUT & VI3W ARCHIVE
          </button>
        </div>
      </div>

      <SettingsModal />
      <AboutModal />
    </div>
  )
}
