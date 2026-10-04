/**
 * Romantic Ambient Music Generator using Web Audio API
 * Plays a gentle, peaceful romantic music-box / piano chord progression
 * Completely offline, zero external dependencies or broken links
 */

class RomanticAudioEngine {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.timer = null;
    this.currentStep = 0;
    
    // Romantic Chord Progression: Cmaj9 -> Am9 -> Fmaj7 -> Gsus4 -> Cmaj9
    // Frequency table for notes (Hz)
    this.notes = {
      'C3': 130.81, 'E3': 164.81, 'G3': 196.00, 'B3': 246.94,
      'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00, 'A4': 440.00, 'B4': 493.88,
      'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'G5': 783.99, 'A5': 880.00
    };

    this.patterns = [
      // Chord 1: Cmaj9 (C - G - B - E - G)
      ['C3', 'G3', 'B3', 'E4', 'G4', 'B4', 'E5'],
      // Chord 2: Am9 (A - E - G - C - E)
      ['A4', 'E4', 'G4', 'C5', 'E5', 'C4', 'A4'],
      // Chord 3: Fmaj7 (F - C - E - A - C)
      ['F4', 'C4', 'E4', 'A4', 'C5', 'E4', 'G4'],
      // Chord 4: Gsus4 / Gadd9 (G - D - G - B - D)
      ['G4', 'D4', 'G4', 'B4', 'D5', 'G4', 'B3']
    ];
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playNote(freq, duration = 2.4, velocity = 0.12) {
    if (!this.ctx) return;
    
    const now = this.ctx.currentTime;
    
    // Main Oscillator (Warm Sine + subtle Triangle for bell/music-box chime)
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    osc1.type = 'sine';
    osc2.type = 'triangle';
    osc1.frequency.setValueAtTime(freq, now);
    osc2.frequency.setValueAtTime(freq * 2, now); // soft 1st harmonic chime

    // Filter to warm up sound (lowpass)
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, now);
    filter.Q.setValueAtTime(2.5, now);

    // Gain Envelope
    const gain1 = this.ctx.createGain();
    const gain2 = this.ctx.createGain();

    gain1.gain.setValueAtTime(0.001, now);
    gain1.gain.linearRampToValueAtTime(velocity, now + 0.04);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    gain2.gain.setValueAtTime(0.001, now);
    gain2.gain.linearRampToValueAtTime(velocity * 0.25, now + 0.02);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + (duration * 0.5));

    // Connect nodes
    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain1);
    filter.connect(gain2);

    gain1.connect(this.ctx.destination);
    gain2.connect(this.ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + duration);
    osc2.stop(now + duration);
  }

  toggle() {
    this.init();
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  start() {
    this.isPlaying = true;
    this.currentStep = 0;
    
    const stepDurationMs = 520; // gentle lofi tempo (~57 bpm)

    const scheduleNext = () => {
      if (!this.isPlaying) return;

      const chordIndex = Math.floor(this.currentStep / 8) % this.patterns.length;
      const noteIndex = this.currentStep % 8;
      const chord = this.patterns[chordIndex];

      // Pluck note
      const noteKey = chord[noteIndex % chord.length];
      if (noteKey && this.notes[noteKey]) {
        // Vary velocity slightly for humanized touch
        const vel = 0.08 + Math.random() * 0.05;
        this.playNote(this.notes[noteKey], 2.8, vel);
      }

      // Occasional soft bass note on 1st beat
      if (noteIndex === 0) {
        const rootFreq = (this.notes[chord[0]] || 261.6) / 2;
        this.playNote(rootFreq, 3.6, 0.14);
      }

      this.currentStep++;
      this.timer = setTimeout(scheduleNext, stepDurationMs);
    };

    scheduleNext();
  }

  stop() {
    this.isPlaying = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}

// Global Audio Engine Instance
window.romanticAudio = new RomanticAudioEngine();
