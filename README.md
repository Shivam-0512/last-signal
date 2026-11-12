# LAST SIGNAL
### Mission 01 — THE LOST FACILITY
*A Premium Browser-Based 3D Sci-Fi Rover Exploration Game & VI3W Integration Showcase*

---

## 1. Game Overview

**Year:** 2089  
**Sector:** Research Sector 07 — Arid Zone Delta  
**Status:** Incident Unexplained — Transmission Lost 72 Hours Ago  

You pilot the **MK-7 Autonomous Rescue Rover**, deployed into the barren perimeter of an abandoned research installation. The facility was conducting high-energy quantum containment experiments when all communication ceased. 

Your objective is to navigate the rugged desert terrain, locate and recover **three missing Quantum Energy Cores**, navigate hazardous toxic contamination corridors, and reach the high-gain transmission sector to **activate the Emergency Distress Beacon**.

---

## 2. Key Features

- **Realistic Atmospheric 3D World:** Desert dust particle systems, naturalistic rock formations, industrial facility compounds, ruined perimeter barricades, communication towers, dynamic shadows, and ACES Filmic tone mapping.
- **Physics-Driven Vehicle Controller:** Responsive arcade vehicle dynamics with forward/reverse acceleration, braking, speed-dependent steering geometry, speed boost (Shift), dynamic chassis banking, and wheel rotation animations.
- **Third-Person Cinematic Follow Camera:** Smooth lerped camera positioning with heading projection and look-ahead targeting.
- **Full Mission Progression Loop:**
  1. *Zone A — Starting Perimeter:* Rover deployment outside the compound.
  2. *Zone B — Industrial Perimeter:* Outer defense walls, cargo crates, and abandoned machinery.
  3. *Zone C — Research Facility:* Central compound containing **Energy Core 01**.
  4. *Zone D — Toxic Hazard Trench:* Gas hazard zone with atmospheric alerts and hull degradation containing **Energy Core 02**.
  5. *Zone E — Communications Sector:* High-altitude transmitter mast containing **Energy Core 03** and the **Emergency Beacon**.
