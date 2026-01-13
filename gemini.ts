
import { GoogleGenAI, Modality, Type, LiveServerMessage, GenerateContentResponse } from "@google/genai";

const ttsCache = new Map<string, AudioBuffer>();

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export class GeminiService {
  private audioCtx: AudioContext | null = null;
  private activeSources: Set<AudioBufferSourceNode> = new Set();

  /**
   * Critically important for iOS/Safari: 
   * Context must be resumed within a user gesture.
   */
  public async ensureAudioStarted() {
    const ctx = this.getContext();
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
  }

  public getContext() {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    return this.audioCtx;
  }

  private trackSource(source: AudioBufferSourceNode) {
    this.activeSources.add(source);
    source.onended = () => {
      this.activeSources.delete(source);
    };
  }

  public stopSpeech() {
    this.activeSources.forEach(source => {
      try {
        source.stop();
        source.disconnect();
      } catch (e) { }
    });
    this.activeSources.clear();
  }

  private async retry<T>(fn: () => Promise<T>, retries = 2, delay = 1000): Promise<T> {
    try {
      return await fn();
    } catch (err: any) {
      if (retries > 0 && (err?.message?.includes('429') || err?.message?.includes('500'))) {
        await new Promise(r => setTimeout(r, delay + Math.random() * 500));
        return this.retry(fn, retries - 1, delay * 2);
      }
      throw err;
    }
  }

  async generatePhonicsPlan(level: string, char: string, role: string, difficulty: string) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    return this.retry(async () => {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Create 5 tutor-led phonics tasks for a child. Level: ${level}. Tutor: ${char}. Difficulty: ${difficulty}.
        Ensure narratives act as "mini-lessons". Return a JSON array. 
        Supported types: MULTIPLE_CHOICE, CVC_BUILDER, SOUND_SORTER, RHYME_RACER.`,
        config: { 
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                prompt: { type: Type.STRING },
                narrative: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                correctIndex: { type: Type.NUMBER },
                type: { type: Type.STRING },
                targetWord: { type: Type.STRING },
                targetSound: { type: Type.STRING }
              },
              required: ['prompt', 'options', 'correctIndex', 'type']
            }
          }
        }
      });
      const parsed = JSON.parse(response.text || '[]');
      // Sanity check: Ensure every task has at least a few options if it's MC
      return parsed.map((t: any) => ({
        ...t,
        options: t.options && t.options.length > 0 ? t.options : ["Option 1", "Option 2"]
      }));
    });
  }

  async speak(text: string, voiceName: 'Kore' | 'Puck' | 'Zephyr' = 'Kore', rate: number = 1.0): Promise<void> {
    await this.ensureAudioStarted();
    this.stopSpeech();
    
    const cacheKey = `${voiceName}:${rate}:${text}`;
    const audioCtx = this.getContext();

    if (ttsCache.has(cacheKey)) {
      const buffer = ttsCache.get(cacheKey)!;
      const source = audioCtx.createBufferSource();
      source.buffer = buffer;
      source.connect(audioCtx.destination);
      source.playbackRate.value = rate;
      this.trackSource(source);
      source.start();
      return;
    }

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response: GenerateContentResponse = await this.retry(() => ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } },
        },
      }));

      const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
      const base64Audio = part?.inlineData?.data;
      if (!base64Audio) throw new Error("No audio");

      const decodedBytes = decode(base64Audio);
      const audioBuffer = await decodeAudioData(decodedBytes, audioCtx, 24000, 1);
      
      ttsCache.set(cacheKey, audioBuffer);
      const source = audioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioCtx.destination);
      source.playbackRate.value = rate;
      this.trackSource(source);
      source.start();
    } catch (err) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = rate;
      window.speechSynthesis.speak(utterance);
    }
  }

  async generateGuardian(sound: string): Promise<{ name: string; lore: string; imageUrl: string }> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const textResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a magical "Sound Guardian" for /${sound}/. 1-sentence lore. Name like "The [Adj] [Noun] of ${sound.toUpperCase()}".`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            lore: { type: Type.STRING }
          },
          required: ['name', 'lore']
        }
      }
    });

    const { name, lore } = JSON.parse(textResponse.text || '{}');

    const imageResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: `Vibrant, child-friendly Sound Guardian for /${sound}/. Name: ${name}. Storybook style, white background.` }] }
    });

    const part = imageResponse.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    // Compression: We won't resize here for complexity, but we'll ensure we return it.
    const imageUrl = part ? `data:image/png;base64,${part.inlineData.data}` : '';

    return { name, lore, imageUrl };
  }

  async connectLive(config: {
    systemInstruction: string;
    tools?: any[];
    voiceName?: 'Kore' | 'Puck' | 'Zephyr' | 'Fenrir' | 'Charon';
    callbacks: {
      onAudio?: (buffer: AudioBuffer) => void;
      onToolCall?: (functionCalls: any[]) => void;
      onOpen?: () => void;
      onClose?: () => void;
    }
  }) {
    await this.ensureAudioStarted();
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const audioCtx = this.getContext();

    const sessionPromise = ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-12-2025',
      config: {
        responseModalities: [Modality.AUDIO],
        tools: config.tools,
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: config.voiceName || 'Kore' } }
        },
        systemInstruction: config.systemInstruction
      },
      callbacks: {
        onopen: () => config.callbacks.onOpen?.(),
        onmessage: async (msg: LiveServerMessage) => {
          if (msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data) {
            const decoded = decode(msg.serverContent.modelTurn.parts[0].inlineData.data);
            const buffer = await decodeAudioData(decoded, audioCtx, 24000, 1);
            config.callbacks.onAudio?.(buffer);
          }
          if (msg.toolCall) {
            config.callbacks.onToolCall?.(msg.toolCall.functionCalls);
            sessionPromise.then((session) => {
              for (const fc of msg.toolCall!.functionCalls) {
                session.sendToolResponse({
                  functionResponses: { id: fc.id, name: fc.name, response: { result: "ok" } }
                });
              }
            });
          }
        },
        onerror: (e) => console.error('Live Error:', e),
        onclose: () => config.callbacks.onClose?.()
      }
    });

    return sessionPromise;
  }

  encodePCM(data: Float32Array): string {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      int16[i] = data[i] * 32768;
    }
    return encode(new Uint8Array(int16.buffer));
  }

  async analyzeMistake(character: string, targetSound: string, chosenSound: string): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    return this.retry(async () => {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `You are ${character}. Child picked /${chosenSound}/ instead of /${targetSound}/. 1-sentence friendly hint about mouth shape or sound difference.`,
      });
      return response.text?.trim() || "Listen closely to that sound again!";
    });
  }
}

export const geminiService = new GeminiService();
