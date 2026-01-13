
import { CharacterType, PhonicsSound } from '../types';
import { geminiService } from './gemini';

const CHARACTER_VOICES: Record<CharacterType, 'Kore' | 'Puck' | 'Zephyr'> = {
  BRIO: 'Kore',
  VOWELIA: 'Puck',
  DIESEL: 'Kore',
  ZIPPY: 'Zephyr'
};

class AudioService {
  private speechSynth: SpeechSynthesis | null = null;
  private currentLocalAudio: HTMLAudioElement | null = null;
  private audioCtx: AudioContext | null = null;
  
  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.speechSynth = window.speechSynthesis;
    }
  }

  private getAudioCtx() {
    if (!this.audioCtx) {
      this.audioCtx = geminiService.getContext();
    }
    return this.audioCtx;
  }

  stop(): void {
    geminiService.stopSpeech();
    if (this.speechSynth) {
      this.speechSynth.cancel();
    }
    if (this.currentLocalAudio) {
      this.currentLocalAudio.pause();
      this.currentLocalAudio = null;
    }
  }
  
  async speak(text: string, characterType: CharacterType, rate: number = 1.0): Promise<void> {
    if (!text) return;
    this.stop();

    // 1. Try Native Bridge (Capacitor TextToSpeech) - Lowest Latency
    if ((window as any).Capacitor?.Plugins?.TextToSpeech) {
      try {
        await (window as any).Capacitor.Plugins.TextToSpeech.speak({
          text,
          rate: rate,
          pitch: 1.0,
          volume: 1.0,
          category: 'playback'
        });
        return;
      } catch (e) {
        console.warn('Native TTS Bridge failed, falling back...');
      }
    }
    
    // 2. Try Gemini TTS (Highest Quality Character Voice)
    if (navigator.onLine) {
      try {
        const voice = CHARACTER_VOICES[characterType];
        await geminiService.speak(text, voice, rate);
        return;
      } catch (e) {
        console.warn('Gemini TTS failed, falling back to Web Speech API', e);
      }
    }

    // 3. Web Speech API Fallback
    if (this.speechSynth) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = rate;
      this.speechSynth.speak(utterance);
    }
  }
  
  playPhonemeSound(phoneme: PhonicsSound | string): void {
    this.stop();
    const p = phoneme.toLowerCase();
    const audio = new Audio(`/sounds/phonemes/${p}.mp3`);
    this.currentLocalAudio = audio;
    audio.play().catch(() => {
      this.speak(`/${p}/`, 'BRIO', 0.5);
    });
  }

  playEffect(effect: 'correct' | 'wrong' | 'click' | 'pop'): void {
    const effects: Record<string, string> = {
      correct: '/sounds/fx/sparkle.mp3',
      wrong: '/sounds/fx/static.mp3',
      click: '/sounds/fx/click.mp3',
      pop: '/sounds/fx/pop.mp3'
    };
    
    if (effects[effect]) {
      const audio = new Audio(effects[effect]);
      audio.volume = 0.4;
      audio.play().catch(() => {
        this.synthesizeEffect(effect);
      });
    } else {
      this.synthesizeEffect(effect);
    }
  }

  private synthesizeEffect(effect: 'correct' | 'wrong' | 'click' | 'pop') {
    const ctx = this.getAudioCtx();
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    const now = ctx.currentTime;

    switch (effect) {
      case 'pop':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(500, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
        break;
      case 'correct':
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, now); 
        osc.frequency.setValueAtTime(659.25, now + 0.1); 
        osc.frequency.exponentialRampToValueAtTime(1046.5, now + 0.3); 
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
        break;
      case 'wrong':
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(110, now);
        osc.frequency.linearRampToValueAtTime(40, now + 0.4);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
        break;
      case 'click':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, now);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.04);
        osc.start(now);
        osc.stop(now + 0.04);
        break;
    }
  }
}

export const audioService = new AudioService();