- **Interactive Military-Industrial HUD:** Hull integrity bar, real-time speedometer, mission countdown clock, core recovery counter, contextual `[ E ]` interaction prompts, and toxic hazard alert banners.
- **Synthesized Web Audio Soundscape:** Built-in procedural audio engine using the Web Audio API (rover turbine engine with speed-dependent pitch, booster rocket hiss, harmonic pickup chimes, danger klaxons, beacon activation power-up surge, and victory fanfares) — zero external audio assets required, guaranteed instant playback.
- **Dual Input Architecture:** Full desktop keyboard support (WASD, Space, Shift, E, Esc) and touch/mobile on-screen controls for smaller screens and tablets.
- **VI3W Model Integration Architecture:** Model components are structured to swap procedural Three.js geometry with GLB 3D assets generated on [VI3W (app.vi3w.in)](https://app.vi3w.in).

---

## 3. Technology Stack

- **React 19**
- **Vite 6**
- **Three.js (r169+)**
- **React Three Fiber (R3F)**
- **@react-three/drei**
- **@react-three/rapier** (WASM-powered Rapier 3D physics engine)
- **Zustand 5** (High-performance global game state)
- **Web Audio API** (Procedural zero-dependency sci-fi sound synthesis)
- **CSS3** (Cyber-industrial responsive interface with scanlines and glow effects)

---

## 4. Controls

| Key | Action |
|---|---|
| `W` / `↑` | Accelerate Forward |
| `S` / `↓` | Reverse |
| `A` / `←` | Steer Left |
| `D` / `→` | Steer Right |
| `SPACE` | Handbrake |
| `SHIFT` | Speed Boost (Turbine Overdrive) |
| `E` | Contextual Interaction (Collect Core / Activate Beacon) |
| `ESC` | Pause / Resume Game |

*On touch-enabled devices or screens under 1024px, an on-screen D-pad and drive/brake buttons appear automatically.*

---

## 5. Project Architecture

```
game/
├── public/
│   └── assets/
│       ├── models/          # Target folder for VI3W exported GLB assets
│       │   ├── rover.glb
│       │   ├── facility.glb
│       │   ├── energy-core.glb
│       │   ├── beacon.glb
│       │   └── crate.glb
│       ├── textures/
│       └── audio/
├── src/
│   ├── components/
│   │   ├── MainMenu.jsx         # Opening screen with New Mission, Settings, About
│   │   ├── MissionBriefing.jsx  # Classified mission parameters & objectives
│   │   ├── HUD.jsx              # In-game telemetry, hull integrity, objective trackers
│   │   ├── PauseMenu.jsx        # Pause modal with resume, restart, and menu actions
│   │   ├── GameOver.jsx         # Hull collapse / timer expiration screen
│   │   ├── MissionComplete.jsx  # Mission success screen with elapsed time and statistics
│   │   ├── LoadingScreen.jsx    # System initialization screen
│   │   ├── SettingsModal.jsx    # Master volume, audio synthesizer toggle, engine diagnostics
│   │   ├── AboutModal.jsx       # Project background and VI3W pipeline archive
│   │   └── TouchControls.jsx    # Responsive mobile/tablet touch control overlay
│   ├── config/
│   │   ├── gameConfig.js        # Vehicle, world, lighting, and mission constants
│   │   └── assetConfig.js       # VI3W model registration & swap toggles
│   ├── entities/
│   │   ├── Rover.jsx            # Kinematic physics entity with heading & banking
│   │   ├── RoverModel.jsx       # High-detail 4-wheel rover with sensor mast & wheels
│   │   ├── Collectible.jsx      # Animated quantum energy core with proximity detection
│   │   ├── Hazard.jsx           # Volumetric toxic hazard zone with hull drain
│   │   ├── Beacon.jsx           # Satellite beacon with animated dish & laser beam
│   │   ├── Building.jsx         # Research facility compound, walls, antenna, and crates
│   │   └── GroundCollider.jsx   # Fixed Rapier physics ground collider
│   ├── game/
│   │   ├── GameCanvas.jsx       # Three.js Canvas root with Rapier Physics & interaction
│   │   ├── Lighting.jsx         # Cinematic directional sun, hemisphere, and bounce lights
│   │   ├── Environment.jsx      # Height-displaced terrain, rock formations, and dust particles
│   │   └── CameraController.jsx # Third-person lerped follow camera with look-ahead
│   ├── hooks/
│   │   ├── useGameTimer.js      # Mission countdown and elapsed time interval hook
│   │   └── useInteraction.js    # Keyboard interaction binding hook
│   ├── store/
│   │   └── gameStore.js         # Zustand global state (screens, health, cores, objectives)
│   ├── styles/
│   │   ├── global.css           # CSS reset and military-industrial palette variables
│   │   ├── game.css             # Fullscreen canvas styling
│   │   └── ui.css               # Scanline overlays, cyber HUD panels, modals, and animations
│   ├── systems/
│   │   ├── VehicleController.js # Pure math vehicle dynamics and steering calculations
│   │   ├── MissionSystem.js     # Mission state transitions and milestone triggers
│   │   └── SoundSystem.js       # Web Audio API procedural synthesizer
│   ├── App.jsx                  # Main application orchestrator
│   └── main.jsx                 # React root mount
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

---

## 6. VI3W Asset Generation & Integration Workflow

This project is built to demonstrate how 3D assets generated on [VI3W](https://app.vi3w.in) can be integrated into an interactive React Three Fiber game.

### What is VI3W?
VI3W is an AI-powered sketch-to-image-to-3D generation platform that allows designers to sketch a concept, generate photorealistic visuals, and transform them into textured 3D meshes ready for real-time game engines.

### Recommended VI3W Generation Prompts

| Target Asset | VI3W Concept / Prompt | Target Filename |
|---|---|---|
| **Rescue Rover** | *"Heavy industrial 4-wheel planetary exploration rover, dark charcoal armor, reinforced front bumper, sensor camera mast, emergency green accents, rugged off-road tires, hard surface sci-fi, 8k"* | `public/assets/models/rover.glb` |
| **Research Facility** | *"Brutalist sci-fi modular research station building, weathered steel panels, industrial entrance bay, reinforced rooftop equipment, communications dish, dark grey and gunmetal"* | `public/assets/models/facility.glb` |
| **Quantum Energy Core** | *"Futuristic sci-fi energy battery core, floating cyan crystal cylinder, metallic containment rings, glowing emissive runes, high tech"* | `public/assets/models/energy-core.glb` |
| **Emergency Beacon** | *"Sci-fi transmission communications tower, large parabolic satellite dish, support truss structure, industrial antenna, cyan status light beacon"* | `public/assets/models/beacon.glb` |
| **Industrial Crate** | *"Military sci-fi cargo container, weathered olive drab metal, reinforced corner brackets, locking latches, stencil markings"* | `public/assets/models/crate.glb` |

### Step-by-Step Integration Guide

1. **Generate the Asset on VI3W:**
   - Go to [https://app.vi3w.in](https://app.vi3w.in)
   - Sketch or upload your concept outline
   - Generate the 2D concept render
   - Generate the corresponding 3D model
2. **Export as GLB:**
   - Download the generated 3D model in `.glb` format
3. **Place the File in the Project:**
   - Copy the exported file to `public/assets/models/` using the corresponding filename (e.g. `rover.glb`, `facility.glb`, `energy-core.glb`, `beacon.glb`, `crate.glb`)
4. **Activate in `src/config/assetConfig.js`:**
   - Open `src/config/assetConfig.js` and set `hasModel: true` for the corresponding asset:
   ```javascript
   export const ASSETS = {
     rover: {
       path: '/assets/models/rover.glb',
       hasModel: true, // <-- set to true
       description: 'Autonomous rescue rover - 4-wheel rugged vehicle with sensor mast',
     },
     // ...
   }
   ```
5. **No Gameplay Code Rewriting Required:**
   - The game architecture decouples physical collision hulls and gameplay state from the visual representation.
   - When `hasModel: false` (or if the file is absent), the game automatically renders high-detail procedural Three.js geometry placeholders.
   - When `hasModel: true`, the GLB model is loaded seamlessly via `@react-three/drei`'s `useGLTF` hook while preserving all physics, sensors, wheel dynamics, and interactions.

---

## 7. Local Setup & Execution

### Prerequisites
- Node.js 18.x or 20.x+
- npm 9.x or 10.x+

### Installation
```bash
git clone <repository-url>
cd game
npm install
```

### Launch Development Server
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173/`.

### Production Build
```bash
npm run build
```
The optimized production bundle will be generated in the `dist/` directory.

### Preview Production Build
```bash
npm run preview
```

---

## 8. Mission Objectives & Walkthrough

1. **Deploy:** Start in Sector 07. Familiarize yourself with the rover handling (`W`/`S` for throttle, `A`/`D` to turn, `Shift` for boost).
2. **Zone B — Industrial Perimeter:** Drive north past the barricades and cargo containers.
3. **Core 01 (Zone C):** Approach the central Research Compound courtyard `[-12, 0, -82]`. Get within range until the HUD displays `[ E ] COLLECT ENERGY CORE`, then press `E`.
4. **Core 02 (Zone D):** Enter the toxic hazard trench `[15, 0, -120]`. Maintain vehicle speed to minimize toxic gas exposure and avoid complete hull failure. Collect the second core with `E`.
5. **Core 03 (Zone E):** Proceed to the northern communication sector `[6, 0, -148]` and collect the final core.
6. **Activate the Beacon:** With all 3 cores recovered, drive up to the massive satellite transmission tower `[0, 0, -158]`. The prompt will update to `[ E ] ACTIVATE BEACON`. Press `E` to initiate transmission and complete Mission 01!

---

*LAST SIGNAL © 2089 — Powered by VI3W (app.vi3w.in)*

