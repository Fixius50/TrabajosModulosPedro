
import React, { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import * as Tabs from '@radix-ui/react-tabs'
import { Plus, X, FileText, Image, FileCode } from 'lucide-react'
import { useCreateDocument } from '../hooks/useDocuments'
import { FileUploader } from './FileUploader'
import type { DocType } from '../lib/schemas'
import { toast } from 'sonner'
import { v4 as uuidv4 } from 'uuid'

interface CreateNewDialogProps {
    children: React.ReactNode
}

export function CreateNewDialog({ children }: CreateNewDialogProps) {
    const [open, setOpen] = useState(false)
    const [title, setTitle] = useState('')
    const [type, setType] = useState<DocType>('text')
    const createDoc = useCreateDocument()

    const handleCreateSubmit = async (e: React.FormEvent) => {
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
                toast.success('Documento creado')
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
                <Dialog.Content className="fixed left-[50%] top-[50%] max-h-[85vh] w-[90vw] max-w-[500px] translate-x-[-50%] translate-y-[-50%] rounded-xl bg-background p-0 shadow-2xl focus:outline-none z-50 border border-border animate-in zoom-in-95 fade-in slide-in-from-left-1/2 slide-in-from-top-48 overflow-hidden flex flex-col">

                    <div className="flex items-center justify-between px-6 py-4 border-b bg-muted/30">
                        <Dialog.Title className="text-lg font-semibold">
                            Crear o Subir
                        </Dialog.Title>
                        <Dialog.Close asChild>
                            <button className="p-1.5 rounded-full hover:bg-muted text-muted-foreground transition-colors">
                                <X size={18} />
                            </button>
                        </Dialog.Close>
                    </div>

                    <Tabs.Root defaultValue="create" className="flex flex-col flex-1">
                        <Tabs.List className="flex px-6 border-b bg-muted/10">
                            <Tabs.Trigger
                                value="create"
                                className="px-4 py-3 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary text-muted-foreground hover:text-foreground transition-all"
                            >
                                Nuevo Documento
                            </Tabs.Trigger>
                            <Tabs.Trigger
                                value="upload"
                                className="px-4 py-3 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary text-muted-foreground hover:text-foreground transition-all"
                            >
                                Subir Archivo
                            </Tabs.Trigger>
                        </Tabs.List>

                        <div className="p-6 flex-1 overflow-y-auto">
                            <Tabs.Content value="create" className="outline-none space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <form onSubmit={handleCreateSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium leading-none">
                                            Nombre del Documento
                                        </label>
                                        <input
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder="Ej: Notas del proyecto..."
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                                            autoFocus
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-sm font-medium leading-none">
                                            Tipo
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
                                                label="PDF Link"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full mt-4"
                                    >
                                        <Plus className="mr-2 h-4 w-4" /> Crear Documento
                                    </button>
                                </form>
                            </Tabs.Content>

                            <Tabs.Content value="upload" className="outline-none h-full animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="h-full flex flex-col">
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Arrastra archivos aquí o haz clic para seleccionar desde tu ordenador.
                                    </p>
                                    <FileUploader
                                        currentFolderId={null}
                                        onUploadComplete={() => {
                                            setOpen(false)
                                            toast.success('Archivos subidos correctamente')
                                        }}
                                    />
                                </div>
                            </Tabs.Content>
                        </div>
                    </Tabs.Root>
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
