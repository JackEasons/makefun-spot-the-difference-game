// Synthesised sound: no audio files, everything is WebAudio oscillators and
// filtered noise, so the game ships no assets and loads nothing over the net.
export class SoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.master = null;
    this.padNodes = null;
  }

  // Browsers only let audio start after a gesture; call from the first click.
  ensure() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = this.muted ? 0 : 0.5;
    this.master.connect(this.ctx.destination);
  }

  setMuted(muted) {
    this.muted = muted;
    if (this.master) this.master.gain.value = muted ? 0 : 0.5;
  }

  tone(freq, start, dur, type, vol, slideTo) {
    if (!this.ctx || this.muted) return;
    const t0 = this.ctx.currentTime + start;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(vol || 0.2, t0 + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain).connect(this.master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  // Two-note chime, rising, on a found difference.
  find() {
    this.tone(880, 0, 0.22, 'sine', 0.22);
    this.tone(1318.5, 0.09, 0.34, 'sine', 0.2);
    this.tone(1760, 0.18, 0.4, 'triangle', 0.08);
  }

  // Low buzz on a miss.
  miss() {
    this.tone(160, 0, 0.18, 'sawtooth', 0.12, 110);
  }

  // Soft shimmer when a hint is spent.
  hint() {
    this.tone(1046.5, 0, 0.3, 'sine', 0.12);
    this.tone(1568, 0.08, 0.4, 'sine', 0.1);
  }

  // Short tick as the timer runs low.
  tick() {
    this.tone(1200, 0, 0.05, 'square', 0.05);
  }

  // Rising arpeggio when a scene is cleared.
  fanfare() {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => this.tone(f, i * 0.11, 0.4, 'triangle', 0.18));
    this.tone(1318.5, 0.46, 0.7, 'sine', 0.16);
  }

  click() {
    this.tone(660, 0, 0.06, 'sine', 0.08);
  }

  // A quiet warm pad under the title screen; started once, stopped on play.
  startPad() {
    if (!this.ctx || this.padNodes || this.muted) return;
    const freqs = [130.81, 196.0, 261.63];
    const gains = freqs.map((f) => {
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = f;
      g.gain.value = 0.035;
      osc.connect(g).connect(this.master);
      osc.start();
      return { osc, g };
    });
    this.padNodes = gains;
  }

  stopPad() {
    if (!this.padNodes) return;
    for (const { osc, g } of this.padNodes) {
      try {
        g.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + 0.4);
        osc.stop(this.ctx.currentTime + 0.45);
      } catch (e) { /* already stopped */ }
    }
    this.padNodes = null;
  }
}
