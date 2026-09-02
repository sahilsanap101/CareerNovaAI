import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Uncaught Error in Component:', error, errorInfo);
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public override render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
          <div className="max-w-md w-full text-center p-8 bg-white dark:bg-slate-900 rounded-2xl shadow-card border border-slate-200 dark:border-slate-800">
            <div className="mx-auto h-14 w-14 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="h-7 w-7 text-red-600 dark:text-red-400" aria-hidden="true" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Something went wrong
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
              An unexpected error occurred in the application. Please try reloading the page.
            </p>
            {this.state.error && (
              <pre className="mb-6 p-3 bg-slate-100 dark:bg-slate-800 rounded-lg text-left text-xs text-slate-600 dark:text-slate-400 overflow-x-auto max-h-32">
                {this.state.error.message}
              </pre>
            )}
            <Button
              onClick={this.handleReset}
              leftIcon={<RefreshCw className="h-4 w-4" />}
              className="w-full"
            >
              Reload Page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
