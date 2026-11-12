import useGameStore from '../store/gameStore.js'
import sounds from '../systems/SoundSystem.js'
import '../styles/ui.css'

export default function SettingsModal() {
  const {
    settingsOpen,
    setSettingsOpen,
    audioVolume,
    setAudioVolume,
    audioMuted,
    setAudioMuted,
  } = useGameStore()

  if (!settingsOpen) return null

  return (
    <div className="modal-backdrop" onClick={() => setSettingsOpen(false)}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-tag">CONFIG // SYS.SETTINGS</span>
          <button className="modal-close" onClick={() => setSettingsOpen(false)}>✕</button>
        </div>

        <div className="modal-title">MISSION PARAMETERS</div>

        <div className="setting-group">
          <div className="setting-row">
            <span className="setting-label">AUDIO SYNTHESIZER</span>
            <button
              className={`toggle-btn ${!audioMuted ? 'active' : ''}`}
              onClick={() => {
                sounds.playClick()
                setAudioMuted(!audioMuted)
              }}
            >
              {audioMuted ? 'MUTED' : 'ENABLED'}
            </button>
          </div>

          <div className="setting-row">
            <span className="setting-label">MASTER VOLUME ({Math.round(audioVolume * 100)}%)</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={audioVolume}
              onChange={(e) => {
                setAudioVolume(parseFloat(e.target.value))
              }}
              className="volume-slider"
            />
          </div>

          <div className="setting-row">
            <span className="setting-label">PHYSICS ENGINE</span>
            <span className="setting-badge">RAPIER 3D (WASM)</span>
          </div>

          <div className="setting-row">
            <span className="setting-label">RENDER PIPELINE</span>
            <span className="setting-badge">ACES FILMIC 60FPS</span>
          </div>

          <div className="setting-row">
            <span className="setting-label">KEYBOARD SCHEME</span>
            <span className="setting-badge">WASD / SPACE / SHIFT / E</span>
          </div>
        </div>

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <button
            className="btn-primary"
            style={{ minWidth: '160px' }}
            onClick={() => {
              sounds.playClick()
              setSettingsOpen(false)
            }}
          >
            CONFIRM
          </button>
        </div>
      </div>
    </div>
  )
}

