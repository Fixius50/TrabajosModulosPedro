import { create } from 'zustand'
import { LocalDB } from '../lib/db'
import { fetchDocuments } from '../lib/supabase'

export type DocType = 'text' | 'image' | 'video' | 'pdf' | 'code'

export interface Document {
    id: string
    title: string
    type: DocType
    content?: string // For text/code
    url?: string // For media/pdf
    createdAt: Date
}

interface AppState {
    view: 'dashboard' | 'editor'
    documents: Document[]
    activeDocId: string | null
    isLoading: boolean

    // Actions
    setView: (view: 'dashboard' | 'editor') => void
    addDocument: (doc: Document) => void
    setActiveDoc: (id: string | null) => void
    updateDocument: (id: string, updates: Partial<Document>) => void
    deleteDocument: (id: string) => void

    // Async
    init: () => Promise<void>
}

export const useStore = create<AppState>((set) => ({
    view: 'dashboard',
    documents: [],
    activeDocId: null,
    isLoading: false,

    setView: (view) => set({ view }),

    addDocument: async (doc) => {
        // Optimistic update
        set((state) => ({ documents: [...state.documents, doc] }))
        await LocalDB.add(doc)
        // Cloud sync can happen here
    },

    setActiveDoc: (id) => set({ activeDocId: id, view: id ? 'editor' : 'dashboard' }),

    updateDocument: async (id, updates) => {
        set((state) => ({
            documents: state.documents.map(d => d.id === id ? { ...d, ...updates } : d)
        }))
        await LocalDB.update(id, updates)
    },

    deleteDocument: async (id) => {
        set((state) => ({
            documents: state.documents.filter(d => d.id !== id),
            activeDocId: state.activeDocId === id ? null : state.activeDocId,
            view: state.activeDocId === id ? 'dashboard' : state.view
        }))
        await LocalDB.remove(id)
    },

    init: async () => {
        set({ isLoading: true })
        try {
            // Try local first
            const localDocs = await LocalDB.getAll()

            // If empty, seed with demo if totally fresh
            if (localDocs.length === 0) {
                const demoDocs: Document[] = [
                    {
                        id: '1',
                        title: 'Bienvenida.md',
                        type: 'text',
                        content: '# Bienvenido a MultiDocApp\n\nEste es un documento de ejemplo persistente.',
                        createdAt: new Date()
                    },
                    {
                        id: '2',
                        title: 'Demo Image (Unsplash)',
                        type: 'image',
                        url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f',
                        createdAt: new Date()
                    }
                ]
                await LocalDB.saveAll(demoDocs)
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
