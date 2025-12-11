
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { DocumentCard } from './DocumentCard'
import type { Document } from '../lib/schemas'

interface SortableDocumentCardProps {
    doc: Document
    viewMode?: 'grid' | 'list'
}

export function SortableDocumentCard({ doc, viewMode = 'grid' }: SortableDocumentCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: doc.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
        opacity: isDragging ? 0.5 : 1
    }

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <DocumentCard doc={doc} viewMode={viewMode} />
        </div>
    )
}
