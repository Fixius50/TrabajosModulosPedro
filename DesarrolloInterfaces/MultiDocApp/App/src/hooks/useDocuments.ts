
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { DataService } from '../lib/data-service'
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
            const docs = await DataService.getDocuments(folderId)
            try {
                const validDocs = docs.map(d => DocumentSchema.parse(d))
                return validDocs
            } catch (error) {
                console.error("Validation error", error)
                return docs as Document[]
            }
        }
    })
}

export function useDocument(id: string) {
    return useQuery({
        queryKey: docKeys.detail(id),
        queryFn: async () => {
            const doc = await DataService.getDocument(id)
            return doc
        },
        enabled: !!id
    })
}

export function useCreateDocument() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (newDoc: Document) => {
            await DataService.createDocument(newDoc)
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
            await DataService.deleteDocument(id)
            return id
        },
        // Optimistic update: remove from cache immediately
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: docKeys.all })
            const previousDocs = queryClient.getQueryData<Document[]>(docKeys.all)
            queryClient.setQueryData<Document[]>(docKeys.all, (old) =>
                old?.filter(d => d.id !== id) || []
            )
            return { previousDocs }
        },
        onError: (_err, _id, context) => {
            // Rollback on error
            if (context?.previousDocs) {
                queryClient.setQueryData(docKeys.all, context.previousDocs)
            }
            toast.error('Error al eliminar')
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: docKeys.all })
            queryClient.invalidateQueries({ queryKey: trashKeys.all })
        },
        onSuccess: () => {
            toast.success('Movido a papelera')
        }
    })
}

export function useUpdateDocument() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ id, updates }: { id: string, updates: Partial<Document> }) => {
            await DataService.updateDocument(id, updates)
            return { id, updates }
        },
        onMutate: async ({ id, updates }) => {
            await queryClient.cancelQueries({ queryKey: docKeys.all })
            const previousDocs = queryClient.getQueryData<Document[]>(docKeys.all)

            queryClient.setQueryData<Document[]>(docKeys.all, (old) =>
                old?.map(d => d.id === id ? { ...d, ...updates } : d) || []
            )

            return { previousDocs }
        },
        onError: (_err, _vars, context) => {
            if (context?.previousDocs) {
                queryClient.setQueryData(docKeys.all, context.previousDocs)
            }
            toast.error('Error al actualizar')
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: docKeys.all })
        }
    })
}

// ==================== FOLDER HOOKS ====================
export function useFolders(parentId?: string | null) {
    return useQuery({
        queryKey: parentId !== undefined ? folderKeys.byParent(parentId) : folderKeys.all,
        queryFn: async () => {
            return await DataService.getFolders(parentId)
        }
    })
}

export function useFolder(id: string) {
    return useQuery({
        queryKey: folderKeys.detail(id),
        queryFn: async () => {
            return await DataService.getFolder(id)
        },
        enabled: !!id
    })
}

export function useCreateFolder() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (newFolder: Folder) => {
            await DataService.createFolder(newFolder)
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
            await DataService.deleteFolder(id)
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
            await DataService.updateFolder(id, updates)
            return { id, updates }
        },
        onMutate: async ({ id, updates }) => {
            await queryClient.cancelQueries({ queryKey: folderKeys.all })
            const previousFolders = queryClient.getQueryData<Folder[]>(folderKeys.all)

            queryClient.setQueryData<Folder[]>(folderKeys.all, (old) =>
                old?.map(f => f.id === id ? { ...f, ...updates } : f) || []
            )

            return { previousFolders }
        },
        onError: (_err, _vars, context) => {
            if (context?.previousFolders) {
                queryClient.setQueryData(folderKeys.all, context.previousFolders)
            }
            toast.error('Error al actualizar carpeta')
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: folderKeys.all })
        }
    })
}

// ==================== TRASH HOOKS ====================
export function useTrash() {
    return useQuery({
        queryKey: trashKeys.all,
        queryFn: async () => {
            return await DataService.getTrash()
        }
    })
}

export function useRestoreFromTrash() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (trashId: string) => {
            await DataService.restoreFromTrash(trashId)
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
            await DataService.permanentDelete(trashId)
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
            await DataService.emptyTrash()
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
                await DataService.updateDocument(id, { pinned })
            } else {
                await DataService.updateFolder(id, { pinned })
            }
            return { id, type, pinned }
        },
        // Optimistic update: toggle pin immediately
        onMutate: async ({ id, type, pinned }) => {
            const queryKey = type === 'document' ? docKeys.all : folderKeys.all
            await queryClient.cancelQueries({ queryKey })
            const previousData = queryClient.getQueryData(queryKey)

            if (type === 'document') {
                queryClient.setQueryData<Document[]>(docKeys.all, (old) =>
                    old?.map(d => d.id === id ? { ...d, pinned } : d) || []
                )
            } else {
                queryClient.setQueryData<Folder[]>(folderKeys.all, (old) =>
                    old?.map(f => f.id === id ? { ...f, pinned } : f) || []
                )
            }
            return { previousData, queryKey }
        },
        onError: (_err, _vars, context) => {
            if (context?.previousData) {
                queryClient.setQueryData(context.queryKey, context.previousData)
            }
        },
        onSettled: (_, __, variables) => {
            if (variables.type === 'document') {
                queryClient.invalidateQueries({ queryKey: docKeys.all })
            } else {
                queryClient.invalidateQueries({ queryKey: folderKeys.all })
            }
        }
    })
}
