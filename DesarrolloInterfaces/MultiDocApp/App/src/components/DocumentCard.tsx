
import React from 'react'
import { FileText, Image as ImageIcon, Video, FileCode, Trash2 } from 'lucide-react'
import { useStore } from '../store/useStore'
import type { Document, DocType } from '../store/useStore'
import { cn } from '../lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import * as AlertDialog from '@radix-ui/react-alert-dialog'
import { toast } from 'sonner'

const IconMap: Record<DocType, React.ElementType> = {
    text: FileText,
    image: ImageIcon,
    video: Video,
    pdf: FileText, // TODO: Add PDF icon
    code: FileCode
}

export function DocumentCard({ doc }: { doc: Document }) {
    const { setActiveDoc, deleteDocument } = useStore()
    const Icon = IconMap[doc.type]

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation()
        try {
            await deleteDocument(doc.id)
            toast.success('Documento eliminado correctamente', {
                description: doc.title,
                duration: 4000
            })
        } catch (error) {
            toast.error('Error al eliminar el documento')
        }
    }

    return (
        <div
            className="group relative bg-card border border-border rounded-xl p-4 hover:shadow-lg transition-all cursor-pointer hover:border-primary/50"
            onClick={() => setActiveDoc(doc.id)}
        >
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 z-10">
                <AlertDialog.Root>
                    <AlertDialog.Trigger asChild>
                        <button
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 bg-destructive/10 text-destructive rounded-full hover:bg-destructive hover:text-destructive-foreground transition-colors"
                        >
                            <Trash2 size={14} />
                        </button>
                    </AlertDialog.Trigger>
                    <AlertDialog.Portal>
                        <AlertDialog.Overlay className="fixed inset-0 bg-black/50 data-[state=open]:animate-overlayShow relative z-50 backdrop-blur-sm" />
                        <AlertDialog.Content className="fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[500px] translate-x-[-50%] translate-y-[-50%] rounded-lg bg-background p-6 shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none z-50 border border-border">
                            <AlertDialog.Title className="text-lg font-semibold text-foreground">
                                ¿Estás seguro?
                            </AlertDialog.Title>
                            <AlertDialog.Description className="mt-2 text-sm text-muted-foreground">
                                Esta acción no se puede deshacer. Se eliminará permanentemente el documento <span className="font-bold text-foreground">{doc.title}</span>.
                            </AlertDialog.Description>
                            <div className="flex justify-end gap-3 mt-6">
                                <AlertDialog.Cancel asChild>
                                    <button className="px-3 py-2 text-sm font-medium rounded-md bg-muted hover:bg-muted/80 text-foreground transition-colors">
                                        Cancelar
                                    </button>
                                </AlertDialog.Cancel>
                                <AlertDialog.Action asChild>
                                    <button
                                        onClick={handleDelete}
                                        className="px-3 py-2 text-sm font-medium rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
                                    >
                                        Sí, eliminar
                                    </button>
                                </AlertDialog.Action>
                            </div>
                        </AlertDialog.Content>
                    </AlertDialog.Portal>
                </AlertDialog.Root>
            </div>

            <div className={cn(
                "h-32 w-full rounded-lg mb-4 flex items-center justify-center bg-muted/30",
                doc.type === 'image' && "bg-transparent p-0 overflow-hidden"
            )}>
                {doc.type === 'image' && doc.url ? (
                    <img src={doc.url} alt={doc.title} className="w-full h-full object-cover rounded-lg" />
                ) : (
                    <Icon size={48} className="text-muted-foreground/50" />
                )}
            </div>

            <div>
                <h3 className="font-semibold text-lg truncate group-hover:text-primary transition-colors">
                    {doc.title}
                </h3>
                <p className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                    <span className="uppercase bg-secondary px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider">
                        {doc.type}
                    </span>
                    <span>
                        {formatDistanceToNow(new Date(doc.createdAt), { addSuffix: true, locale: es })}
                    </span>
                </p>
            </div>
        </div>
    )
}
