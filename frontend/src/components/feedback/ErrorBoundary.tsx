import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Catches render-time crashes so one broken page cannot blank the whole site.
 * Deliberately minimal: no error-reporting dependency, and no leaking of
 * technical detail into user-facing text.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // In production this is where an error-reporting service would be called.
    console.error('Unhandled UI error:', error, info.componentStack);
  }

  private handleReset = () => {
    this.setState({ error: null });
  };

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="flex min-h-screen items-center justify-center bg-app px-4 py-16">
        <div className="w-full max-w-lg text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-pink-50 text-pink-600">
            <AlertTriangle className="h-7 w-7" aria-hidden="true" />
          </span>

          <h1 className="mt-6 text-2xl font-bold text-navy-800">Something went wrong</h1>

          <p className="mt-3 text-base leading-relaxed text-ink-soft">
            This page could not be displayed. Please try again. If the problem continues, call the
            clinic and we will help you directly.
          </p>

          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={this.handleReset}
              className="inline-flex min-h-[48px] items-center justify-center rounded-xl bg-navy-800 px-6 text-base font-semibold text-white transition-colors hover:bg-navy-900"
            >
              Try again
            </button>
            <a
              href="/"
              className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-line bg-white px-6 text-base font-semibold text-navy-800 transition-colors hover:border-ink-faint"
            >
              Go to home page
            </a>
          </div>

          {import.meta.env.DEV ? (
            <pre className="mt-8 max-h-48 overflow-auto rounded-xl bg-navy-950 p-4 text-left text-xs text-blue-100">
              {error.message}
            </pre>
          ) : null}
        </div>
      </div>
    );
  }
}