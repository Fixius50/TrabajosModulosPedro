
import { ChevronRight, Home } from 'lucide-react'
import type { Folder } from '../lib/schemas'

interface BreadcrumbProps {
    path: Folder[]
    onNavigate: (folderId: string | null) => void
}

export function Breadcrumb({ path, onNavigate }: BreadcrumbProps) {
    return (
        <nav className="flex items-center gap-1 text-sm text-muted-foreground overflow-x-auto pb-2">
            <button
                onClick={() => onNavigate(null)}
                className="flex items-center gap-1 px-2 py-1 rounded hover:bg-muted hover:text-foreground transition-colors shrink-0"
            >
                <Home size={14} />
                <span>Inicio</span>
            </button>

            {path.map((folder, index) => (
                <div key={folder.id} className="flex items-center gap-1 shrink-0">
                    <ChevronRight size={14} className="text-muted-foreground/50" />
                    <button
                        onClick={() => onNavigate(folder.id)}
                        className={`px-2 py-1 rounded hover:bg-muted transition-colors truncate max-w-[150px] ${index === path.length - 1
                            ? 'text-foreground font-medium'
                            : 'hover:text-foreground'
                            }`}
                    >
                        {folder.name}
                    </button>
                </div>
            ))}
        </nav>
    )
}
