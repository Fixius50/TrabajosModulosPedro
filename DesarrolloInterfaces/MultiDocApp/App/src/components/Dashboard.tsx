
import { useState, useMemo, useEffect } from 'react'
import { useDocuments, useFolders, useDeleteFolder, useUpdateDocument, useUpdateFolder } from '../hooks/useDocuments'
import { SortableDocumentCard } from './SortableDocumentCard'
import { SortableFolderCard } from './SortableFolderCard'
import { Breadcrumb } from './Breadcrumb'
import { Search, FileQuestion, Filter, LayoutGrid, List, HardDrive } from 'lucide-react'
import type { DocType, Folder } from '../lib/schemas'
import { DndContext, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import { SortableContext, sortableKeyboardCoordinates, rectSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { useStore } from '../store/useStore'

export function Dashboard() {
    const [currentFolderId, setCurrentFolderId] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterType, setFilterType] = useState<'all' | DocType>('all')
    const [minSizeMB, setMinSizeMB] = useState<string>('')
    const [maxSizeMB, setMaxSizeMB] = useState<string>('')
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

    // Get sidebar type filter from store
    const { selectedTypeFilter, setTypeFilter } = useStore()

    // Sync local filterType with sidebar filter
    useEffect(() => {
        if (selectedTypeFilter) {
            setFilterType(selectedTypeFilter)
        } else {
            setFilterType('all')
        }
    }, [selectedTypeFilter])

    // Fetch documents and folders for current level
    const { data: documents = [], isLoading: docsLoading } = useDocuments(currentFolderId)
    const { data: folders = [], isLoading: foldersLoading } = useFolders(currentFolderId)
    const { data: allFolders = [] } = useFolders()

    // Fetch document counts for each folder
    const { data: allDocuments = [] } = useDocuments()

    const deleteFolder = useDeleteFolder()
    const updateDocument = useUpdateDocument()
    const updateFolder = useUpdateFolder()

    // DnD sensors
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    )

    // Handle drag end for reordering
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event
        if (!over || active.id === over.id) return

        // Check if it's a folder
        const folderIndex = filteredFolders.findIndex(f => f.id === active.id)
        if (folderIndex !== -1) {
            const overIndex = filteredFolders.findIndex(f => f.id === over.id)
            if (overIndex !== -1) {
                const newFolders = arrayMove(filteredFolders, folderIndex, overIndex)
                newFolders.forEach((folder, idx) => {
                    updateFolder.mutate({ id: folder.id, updates: { order: idx } })
                })
            }
            return
        }

        // Otherwise it's a document
        const docIndex = filteredDocs.findIndex(d => d.id === active.id)
        if (docIndex !== -1) {
            const overDocIndex = filteredDocs.findIndex(d => d.id === over.id)
            if (overDocIndex !== -1) {
                const newDocs = arrayMove(filteredDocs, docIndex, overDocIndex)
                newDocs.forEach((doc, idx) => {
                    updateDocument.mutate({ id: doc.id, updates: { order: idx } })
                })
            }
        }
    }

    // Build breadcrumb path
    const breadcrumbPath = useMemo(() => {
        if (!currentFolderId) return []

        const path: Folder[] = []
        let current = allFolders.find(f => f.id === currentFolderId)

        while (current) {
            path.unshift(current)
            current = current.parentId ? allFolders.find(f => f.id === current!.parentId) : undefined
        }

        return path
    }, [currentFolderId, allFolders])

    // Get file count for a folder
    const getFolderFileCount = (folderId: string) => {
        return allDocuments.filter(d => d.folderId === folderId).length
    }

    // Filter and sort items
    const filteredFolders = useMemo(() => {
        let result = [...folders]

        if (searchTerm) {
            result = result.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()))
        }

        // Sort: pinned first, then by order
        result.sort((a, b) => {
            if (a.pinned && !b.pinned) return -1
            if (!a.pinned && b.pinned) return 1
            return (a.order || 0) - (b.order || 0)
        })

        return result
    }, [folders, searchTerm])

    const filteredDocs = useMemo(() => {
        let result = [...documents]

        if (searchTerm) {
            result = result.filter(d => d.title.toLowerCase().includes(searchTerm.toLowerCase()))
        }

        if (filterType !== 'all') {
            result = result.filter(d => d.type === filterType)
        }

        // Size filter (min/max MB)
        const minBytes = minSizeMB ? parseFloat(minSizeMB) * 1024 * 1024 : null
        const maxBytes = maxSizeMB ? parseFloat(maxSizeMB) * 1024 * 1024 : null

        if (minBytes !== null || maxBytes !== null) {
            result = result.filter(d => {
                const size = d.size || 0
                if (minBytes !== null && size < minBytes) return false
                if (maxBytes !== null && size > maxBytes) return false
                return true
            })
        }

        // Sort: pinned first, then by order
        result.sort((a, b) => {
            if (a.pinned && !b.pinned) return -1
            if (!a.pinned && b.pinned) return 1
            return (a.order || 0) - (b.order || 0)
        })

        return result
    }, [documents, searchTerm, filterType, minSizeMB, maxSizeMB])

    // Group documents by type for categorized view
    const categorizedDocs = useMemo(() => {
        const categories: Record<string, typeof filteredDocs> = {
            'Imágenes': filteredDocs.filter(d => d.type === 'image'),
            'Multimedia': filteredDocs.filter(d => ['video', 'audio'].includes(d.type)),
            'Documentos': filteredDocs.filter(d => ['pdf', 'excel'].includes(d.type)),
            'Código/Datos': filteredDocs.filter(d => ['code', 'json', 'csv', 'html'].includes(d.type)),
            'Texto': filteredDocs.filter(d => ['text', 'markdown'].includes(d.type)),
        }
        return Object.entries(categories).filter(([_, docs]) => docs.length > 0)
    }, [filteredDocs])

    const isLoading = docsLoading || foldersLoading
    const isFiltered = searchTerm !== '' || filterType !== 'all'
    const hasContent = filteredFolders.length > 0 || filteredDocs.length > 0

    const handleNavigate = (folderId: string | null) => {
        setCurrentFolderId(folderId)
    }

    if (isLoading) return <div className="p-8">Cargando documentos...</div>

    return (
        <div className="p-8 max-w-7xl mx-auto min-h-full flex flex-col">
            {/* Header - Row 1: Title */}
            <header className="mb-6">
                <div className="mb-4">
                    <h2 className="text-3xl font-bold tracking-tight">
                        {currentFolderId ? breadcrumbPath[breadcrumbPath.length - 1]?.name : 'Mi Universo'}
                    </h2>
                    <p className="text-muted-foreground mt-1">
                        Gestiona, visualiza y edita tus archivos multimedia.
                    </p>
                </div>

                {/* Header - Row 2: Controls */}
                <div className="flex flex-wrap items-center gap-3">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Buscar..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2 h-10 w-full sm:w-[200px] rounded-md border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>

                    {/* Filter */}
                    <div className="relative">
                        <Filter className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <select
                            value={filterType}
                            onChange={(e) => {
                                setFilterType(e.target.value as any)
                                // Also clear sidebar filter when manually changing
                                if (e.target.value === 'all') {
                                    setTypeFilter(null)
                                }
                            }}
                            className="pl-9 pr-4 py-2 h-10 w-full sm:w-[160px] rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
                        >
                            <option value="all">Todos los tipos</option>
                            <option value="text">Texto</option>
                            <option value="code">Código</option>
                            <option value="image">Imagen</option>
                            <option value="video">Video</option>
                            <option value="audio">Audio</option>
                            <option value="pdf">PDF</option>
                            <option value="excel">Excel</option>
                            <option value="csv">CSV</option>
                            <option value="markdown">Markdown</option>
                            <option value="json">JSON</option>
                            <option value="html">HTML</option>
                        </select>
                    </div>

                    {/* Size Filter - Min/Max MB */}
                    <div className="flex items-center gap-2">
                        <HardDrive className="h-4 w-4 text-muted-foreground shrink-0" />
                        <input
                            type="number"
                            step="0.1"
                            min="0"
                            placeholder="Min MB"
                            value={minSizeMB}
                            onChange={(e) => {
                                const val = e.target.value
                                if (maxSizeMB && parseFloat(val) >= parseFloat(maxSizeMB)) return
                                setMinSizeMB(val)
                            }}
                            className="w-20 h-10 px-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <span className="text-xs text-muted-foreground">-</span>
                        <input
                            type="number"
                            step="0.1"
                            min="0"
                            placeholder="Max MB"
                            value={maxSizeMB}
                            onChange={(e) => {
                                const val = e.target.value
                                if (minSizeMB && parseFloat(val) <= parseFloat(minSizeMB)) return
                                setMaxSizeMB(val)
                            }}
                            className="w-20 h-10 px-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>

                    {/* View toggle */}
                    <div className="flex border border-input rounded-md ml-auto">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                        >
                            <LayoutGrid size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                        >
                            <List size={18} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Breadcrumb */}
            {currentFolderId && (
                <div className="mb-4">
                    <Breadcrumb path={breadcrumbPath} onNavigate={handleNavigate} />
                </div>
            )}

            {/* Content */}
            {hasContent ? (
                <div className="flex-1">
                    {/* Folders */}
                    {filteredFolders.length > 0 && (
                        <div className="mb-8">
                            <h3 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
                                <span>Carpetas</span>
                                <span className="text-xs bg-muted px-2 py-0.5 rounded-full">{filteredFolders.length}</span>
                            </h3>
                            <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
                                <SortableContext items={filteredFolders.map(f => f.id)} strategy={rectSortingStrategy}>
                                    <div className={viewMode === 'grid'
                                        ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
                                        : "flex flex-col gap-2"
                                    }>
                                        {filteredFolders.map(folder => (
                                            <SortableFolderCard
                                                key={folder.id}
                                                folder={folder}
                                                fileCount={getFolderFileCount(folder.id)}
                                                onClick={() => handleNavigate(folder.id)}
                                                onDelete={() => deleteFolder.mutate(folder.id)}
                                            />
                                        ))}
                                    </div>
                                </SortableContext>
                            </DndContext>
                        </div>
                    )}

                    {/* Documents - Categorized */}
                    {categorizedDocs.length > 0 && (
                        <div className="space-y-8">
                            {categorizedDocs.map(([category, docs]) => (
                                <div key={category}>
                                    <h3 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2 border-b border-border pb-2">
                                        <span>{category}</span>
                                        <span className="text-xs bg-muted px-2 py-0.5 rounded-full">{docs.length}</span>
                                    </h3>
                                    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
                                        <SortableContext items={docs.map(d => d.id)} strategy={rectSortingStrategy}>
                                            <div className={viewMode === 'grid'
                                                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                                                : "flex flex-col gap-2"
                                            }>
                                                {docs.map(doc => (
                                                    <SortableDocumentCard key={doc.id} doc={doc} viewMode={viewMode} />
                                                ))}
                                            </div>
                                        </SortableContext>
                                    </DndContext>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-border rounded-xl bg-muted/5">
                    <div className="bg-muted p-4 rounded-full mb-4">
                        <FileQuestion size={48} className="text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold">
                        {isFiltered ? 'No se encontraron resultados' : 'Esta carpeta está vacía'}
                    </h3>
                    <p className="text-muted-foreground mt-2 max-w-sm mb-6">
                        {isFiltered
                            ? 'Intenta ajustar tus filtros de búsqueda.'
                            : 'Usa el botón "Nuevo / Subir" en el menú lateral para añadir contenido.'}
                    </p>
                    {isFiltered && (
                        <button
                            onClick={() => { setSearchTerm(''); setFilterType('all') }}
                            className="text-primary hover:underline font-medium"
                        >
                            Limpiar filtros
                        </button>
                    )}
                </div>
            )}

            {/* Floating upload area when there's content */}

        </div>
    )
}
