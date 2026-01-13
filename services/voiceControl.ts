
import { geminiService } from './gemini';
import { Type } from '@google/genai';

export type NavCommand = 'MAP' | 'VAULT' | 'PARENT' | 'EXIT';

class VoiceControlService {
  private isListening = false;
  private isThinking = false;
  private commandCallback: ((cmd: NavCommand) => void) | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private microphone: MediaStreamAudioSourceNode | null = null;
  private initPromise: Promise<void> | null = null;
  private sessionPromise: any = null;

  async startGlobalListener(onCommand: (cmd: NavCommand) => void) {
    if (this.isListening) return;
    this.isListening = true;
    this.commandCallback = onCommand;

    const navigateTool = {
      name: 'navigate',
      parameters: {
        type: Type.OBJECT,
        description: 'Navigates the user to a different screen in the Phonics Kingdom.',
        properties: {
          destination: {
            type: Type.STRING,
            enum: ['MAP', 'VAULT', 'PARENT', 'EXIT'],
            description: 'The location to go to.'
          }
        },
        required: ['destination']
      }
    };

    try {
      this.sessionPromise = geminiService.connectLive({
        systemInstruction: `You are the Kingdom Navigator. 
        Your job is to help users move around the app by listening for their requests.
        Available Destinations:
        - MAP (Go back to the main kingdom map)
        - VAULT (Show the collected sound shards)
        - PARENT (Open the parent dashboard or insights)
        - EXIT (Quit the current game or activity)
        
        When a user says something like "Take me to the map" or "Show shards", immediately call the navigate tool.`,
        tools: [{ functionDeclarations: [navigateTool] }],
        callbacks: {
          onToolCall: (fcs) => {
            this.isThinking = true;
            fcs.forEach(fc => {
              if (fc.name === 'navigate') {
                const dest = fc.args.destination as NavCommand;
                console.log('Navigating to:', dest);
                this.commandCallback?.(dest);
              }
            });
            setTimeout(() => { this.isThinking = false; }, 1000);
          },
          onOpen: () => {
            this.sessionPromise.then((session: any) => {
              // Start streaming microphone data
              this.ensureInitialized().then(() => {
                if (!this.audioContext || !this.microphone) return;
                
                const scriptProcessor = this.audioContext.createScriptProcessor(4096, 1, 1);
                scriptProcessor.onaudioprocess = (e) => {
                  if (!this.isListening) return;
                  const inputData = e.inputBuffer.getChannelData(0);
                  const pcm = geminiService.encodePCM(inputData);
                  session.sendRealtimeInput({ media: { data: pcm, mimeType: 'audio/pcm;rate=16000' } });
                };
                this.microphone.connect(scriptProcessor);
                scriptProcessor.connect(this.audioContext.destination);
              }).catch(err => {
                console.warn("Microphone access failed in onOpen:", err);
                this.isListening = false;
              });
            });
          }
        }
      });
    } catch (e) {
      console.warn("Navigator Init Failed", e);
      this.isListening = false;
    }
  }

  private async ensureInitialized(): Promise<void> {
    if (this.initPromise) return this.initPromise;
    this.initPromise = (async () => {
      this.audioContext = geminiService.getContext();
      
      // Explicitly resume context as part of the initialization flow
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.microphone = this.audioContext.createMediaStreamSource(stream);
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 256;
        this.microphone.connect(this.analyser);
      } catch (err) {
        this.initPromise = null; // Allow retry if it failed due to temporary permission denial
        throw err;
      }
    })();
    return this.initPromise;
  }

  async getSonicIntensity(): Promise<number> {
    try {
      // Don't force initialization here as it might trigger mic prompts unexpectedly.
      // Only get intensity if already initialized.
      if (!this.analyser) return 0;
      
      const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
      this.analyser.getByteFrequencyData(dataArray);
      let values = 0;
      for (let i = 0; i < dataArray.length; i++) values += dataArray[i];
      return values / dataArray.length / 255;
    } catch (e) {
      return 0;
    }
  }

  getIsThinking(): boolean { return this.isThinking; }

  stop() {
    this.isListening = false;
    this.initPromise = null;
    if (this.sessionPromise) {
        this.sessionPromise.then((s: any) => s.close());
    }
  }
}

export const voiceControl = new VoiceControlService();
