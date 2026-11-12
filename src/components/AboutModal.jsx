import useGameStore from '../store/gameStore.js'
import sounds from '../systems/SoundSystem.js'
import '../styles/ui.css'

export default function AboutModal() {
  const { aboutOpen, setAboutOpen } = useGameStore()

  if (!aboutOpen) return null

  return (
    <div className="modal-backdrop" onClick={() => setAboutOpen(false)}>
      <div className="modal-panel about-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-tag">TRANSMISSION // VI3W SHOWCASE</span>
          <button className="modal-close" onClick={() => setAboutOpen(false)}>✕</button>
        </div>

        <div className="modal-title">LAST SIGNAL — PROJECT ARCHIVE</div>

        <div className="about-content">
          <p className="about-text">
            <strong>LAST SIGNAL</strong> is a premium realistic 3D sci-fi rover exploration game
            built to demonstrate next-generation 3D game asset workflows powered by{' '}
            <a href="https://app.vi3w.in" target="_blank" rel="noreferrer" className="about-link">
              VI3W (app.vi3w.in)
            </a>.
          </p>

          <div className="about-section">
            <div className="about-section-title">▸ THE VI3W 3D PIPELINE</div>
            <p className="about-text">
              VI3W transforms 2D sketches and concept art into production-ready 3D game models.
              In this game, key mission objects (Rescue Rover MK-7, Research Facility 07, Quantum Energy Cores,
              Transmission Beacon, and Industrial Storage Crates) are architected for direct plug-and-play
              replacement with models exported from VI3W.
            </p>
          </div>

          <div className="about-section">
            <div className="about-section-title">▸ MISSION 01 BRIEFING</div>
            <p className="about-text">
              <strong>Year:</strong> 2089<br />
              <strong>Sector:</strong> Arid Research Sector 07<br />
              <strong>Incident:</strong> Sudden signal silence following advanced quantum energy experiments.<br />
              <strong>Assignment:</strong> Navigate the MK-7 autonomous rover, recover three scattered energy cores,
              survive the toxic corridor, and restore the emergency distress beacon.
            </p>
          </div>

          <div className="about-section">
            <div className="about-section-title">▸ TECHNICAL STACK</div>
            <p className="about-text">
              React 19, Three.js, React Three Fiber, @react-three/rapier (WASM physics), Zustand, Web Audio API synthesis.
            </p>
          </div>
        </div>

        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <button
            className="btn-primary"
            style={{ minWidth: '160px' }}
            onClick={() => {
              sounds.playClick()
              setAboutOpen(false)
            }}
          >
            DISMISS
          </button>
        </div>
      </div>
    </div>
  )
}

