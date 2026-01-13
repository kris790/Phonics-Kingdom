
import React, { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Phonics Kingdom caught an error:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="fixed inset-0 flex items-center justify-center bg-teal-50 p-6 z-[200]">
          <div className="p-12 text-center bg-white rounded-[3rem] shadow-2xl border-4 border-red-100 max-w-lg w-full">
            <div className="text-8xl mb-6">🌪️</div>
            <h2 className="text-3xl font-black text-slate-800 mb-4 uppercase italic">Static Scramble!</h2>
            <p className="text-slate-600 mb-8 font-medium">The Sound Spirits got a bit confused. Let's try resetting the adventure.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="w-full bg-teal-500 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-teal-100 hover:bg-teal-600 transition-all active:scale-95"
            >
              Restart Kingdom
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
