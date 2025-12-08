
import { useState } from 'react'
import { useStore } from '../store/useStore'
import { DocumentCard } from './DocumentCard'
import { Search, FileQuestion, Filter } from 'lucide-react'
import { CreateDocumentDialog } from './CreateDocumentDialog'

export function Dashboard() {
    const { documents } = useStore()
    const [searchTerm, setSearchTerm] = useState('')
    const [filterType, setFilterType] = useState<'all' | 'text' | 'image' | 'video' | 'pdf' | 'code'>('all')

    const filteredDocs = documents.filter(doc => {
        const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesType = filterType === 'all' || doc.type === filterType
        return matchesSearch && matchesType
    })

    return (
        <div className="p-8 max-w-7xl mx-auto min-h-full flex flex-col">
            <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Mis Documentos</h2>
                    <p className="text-muted-foreground mt-2">
                        Gestiona, visualiza y edita tus archivos multimedia.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Buscar documentos..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2 h-10 w-full sm:w-[250px] rounded-md border border-input bg-background text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                        />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value as any)}
                            className="pl-9 pr-4 py-2 h-10 w-full sm:w-[180px] rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 appearance-none cursor-pointer"
                        >
                            <option value="all">Todos los tipos</option>
                            <option value="text">Texto</option>
                            <option value="code">Código</option>
                            <option value="image">Imagen</option>
                            <option value="pdf">PDF</option>
                        </select>
                    </div>
                </div>
            </header>

            {filteredDocs.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
                    {filteredDocs.map(doc => (
                        <DocumentCard key={doc.id} doc={doc} />
                    ))}
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] text-center p-8 border-2 border-dashed border-border rounded-xl bg-muted/5 animate-in fade-in-50">
                    <div className="bg-muted p-4 rounded-full mb-4">
                        <FileQuestion size={48} className="text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold">No se encontraron documentos</h3>
                    <p className="text-muted-foreground mt-2 max-w-sm mb-6">
                        {searchTerm || filterType !== 'all'
                            ? "Intenta ajustar tus filtros de búsqueda."
                            : "Tu colección está vacía. Crea tu primer documento para comenzar."}
                    </p>
                    {(searchTerm || filterType !== 'all') ? (
                        <button
                            onClick={() => { setSearchTerm(''); setFilterType('all') }}
                            className="text-primary hover:underline font-medium"
                        >
                            Limpiar filtros
                        </button>
                    ) : (
                        <CreateDocumentDialog>
                            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors">
                                Crear Documento
                            </button>
                        </CreateDocumentDialog>
                    )}
                </div>
            )}
        </div>
    )
}
