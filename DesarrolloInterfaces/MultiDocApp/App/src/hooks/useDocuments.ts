
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { LocalDB } from '../lib/db'
import { DocumentSchema, type Document } from '../lib/schemas'
import { toast } from 'sonner' // Removed uuidv4 and fetchDocuments

// Keys
export const docKeys = {
    all: ['documents'] as const,
    detail: (id: string) => [...docKeys.all, id] as const,
}

// Hooks
export function useDocuments() {
    return useQuery({
        queryKey: docKeys.all,
        queryFn: async () => {
            // Try Local First
            const localDocs = await LocalDB.getAll()

            // Validate with Zod (Optional but good practice)
            try {
                // We map to ensure dates are Date objects for Zod
                const validDocs = localDocs.map(d => DocumentSchema.parse(d))

                // If empty, maybe seeding logic here? Or keep it separate.
                if (validDocs.length === 0) {
                    // logic to seed if needed, handled in UI or separate init
                }
                return validDocs
            } catch (error) {
                console.error("Validation error", error)
                return localDocs as Document[] // Fallback
            }
        }
    })
}

export function useDocument(id: string) {
    return useQuery({
        queryKey: docKeys.detail(id),
        queryFn: async () => {
            // In a real app, fetch single by ID. 
            // Here, we can filter from getAll or add getById to LocalDB
            const docs = await LocalDB.getAll()
            return docs.find(d => d.id === id) as Document || null
        },
        enabled: !!id
    })
}

export function useCreateDocument() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (newDoc: Document) => {
            await LocalDB.add(newDoc)
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
            await LocalDB.remove(id)
            return id
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: docKeys.all })
            // Toast handled in UI or here
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
            await LocalDB.update(id, updates)
            return { id, updates }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: docKeys.all })
        }
    })
}
