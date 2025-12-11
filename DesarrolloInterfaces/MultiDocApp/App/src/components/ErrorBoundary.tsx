import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
    children?: ReactNode
}

interface State {
    hasError: boolean
    error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    }

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error }
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo)
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-background p-4">
                    <div className="max-w-md w-full bg-card border border-destructive/50 rounded-lg p-6 shadow-xl space-y-4">
                        <div className="flex items-center gap-3 text-destructive">
                            <AlertTriangle size={32} />
                            <h1 className="text-xl font-bold">Algo salió mal</h1>
                        </div>
                        <p className="text-muted-foreground text-sm">
                            La aplicación ha encontrado un error inesperado al renderizar.
                        </p>
                        <div className="bg-muted p-4 rounded-md overflow-auto max-h-40">
                            <code className="text-xs text-red-500 font-mono">
                                {this.state.error?.message}
                            </code>
                        </div>
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2 rounded-md hover:bg-primary/90 transition"
                        >
                            <RefreshCw size={16} /> Recargar Aplicación
                        </button>
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}
