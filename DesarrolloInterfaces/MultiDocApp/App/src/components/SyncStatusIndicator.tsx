
import { useSyncStore } from '../store/syncStore'
import { Cloud, CloudOff, Loader2, Check, AlertCircle, RefreshCw } from 'lucide-react'
import { DataService } from '../lib/data-service'
import { AnimatePresence, motion } from 'framer-motion'

export function SyncStatusIndicator() {
    const { status, currentOperation, lastSyncAt, pendingChanges, isOnline, error } = useSyncStore()

    const handleManualSync = async () => {
        await DataService.syncWithCloud()
    }

    const getStatusIcon = () => {
        switch (status) {
            case 'syncing':
                return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
            case 'success':
                return <Check className="w-4 h-4 text-green-500" />
            case 'error':
                return <AlertCircle className="w-4 h-4 text-red-500" />
            case 'offline':
                return <CloudOff className="w-4 h-4 text-yellow-500" />
            default:
                return <Cloud className="w-4 h-4 text-muted-foreground" />
        }
    }

    const getStatusText = () => {
        if (!isOnline) return 'Sin conexión'
        switch (status) {
            case 'syncing':
                return currentOperation?.message || 'Sincronizando...'
            case 'success':
                return 'Sincronizado'
            case 'error':
                return error || 'Error de sincronización'
            default:
                if (pendingChanges > 0) return `${pendingChanges} cambios pendientes`
                if (lastSyncAt) {
                    const ago = Math.round((Date.now() - lastSyncAt.getTime()) / 1000 / 60)
                    if (ago < 1) return 'Sincronizado ahora'
                    if (ago < 60) return `Sincronizado hace ${ago} min`
                    return `Sincronizado hace ${Math.round(ago / 60)}h`
                }
                return 'Conectado'
        }
    }

    const getStatusColor = () => {
        switch (status) {
            case 'syncing': return 'bg-blue-500/10 border-blue-500/30'
            case 'success': return 'bg-green-500/10 border-green-500/30'
            case 'error': return 'bg-red-500/10 border-red-500/30'
            case 'offline': return 'bg-yellow-500/10 border-yellow-500/30'
            default: return 'bg-muted/50 border-border'
        }
    }

    return (
        <div className="flex items-center gap-2">
            {/* Status Badge */}
            <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-all duration-300 ${getStatusColor()}`}
            >
                {getStatusIcon()}
                <span className="max-w-[150px] truncate">{getStatusText()}</span>
            </div>

            {/* Manual Sync Button */}
            {isOnline && status === 'idle' && DataService.isCloudConfigured() && (
                <button
                    onClick={handleManualSync}
                    className="p-1.5 rounded-md hover:bg-muted transition-colors"
                    title="Sincronizar ahora"
                >
                    <RefreshCw className="w-4 h-4 text-muted-foreground" />
                </button>
            )}
        </div>
    )
}

// Toast-style notification that appears during sync operations
export function SyncNotification() {
    const { status, currentOperation, error } = useSyncStore()

    const isVisible = status === 'syncing' || status === 'error'

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.9 }}
                    className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
                >
                    <div className={`
                        flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border backdrop-blur-md
                        ${status === 'syncing' ? 'bg-card/95 border-blue-500/30' : 'bg-red-500/10 border-red-500/30'}
                    `}>
                        {status === 'syncing' ? (
                            <>
                                <div className="relative">
                                    <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                                    <div className="absolute inset-0 w-5 h-5 rounded-full bg-blue-500/20 animate-ping" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium">
                                        {currentOperation?.type === 'download' ? 'Descargando' :
                                            currentOperation?.type === 'upload' ? 'Subiendo' : 'Sincronizando'}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {currentOperation?.message}
                                    </span>
                                </div>
                            </>
                        ) : (
                            <>
                                <AlertCircle className="w-5 h-5 text-red-500" />
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-red-500">Error</span>
                                    <span className="text-xs text-muted-foreground">{error}</span>
                                </div>
                            </>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
