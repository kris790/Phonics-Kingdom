
import React, { useState, useCallback, useEffect, useReducer } from 'react';
import { INITIAL_NODES } from './constants';
import { SkillNode, CharacterType, UserSettings, AppState, DifficultyLevel, MasteredGuardian, UserProfile, GameSession, SkillLevel } from './types';
import MagicMap from './components/MagicMap';
import GameEngine from './components/GameEngine';
import ParentHub from './components/ParentHub';
import ParentLock from './components/ParentLock';
import SoundVault from './components/SoundVault';
import CharacterSelectorModal from './components/CharacterSelectorModal';
import OnboardingFlow from './components/OnboardingFlow';
import PlacementAssessment from './components/PlacementAssessment';
import WorldIntro from './components/WorldIntro';
import ErrorBoundary from './components/ErrorBoundary';
import VoiceIndicator from './components/VoiceIndicator';
import LandingPage from './components/LandingPage';
import DailyChallenge from './components/DailyChallenge';
import CharacterChat from './components/CharacterChat';
import { storageService } from './services/storageService';
import { telemetry } from './services/telemetryService';
import { voiceControl, NavCommand } from './services/voiceControl';
import { audioService } from './services/audioService';
import { geminiService } from './services/gemini';

const DEFAULT_SETTINGS: UserSettings = {
  speechRate: 1.0,
  dyslexicFont: false,
  highContrast: false,
  difficulty: DifficultyLevel.NORMAL
};

const MASTERY_THRESHOLD = 85;
const UNLOCK_THRESHOLD = 70;

const createNewProfile = (): UserProfile => ({
  id: `user_${Date.now()}`,
  playerName: '',
  characterType: 'BRIO',
  totalStars: 0,
  totalSoundShards: 0,
  totalMagicSeeds: 0,
  createdDate: Date.now(),
  lastActive: Date.now(),
  masteryLevel: 1,
  consecutiveDays: 1,
  onboardingCompleted: false,
  placementScore: 0,
  notifications: [],
  pairing: { isPaired: false }
});

type AppAction = 
  | { type: 'LOAD_STATE'; payload: AppState }
  | { type: 'COMPLETE_ONBOARDING'; playerName: string; characterType: CharacterType }
  | { type: 'COMPLETE_PLACEMENT'; score: number; startingLevel: SkillLevel }
  | { type: 'GAME_COMPLETE'; accuracy: number; skillId: string; timeSpent: number; session: GameSession }
  | { type: 'COMPLETE_DAILY'; stars: number }
  | { type: 'SELECT_CHARACTER'; characterType: CharacterType }
  | { type: 'UPDATE_SETTINGS'; settings: UserSettings }
  | { type: 'SAVE_GUARDIAN'; guardian: MasteredGuardian }
  | { type: 'RESET_PROGRESS' }
  | { type: 'DISMISS_NOTIFICATIONS' }
  | { type: 'UPDATE_STATE'; payload: Partial<AppState> };

const initialState: AppState = {
  nodes: INITIAL_NODES,
  stars: 0,
  soundShards: 0,
  magicSeeds: 0,
  characterType: 'BRIO',
  settings: DEFAULT_SETTINGS,
  guardians: {},
  profile: createNewProfile(),
  sessions: []
};

