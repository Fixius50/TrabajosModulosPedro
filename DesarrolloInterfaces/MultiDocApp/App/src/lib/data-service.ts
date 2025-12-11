
import { LocalDB } from './db'
import * as Supabase from './supabase'
import { useSyncStore } from '../store/syncStore'
import type { Document, Folder, TrashItem } from './schemas'

/**
 * DataService - Unified data layer with Local-First + Cloud Sync strategy
 * 
 * Strategy:
 * 1. All operations write to LOCAL (IndexedDB) immediately for instant response
 * 2. Background sync to CLOUD (Supabase) if configured
 * 3. On app start, merge cloud data into local (cloud wins on conflict)
 */

const syncStore = () => useSyncStore.getState()

// ==================== DOCUMENTS ====================

export async function getDocuments(folderId?: string | null): Promise<Document[]> {
    // Always read from local for speed
    if (folderId !== undefined) {
        return await LocalDB.getDocumentsByFolder(folderId)
    }
    return await LocalDB.getAllDocuments()
}

export async function getDocument(id: string): Promise<Document | null> {
    const docs = await LocalDB.getAllDocuments()
    return docs.find(d => d.id === id) || null
}

export async function createDocument(doc: Document): Promise<Document> {
    syncStore().startOperation({
        type: 'upload',
        entity: 'document',
        message: `Guardando "${doc.title}"...`
    })

    try {
        // 1. Save locally (instant)
        await LocalDB.addDocument(doc)

        // 2. Sync to cloud (background)
        if (Supabase.isSupabaseConfigured()) {
            syncStore().incrementPending()
            try {
                await Supabase.createDocument(doc)
                syncStore().decrementPending()
            } catch (e) {
                console.warn('Cloud sync failed for create:', e)
                // Keep in pending for retry
            }
        }

        syncStore().completeOperation(true)
        return doc
    } catch (error) {
        syncStore().completeOperation(false, 'Error al guardar documento')
        throw error
    }
}

export async function updateDocument(id: string, updates: Partial<Document>): Promise<void> {
    syncStore().startOperation({
        type: 'upload',
        entity: 'document',
        message: 'Actualizando documento...'
    })

    try {
        // 1. Update locally
        await LocalDB.updateDocument(id, updates)

        // 2. Sync to cloud
        if (Supabase.isSupabaseConfigured()) {
            syncStore().incrementPending()
            try {
                await Supabase.updateDocument(id, updates)
                syncStore().decrementPending()
            } catch (e) {
                console.warn('Cloud sync failed for update:', e)
            }
        }

        syncStore().completeOperation(true)
    } catch (error) {
        syncStore().completeOperation(false, 'Error al actualizar')
        throw error
    }
}

export async function deleteDocument(id: string): Promise<void> {
    syncStore().startOperation({
        type: 'upload',
        entity: 'document',
        message: 'Moviendo a papelera...'
    })

    try {
        // Get doc before delete
        const docs = await LocalDB.getAllDocuments()
        const doc = docs.find(d => d.id === id)

        if (doc) {
            await LocalDB.moveToTrash(doc, 'document')

            if (Supabase.isSupabaseConfigured()) {
                try {
                    await Supabase.deleteDocument(id)
                } catch (e) {
                    console.warn('Cloud delete failed:', e)
                }
            }
        }

        syncStore().completeOperation(true)
    } catch (error) {
        syncStore().completeOperation(false, 'Error al eliminar')
        throw error
    }
}

// ==================== FOLDERS ====================

export async function getFolders(parentId?: string | null): Promise<Folder[]> {
    if (parentId !== undefined) {
        return await LocalDB.getFoldersByParent(parentId)
    }
    return await LocalDB.getAllFolders()
}

export async function getFolder(id: string): Promise<Folder | null> {
    return await LocalDB.getFolder(id)
}

