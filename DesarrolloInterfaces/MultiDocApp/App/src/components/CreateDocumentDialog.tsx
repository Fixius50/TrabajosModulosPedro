import React, { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { Plus, X, FileText, Image, FileCode } from 'lucide-react'
import { useCreateDocument } from '../hooks/useDocuments'
import type { DocType } from '../lib/schemas'
import { toast } from 'sonner'
import { v4 as uuidv4 } from 'uuid'

interface CreateDocumentDialogProps {
    children: React.ReactNode
}

export function CreateDocumentDialog({ children }: CreateDocumentDialogProps) {
    const [open, setOpen] = useState(false)
    const [title, setTitle] = useState('')
    const [type, setType] = useState<DocType>('text')

    // Mutation
    const createDoc = useCreateDocument()
    // const { addDocument } = useStore() // Removed

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!title.trim()) {
            toast.error("El título es obligatorio")
            return
        }

        const newDoc = {
            id: uuidv4(),
            title: title.trim(),
            type,
            content: '',
            createdAt: new Date(),
            url: type === 'image' ? 'https://source.unsplash.com/random' : undefined,
            pinned: false,
            order: 0,
            folderId: null
        }

        createDoc.mutate(newDoc, {
            onSuccess: () => {
                setOpen(false)
                setTitle('')
                setType('text')
            }
        })
    }

    return (
        <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger asChild>
                {children}
            </Dialog.Trigger>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in" />
                <Dialog.Content className="fixed left-[50%] top-[50%] max-h-[85vh] w-[90vw] max-w-[450px] translate-x-[-50%] translate-y-[-50%] rounded-xl bg-background p-6 shadow-2xl focus:outline-none z-50 border border-border animate-in zoom-in-95 fade-in slide-in-from-left-1/2 slide-in-from-top-48">
                    <div className="flex items-center justify-between mb-6">
                        <Dialog.Title className="text-xl font-semibold">
                            Nuevo Documento
                        </Dialog.Title>
                        <Dialog.Close asChild>
                            <button className="p-1 rounded-full hover:bg-muted text-muted-foreground transition-colors">
                                <X size={20} />
                            </button>
                        </Dialog.Close>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Título
                            </label>
                            <input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Ej: Notas de reunión..."
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                autoFocus
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-sm font-medium leading-none">
                                Tipo de Archivo
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <MediaTypeCard
                                    active={type === 'text'}
                                    onClick={() => setType('text')}
                                    icon={<FileText />}
                                    label="Texto / Notas"
                                />
                                <MediaTypeCard
                                    active={type === 'code'}
                                    onClick={() => setType('code')}
                                    icon={<FileCode />}
                                    label="Código"
                                />
                                <MediaTypeCard
                                    active={type === 'image'}
                                    onClick={() => setType('image')}
                                    icon={<Image />}
                                    label="Imagen"
                                />
                                <MediaTypeCard
                                    active={type === 'pdf'}
                                    onClick={() => setType('pdf')}
                                    icon={<FileText className="text-red-500" />}
                                    label="PDF"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end pt-2">
                            <button
                                type="submit"
                                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
                            >
                                <Plus className="mr-2 h-4 w-4" /> Crear Documento
                            </button>
                        </div>
                    </form>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    )
}

function MediaTypeCard({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
    return (
        <div
            onClick={onClick}
            className={`cursor-pointer border rounded-lg p-3 flex flex-col items-center gap-2 transition-all ${active ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border hover:border-primary/50 hover:bg-muted/50'}`}
        >
            <div className={active ? 'text-primary' : 'text-muted-foreground'}>
                {icon}
            </div>
            <span className={`text-xs font-medium ${active ? 'text-primary' : 'text-muted-foreground'}`}>
                {label}
            </span>
        </div>
    )
}
