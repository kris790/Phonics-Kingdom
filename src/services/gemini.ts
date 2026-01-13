// Gemini AI Service for intelligent tutoring
// This is a mock service - replace with actual Gemini API integration

// Using string type for character to avoid import issues
type CharacterTypeSimple = string;

interface SkillNodeSimple {
  id: string;
  title: string;
  isMastered: boolean;
  isLocked: boolean;
  accuracy: number;
  attempts: number;
}

interface GameSessionSimple {
  id: string;
  nodeId: string;
  accuracy: number;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

class GeminiService {
  private audioStarted = false;
  private conversationHistory: ChatMessage[] = [];

  async ensureAudioStarted(): Promise<void> {
    if (this.audioStarted) return;
    
    // Create and play a silent audio to unlock audio context
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      gainNode.gain.value = 0; // Silent
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.01);
      this.audioStarted = true;
    } catch (e) {
      console.warn('Could not start audio context:', e);
    }
  }

  async generateResponse(
    prompt: string,
    characterType: CharacterTypeSimple,
    context?: {
      playerName?: string;
      nodes?: SkillNodeSimple[];
      sessions?: GameSessionSimple[];
    }
  ): Promise<string> {
    // Add to conversation history
    this.conversationHistory.push({ role: 'user', content: prompt });

    // Character personalities
    const personalities: Record<string, string> = {
      brio: "You are Brio, an energetic lion cub who loves phonics! You're enthusiastic, use words like 'awesome', 'let's go!', and encourage with high energy.",
      vowelia: "You are Vowelia, a wise owl who speaks calmly and thoughtfully. You use gentle encouragement and occasionally share wisdom about sounds and letters.",
      diesel: "You are Diesel, a friendly fox who loves digging for treasure (knowledge!). You're curious, adventurous, and use phrases like 'let's dig in!' and 'great discovery!'",
      zippy: "You are Zippy, a speedy bunny who loves racing through learning! You're quick, excited, and use phrases like 'zoom zoom!' and 'ready, set, read!'",
    };

    // Mock responses based on character (replace with actual Gemini API call)
    const characterResponses: Record<string, string[]> = {
      brio: [
        "Awesome job! You're crushing it! 🦁",
        "Let's GOOO! You've got this!",
        "Roar! That was amazing practice!",
        "You're becoming a reading superstar!",
      ],
      vowelia: [
        "Well done, young learner. Your wisdom grows...",
        "I see great potential in you. Keep practicing.",
        "The sounds are becoming clearer to you now.",
        "Patience and practice lead to mastery.",
      ],
      diesel: [
        "Great discovery! You found the right sound!",
        "Let's dig deeper into these words!",
        "You're uncovering treasure with every word!",
        "What an adventure we're having!",
      ],
      zippy: [
        "Zoom zoom! You're so fast at reading!",
        "Ready, set, READ! You did it!",
        "Quick as a bunny! Great job!",
        "Let's race to the next word!",
      ],
    };

    // Simple response selection (replace with actual AI logic)
    const responses = characterResponses[characterType.toLowerCase()] || characterResponses['brio'];
    const response = responses[Math.floor(Math.random() * responses.length)];

    this.conversationHistory.push({ role: 'assistant', content: response });

    return response;
  }

  async getStudyRecommendation(
    nodes: SkillNodeSimple[],
    characterType: CharacterTypeSimple
  ): Promise<string> {
    const unmastered = nodes.filter(n => !n.isMastered && !n.isLocked);
    const struggling = unmastered.filter(n => n.attempts > 2 && n.accuracy < 60);
    
    if (struggling.length > 0) {
      const node = struggling[0];
      return `Let's practice "${node.title}" together! You're getting closer to mastering it.`;
    }
    
    if (unmastered.length > 0) {
      const node = unmastered[0];
      return `Ready to continue with "${node.title}"? Let's do it!`;
    }
    
    return "Amazing! You're making great progress through all the skills!";
  }

  async generateEncouragement(accuracy: number, characterType: CharacterTypeSimple): Promise<string> {
    const charLower = characterType.toLowerCase();
    if (accuracy >= 90) {
      return charLower === 'brio' 
        ? "INCREDIBLE! You're on fire! 🔥"
        : charLower === 'vowelia'
        ? "Magnificent! Your mastery is impressive."
        : charLower === 'diesel'
        ? "You struck gold! What a treasure!"
        : "Lightning fast and super accurate! Zoom!";
    } else if (accuracy >= 70) {
      return "Great job! Keep up the good work!";
    } else if (accuracy >= 50) {
      return "Nice effort! Practice makes perfect!";
    } else {
      return "Don't give up! Every try makes you stronger!";
    }
  }

  clearHistory() {
    this.conversationHistory = [];
  }

  getHistory(): ChatMessage[] {
    return [...this.conversationHistory];
  }
}

export const geminiService = new GeminiService();
