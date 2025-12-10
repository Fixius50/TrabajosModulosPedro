
import type { Document } from '../../lib/schemas'

interface VideoViewerProps {
    doc: Document
}

export function VideoViewer({ doc }: VideoViewerProps) {
    const src = doc.url || doc.content

    if (!src) {
        return (
            <div className="flex items-center justify-center h-full p-8">
                <p className="text-muted-foreground">No se puede reproducir este video</p>
            </div>
        )
    }

    return (
        <div className="flex items-center justify-center h-full p-4 bg-black/50">
            <video
                controls
                autoPlay={false}
                className="max-w-full max-h-[80vh] rounded-lg shadow-2xl"
                src={src}
            >
                Tu navegador no soporta la reproducción de video.
            </video>
        </div>
    )
}