function getDayFloor(timestamp: number): number {
  const date = new Date(timestamp);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

function isNewSpacedSession(lastAttempt: number | undefined): boolean {
  if (!lastAttempt) return true;
  return getDayFloor(Date.now()) > getDayFloor(lastAttempt);
}

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'LOAD_STATE':
      return {
        ...action.payload,
        settings: { ...DEFAULT_SETTINGS, ...action.payload.settings },
        guardians: action.payload.guardians || {},
        profile: action.payload.profile || createNewProfile(),
        sessions: action.payload.sessions || [],
        magicSeeds: action.payload.magicSeeds || action.payload.profile?.totalMagicSeeds || 0
      };

    case 'COMPLETE_ONBOARDING':
      return {
        ...state,
        characterType: action.characterType,
        profile: {
          ...state.profile,
          playerName: action.playerName,
          characterType: action.characterType
        }
      };

    case 'COMPLETE_PLACEMENT': {
      const startingNodes = state.nodes.map(node => {
        const levelOrder = [
          SkillLevel.PHONEMIC_AWARENESS,
          SkillLevel.LETTER_SOUNDS,
          SkillLevel.DIGRAPHS_BLENDS,
          SkillLevel.BLENDING_CVC,
          SkillLevel.SIGHT_WORDS
        ];
        const startIndex = levelOrder.indexOf(action.startingLevel);
        const nodeIndex = levelOrder.indexOf(node.level);
        return {
          ...node,
          isLocked: nodeIndex > startIndex
        };
      });

      return {
        ...state,
        nodes: startingNodes,
        profile: {
          ...state.profile,
          placementScore: action.score,
          onboardingCompleted: true
        }
      };
    }

    case 'SAVE_GUARDIAN':
      return {
        ...state,
        guardians: {
          ...state.guardians,
          [action.guardian.sound.toLowerCase()]: action.guardian
        }
      };

    case 'COMPLETE_DAILY':
      return {
        ...state,
        stars: state.stars + action.stars,
        profile: {
          ...state.profile,
          lastDailyChallenge: Date.now(),
          totalStars: state.profile.totalStars + action.stars
        }
      };

    case 'DISMISS_NOTIFICATIONS':
      return {
        ...state,
        profile: { ...state.profile, notifications: [] }
      };

    case 'GAME_COMPLETE': {
      const { accuracy, skillId, timeSpent, session } = action;
      let shardGained = 0;
      let starsGained = session.starsEarned;
      let seedsGained = accuracy >= 90 ? 10 : accuracy >= 70 ? 5 : 1;
      let newNotification = "";

      telemetry.track('skill_attempt', skillId, accuracy);

      const updatedNodes = state.nodes.map((node) => {
        if (node.id !== skillId) return node;

        const passedThisTurn = accuracy >= MASTERY_THRESHOLD;
        const isNewDay = isNewSpacedSession(node.lastAttemptAt);
        
        let newPasses = node.successivePasses;
        if (passedThisTurn) {
          if (isNewDay || node.successivePasses === 0) {
            newPasses = Math.min(3, node.successivePasses + 1);
          }
        }

        const mastered = newPasses === 3 || node.isMastered;
        if (newPasses === 3 && !node.isMastered) {
          shardGained = 1;
          newNotification = `Today ${state.profile.playerName} mastered '${node.title}'!`;
        }

        return {
          ...node,
          accuracy: Math.max(node.accuracy, accuracy),
          successivePasses: newPasses,
          isMastered: mastered,
          attempts: node.attempts + 1,
          lastAttemptAt: Date.now(),
          timeSpent: (node.timeSpent || 0) + timeSpent
        };
      });

      const finalNodes = updatedNodes.map((node, idx) => {
        if (idx === 0) return { ...node, isLocked: false };
        const prevNode = updatedNodes[idx - 1];
        const meetsUnlockCriteria = prevNode.accuracy >= UNLOCK_THRESHOLD || prevNode.isMastered;
        return {
          ...node,
          isLocked: node.isLocked ? !meetsUnlockCriteria : false
        };
      });

      const updatedProfile = {
        ...state.profile,
        totalStars: state.profile.totalStars + starsGained,
        totalSoundShards: state.profile.totalSoundShards + shardGained,
        totalMagicSeeds: (state.profile.totalMagicSeeds || 0) + seedsGained,
        lastActive: Date.now(),
        masteryLevel: Math.floor(finalNodes.filter(n => n.isMastered).length / 2) + 1,
        notifications: newNotification ? [...state.profile.notifications, newNotification] : state.profile.notifications
      };

      return {
        ...state,
        nodes: finalNodes,
        stars: state.stars + starsGained,
        soundShards: state.soundShards + shardGained,
        magicSeeds: state.magicSeeds + seedsGained,
        profile: updatedProfile,
        sessions: [session, ...state.sessions].slice(0, 50)
      };
    }

    case 'SELECT_CHARACTER':
      return { 
        ...state, 
        characterType: action.characterType,
        profile: { ...state.profile, characterType: action.characterType }
      };

    case 'UPDATE_SETTINGS':
      return { ...state, settings: action.settings };

    case 'RESET_PROGRESS':
      return { ...initialState, settings: state.settings, profile: createNewProfile() };

    default:
      return state;
  }
}

