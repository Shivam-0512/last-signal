// Web Audio API Procedural Sound Synthesizer for LAST SIGNAL
// Zero external files, fully responsive, zero-latency, realistic sci-fi effects

class SoundSystem {
  constructor() {
    this.ctx = null
    this.masterGain = null
    this.engineGain = null
    this.engineOsc = null
    this.engineOsc2 = null
    this.engineFilter = null
    this.ambientGain = null
    this.volume = 0.7
    this.muted = false
    this.initialized = false
    this.engineRunning = false
  }

  init() {
    if (this.initialized) return
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext
      if (!AudioContext) return
      this.ctx = new AudioContext()
      this.masterGain = this.ctx.createGain()
      this.masterGain.gain.setValueAtTime(this.muted ? 0 : this.volume, this.ctx.currentTime)
      this.masterGain.connect(this.ctx.destination)

      this.initEngine()
      this.initAmbience()
      this.initialized = true
    } catch (e) {
      console.warn('AudioContext initialization deferred:', e)
    }
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val))
    if (this.masterGain && this.ctx && !this.muted) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime)
    }
  }

  setMuted(muted) {
    this.muted = muted
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : this.volume, this.ctx.currentTime)
    }
  }

  ensureContext() {
    if (!this.initialized) {
      this.init()
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
  }

  // 1. Procedural Engine Sound
  initEngine() {
    if (!this.ctx) return
    this.engineGain = this.ctx.createGain()
    this.engineGain.gain.setValueAtTime(0, this.ctx.currentTime)

    // Sub-harmonic low oscillator
    this.engineOsc = this.ctx.createOscillator()
    this.engineOsc.type = 'sawtooth'
    this.engineOsc.frequency.setValueAtTime(45, this.ctx.currentTime)

    // Secondary oscillator for turbine whine
    this.engineOsc2 = this.ctx.createOscillator()
    this.engineOsc2.type = 'triangle'
    this.engineOsc2.frequency.setValueAtTime(90, this.ctx.currentTime)

    // Low-pass filter for heavy industrial engine body
    this.engineFilter = this.ctx.createBiquadFilter()
    this.engineFilter.type = 'lowpass'
    this.engineFilter.frequency.setValueAtTime(160, this.ctx.currentTime)
    this.engineFilter.Q.setValueAtTime(3, this.ctx.currentTime)

    this.engineOsc.connect(this.engineFilter)
    this.engineOsc2.connect(this.engineFilter)
    this.engineFilter.connect(this.engineGain)
    this.engineGain.connect(this.masterGain)

    this.engineOsc.start()
    this.engineOsc2.start()
  }

  updateEngine(speed, isBoosting) {
    if (!this.initialized || !this.ctx || !this.engineGain) return
    const s = Math.abs(speed || 0)
    const baseGain = s > 0.1 ? Math.min(0.35, 0.08 + s * 0.015) : 0.03
    const boostBonus = isBoosting ? 0.1 : 0
    this.engineGain.gain.setTargetAtTime(baseGain + boostBonus, this.ctx.currentTime, 0.05)

    // Modulate pitch with speed
    const targetFreq = 42 + Math.min(s * 4, 120) * (isBoosting ? 1.4 : 1.0)
    this.engineOsc.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.05)
    this.engineOsc2.frequency.setTargetAtTime(targetFreq * 2.1, this.ctx.currentTime, 0.05)

    // Filter opening
    const filterFreq = 140 + Math.min(s * 25, 600) * (isBoosting ? 1.8 : 1.0)
    this.engineFilter.frequency.setTargetAtTime(filterFreq, this.ctx.currentTime, 0.05)
  }

  stopEngine() {
    if (this.engineGain && this.ctx) {
      this.engineGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.1)
    }
  }

  // 2. Desert Wind & Industrial Ambient Drone
  initAmbience() {
    if (!this.ctx) return
    const bufferSize = this.ctx.sampleRate * 2
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate)
    const output = noiseBuffer.getChannelData(0)
    let lastOut = 0.0
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1
      output[i] = (lastOut + 0.02 * white) / 1.02 // Brown noise (desert wind)
      lastOut = output[i]
      output[i] *= 3.5
    }

    const whiteNoise = this.ctx.createBufferSource()
    whiteNoise.buffer = noiseBuffer
    whiteNoise.loop = true

    const filter = this.ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(260, this.ctx.currentTime)

    this.ambientGain = this.ctx.createGain()
    this.ambientGain.gain.setValueAtTime(0.06, this.ctx.currentTime)

    whiteNoise.connect(filter)
    filter.connect(this.ambientGain)
    this.ambientGain.connect(this.masterGain)
    whiteNoise.start()
  }

  // 3. Energy Core Collect Sound (futuristic sci-fi crystalline chime)
  playCollect() {
    this.ensureContext()
    if (!this.ctx) return

    const now = this.ctx.currentTime
    const freqs = [523.25, 659.25, 783.99, 1046.50] // C5, E5, G5, C6 chord

    freqs.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, now + idx * 0.06)

      gain.gain.setValueAtTime(0, now + idx * 0.06)
      gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.06 + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.5)

      osc.connect(gain)
      gain.connect(this.masterGain)

      osc.start(now + idx * 0.06)
      osc.stop(now + idx * 0.06 + 0.55)
    })
  }

  // 4. Hazard Warning Klaxon (pulsed danger tone)
  playHazardWarning() {
    this.ensureContext()
    if (!this.ctx) return
    const now = this.ctx.currentTime

    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()

    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(700, now)
    osc.frequency.linearRampToValueAtTime(450, now + 0.18)

    gain.gain.setValueAtTime(0.12, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22)

    osc.connect(gain)
    gain.connect(this.masterGain)

    osc.start(now)
    osc.stop(now + 0.24)
  }

  // 5. Beacon Activation Pulse (deep resonant sci-fi energy surge)
  playBeaconActivation() {
    this.ensureContext()
    if (!this.ctx) return
    const now = this.ctx.currentTime

    // Low sub sweep
    const subOsc = this.ctx.createOscillator()
    const subGain = this.ctx.createGain()
    subOsc.type = 'sine'
    subOsc.frequency.setValueAtTime(60, now)
    subOsc.frequency.exponentialRampToValueAtTime(320, now + 1.2)

    subGain.gain.setValueAtTime(0.35, now)
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 1.8)

    subOsc.connect(subGain)
    subGain.connect(this.masterGain)

    subOsc.start(now)
    subOsc.stop(now + 1.9)

    // High harmonic resonance
    const highOsc = this.ctx.createOscillator()
    const highGain = this.ctx.createGain()
    highOsc.type = 'triangle'
    highOsc.frequency.setValueAtTime(440, now + 0.3)
    highOsc.frequency.linearRampToValueAtTime(880, now + 1.4)

    highGain.gain.setValueAtTime(0, now + 0.3)
    highGain.gain.linearRampToValueAtTime(0.2, now + 0.5)
    highGain.gain.exponentialRampToValueAtTime(0.001, now + 2.0)

    highOsc.connect(highGain)
    highGain.connect(this.masterGain)

    highOsc.start(now + 0.3)
    highOsc.stop(now + 2.1)
  }

  // 6. Mission Complete Fanfare (triumphant sci-fi chords)
  playMissionComplete() {
    this.ensureContext()
    if (!this.ctx) return
    const now = this.ctx.currentTime

    const notes = [
      { f: 392.00, t: 0.0, d: 0.3 }, // G4
      { f: 523.25, t: 0.2, d: 0.3 }, // C5
      { f: 659.25, t: 0.4, d: 0.4 }, // E5
      { f: 783.99, t: 0.7, d: 0.8 }, // G5
      { f: 1046.50, t: 1.1, d: 1.2 }, // C6
    ]

    notes.forEach(({ f, t, d }) => {
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(f, now + t)

      gain.gain.setValueAtTime(0, now + t)
      gain.gain.linearRampToValueAtTime(0.25, now + t + 0.04)
      gain.gain.exponentialRampToValueAtTime(0.001, now + t + d)

      osc.connect(gain)
      gain.connect(this.masterGain)

      osc.start(now + t)
      osc.stop(now + t + d + 0.1)
    })
  }

  // 7. Mission Failed Tone
  playGameOver() {
    this.ensureContext()
    if (!this.ctx) return
    const now = this.ctx.currentTime

    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()

    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(220, now)
    osc.frequency.exponentialRampToValueAtTime(55, now + 1.2)

    gain.gain.setValueAtTime(0.2, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.4)

    osc.connect(gain)
    gain.connect(this.masterGain)

    osc.start(now)
    osc.stop(now + 1.5)
  }

  // 8. Cyber UI Click
  playClick() {
    this.ensureContext()
    if (!this.ctx) return
    const now = this.ctx.currentTime
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(1200, now)
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.05)
    gain.gain.setValueAtTime(0.1, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05)
    osc.connect(gain)
    gain.connect(this.masterGain)
    osc.start(now)
    osc.stop(now + 0.06)
  }
}

export const sounds = new SoundSystem()
export default sounds