export async function createFolder(folder: Folder): Promise<Folder> {
    syncStore().startOperation({
        type: 'upload',
        entity: 'folder',
        message: `Creando carpeta "${folder.name}"...`
    })

    try {
        await LocalDB.addFolder(folder)

        if (Supabase.isSupabaseConfigured()) {
            try {
                await Supabase.createFolder(folder)
            } catch (e) {
                console.warn('Cloud folder create failed:', e)
            }
        }

        syncStore().completeOperation(true)
        return folder
    } catch (error) {
        syncStore().completeOperation(false, 'Error al crear carpeta')
        throw error
    }
}

export async function updateFolder(id: string, updates: Partial<Folder>): Promise<void> {
    await LocalDB.updateFolder(id, updates)

    if (Supabase.isSupabaseConfigured()) {
        try {
            await Supabase.updateFolder(id, updates)
        } catch (e) {
            console.warn('Cloud folder update failed:', e)
        }
    }
}

export async function deleteFolder(id: string): Promise<void> {
    syncStore().startOperation({
        type: 'upload',
        entity: 'folder',
        message: 'Eliminando carpeta...'
    })

    try {
        const folder = await LocalDB.getFolder(id)
        if (folder) {
            await LocalDB.moveToTrash(folder, 'folder')

            if (Supabase.isSupabaseConfigured()) {
                try {
                    await Supabase.deleteFolder(id)
                } catch (e) {
                    console.warn('Cloud folder delete failed:', e)
                }
            }
        }

        syncStore().completeOperation(true)
    } catch (error) {
        syncStore().completeOperation(false, 'Error al eliminar carpeta')
        throw error
    }
}

// ==================== TRASH ====================

export async function getTrash(): Promise<TrashItem[]> {
    return await LocalDB.getAllTrash()
}

// ... (previous code)

export async function restoreFromTrash(trashId: string): Promise<void> {
    syncStore().startOperation({
        type: 'sync',
        entity: 'trash',
        message: 'Restaurando elemento...'
    })

    try {
        await LocalDB.restoreFromTrash(trashId)
        syncStore().completeOperation(true)
    } catch (error) {
        syncStore().completeOperation(false, 'Error al restaurar')
        throw error
    }
}

export async function restoreAllFromTrash(): Promise<void> {
    syncStore().startOperation({
        type: 'sync',
        entity: 'trash',
        message: 'Restaurando todo...'
    })

    try {
        await LocalDB.restoreAllTrash()

        if (Supabase.isSupabaseConfigured()) {
            try {
                await Supabase.restoreAllTrash()
            } catch (e) {
                console.warn('Cloud restore all failed:', e)
            }
        }

        syncStore().completeOperation(true)
    } catch (error) {
        syncStore().completeOperation(false, 'Error al restaurar todo')
        throw error
    }
}

export async function permanentDelete(trashId: string): Promise<void> {
    // ...
    await LocalDB.permanentDelete(trashId)
}

export async function emptyTrash(): Promise<void> {
    syncStore().startOperation({
        type: 'sync',
        entity: 'trash',
        message: 'Vaciando papelera...'
    })

    try {
        await LocalDB.emptyTrash()

        if (Supabase.isSupabaseConfigured()) {
            try {
                await Supabase.emptyTrash()
            } catch (e) {
                console.warn('Cloud trash empty failed:', e)
            }
        }

        syncStore().completeOperation(true)
    } catch (error) {
        syncStore().completeOperation(false, 'Error al vaciar papelera')
        throw error
    }
}

// ==================== SYNC ====================

