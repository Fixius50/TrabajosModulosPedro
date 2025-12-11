
import { get, set } from 'idb-keyval'
import type { Document, Folder, TrashItem } from './schemas'

const DOCS_KEY = 'multidoc_documents'
const FOLDERS_KEY = 'multidoc_folders'
const TRASH_KEY = 'multidoc_trash'

export const LocalDB = {
    // ==================== DOCUMENTS ====================
    async getAllDocuments(): Promise<Document[]> {
        const docs = await get<Document[]>(DOCS_KEY)
        return docs || []
    },

    async getDocumentsByFolder(folderId: string | null): Promise<Document[]> {
        const docs = await this.getAllDocuments()
        return docs.filter(d => (d.folderId || null) === folderId)
    },

    async saveAllDocuments(docs: Document[]) {
        await set(DOCS_KEY, docs)
    },

    async addDocument(doc: Document) {
        const docs = await this.getAllDocuments()
        docs.push(doc)
        await this.saveAllDocuments(docs)
    },

    async updateDocument(id: string, updates: Partial<Document>) {
        const docs = await this.getAllDocuments()
        const index = docs.findIndex(d => d.id === id)
        if (index !== -1) {
            docs[index] = { ...docs[index], ...updates }
            await this.saveAllDocuments(docs)
        }
    },

    async deleteDocument(id: string) {
        const docs = await this.getAllDocuments()
        const filtered = docs.filter(d => d.id !== id)
        await this.saveAllDocuments(filtered)
    },

    // ==================== FOLDERS ====================
    async getAllFolders(): Promise<Folder[]> {
        const folders = await get<Folder[]>(FOLDERS_KEY)
        return folders || []
    },

    async getFoldersByParent(parentId: string | null): Promise<Folder[]> {
        const folders = await this.getAllFolders()
        return folders.filter(f => (f.parentId || null) === parentId)
    },

    async saveAllFolders(folders: Folder[]) {
        await set(FOLDERS_KEY, folders)
    },

    async addFolder(folder: Folder) {
        const folders = await this.getAllFolders()
        folders.push(folder)
        await this.saveAllFolders(folders)
    },

    async updateFolder(id: string, updates: Partial<Folder>) {
        const folders = await this.getAllFolders()
        const index = folders.findIndex(f => f.id === id)
        if (index !== -1) {
            folders[index] = { ...folders[index], ...updates }
            await this.saveAllFolders(folders)
        }
    },

    async deleteFolder(id: string) {
        const folders = await this.getAllFolders()
        const filtered = folders.filter(f => f.id !== id)
        await this.saveAllFolders(filtered)
    },

    async getFolder(id: string): Promise<Folder | null> {
        const folders = await this.getAllFolders()
        return folders.find(f => f.id === id) || null
    },

    // ==================== TRASH ====================
    async getAllTrash(): Promise<TrashItem[]> {
        const trash = await get<TrashItem[]>(TRASH_KEY)
        return trash || []
    },

    async saveAllTrash(trash: TrashItem[]) {
        await set(TRASH_KEY, trash)
    },

    async moveToTrash(item: Document | Folder, type: 'document' | 'folder') {
        const trashItem: TrashItem = {
            id: crypto.randomUUID(),
            originalId: item.id,
            originalType: type,
            data: item,
            deletedAt: new Date()
        }

        const trash = await this.getAllTrash()
        trash.push(trashItem)
        await this.saveAllTrash(trash)

        // Remove from original location
        if (type === 'document') {
            await this.deleteDocument(item.id)
        } else {
            await this.deleteFolder(item.id)
            // Also move all documents in this folder to trash
            const docs = await this.getDocumentsByFolder(item.id)
            for (const doc of docs) {
                await this.moveToTrash(doc, 'document')
            }
        }
    },

    async restoreFromTrash(trashId: string) {
        const trash = await this.getAllTrash()
        const item = trash.find(t => t.id === trashId)

        if (!item) return

        // FIRST: Remove from trash to prevent duplicates
        const filtered = trash.filter(t => t.id !== trashId)
        await this.saveAllTrash(filtered)

        // THEN: Check if item already exists (prevent duplicates)
        if (item.originalType === 'document') {
            const existingDocs = await this.getAllDocuments()
            const alreadyExists = existingDocs.some(d => d.id === item.originalId)
            if (!alreadyExists) {
                await this.addDocument(item.data as Document)
            }
        } else {
            const existingFolders = await this.getAllFolders()
            const alreadyExists = existingFolders.some(f => f.id === item.originalId)
            if (!alreadyExists) {
                await this.addFolder(item.data as Folder)
            }
        }
    },

    async restoreAllTrash() {
        const trash = await this.getAllTrash()
        for (const item of trash) {
            // Restore logic duplicated for safety/atomic-like op (in local context)
            // Or strictly, we just define it to call restoreFromTrash, but iteration is safer here for bulk
            // Simpler: iterate and call restoreFromTrash (inefficient but safe) or bulk logic.
            // Bulk logic:
            if (item.originalType === 'document') {
                const existingDocs = await this.getAllDocuments()
                if (!existingDocs.some(d => d.id === item.originalId)) {
                    await this.addDocument(item.data as Document)
                }
            } else {
                const existingFolders = await this.getAllFolders()
                if (!existingFolders.some(f => f.id === item.originalId)) {
                    await this.addFolder(item.data as Folder)
                }
            }
        }
        await this.saveAllTrash([])
    },

    async permanentDelete(trashId: string) {
        const trash = await this.getAllTrash()
        const filtered = trash.filter(t => t.id !== trashId)
        await this.saveAllTrash(filtered)
    },

    async emptyTrash() {
        await this.saveAllTrash([])
    },

    // ==================== LEGACY COMPAT ====================
    // These maintain backward compatibility with existing code
    async getAll(): Promise<Document[]> {
        return this.getAllDocuments()
    },

    async saveAll(docs: Document[]) {
        return this.saveAllDocuments(docs)
    },

    async add(doc: Document) {
        return this.addDocument(doc)
    },

    async update(id: string, updates: Partial<Document>) {
        return this.updateDocument(id, updates)
    },

    async remove(id: string) {
        return this.deleteDocument(id)
    }
}
