// Voice Control Service for hands-free navigation
export type NavCommand = 'MAP' | 'VAULT' | 'PARENT' | 'EXIT' | 'HELP' | 'REPEAT';

type CommandCallback = (command: NavCommand) => void;

// Web Speech API types
interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: any) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}

class VoiceControlService {
  private recognition: ISpeechRecognition | null = null;
  private isListening = false;
  private callback: CommandCallback | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private mediaStream: MediaStream | null = null;
  private intensity = 0;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognitionAPI) {
        this.recognition = new SpeechRecognitionAPI() as ISpeechRecognition;
        this.recognition.continuous = true;
        this.recognition.interimResults = false;
        this.recognition.lang = 'en-US';
        
        this.recognition.onresult = this.handleResult.bind(this);
        this.recognition.onerror = this.handleError.bind(this);
        this.recognition.onend = this.handleEnd.bind(this);
      }
    }
  }

  private handleResult(event: any) {
    const last = event.results.length - 1;
    const transcript = event.results[last][0].transcript.toLowerCase().trim();
    
    const commands: Record<string, NavCommand> = {
      'go to map': 'MAP',
      'open map': 'MAP',
      'map': 'MAP',
      'kingdom': 'MAP',
      'go to vault': 'VAULT',
      'open vault': 'VAULT',
      'vault': 'VAULT',
      'sound vault': 'VAULT',
      'parent': 'PARENT',
      'parents': 'PARENT',
      'parent hub': 'PARENT',
      'insights': 'PARENT',
      'exit': 'EXIT',
      'go back': 'EXIT',
      'back': 'EXIT',
      'quit': 'EXIT',
      'help': 'HELP',
      'help me': 'HELP',
      'repeat': 'REPEAT',
      'say again': 'REPEAT',
    };

    for (const [phrase, command] of Object.entries(commands)) {
      if (transcript.includes(phrase)) {
        this.callback?.(command);
        break;
      }
    }
  }

  private handleError(event: any) {
    console.warn('Voice recognition error:', event.error);
    if (event.error === 'not-allowed') {
      this.isListening = false;
    }
  }

  private handleEnd() {
    // Restart if still supposed to be listening
    if (this.isListening && this.recognition) {
      try {
        this.recognition.start();
      } catch (e) {
        // Already started
      }
    }
  }

  async startGlobalListener(callback: CommandCallback): Promise<boolean> {
    if (!this.recognition) {
      console.warn('Speech recognition not supported');
      return false;
    }

    this.callback = callback;
    
    try {
      // Request microphone for intensity tracking
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioContext = new AudioContext();
      this.analyser = this.audioContext.createAnalyser();
      const source = this.audioContext.createMediaStreamSource(this.mediaStream);
      source.connect(this.analyser);
      this.analyser.fftSize = 256;

      this.recognition.start();
      this.isListening = true;
      return true;
    } catch (e) {
      console.warn('Could not start voice control:', e);
      return false;
    }
  }

  stop() {
    this.isListening = false;
    this.callback = null;
    
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {
        // Already stopped
      }
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }

  async getSonicIntensity(): Promise<number> {
    if (!this.analyser) return 0;

    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);
    
    const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
    this.intensity = average / 255;
    
    return this.intensity;
  }

  isActive(): boolean {
    return this.isListening;
  }
}

export const voiceControl = new VoiceControlService();
