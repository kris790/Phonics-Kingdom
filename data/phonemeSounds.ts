
import { PhonicsSound } from '../types';

export interface PhonemeData {
  sound: PhonicsSound | string;
  mouthAction: string;
  isVoiced: boolean;
  category: 'STOP' | 'FRICATIVE' | 'NASAL' | 'LIQUID' | 'GLIDE' | 'VOWEL';
  exampleWords: string[];
}

export const PHONEME_SOUNDS: Record<string, PhonemeData> = {
  'a': { sound: 'a', mouthAction: 'Open mouth wide like you are eating an apple.', isVoiced: true, category: 'VOWEL', exampleWords: ['apple', 'ant'] },
  'b': { sound: 'b', mouthAction: 'Press your lips together and make a quick puff of air.', isVoiced: true, category: 'STOP', exampleWords: ['ball', 'bat'] },
  'c': { sound: 'k', mouthAction: 'Open your mouth and push air from the back of your throat.', isVoiced: false, category: 'STOP', exampleWords: ['cat', 'can'] },
  'd': { sound: 'd', mouthAction: 'Touch your tongue to the roof of your mouth behind your teeth.', isVoiced: true, category: 'STOP', exampleWords: ['dog', 'dad'] },
  'e': { sound: 'e', mouthAction: 'Make a small smile and keep your tongue low.', isVoiced: true, category: 'VOWEL', exampleWords: ['egg', 'elbow'] },
  'f': { sound: 'f', mouthAction: 'Touch your top teeth to your bottom lip and blow air.', isVoiced: false, category: 'FRICATIVE', exampleWords: ['fan', 'fish'] },
  'g': { sound: 'g', mouthAction: 'Push air from the back of your throat with your voice on.', isVoiced: true, category: 'STOP', exampleWords: ['goat', 'gum'] },
  'h': { sound: 'h', mouthAction: 'Open your mouth and breathe out like you are fogging a mirror.', isVoiced: false, category: 'FRICATIVE', exampleWords: ['hat', 'hen'] },
  'i': { sound: 'i', mouthAction: 'Small smile, tongue is high and forward.', isVoiced: true, category: 'VOWEL', exampleWords: ['igloo', 'it'] },
  'j': { sound: 'j', mouthAction: 'Push your lips out and make a quick burst of sound.', isVoiced: true, category: 'STOP', exampleWords: ['jet', 'jam'] },
  'k': { sound: 'k', mouthAction: 'Short burst of air from the back of the throat.', isVoiced: false, category: 'STOP', exampleWords: ['kite', 'kid'] },
  'l': { sound: 'l', mouthAction: 'Touch your tongue to the bumpy part behind your top teeth.', isVoiced: true, category: 'LIQUID', exampleWords: ['lip', 'log'] },
  'm': { sound: 'm', mouthAction: 'Close your lips and make a sound through your nose.', isVoiced: true, category: 'NASAL', exampleWords: ['moon', 'map'] },
  'n': { sound: 'n', mouthAction: 'Tongue on the roof of your mouth, sound through your nose.', isVoiced: true, category: 'NASAL', exampleWords: ['net', 'nap'] },
  'o': { sound: 'o', mouthAction: 'Open your mouth in a round shape.', isVoiced: true, category: 'VOWEL', exampleWords: ['octopus', 'on'] },
  'p': { sound: 'p', mouthAction: 'Press lips together and blow a quick puff of air.', isVoiced: false, category: 'STOP', exampleWords: ['pig', 'pen'] },
  'r': { sound: 'r', mouthAction: 'Pull your tongue back and growl like a tiger.', isVoiced: true, category: 'LIQUID', exampleWords: ['rat', 'run'] },
  's': { sound: 's', mouthAction: 'Teeth together and hiss like a snake.', isVoiced: false, category: 'FRICATIVE', exampleWords: ['sun', 'snake'] },
  't': { sound: 't', mouthAction: 'Tip of the tongue taps behind the top teeth.', isVoiced: false, category: 'STOP', exampleWords: ['top', 'ten'] },
  'u': { sound: 'u', mouthAction: 'Open your mouth like you are saying "uh-oh".', isVoiced: true, category: 'VOWEL', exampleWords: ['up', 'umbrella'] },
  'v': { sound: 'v', mouthAction: 'Top teeth on bottom lip with your voice on.', isVoiced: true, category: 'FRICATIVE', exampleWords: ['van', 'vest'] },
  'w': { sound: 'w', mouthAction: 'Round your lips like a small circle.', isVoiced: true, category: 'GLIDE', exampleWords: ['wig', 'wet'] },
  'x': { sound: 'ks', mouthAction: 'Make the /k/ sound and /s/ sound together.', isVoiced: false, category: 'FRICATIVE', exampleWords: ['box', 'fox'] },
  'y': { sound: 'y', mouthAction: 'Smile and pull your tongue up.', isVoiced: true, category: 'GLIDE', exampleWords: ['yak', 'yellow'] },
  'z': { sound: 'z', mouthAction: 'Teeth together and buzz like a bee.', isVoiced: true, category: 'FRICATIVE', exampleWords: ['zip', 'zoo'] }
};
