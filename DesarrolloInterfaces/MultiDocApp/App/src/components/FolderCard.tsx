
import { Folder, Pin, PinOff, MoreVertical } from 'lucide-react'
import { useTogglePin } from '../hooks/useDocuments'
import type { Folder as FolderType } from '../lib/schemas'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'

interface FolderCardProps {
    folder: FolderType
    fileCount: number
    onClick: () => void
    onDelete?: () => void
}

export function FolderCard({ folder, fileCount, onClick, onDelete }: FolderCardProps) {
    const togglePin = useTogglePin()

    const handlePin = (e: React.MouseEvent) => {
        e.stopPropagation()
        togglePin.mutate({ id: folder.id, type: 'folder', pinned: !folder.pinned })
    }

    return (
        <div
            onClick={onClick}
            className={`group relative bg-card border rounded-xl p-4 cursor-pointer transition-all hover:shadow-lg hover:border-primary/50 hover:-translate-y-1 ${folder.pinned ? 'ring-2 ring-amber-400/50 border-amber-400' : 'border-border'
                }`}
        >
            {/* Pin indicator */}
            {folder.pinned && (
                <div className="absolute top-2 right-2 text-amber-400">
                    <Pin size={14} className="fill-current" />
                </div>
            )}

            <div className="flex flex-col items-center text-center gap-3">
                <div className="p-4 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                    <Folder size={40} className="text-primary" />
                </div>

                <div className="flex-1 min-w-0 w-full">
                    <h3 className="font-semibold truncate">{folder.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                        {fileCount} {fileCount === 1 ? 'elemento' : 'elementos'}
                    </p>
                </div>
            </div>

            {/* Actions menu */}
            <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild>
                        <button
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 hover:bg-muted rounded-md"
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
                                    handlePin(e as unknown as React.MouseEvent)
                                }}
                            >
                                {folder.pinned ? <PinOff size={14} /> : <Pin size={14} />}
                                {folder.pinned ? 'Desfijar' : 'Fijar'}
                            </DropdownMenu.Item>
                            {onDelete && (
                                <DropdownMenu.Item
                                    className="flex items-center gap-2 px-2 py-1.5 text-sm outline-none cursor-pointer hover:bg-destructive hover:text-destructive-foreground rounded-sm text-destructive"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        onDelete()
                                    }}
                                >
                                    Eliminar
                                </DropdownMenu.Item>
                            )}
                        </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                </DropdownMenu.Root>
            </div>
        </div>
    )
}
