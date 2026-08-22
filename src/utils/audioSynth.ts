// Web Audio API Sound Synthesizer for Siren, Ringtone, and Speech Synthesis

class SoundController {
  private ctx: AudioContext | null = null;
  private sirenOsc: OscillatorNode | null = null;
  private sirenGain: GainNode | null = null;
  private sirenInterval: any = null;
  private ringtoneInterval: any = null;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Emergency Siren Generator (Modulated High-Low Alert Tone)
  startSiren() {
    this.stopSiren();
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.35, this.ctx.currentTime);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();

    this.sirenOsc = osc;
    this.sirenGain = gain;

    let isHigh = false;
    this.sirenInterval = setInterval(() => {
      if (!this.ctx || !this.sirenOsc) return;
      const now = this.ctx.currentTime;
      isHigh = !isHigh;
      this.sirenOsc.frequency.exponentialRampToValueAtTime(isHigh ? 1300 : 700, now + 0.35);
    }, 400);
  }

  stopSiren() {
    if (this.sirenInterval) {
      clearInterval(this.sirenInterval);
      this.sirenInterval = null;
    }
    if (this.sirenOsc) {
      try {
        this.sirenOsc.stop();
        this.sirenOsc.disconnect();
      } catch {}
      this.sirenOsc = null;
    }
  }

  // Realistic Phone Ringtone Generator
  startRingtone() {
    this.stopRingtone();
    this.initContext();
    if (!this.ctx) return;

    const playRingBurst = () => {
      if (!this.ctx) return;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.value = 440; // A4
      osc2.frequency.value = 480; // B4

      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.8);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(this.ctx.currentTime + 1.8);
      osc2.stop(this.ctx.currentTime + 1.8);
    };

    playRingBurst();
    this.ringtoneInterval = setInterval(playRingBurst, 3000);
  }

  stopRingtone() {
    if (this.ringtoneInterval) {
      clearInterval(this.ringtoneInterval);
      this.ringtoneInterval = null;
    }
  }

  // Text-To-Speech Voice Dialogue for Fake Call Escape
  speakDialogue(text: string, onEnd?: () => void) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.05;
    if (onEnd) {
      utterance.onend = onEnd;
    }
    window.speechSynthesis.speak(utterance);
  }

  stopSpeech() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const sound = new SoundController();
