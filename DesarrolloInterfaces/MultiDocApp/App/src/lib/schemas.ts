
import { z } from 'zod'

export const DocTypeSchema = z.enum(['text', 'image', 'video', 'pdf', 'code'])

export const DocumentSchema = z.object({
    id: z.string().uuid(),
    title: z.string().min(1, "El título es obligatorio"),
    type: DocTypeSchema,
    content: z.string().optional(),
    url: z.string().url().optional(),
    order: z.number().optional(), // Added order field
    createdAt: z.date().or(z.string().transform((str) => new Date(str))) // Handle JSON Serialization
})

export type Document = z.infer<typeof DocumentSchema>
export type DocType = z.infer<typeof DocTypeSchema>
