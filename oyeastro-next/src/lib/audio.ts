// Programmatic retro 8-bit sound effects synthesizer using the Web Audio API
// No assets/MP3s required! Light, fast, responsive.

let audioCtx: AudioContext | null = null

function getAudioContext() {
  if (typeof window === 'undefined') return null
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume()
  }
  return audioCtx
}

function isMuted() {
  if (typeof window === 'undefined') return true
  // Checked in local storage and custom window setting
  const storage = localStorage.getItem('oyeastro_game_muted')
  return storage === 'true' || (window as any).__oyeastro_muted === true
}

// Base sound creator
function playSynthSound(
  frequencies: number[],
  duration: number,
  type: OscillatorType = 'sine',
  gainValues: number[] = [0.15, 0]
) {
  try {
    const ctx = getAudioContext()
    if (!ctx || isMuted()) return

    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gainNode = ctx.createGain()

    osc.type = type
    osc.connect(gainNode)
    gainNode.connect(ctx.destination)

    // Setup frequency transitions (for arpeggios or slides)
    if (frequencies.length === 1) {
      osc.frequency.setValueAtTime(frequencies[0], now)
    } else {
      const step = duration / frequencies.length
      frequencies.forEach((freq, idx) => {
        osc.frequency.setValueAtTime(freq, now + idx * step)
      })
    }

    // Setup volume envelope
    gainNode.gain.setValueAtTime(gainValues[0], now)
    gainNode.gain.exponentialRampToValueAtTime(Math.max(gainValues[1], 0.0001), now + duration)

    osc.start(now)
    osc.stop(now + duration)
  } catch (err) {
    // Fail silently to avoid interrupting code execution if audio is blocked or fails
    console.warn('[Audio Synth Failed]:', err)
  }
}

export const audioSystem = {
  playClick() {
    playSynthSound([600], 0.08, 'triangle', [0.1, 0.001])
  },

  playCoin() {
    // Classical retro chime: two short square waves
    const ctx = getAudioContext()
    if (!ctx || isMuted()) return
    const now = ctx.currentTime

    // Note 1: B5 (988Hz)
    playSynthSound([988], 0.1, 'square', [0.08, 0.01])
    
    // Note 2: E6 (1319Hz) slightly delayed
    setTimeout(() => {
      playSynthSound([1319], 0.18, 'square', [0.08, 0.001])
    }, 80)
  },

  playLevelUp() {
    // Quick ascending major arpeggio
    const freqs = [523.25, 659.25, 783.99, 1046.50, 1318.51] // C5, E5, G5, C6, E6
    playSynthSound(freqs, 0.4, 'sine', [0.15, 0.001])
  },

  playUnlock() {
    // Ascending pitch slide (sweep)
    const ctx = getAudioContext()
    if (!ctx || isMuted()) return
    const now = ctx.currentTime

    const osc = ctx.createOscillator()
    const gainNode = ctx.createGain()

    osc.type = 'triangle'
    osc.connect(gainNode)
    gainNode.connect(ctx.destination)

    osc.frequency.setValueAtTime(300, now)
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.3)

    gainNode.gain.setValueAtTime(0.12, now)
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.3)

    osc.start(now)
    osc.stop(now + 0.3)
  },

  playShake() {
    // Low frequency rumbling noise
    playSynthSound([120, 90, 110, 80], 0.15, 'sawtooth', [0.2, 0.01])
  },

  playChestOpen() {
    // Uplifting retro reward tune
    const notes = [659.25, 783.99, 987.77, 1318.51] // E5, G5, B5, E6
    playSynthSound(notes, 0.35, 'square', [0.12, 0.001])
  }
}
