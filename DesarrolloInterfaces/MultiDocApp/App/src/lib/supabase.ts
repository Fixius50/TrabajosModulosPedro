
import { createClient } from '@supabase/supabase-js'
import type { Document, Folder, TrashItem } from './schemas'

// Try to get env vars, fallback to null for local-only mode
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = (supabaseUrl && supabaseKey)
    ? createClient(supabaseUrl, supabaseKey)
    : null

export const isSupabaseConfigured = () => supabase !== null

// ==================== DOCUMENTS ====================
export async function fetchDocuments(): Promise<Document[]> {
    if (!supabase) return []
    const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false })
    if (error) {
        console.error('Supabase fetch documents error:', error)
        return []
    }
    return data || []
}

export async function fetchDocumentsByFolder(folderId: string | null): Promise<Document[]> {
    if (!supabase) return []
    let query = supabase.from('documents').select('*')

    if (folderId) {
        query = query.eq('folder_id', folderId)
    } else {
        query = query.is('folder_id', null)
    }

    const { data, error } = await query.order('order', { ascending: true })
    if (error) {
        console.error('Supabase fetch by folder error:', error)
        return []
    }
    return data || []
}

export async function createDocument(doc: Document): Promise<Document | null> {
    if (!supabase) return null
    const { data, error } = await supabase
        .from('documents')
        .insert([{
            id: doc.id,
            title: doc.title,
            type: doc.type,
            content: doc.content,
            url: doc.url,
            folder_id: doc.folderId,
            pinned: doc.pinned,
            order: doc.order,
            ext: doc.ext,
            size: doc.size,
            created_at: doc.createdAt
        }])
        .select()
        .single()

    if (error) {
        console.error('Supabase create document error:', error)
        return null
    }
    return data
}

export async function updateDocument(id: string, updates: Partial<Document>): Promise<boolean> {
    if (!supabase) return false
    const { error } = await supabase
        .from('documents')
        .update({
            title: updates.title,
            content: updates.content,
            url: updates.url,
            folder_id: updates.folderId,
            pinned: updates.pinned,
            order: updates.order
        })
        .eq('id', id)

    if (error) {
        console.error('Supabase update document error:', error)
        return false
    }
    return true
}

export async function deleteDocument(id: string): Promise<boolean> {
    if (!supabase) return false
    const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Supabase delete document error:', error)
        return false
    }
    return true
}

// ==================== FOLDERS ====================
export async function fetchFolders(): Promise<Folder[]> {
    if (!supabase) return []
    const { data, error } = await supabase
        .from('folders')
        .select('*')
        .order('order', { ascending: true })

    if (error) {
        console.error('Supabase fetch folders error:', error)
        return []
    }
    return data || []
}

export async function fetchFoldersByParent(parentId: string | null): Promise<Folder[]> {
    if (!supabase) return []
    let query = supabase.from('folders').select('*')

    if (parentId) {
        query = query.eq('parent_id', parentId)
    } else {
        query = query.is('parent_id', null)
    }

    const { data, error } = await query.order('order', { ascending: true })
    if (error) {
        console.error('Supabase fetch folders by parent error:', error)
        return []
    }
    return data || []
}

export async function createFolder(folder: Folder): Promise<Folder | null> {
    if (!supabase) return null
    const { data, error } = await supabase
        .from('folders')
        .insert([{
            id: folder.id,
            name: folder.name,
            parent_id: folder.parentId,
            pinned: folder.pinned,
            order: folder.order,
            created_at: folder.createdAt
        }])
        .select()
        .single()

    if (error) {
        console.error('Supabase create folder error:', error)
        return null
    }
    return data
}

export async function updateFolder(id: string, updates: Partial<Folder>): Promise<boolean> {
    if (!supabase) return false
    const { error } = await supabase
        .from('folders')
        .update({
            name: updates.name,
            parent_id: updates.parentId,
            pinned: updates.pinned,
            order: updates.order
        })
        .eq('id', id)

    if (error) {
        console.error('Supabase update folder error:', error)
        return false
    }
    return true
}

export async function deleteFolder(id: string): Promise<boolean> {
    if (!supabase) return false
    const { error } = await supabase
        .from('folders')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Supabase delete folder error:', error)
        return false
    }
    return true
}

// ==================== TRASH ====================
export async function fetchTrash(): Promise<TrashItem[]> {
    if (!supabase) return []
    const { data, error } = await supabase
        .from('trash')
        .select('*')
        .order('deleted_at', { ascending: false })

    if (error) {
        console.error('Supabase fetch trash error:', error)
        return []
    }
    return data || []
}

export async function addToTrash(item: TrashItem): Promise<boolean> {
    if (!supabase) return false
    const { error } = await supabase
        .from('trash')
        .insert([{
            id: item.id,
            original_id: item.originalId,
            original_type: item.originalType,
            data: item.data,
            deleted_at: item.deletedAt
        }])

    if (error) {
        console.error('Supabase add to trash error:', error)
        return false
    }
    return true
}

export async function removeFromTrash(id: string): Promise<boolean> {
    if (!supabase) return false
    const { error } = await supabase
        .from('trash')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Supabase remove from trash error:', error)
        return false
    }
    return true
}

export async function emptyTrash(): Promise<boolean> {
    if (!supabase) return false
    const { error } = await supabase
        .from('trash')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

    if (error) {
        console.error('Supabase empty trash error:', error)
        return false
    }
    return true
}

// ==================== SYNC UTILITIES ====================
export async function syncLocalToCloud(
    documents: Document[],
    folders: Folder[],
    trash: TrashItem[]
): Promise<{ success: boolean; errors: string[] }> {
    if (!supabase) {
        return { success: false, errors: ['Supabase no configurado'] }
    }

    const errors: string[] = []

    // Sync folders first (for foreign key references)
    for (const folder of folders) {
        const result = await createFolder(folder)
        if (!result) errors.push(`Error syncing folder: ${folder.name}`)
    }

    // Sync documents
    for (const doc of documents) {
        const result = await createDocument(doc)
        if (!result) errors.push(`Error syncing document: ${doc.title}`)
    }

    // Sync trash
    for (const item of trash) {
        const result = await addToTrash(item)
        if (!result) errors.push(`Error syncing trash item: ${item.id}`)
    }

    return {
        success: errors.length === 0,
        errors
    }
}
