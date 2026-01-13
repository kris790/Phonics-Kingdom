import React, { useState, useEffect } from 'react';

interface ParentLockProps {
  onUnlock: () => void;
  onCancel: () => void;
}

const ParentLock: React.FC<ParentLockProps> = ({ onUnlock, onCancel }) => {
  const [challenge, setChallenge] = useState({ q: '', a: 0 });
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    const num1 = Math.floor(Math.random() * 10) + 5;
    const num2 = Math.floor(Math.random() * 5) + 1;
    const isPlus = Math.random() > 0.5;
    
    setChallenge({
      q: `${num1} ${isPlus ? '+' : '-'} ${num2}`,
      a: isPlus ? num1 + num2 : num1 - num2
    });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parseInt(input) === challenge.a) {
      onUnlock();
    } else {
      setError(true);
      setInput('');
      setTimeout(() => setError(false), 500);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-xl flex items-center justify-center p-6">
      <div className={`bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl transition-transform ${error ? 'animate-shake' : ''}`}>
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">🔐</div>
          <h2 className="text-2xl font-black text-slate-800">Adults Only</h2>
          <p className="text-slate-500 text-sm mt-1">Please solve this to enter the dashboard.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-slate-50 p-6 rounded-2xl border-2 border-slate-100 text-center">
            <span className="text-4xl font-black text-slate-700 tracking-widest">{challenge.q} = ?</span>
          </div>

          <input
            autoFocus
            type="number"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full text-center text-4xl font-black p-4 rounded-2xl border-4 border-slate-100 focus:border-sky-500 focus:ring-0 outline-none transition-all"
            placeholder="?"
          />

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase tracking-wider text-sm hover:bg-slate-200 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-4 bg-sky-500 text-white rounded-2xl font-black uppercase tracking-wider text-sm shadow-lg shadow-sky-200 hover:bg-sky-600 transition-all active:scale-95"
            >
              Unlock
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ParentLock;