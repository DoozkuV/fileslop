import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-screen p-8">
          <div className="text-center max-w-lg">
            <AlertTriangle size={48} className="text-red-500 mb-6 mx-auto" />
            <h1 className="text-2xl font-semibold mb-4 text-primary-900">Something went wrong</h1>
            <p className="text-primary-600 mb-8">An unexpected error occurred in Fileslop.</p>
            
            {this.state.error && (
              <details className="text-left mb-8 border border-primary-200 rounded-lg overflow-hidden">
                <summary className="px-3 py-2 bg-primary-50 cursor-pointer font-medium text-primary-900">Error details</summary>
                <pre className="px-4 py-4 text-xs text-red-600 bg-white overflow-auto max-h-48 font-mono">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
            
            <button
              className="inline-flex items-center gap-2 bg-accent-400 hover:bg-accent-500 text-white font-medium px-6 py-3 rounded-lg transition-colors"
              onClick={this.handleRetry}
            >
              <RefreshCw size={20} />
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}