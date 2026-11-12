import { Suspense } from 'react'
import useGameStore from './store/gameStore.js'
import MainMenu from './components/MainMenu.jsx'
import MissionBriefing from './components/MissionBriefing.jsx'
import HUD from './components/HUD.jsx'
import PauseMenu from './components/PauseMenu.jsx'
import GameOver from './components/GameOver.jsx'
import MissionComplete from './components/MissionComplete.jsx'
import LoadingScreen from './components/LoadingScreen.jsx'
import TouchControls from './components/TouchControls.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import GameCanvas from './game/GameCanvas.jsx'
import './styles/global.css'
import './styles/game.css'

export default function App() {
  const screen = useGameStore((s) => s.screen)

  const is3DActive =
    screen === 'playing' ||
    screen === 'paused' ||
    screen === 'gameover' ||
    screen === 'complete'

  return (
    <ErrorBoundary>
      <div className="game-container">
        {/* 3D Scene Layer */}
        {is3DActive && (
          <div className="canvas-wrapper">
            <Suspense fallback={<LoadingScreen />}>
              <GameCanvas />
            </Suspense>
          </div>
        )}

        {/* Screen Interface Overlays */}
        {screen === 'menu' && <MainMenu />}
        {screen === 'briefing' && <MissionBriefing />}
        {(screen === 'playing' || screen === 'paused') && <HUD />}
        {screen === 'playing' && <TouchControls />}
        {screen === 'paused' && <PauseMenu />}
        {screen === 'gameover' && <GameOver />}
        {screen === 'complete' && <MissionComplete />}
      </div>
    </ErrorBoundary>
  )
}

