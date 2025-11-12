import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-mocca-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 border border-red-200">
            <div className="text-center">
              <div className="text-6xl mb-4">😕</div>
              <h1 className="text-2xl font-bold text-dark-heading mb-4">
                Noe gikk galt
              </h1>
              <p className="text-dark-text mb-6">
                Beklager, men noe uventet skjedde. Vennligst prøv å oppdatere siden.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => window.location.reload()}
                  className="w-full bg-mocca-400 text-white px-6 py-3 rounded-lg font-semibold hover:bg-mocca-500 transition-colors focus:outline-none focus:ring-2 focus:ring-mocca-400 focus:ring-offset-2"
                  aria-label="Oppdater siden"
                >
                  Oppdater siden
                </button>
                <button
                  onClick={() => {
                    this.setState({ hasError: false, error: null });
                    window.location.href = '/';
                  }}
                  className="w-full bg-mocca-200 text-dark-text px-6 py-3 rounded-lg font-semibold hover:bg-mocca-300 transition-colors focus:outline-none focus:ring-2 focus:ring-mocca-400 focus:ring-offset-2"
                  aria-label="Gå til hjemmesiden"
                >
                  Gå til hjemmesiden
                </button>
              </div>
              {import.meta.env.DEV && this.state.error && (
                <details className="mt-6 text-left">
                  <summary className="cursor-pointer text-sm text-gray-600 mb-2">
                    Feildetaljer (Kun i utviklingsmodus)
                  </summary>
                  <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto max-h-40">
                    {this.state.error.toString()}
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

