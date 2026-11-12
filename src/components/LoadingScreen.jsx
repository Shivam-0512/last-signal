import '../styles/ui.css'

export default function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="loading-title">LAST SIGNAL</div>
      <div className="loading-bar-wrap">
        <div className="loading-bar-fill" />
      </div>
      <div className="loading-status">INITIALIZING SYSTEMS...</div>
    </div>
  )
}
