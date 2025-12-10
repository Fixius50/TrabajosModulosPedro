
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { LocalDB } from '../lib/db'
import { DocumentSchema, type Document, type Folder } from '../lib/schemas'
import { toast } from 'sonner'

// ==================== QUERY KEYS ====================
export const docKeys = {
    all: ['documents'] as const,
    byFolder: (folderId: string | null) => [...docKeys.all, 'folder', folderId] as const,
    detail: (id: string) => [...docKeys.all, id] as const,
}

export const folderKeys = {
    all: ['folders'] as const,
    byParent: (parentId: string | null) => [...folderKeys.all, 'parent', parentId] as const,
    detail: (id: string) => [...folderKeys.all, id] as const,
}

export const trashKeys = {
    all: ['trash'] as const,
}

// ==================== DOCUMENT HOOKS ====================
export function useDocuments(folderId?: string | null) {
    return useQuery({
        queryKey: folderId !== undefined ? docKeys.byFolder(folderId) : docKeys.all,
        queryFn: async () => {
            if (folderId !== undefined) {
                return await LocalDB.getDocumentsByFolder(folderId)
            }
            const localDocs = await LocalDB.getAllDocuments()
            try {
                const validDocs = localDocs.map(d => DocumentSchema.parse(d))
                return validDocs
            } catch (error) {
                console.error("Validation error", error)
                return localDocs as Document[]
            }
        }
    })
}

export function useDocument(id: string) {
    return useQuery({
        queryKey: docKeys.detail(id),
        queryFn: async () => {
            const docs = await LocalDB.getAllDocuments()
            return docs.find(d => d.id === id) as Document || null
        },
        enabled: !!id
    })
}

export function useCreateDocument() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (newDoc: Document) => {
            await LocalDB.addDocument(newDoc)
            return newDoc
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: docKeys.all })
            toast.success('Documento creado')
        },
        onError: () => {
            toast.error('Error al crear documento')
        }
    })
}

export function useDeleteDocument() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (id: string) => {
            // Move to trash instead of permanent delete
            const docs = await LocalDB.getAllDocuments()
            const doc = docs.find(d => d.id === id)
            if (doc) {
                await LocalDB.moveToTrash(doc, 'document')
            }
            return id
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: docKeys.all })
            queryClient.invalidateQueries({ queryKey: trashKeys.all })
            toast.success('Movido a papelera')
        },
        onError: () => {
            toast.error('Error al eliminar')
        }
    })
}

export function useUpdateDocument() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ id, updates }: { id: string, updates: Partial<Document> }) => {
            await LocalDB.updateDocument(id, updates)
            return { id, updates }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: docKeys.all })
        }
    })
}

// ==================== FOLDER HOOKS ====================
export function useFolders(parentId?: string | null) {
    return useQuery({
        queryKey: parentId !== undefined ? folderKeys.byParent(parentId) : folderKeys.all,
        queryFn: async () => {
            if (parentId !== undefined) {
                return await LocalDB.getFoldersByParent(parentId)
            }
            return await LocalDB.getAllFolders()
        }
    })
}

export function useFolder(id: string) {
    return useQuery({
        queryKey: folderKeys.detail(id),
        queryFn: async () => {
            return await LocalDB.getFolder(id)
        },
        enabled: !!id
    })
}

export function useCreateFolder() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (newFolder: Folder) => {
            await LocalDB.addFolder(newFolder)
            return newFolder
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: folderKeys.all })
            toast.success('Carpeta creada')
        },
        onError: () => {
            toast.error('Error al crear carpeta')
        }
    })
}

export function useDeleteFolder() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (id: string) => {
            const folder = await LocalDB.getFolder(id)
            if (folder) {
                await LocalDB.moveToTrash(folder, 'folder')
            }
            return id
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: folderKeys.all })
            queryClient.invalidateQueries({ queryKey: docKeys.all })
            queryClient.invalidateQueries({ queryKey: trashKeys.all })
            toast.success('Carpeta movida a papelera')
        },
        onError: () => {
            toast.error('Error al eliminar carpeta')
        }
    })
}

export function useUpdateFolder() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ id, updates }: { id: string, updates: Partial<Folder> }) => {
            await LocalDB.updateFolder(id, updates)
            return { id, updates }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: folderKeys.all })
        }
    })
}

// ==================== TRASH HOOKS ====================
export function useTrash() {
    return useQuery({
        queryKey: trashKeys.all,
        queryFn: async () => {
            return await LocalDB.getAllTrash()
        }
    })
}

export function useRestoreFromTrash() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (trashId: string) => {
            await LocalDB.restoreFromTrash(trashId)
            return trashId
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: trashKeys.all })
            queryClient.invalidateQueries({ queryKey: docKeys.all })
            queryClient.invalidateQueries({ queryKey: folderKeys.all })
            toast.success('Elemento restaurado')
        },
        onError: () => {
            toast.error('Error al restaurar')
        }
    })
}

export function usePermanentDelete() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (trashId: string) => {
            await LocalDB.permanentDelete(trashId)
            return trashId
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: trashKeys.all })
            toast.success('Eliminado permanentemente')
        },
        onError: () => {
            toast.error('Error al eliminar')
        }
    })
}

export function useEmptyTrash() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async () => {
            await LocalDB.emptyTrash()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: trashKeys.all })
            toast.success('Papelera vaciada')
        },
        onError: () => {
            toast.error('Error al vaciar papelera')
        }
    })
}

// ==================== PIN HOOKS ====================
export function useTogglePin() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ id, type, pinned }: { id: string, type: 'document' | 'folder', pinned: boolean }) => {
            if (type === 'document') {
                await LocalDB.updateDocument(id, { pinned })
            } else {
                await LocalDB.updateFolder(id, { pinned })
            }
            return { id, type, pinned }
        },
        onSuccess: (_, variables) => {
            if (variables.type === 'document') {
                queryClient.invalidateQueries({ queryKey: docKeys.all })
            } else {
                queryClient.invalidateQueries({ queryKey: folderKeys.all })
            }
        }
    })
}
