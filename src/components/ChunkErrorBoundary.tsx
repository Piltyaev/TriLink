import { Component, type ReactNode } from "react";

interface Props { children: ReactNode }
interface State { hasError: boolean }

export class ChunkErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center">
          <p className="text-muted-foreground text-sm">Не удалось загрузить страницу</p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Обновить
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
