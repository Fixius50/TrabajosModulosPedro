
import { get, set } from 'idb-keyval'
import type { Document } from '../store/useStore'

const STORE_KEY = 'multidoc_documents'

export const LocalDB = {
    async getAll(): Promise<Document[]> {
        const docs = await get<Document[]>(STORE_KEY)
        return docs || []
    },

    async saveAll(docs: Document[]) {
        await set(STORE_KEY, docs)
    },

    async add(doc: Document) {
        const docs = await this.getAll()
        docs.push(doc)
        await this.saveAll(docs)
    },

    async update(id: string, updates: Partial<Document>) {
        const docs = await this.getAll()
        const index = docs.findIndex(d => d.id === id)
        if (index !== -1) {
            docs[index] = { ...docs[index], ...updates }
            await this.saveAll(docs)
        }
    },

    async remove(id: string) {
        const docs = await this.getAll()
        const filtered = docs.filter(d => d.id !== id)
        await this.saveAll(filtered)
    }
}
