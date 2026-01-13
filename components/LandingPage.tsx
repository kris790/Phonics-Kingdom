
import React, { useState } from 'react';

interface LandingPageProps {
  onStart: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  const [showGuide, setShowGuide] = useState(false);

  const GuideOverlay = () => (
    <div className="fixed inset-0 z-[100] bg-slate-950 overflow-y-auto animate-pop">
      <div className="max-w-4xl mx-auto px-6 py-20">
        <div className="flex justify-between items-center mb-16">
          <button 
            onClick={() => setShowGuide(false)}
            className="text-slate-400 font-black uppercase tracking-widest text-xs hover:text-white flex items-center gap-2 transition-colors"
          >
            ← Back to Home
          </button>
          <div className="h-px flex-1 mx-8 bg-gradient-to-r from-teal-500/50 to-transparent"></div>
        </div>

        <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase italic mb-12">
          How the <span className="text-teal-400">Kingdom</span> Works
        </h2>

        <div className="grid grid-cols-1 gap-8 mb-20">
          <div className="bg-white/5 border border-white/10 p-10 rounded-[3rem] backdrop-blur-xl">
            <div className="flex items-center gap-6 mb-6">
              <span className="text-5xl">🎙️</span>
              <h3 className="text-2xl font-black text-white uppercase italic">Real-Time Voice Analysis</h3>
            </div>
            <p className="text-slate-400 text-lg leading-relaxed">
              Brio the Beatboxer uses the <strong>Gemini 2.5 Native Audio</strong> engine to listen to your child. Unlike traditional apps, Phonics Kingdom provides instant, character-voiced feedback on pronunciation, helping children master phonemes through rhythm and play.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 p-10 rounded-[3rem] backdrop-blur-xl">
            <div className="flex items-center gap-6 mb-6">
              <span className="text-5xl">🎨</span>
              <h3 className="text-2xl font-black text-white uppercase italic">AI-Generated Scaffolding</h3>
            </div>
            <p className="text-slate-400 text-lg leading-relaxed">
              Every word your child builds is brought to life by <strong>Gemini 2.5 Flash Image</strong>. This visual context ensures that non-readers can connect sounds to meaning, bridging the gap between decoding and comprehension.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 p-10 rounded-[3rem] backdrop-blur-xl">
            <div className="flex items-center gap-6 mb-6">
              <span className="text-5xl">🧠</span>
              <h3 className="text-2xl font-black text-white uppercase italic">Adaptive Pedagogy</h3>
            </div>
            <p className="text-slate-400 text-lg leading-relaxed">
              Our <strong>Gemini 3 Flash</strong> orchestrator acts as a private tutor. If a child struggles, the app automatically adjusts the speech rate, simplifies prompts, and provides focused practice on the specific sounds the Scrambler is trying to hide.
            </p>
          </div>
        </div>

        <div className="text-center">
          <button 
            onClick={onStart}
            className="bg-teal-500 text-white px-12 py-6 rounded-[3rem] font-black uppercase text-2xl shadow-2xl shadow-teal-500/20 hover:scale-105 active:scale-95 transition-all"
          >
            Start Your First Quest
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full w-full overflow-y-auto bg-slate-950 text-slate-100 scroll-smooth">
      {showGuide && <GuideOverlay />}

      {/* Hero Section */}
      <section className="relative h-screen flex flex-col items-center justify-center text-center p-6 overflow-hidden">
        {/* Animated Background Orbs */}
        <div className="absolute inset-0 pointer-events-none">
           <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-teal-900/20 rounded-full blur-[120px] animate-drift"></div>
           <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-900/20 rounded-full blur-[120px] animate-drift" style={{ animationDelay: '2s' }}></div>
        </div>
        
        <div className="absolute inset-0 track-bg opacity-10 z-0"></div>
        <div className="absolute top-20 left-10 animate-float opacity-10 text-9xl">☁️</div>
        <div className="absolute bottom-20 right-10 animate-float opacity-10 text-9xl" style={{ animationDelay: '1s' }}>☁️</div>
        
        <div className="relative z-10 max-w-4xl">
          <div className="bg-white/5 backdrop-blur-md px-8 py-3 rounded-full border-2 border-white/10 shadow-xl inline-block mb-8 transform -rotate-1">
             <span className="text-teal-400 font-black uppercase tracking-[0.3em] text-xs">AI-Native Literacy Adventure</span>
          </div>
          <h1 className="text-7xl md:text-9xl font-black text-white leading-[0.8] tracking-tighter mb-8 uppercase italic">
            Phonics <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-indigo-500">Kingdom</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-400 font-medium max-w-2xl mx-auto mb-12 leading-relaxed">
            Stop doing worksheets. Start going on quests. Master phonics with an AI-powered Sound Squad that adapts to your child in real-time.
          </p>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            <button 
              onClick={onStart}
              className="group relative bg-teal-500 text-white px-12 py-6 rounded-[3rem] font-black uppercase text-2xl shadow-2xl shadow-teal-500/20 hover:scale-105 active:scale-95 transition-all"
            >
              <span className="relative z-10">Start Adventure</span>
              <div className="absolute inset-0 bg-white rounded-[3rem] opacity-0 group-hover:opacity-20 transition-opacity"></div>
            </button>
            <button 
              onClick={() => setShowGuide(true)}
              className="text-slate-500 font-black uppercase tracking-widest text-sm hover:text-teal-400 transition-colors cursor-pointer outline-none"
            >
              How it works ↓
            </button>
          </div>
        </div>

        {/* Character Peek */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-8 md:gap-20 pointer-events-none opacity-40">
           <div className="text-8xl md:text-[10rem] animate-float translate-y-12">🎙️</div>
           <div className="text-8xl md:text-[10rem] animate-float translate-y-8" style={{ animationDelay: '0.5s' }}>✨</div>
           <div className="text-8xl md:text-[10rem] animate-float translate-y-16" style={{ animationDelay: '1s' }}>🏗️</div>
           <div className="text-8xl md:text-[10rem] animate-float translate-y-10" style={{ animationDelay: '1.5s' }}>🚀</div>
        </div>
      </section>

      {/* Social Proof / Stats */}
      <section className="bg-slate-900 py-20 border-y border-white/5">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <div>
            <div className="text-5xl font-black text-teal-400 mb-2">85%</div>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Mastery Goal</p>
          </div>
          <div>
            <div className="text-5xl font-black text-indigo-400 mb-2">Gemini 3</div>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">AI Reasoning Engine</p>
          </div>
          <div>
            <div className="text-5xl font-black text-rose-400 mb-2">CCSS</div>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Curriculum Mapped</p>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="py-32 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-24">
          <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase italic mb-6">The Sound Squad</h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg font-medium">Four unique heroes designed to tackle the pillars of foundational literacy through play.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Brio */}
          <div className="bg-slate-900 p-12 rounded-[4rem] border-b-[16px] border-teal-600 shadow-xl group hover:-translate-y-2 transition-transform border border-white/5">
             <div className="text-8xl mb-8 group-hover:scale-110 transition-transform inline-block">🎙️</div>
             <h3 className="text-4xl font-black text-white mb-4 uppercase italic">Brio the Beatboxer</h3>
             <p className="text-slate-400 text-lg">Master of phonemes and rhythm. Brio listens to your sounds and drops beats when you get them right.</p>
          </div>
          {/* Vowelia */}
          <div className="bg-slate-900 p-12 rounded-[4rem] border-b-[16px] border-purple-600 shadow-xl group hover:-translate-y-2 transition-transform border border-white/5">
             <div className="text-8xl mb-8 group-hover:scale-110 transition-transform inline-block">✨</div>
             <h3 className="text-4xl font-black text-white mb-4 uppercase italic">Vowelia</h3>
             <p className="text-slate-400 text-lg">Magical weaver of vowel sounds. She helps children bridge the gap between simple sounds and complex words.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

// Fix: Add the missing default export
export default LandingPage;
