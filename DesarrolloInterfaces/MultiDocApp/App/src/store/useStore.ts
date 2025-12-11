
import { create } from 'zustand'
import { LocalDB } from '../lib/db'
import { fetchDocuments } from '../lib/supabase'
import type { Document, DocType } from '../lib/schemas'

// Re-export types for compatibility
export type { Document, DocType }

interface AppState {
    view: 'dashboard' | 'editor' | 'settings'
    documents: Document[]
    activeDocId: string | null
    isLoading: boolean

    // Actions
    setView: (view: 'dashboard' | 'editor' | 'settings') => void
    addDocument: (doc: Document) => void
    setActiveDoc: (id: string | null) => void
    updateDocument: (id: string, updates: Partial<Document>) => void
    deleteDocument: (id: string) => void

    // Customization
    customCSS: string
    setCustomCSS: (css: string) => void

    // Sync Mode
    syncMode: 'manual' | 'auto'
    setSyncMode: (mode: 'manual' | 'auto') => void

    // Type Filter for Sidebar Navigation
    selectedTypeFilter: DocType | null
    setTypeFilter: (type: DocType | null) => void

    // Async
    init: () => Promise<void>
}

export const useStore = create<AppState>((set) => ({
    view: 'dashboard',
    documents: [],
    activeDocId: null,
    isLoading: false,
    customCSS: '',
    syncMode: 'manual',
    selectedTypeFilter: null,

    setView: (view) => set({ view }),

    addDocument: async (doc) => {
        // Optimistic update
        set((state) => ({ documents: [...state.documents, doc] }))
        await LocalDB.addDocument(doc)
        // Cloud sync can happen here
    },

    setActiveDoc: (id) => set({ activeDocId: id, view: id ? 'editor' : 'dashboard' }),

    updateDocument: async (id, updates) => {
        set((state) => ({
            documents: state.documents.map(d => d.id === id ? { ...d, ...updates } : d)
        }))
        await LocalDB.updateDocument(id, updates)
    },

    setCustomCSS: (css) => {
        set({ customCSS: css })
        localStorage.setItem('customCSS', css)
    },

    setSyncMode: (mode) => {
        set({ syncMode: mode })
        localStorage.setItem('syncMode', mode)
    },

    setTypeFilter: (type) => {
        set({ selectedTypeFilter: type })
    },

    deleteDocument: async (id) => {
        set((state) => ({
            documents: state.documents.filter(d => d.id !== id),
            activeDocId: state.activeDocId === id ? null : state.activeDocId,
            view: state.activeDocId === id ? 'dashboard' : state.view
        }))
        await LocalDB.deleteDocument(id)
    },

    init: async () => {
        set({ isLoading: true })
        // Load custom CSS
        const savedCSS = localStorage.getItem('customCSS') || ''
        // Load sync mode
        const savedSyncMode = (localStorage.getItem('syncMode') as 'manual' | 'auto') || 'manual'
        set({ customCSS: savedCSS, syncMode: savedSyncMode })

        try {
            // Try local first
            const localDocs = await LocalDB.getAllDocuments()

            // If empty, seed with demo if totally fresh
            if (localDocs.length === 0) {
                const demoDocs: Document[] = [
                    {
                        id: crypto.randomUUID(),
                        title: 'Bienvenida.md',
                        type: 'text',
                        content: '# Bienvenido a MultiDocApp\n\nEste es un documento de ejemplo persistente.',
                        createdAt: new Date(),
                        pinned: false,
                        order: 0
                    },
                    {
                        id: crypto.randomUUID(),
                        title: 'Demo Image (Unsplash)',
                        type: 'image',
                        url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f',
                        createdAt: new Date(),
                        pinned: false,
                        order: 1
                    }
                ]
                await LocalDB.saveAllDocuments(demoDocs)
                set({ documents: demoDocs })
            } else {
                set({ documents: localDocs })
            }

            // Try cloud (silent fail if no keys)
            try {
                const cloudDocs = await fetchDocuments()
                // Merge logic would go here. For now, we prefer local.
                console.log("Cloud docs found:", cloudDocs?.length)
            } catch (e) {
                console.warn("Cloud sync disabled/failed", e)
            }

        } finally {
            set({ isLoading: false })
        }
    }
}))