const App: React.FC = () => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [view, setView] = useState<'LANDING' | 'ONBOARDING' | 'PLACEMENT' | 'WORLD_INTRO' | 'MAP' | 'GAME' | 'PARENT' | 'VAULT' | 'DAILY' | 'CHAT'>('LANDING');
  const [activeSkill, setActiveSkill] = useState<SkillNode | null>(null);
  const [showCharacterSelector, setShowCharacterSelector] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLockingParent, setIsLockingParent] = useState(false);
  
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [voiceIntensity, setVoiceIntensity] = useState(0);

  useEffect(() => {
    const initialize = async () => {
      storageService.migrateFromOldVersions();
      const saved = await storageService.load();
      if (saved) {
        dispatch({ type: 'LOAD_STATE', payload: saved });
        if (saved.profile.onboardingCompleted) {
          setView('MAP');
        }
      }
      telemetry.loadQueue();
      setIsInitialized(true);
    };

    initialize();
    
    const intensityInterval = setInterval(async () => {
      const vol = await voiceControl.getSonicIntensity();
      setVoiceIntensity(vol);
      setIsVoiceListening(vol > 0.05);
    }, 100);

    return () => {
      clearInterval(intensityInterval);
      voiceControl.stop();
      audioService.stop();
    };
  }, []);

  useEffect(() => {
    if (!isInitialized) return;
    storageService.save(state);
  }, [state, isInitialized]);

  const handleUserInteraction = useCallback(async () => {
    await geminiService.ensureAudioStarted();
  }, []);

  const handleStartAdventure = useCallback(async () => {
    await handleUserInteraction();
    if (state.profile.onboardingCompleted) {
      setView('MAP');
    } else {
      setView('ONBOARDING');
    }
  }, [handleUserInteraction, state.profile.onboardingCompleted]);

  const handleOnboardingComplete = (playerName: string, characterType: CharacterType) => {
    dispatch({ type: 'COMPLETE_ONBOARDING', playerName, characterType });
    setView('PLACEMENT');
  };

  const handlePlacementComplete = (score: number, startingLevel: SkillLevel) => {
    dispatch({ type: 'COMPLETE_PLACEMENT', score, startingLevel });
    setView('WORLD_INTRO');
  };

  const handleWorldIntroComplete = () => {
    setView('MAP');
    voiceControl.startGlobalListener((cmd: NavCommand) => {
      switch(cmd) {
        case 'MAP': setView('MAP'); break;
        case 'VAULT': setView('VAULT'); break;
        case 'PARENT': setIsLockingParent(true); break;
        case 'EXIT': setView('MAP'); setActiveSkill(null); break;
      }
    });
  };

  const handleNodeSelect = async (node: SkillNode) => {
    await handleUserInteraction();
    setActiveSkill(node);
    setView('GAME');
  };

  const handleNavClick = async (newView: typeof view) => {
    await handleUserInteraction();
    if (newView === 'PARENT') setIsLockingParent(true);
    else setView(newView);
  };

  const handleGameComplete = useCallback((accuracy: number, skillId: string, timeSpent: number, session: GameSession) => {
    dispatch({ type: 'GAME_COMPLETE', accuracy, skillId, timeSpent, session });
    setView('MAP');
    setActiveSkill(null);
  }, []);

  const handleResetProgress = () => {
    if (window.confirm("This will erase all progress. Proceed?")) {
      dispatch({ type: 'RESET_PROGRESS' });
      storageService.clear();
      setView('LANDING');
    }
  };

  if (!isInitialized) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-teal-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-black uppercase italic tracking-widest text-xs">Entering Soundia...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div 
        onClick={handleUserInteraction}
        className={`h-screen w-full flex flex-col overflow-hidden transition-colors ${state.settings.highContrast ? 'bg-black' : 'bg-teal-50'} ${state.settings.dyslexicFont ? 'dyslexic-font' : ''}`}>
        
        {view !== 'LANDING' && view !== 'ONBOARDING' && view !== 'PLACEMENT' && view !== 'WORLD_INTRO' && (
          <VoiceIndicator isListening={isVoiceListening} intensity={voiceIntensity} />
        )}

        <main className="flex-1 relative">
          {view === 'LANDING' && <LandingPage onStart={handleStartAdventure} />}
          {view === 'ONBOARDING' && <OnboardingFlow onComplete={handleOnboardingComplete} />}
          {view === 'PLACEMENT' && <PlacementAssessment onComplete={handlePlacementComplete} characterType={state.characterType} />}
          {view === 'WORLD_INTRO' && <WorldIntro characterType={state.characterType} playerName={state.profile.playerName} onComplete={handleWorldIntroComplete} />}
          {isLockingParent && <ParentLock onUnlock={() => { setIsLockingParent(false); setView('PARENT'); }} onCancel={() => setIsLockingParent(false)} />}
          {view === 'VAULT' && <SoundVault nodes={state.nodes} guardians={state.guardians} onSaveGuardian={(g) => dispatch({ type: 'SAVE_GUARDIAN', guardian: g })} onClose={() => setView('MAP')} />}
          {view === 'DAILY' && <DailyChallenge characterType={state.characterType} onComplete={(stars) => { dispatch({ type: 'COMPLETE_DAILY', stars }); setView('MAP'); }} onExit={() => setView('MAP')} />}
          {view === 'CHAT' && <CharacterChat characterType={state.characterType} playerName={state.profile.playerName} nodes={state.nodes} sessions={state.sessions} onExit={() => setView('MAP')} />}
          <CharacterSelectorModal isOpen={showCharacterSelector} onClose={() => setShowCharacterSelector(false)} onSelect={(t) => { dispatch({ type: 'SELECT_CHARACTER', characterType: t }); setShowCharacterSelector(false); }} currentType={state.characterType} />
          {view === 'MAP' && <MagicMap nodes={state.nodes} onNodeSelect={handleNodeSelect} stars={state.stars} characterType={state.characterType} profile={state.profile} onOpenSelector={() => setShowCharacterSelector(true)} onDailyChallenge={() => setView('DAILY')} onChat={() => setView('CHAT')} />}
          {view === 'GAME' && activeSkill && <GameEngine skill={activeSkill} characterType={state.characterType} settings={state.settings} onComplete={handleGameComplete} onExit={() => setView('MAP')} />}
          {view === 'PARENT' && <ParentHub nodes={state.nodes} stars={state.stars} soundShards={state.soundShards} settings={state.settings} sessions={state.sessions} profile={state.profile} onUpdateSettings={(s) => dispatch({ type: 'UPDATE_SETTINGS', settings: s })} onDismissNotifications={() => dispatch({ type: 'DISMISS_NOTIFICATIONS' })} onBack={() => setView('MAP')} onReset={handleResetProgress} />}
        </main>

        {view !== 'GAME' && view !== 'LANDING' && view !== 'ONBOARDING' && view !== 'PLACEMENT' && view !== 'WORLD_INTRO' && !isLockingParent && (
          <nav className={`px-6 py-4 flex justify-around items-center shadow-[0_-4px_20px_rgba(0,0,0,0.05)] border-t-2 ${state.settings.highContrast ? 'bg-black border-white' : 'bg-white border-slate-100'}`}>
            <button onClick={() => handleNavClick('MAP')} className={`flex flex-col items-center gap-1 transition-all ${view === 'MAP' ? 'text-teal-600 scale-110' : 'text-slate-300 hover:text-slate-400'}`}>
              <span className="text-2xl">🗺️</span>
              <span className="text-[10px] font-black uppercase italic tracking-widest">Kingdom</span>
            </button>
            <button onClick={() => handleNavClick('VAULT')} className={`flex flex-col items-center gap-1 transition-all ${view === 'VAULT' ? 'text-indigo-600 scale-110' : 'text-slate-300 hover:text-slate-400'}`}>
              <span className="text-2xl">💎</span>
              <span className="text-[10px] font-black uppercase italic tracking-widest">Vault</span>
            </button>
            <button onClick={() => handleNavClick('PARENT')} className={`flex flex-col items-center gap-1 transition-all ${view === 'PARENT' ? 'text-teal-600 scale-110' : 'text-slate-300 hover:text-slate-400'}`}>
              <span className="text-2xl">📊</span>
              <span className="text-[10px] font-black uppercase italic tracking-widest">Insights</span>
            </button>
          </nav>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default App;
