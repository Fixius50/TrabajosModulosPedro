
import type { Document } from '../../store/useStore'

export function ImageViewer({ doc }: { doc: Document }) {
    if (!doc.url) return <div className="p-10 text-center">No image URL provided</div>

    return (
        <div className="h-full flex items-center justify-center p-4 bg-black/5">
            <img
                src={doc.url}
                alt={doc.title}
                className="max-h-full max-w-full object-contain shadow-2xl rounded-lg"
            />
        </div>
    )
}
