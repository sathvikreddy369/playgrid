import React, { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6">
            <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-500" />
          </div>
          <h1 className="text-3xl font-black text-foreground mb-4">Something went wrong</h1>
          <p className="text-muted text-lg max-w-md mb-8">
            An unexpected error occurred while rendering this page. We've logged the issue and are looking into it.
          </p>
          <div className="flex gap-4">
            <button 
              onClick={this.handleReset}
              className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-full font-bold transition-all active:scale-95 shadow-sm"
            >
              <RefreshCcw className="w-5 h-5" /> Try Again
            </button>
            <Link 
              to="/"
              onClick={() => this.setState({ hasError: false, error: null })}
              className="flex items-center gap-2 bg-surface hover:bg-muted/10 text-foreground border border-border px-6 py-3 rounded-full font-bold transition-all active:scale-95 shadow-sm"
            >
              <Home className="w-5 h-5" /> Go Home
            </Link>
          </div>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <div className="mt-12 p-6 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/50 rounded-xl text-left w-full max-w-3xl overflow-auto text-sm font-mono text-red-800 dark:text-red-400">
              <p className="font-bold mb-2">{this.state.error.toString()}</p>
              <pre>{this.state.error.stack}</pre>
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
