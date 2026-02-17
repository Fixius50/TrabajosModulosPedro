
import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class GlobalErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('CRITICAL UI ERROR:', error, errorInfo);
        // Here we could send to Sentry if needed
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: null });
        window.location.href = '/';
    };

    private handleReload = () => {
        window.location.reload();
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-[#0c0a09] flex items-center justify-center p-6 font-display">
                    <div className="max-w-md w-full glass-panel p-8 border-red-500/30 text-center space-y-6 animate-in fade-in zoom-in duration-300">
                        <div className="w-20 h-20 bg-red-900/20 rounded-full flex items-center justify-center mx-auto border-2 border-red-500/40 text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                            <AlertTriangle size={40} className="animate-pulse" />
                        </div>

                        <div className="space-y-2">
                            <h1 className="text-2xl font-bold text-white tracking-tight">ERROR CRÍTICO DEL SISTEMA</h1>
                            <p className="text-stone-400 text-sm leading-relaxed">
                                El Grimorio ha encontrado una anomalía mágica que impide el renderizado.
                                Es posible que un componente no se haya cargado correctamente.
                            </p>
                        </div>

                        {this.state.error && (
                            <div className="bg-black/40 p-3 rounded border border-red-900/20 text-[0.625rem] font-mono text-red-400/70 text-left overflow-auto max-h-32">
                                {this.state.error.toString()}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4 pt-4">
                            <button
                                onClick={this.handleReload}
                                className="flex items-center justify-center gap-2 px-4 py-3 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold uppercase tracking-widest rounded-lg transition-all border border-stone-600/50"
                            >
                                <RefreshCcw size={14} />
                                Reiniciar
                            </button>
                            <button
                                onClick={this.handleReset}
                                className="flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-widest rounded-lg transition-all shadow-lg shadow-red-900/40"
                            >
                                <Home size={14} />
                                Ir a Inicio
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default GlobalErrorBoundary;
