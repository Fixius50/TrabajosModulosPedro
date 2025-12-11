
import { create } from 'zustand'

export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error' | 'offline'

interface SyncOperation {
    id: string
    type: 'upload' | 'download' | 'sync'
    entity: 'document' | 'folder' | 'trash' | 'all'
    message: string
    startedAt: Date
}

interface SyncState {
    status: SyncStatus
    currentOperation: SyncOperation | null
    lastSyncAt: Date | null
    pendingChanges: number
    isOnline: boolean
    error: string | null

    // Actions
    startOperation: (operation: Omit<SyncOperation, 'id' | 'startedAt'>) => void
    completeOperation: (success: boolean, error?: string) => void
    setOnline: (online: boolean) => void
    incrementPending: () => void
    decrementPending: () => void
    clearPending: () => void
}

export const useSyncStore = create<SyncState>((set, get) => ({
    status: 'idle',
    currentOperation: null,
    lastSyncAt: null,
    pendingChanges: 0,
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    error: null,

    startOperation: (operation) => {
        const op: SyncOperation = {
            ...operation,
            id: crypto.randomUUID(),
            startedAt: new Date()
        }
        set({ status: 'syncing', currentOperation: op, error: null })
    },

    completeOperation: (success, error) => {
        set({
            status: success ? 'success' : 'error',
            currentOperation: null,
            lastSyncAt: success ? new Date() : get().lastSyncAt,
            error: error || null
        })

        // Reset to idle after short delay
        setTimeout(() => {
            if (get().status === 'success' || get().status === 'error') {
                set({ status: 'idle' })
            }
        }, 2000)
    },

    setOnline: (online) => {
        set({
            isOnline: online,
            status: online ? 'idle' : 'offline'
        })
    },

    incrementPending: () => set((s) => ({ pendingChanges: s.pendingChanges + 1 })),
    decrementPending: () => set((s) => ({ pendingChanges: Math.max(0, s.pendingChanges - 1) })),
    clearPending: () => set({ pendingChanges: 0 })
}))

// Setup online/offline listeners
if (typeof window !== 'undefined') {
    window.addEventListener('online', () => useSyncStore.getState().setOnline(true))
    window.addEventListener('offline', () => useSyncStore.getState().setOnline(false))
}
