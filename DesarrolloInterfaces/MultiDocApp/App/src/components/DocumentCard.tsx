
import React from 'react'
import { FileText, Image as ImageIcon, Video, FileCode, Trash2 } from 'lucide-react'
import { useStore } from '../store/useStore'
import type { Document, DocType } from '../store/useStore'
import { cn } from '../lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

const IconMap: Record<DocType, React.ElementType> = {
    text: FileText,
    image: ImageIcon,
    video: Video,
    pdf: FileText,
    code: FileCode
}

export function DocumentCard({ doc }: { doc: Document }) {
    const { setActiveDoc, deleteDocument } = useStore()
    const Icon = IconMap[doc.type]

    return (
        <div
            className="group relative bg-card border border-border rounded-xl p-4 hover:shadow-lg transition-all cursor-pointer hover:border-primary/50"
            onClick={() => setActiveDoc(doc.id)}
        >
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                <button
                    onClick={(e) => { e.stopPropagation(); deleteDocument(doc.id) }}
                    className="p-1.5 bg-destructive/10 text-destructive rounded-full hover:bg-destructive hover:text-destructive-foreground"
                >
                    <Trash2 size={14} />
                </button>
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
