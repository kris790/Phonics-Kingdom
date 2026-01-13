// ErrorBoundary - Catches React errors and provides fallback UI
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
    
    // In production, you might want to log this to an error tracking service
    // logErrorToService(error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-kingdom-bg flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center">
            {/* Error illustration */}
            <div className="text-6xl mb-4">😵</div>
            
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Oops! Something went wrong
            </h1>
            
            <p className="text-gray-600 mb-6">
              Don't worry! Our magical creatures are working to fix this.
            </p>

            {/* Error details (development only) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  Technical details
                </summary>
                <div className="mt-2 p-3 bg-gray-100 rounded-lg text-xs font-mono text-gray-700 overflow-auto max-h-40">
                  <div className="font-bold text-red-600 mb-2">
                    {this.state.error.name}: {this.state.error.message}
                  </div>
                  <pre className="whitespace-pre-wrap">
                    {this.state.error.stack}
                  </pre>
                </div>
              </details>
            )}

            {/* Action buttons */}
            <div className="flex gap-4">
              <button
                onClick={this.handleReset}
                className="flex-1 py-3 px-6 border-2 border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={this.handleReload}
                className="flex-1 py-3 px-6 bg-gradient-to-r from-brio-teal to-vowelia-purple text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
