
import type { Document } from '../../lib/schemas'
import { Music } from 'lucide-react'

interface AudioViewerProps {
    doc: Document
}

export function AudioViewer({ doc }: AudioViewerProps) {
    const src = doc.url || doc.content

    if (!src) {
        return (
            <div className="flex items-center justify-center h-full p-8">
                <p className="text-muted-foreground">No se puede reproducir este audio</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center justify-center h-full p-8 gap-8">
            {/* Visual representation */}
            <div className="relative">
                <div className="w-48 h-48 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center animate-pulse">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/40 to-primary/10 flex items-center justify-center">
                        <Music size={48} className="text-primary" />
                    </div>
                </div>

                {/* Animated rings */}
                <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping" style={{ animationDuration: '2s' }} />
                <div className="absolute inset-0 rounded-full border border-primary/10 animate-ping" style={{ animationDuration: '3s', animationDelay: '0.5s' }} />
            </div>

            {/* Title */}
            <div className="text-center">
                <h3 className="text-lg font-medium">{doc.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">Audio</p>
            </div>

            {/* Audio player */}
            <audio
                controls
                className="w-full max-w-md"
                src={src}
            >
                Tu navegador no soporta la reproducción de audio.
            </audio>
        </div>
    )
}
