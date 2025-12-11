
import React from 'react'
import {
    FileText, Image as ImageIcon, Video, FileCode, Trash2,
    Music, FileSpreadsheet, Table, FileJson, Code, Pin, PinOff, MoreVertical
} from 'lucide-react'
import type { Document, DocType } from '../lib/schemas'
import { cn } from '../lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import * as AlertDialog from '@radix-ui/react-alert-dialog'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { useNavigate } from '@tanstack/react-router'
import { useDeleteDocument, useTogglePin } from '../hooks/useDocuments'

const IconMap: Record<DocType, React.ElementType> = {
    text: FileText,
    image: ImageIcon,
    video: Video,
    pdf: FileText,
    code: FileCode,
    audio: Music,
    excel: FileSpreadsheet,
    csv: Table,
    markdown: FileText,
    json: FileJson,
    html: Code
}

interface DocumentCardProps {
    doc: Document
    viewMode?: 'grid' | 'list'
}

export function DocumentCard({ doc, viewMode = 'grid' }: DocumentCardProps) {
    const deleteMutation = useDeleteDocument()
    const togglePin = useTogglePin()
    const navigate = useNavigate()
    const Icon = IconMap[doc.type] || FileText

    const handleCardClick = () => {
        navigate({ to: '/editor/$docId', params: { docId: doc.id } })
    }

    const handleDelete = () => {
        deleteMutation.mutate(doc.id)
    }

    const handlePin = (e: React.MouseEvent) => {
        e.stopPropagation()
        togglePin.mutate({ id: doc.id, type: 'document', pinned: !doc.pinned })
    }

    // List view
    if (viewMode === 'list') {
        return (
            <div
                onClick={handleCardClick}
                className={cn(
                    "flex items-center gap-4 p-3 bg-card border rounded-lg hover:border-primary/50 transition-all group cursor-pointer",
                    doc.pinned && "ring-2 ring-amber-400/50 border-amber-400"
                )}
            >
                {/* Thumbnail */}
                <div className="w-12 h-12 rounded-md bg-muted/50 flex items-center justify-center overflow-hidden shrink-0">
                    {doc.type === 'image' && doc.url ? (
                        <img src={doc.url} alt="" className="w-full h-full object-cover" />
                    ) : (
                        <Icon size={20} className="text-muted-foreground" />
                    )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate group-hover:text-primary transition-colors">
                        {doc.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        <span className="uppercase bg-muted px-1.5 py-0.5 rounded text-[10px] font-bold">
                            {doc.type}
                        </span>
                        {doc.size && (
                            <span>{(doc.size / 1024).toFixed(1)} KB</span>
                        )}
                    </div>
                </div>

                {/* Pin indicator */}
                {doc.pinned && (
                    <Pin size={14} className="text-amber-400 fill-current shrink-0" />
                )}

                {/* Actions */}
                <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild>
                        <button
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 hover:bg-muted rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <MoreVertical size={16} className="text-muted-foreground" />
                        </button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Portal>
                        <DropdownMenu.Content className="min-w-[140px] bg-popover rounded-md border shadow-md p-1 z-50">
                            <DropdownMenu.Item
                                className="flex items-center gap-2 px-2 py-1.5 text-sm outline-none cursor-pointer hover:bg-accent rounded-sm"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handlePin(e)
                                }}
                            >
                                {doc.pinned ? <PinOff size={14} /> : <Pin size={14} />}
                                {doc.pinned ? 'Desfijar' : 'Fijar'}
                            </DropdownMenu.Item>
                            <DropdownMenu.Item
                                className="flex items-center gap-2 px-2 py-1.5 text-sm outline-none cursor-pointer hover:bg-destructive hover:text-destructive-foreground rounded-sm text-destructive"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handleDelete()
                                }}
                            >
                                <Trash2 size={14} />
                                Eliminar
                            </DropdownMenu.Item>
                        </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                </DropdownMenu.Root>
            </div>
        )
    }

    // Grid view (default)
    return (
        <div
            onClick={handleCardClick}
            className={cn(
                "block group relative bg-card border rounded-xl p-4 hover:shadow-lg transition-all cursor-pointer hover:border-primary/50",
                doc.pinned && "ring-2 ring-amber-400/50 border-amber-400"
            )}
        >
            {/* Pin indicator */}
            {doc.pinned && (
                <div className="absolute top-2 left-2 z-10">
                    <Pin size={14} className="text-amber-400 fill-current" />
                </div>
            )}

            {/* Actions */}
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 z-10">
                <button
                    onClick={handlePin}
                    className="p-1.5 bg-muted/80 rounded-full hover:bg-muted transition-colors"
                >
                    {doc.pinned ? <PinOff size={14} /> : <Pin size={14} />}
                </button>

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
                        <AlertDialog.Overlay className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm" />
                        <AlertDialog.Content
                            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-w-md w-[90vw] bg-background p-6 rounded-lg border shadow-xl z-50"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <AlertDialog.Title className="text-lg font-semibold">
                                ¿Mover a papelera?
                            </AlertDialog.Title>
                            <AlertDialog.Description className="mt-2 text-sm text-muted-foreground">
                                El documento <span className="font-bold text-foreground">{doc.title}</span> se moverá a la papelera. Podrás restaurarlo después.
                            </AlertDialog.Description>
                            <div className="flex justify-end gap-3 mt-6">
                                <AlertDialog.Cancel asChild>
                                    <button className="px-3 py-2 text-sm font-medium rounded-md hover:bg-muted transition-colors">
                                        Cancelar
                                    </button>
                                </AlertDialog.Cancel>
                                <AlertDialog.Action asChild>
                                    <button
                                        onClick={handleDelete}
                                        className="px-3 py-2 text-sm font-medium rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
                                    >
                                        Mover a papelera
                                    </button>
                                </AlertDialog.Action>
                            </div>
                        </AlertDialog.Content>
                    </AlertDialog.Portal>
                </AlertDialog.Root>
            </div>

            {/* Preview */}
            <div className={cn(
                "h-32 w-full rounded-lg mb-4 flex items-center justify-center bg-muted/30 overflow-hidden relative",
                doc.type === 'image' && "bg-transparent p-0"
            )}>
                {doc.type === 'image' && doc.url ? (
                    <img src={doc.url} alt={doc.title} className="w-full h-full object-cover rounded-lg" />
                ) : doc.type === 'video' && doc.url ? (
                    <video src={doc.url} className="w-full h-full object-cover rounded-lg text-xs" muted />
                ) : (['text', 'code', 'markdown', 'json', 'csv', 'html', 'xml'].includes(doc.type) && doc.content) ? (
                    <div className="w-full h-full p-3 bg-card border text-[0.6rem] font-mono text-muted-foreground overflow-hidden leading-tight select-none opacity-80 text-left">
                        {doc.content.slice(0, 300)}
                    </div>
                ) : (
                    <Icon size={48} className="text-muted-foreground/50" />
                )}
            </div>

            {/* Info */}
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