export async function syncWithCloud(): Promise<{ success: boolean; merged: number }> {
    if (!Supabase.isSupabaseConfigured()) {
        return { success: false, merged: 0 }
    }

    syncStore().startOperation({
        type: 'download',
        entity: 'all',
        message: 'Sincronizando con la nube...'
    })

    try {
        let merged = 0

        // Fetch all from cloud
        const [cloudDocs, cloudFolders] = await Promise.all([
            Supabase.fetchDocuments(),
            Supabase.fetchFolders()
        ])

        // Get local data
        const [localDocs, localFolders] = await Promise.all([
            LocalDB.getAllDocuments(),
            LocalDB.getAllFolders()
        ])

        // Merge documents (cloud wins for now - simple strategy)
        const localDocIds = new Set(localDocs.map(d => d.id))
        for (const cloudDoc of cloudDocs as any[]) {
            if (!localDocIds.has(cloudDoc.id)) {
                // Map cloud fields to local schema (snake_case -> camelCase)
                const mappedDoc: Document = {
                    id: cloudDoc.id,
                    title: cloudDoc.title,
                    type: cloudDoc.type,
                    content: cloudDoc.content,
                    url: cloudDoc.url,
                    folderId: cloudDoc.folder_id ?? cloudDoc.folderId,
                    pinned: cloudDoc.pinned ?? false,
                    order: cloudDoc.order ?? 0,
                    ext: cloudDoc.ext,
                    size: cloudDoc.size,
                    createdAt: new Date(cloudDoc.created_at ?? cloudDoc.createdAt)
                }
                await LocalDB.addDocument(mappedDoc)
                merged++
            }
        }

        // Merge folders
        const localFolderIds = new Set(localFolders.map(f => f.id))
        for (const cloudFolder of cloudFolders as any[]) {
            if (!localFolderIds.has(cloudFolder.id)) {
                const mappedFolder: Folder = {
                    id: cloudFolder.id,
                    name: cloudFolder.name,
                    parentId: cloudFolder.parent_id ?? cloudFolder.parentId,
                    pinned: cloudFolder.pinned ?? false,
                    order: cloudFolder.order ?? 0,
                    createdAt: new Date(cloudFolder.created_at ?? cloudFolder.createdAt)
                }
                await LocalDB.addFolder(mappedFolder)
                merged++
            }
        }

        syncStore().clearPending()
        syncStore().completeOperation(true)

        return { success: true, merged }
    } catch (error) {
        console.error('Sync failed:', error)
        syncStore().completeOperation(false, 'Error de sincronización')
        return { success: false, merged: 0 }
    }
}

// ==================== INITIAL LOAD ====================

export async function initializeData(): Promise<void> {
    syncStore().startOperation({
        type: 'download',
        entity: 'all',
        message: 'Cargando datos...'
    })

    try {
        // Check if we have local data
        const localDocs = await LocalDB.getAllDocuments()

        // If empty, seed with demo data
        if (localDocs.length === 0) {
            const demoDocs: Document[] = [
                {
                    id: crypto.randomUUID(),
                    title: 'Bienvenida.md',
                    type: 'markdown',
                    content: '# Bienvenido a MultiDocApp\n\nEste es un documento de ejemplo persistente.\n\n## Características\n- Gestión de documentos\n- Sincronización con la nube\n- Soporte offline',
                    createdAt: new Date(),
                    pinned: true,
                    order: 0
                },
                {
                    id: crypto.randomUUID(),
                    title: 'Demo Image',
                    type: 'image',
                    url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f',
                    createdAt: new Date(),
                    pinned: false,
                    order: 1
                }
            ]
            await LocalDB.saveAllDocuments(demoDocs)
        }

        // Try to sync with cloud
        if (Supabase.isSupabaseConfigured()) {
            await syncWithCloud()
        }

        syncStore().completeOperation(true)
    } catch (error) {
        console.error('Init failed:', error)
        syncStore().completeOperation(false, 'Error al cargar datos')
    }
}

// Export for convenience
export const DataService = {
    // Documents
    getDocuments,
    getDocument,
    createDocument,
    updateDocument,
    deleteDocument,

    // Folders
    getFolders,
    getFolder,
    createFolder,
    updateFolder,
    deleteFolder,

    // Trash
    getTrash,
    restoreFromTrash,
    restoreAllFromTrash,
    permanentDelete,
    emptyTrash,

    // Sync
    syncWithCloud,
    initializeData,
    isCloudConfigured: Supabase.isSupabaseConfigured
}
