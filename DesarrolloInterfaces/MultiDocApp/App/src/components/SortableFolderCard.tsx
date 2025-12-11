
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { FolderCard } from './FolderCard'
import type { Folder } from '../lib/schemas'

interface SortableFolderCardProps {
    folder: Folder
    fileCount: number
    onClick: () => void
    onDelete?: () => void
}

export function SortableFolderCard({ folder, fileCount, onClick, onDelete }: SortableFolderCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: folder.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
        opacity: isDragging ? 0.5 : 1
    }

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <FolderCard
                folder={folder}
                fileCount={fileCount}
                onClick={onClick}
                onDelete={onDelete}
            />
        </div>
    )
}
