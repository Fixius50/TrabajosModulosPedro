

import { useStore } from '../store/useStore'
import { DocumentCard } from './DocumentCard'

export function Dashboard() {
    const { documents } = useStore()

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <header className="mb-8">
                <h2 className="text-3xl font-bold tracking-tight">Mis Documentos</h2>
                <p className="text-muted-foreground mt-2">
                    Gestiona, visualiza y edita tus archivos multimedia.
                </p>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {documents.map(doc => (
                    <DocumentCard key={doc.id} doc={doc} />
                ))}
                {documents.length === 0 && (
                    <div className="col-span-full py-20 text-center text-muted-foreground">
                        No hay documentos. ¡Crea uno nuevo para empezar!
                    </div>
                )}
            </div>
        </div>
    )
}
