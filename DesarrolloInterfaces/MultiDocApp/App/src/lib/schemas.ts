
import { z } from 'zod'

// Expanded Document Types
export const DocTypeSchema = z.enum([
    'text', 'image', 'video', 'pdf', 'code',
    'audio', 'excel', 'csv', 'markdown', 'json', 'html'
])

export const DocumentSchema = z.object({
    id: z.string().uuid(),
    title: z.string().min(1, "El título es obligatorio"),
    type: DocTypeSchema,
    content: z.string().optional(),
    url: z.string().optional(),
    folderId: z.string().uuid().nullable().optional(), // null = root level
    pinned: z.boolean().default(false),
    order: z.number().default(0),
    ext: z.string().optional(), // File extension
    size: z.number().optional(), // File size in bytes
    createdAt: z.date().or(z.string().transform((str) => new Date(str)))
})

export const FolderSchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(1, "El nombre es obligatorio"),
    parentId: z.string().uuid().nullable().optional(), // null = root level
    pinned: z.boolean().default(false),
    order: z.number().default(0),
    createdAt: z.date().or(z.string().transform((str) => new Date(str)))
})

export const TrashItemSchema = z.object({
    id: z.string().uuid(),
    originalId: z.string().uuid(),
    originalType: z.enum(['folder', 'document']),
    data: z.any(), // Original document or folder data
    deletedAt: z.date().or(z.string().transform((str) => new Date(str)))
})

export type Document = z.infer<typeof DocumentSchema>
export type DocType = z.infer<typeof DocTypeSchema>
export type Folder = z.infer<typeof FolderSchema>
export type TrashItem = z.infer<typeof TrashItemSchema>

// Helper to detect file type from extension
export function detectFileType(filename: string): DocType {
    const ext = filename.split('.').pop()?.toLowerCase() || ''

    if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp'].includes(ext)) return 'image'
    if (['mp4', 'webm', 'mov', 'avi', 'mkv'].includes(ext)) return 'video'
    if (['mp3', 'wav', 'ogg', 'm4a', 'flac'].includes(ext)) return 'audio'
    if (['pdf'].includes(ext)) return 'pdf'
    if (['xls', 'xlsx'].includes(ext)) return 'excel'
    if (['csv'].includes(ext)) return 'csv'
    if (['md', 'markdown'].includes(ext)) return 'markdown'
    if (['json'].includes(ext)) return 'json'
    if (['html', 'htm'].includes(ext)) return 'html'
    if (['js', 'ts', 'jsx', 'tsx', 'css', 'scss', 'py', 'java', 'c', 'cpp', 'go', 'rs', 'sql', 'sh'].includes(ext)) return 'code'

    return 'text'
}
