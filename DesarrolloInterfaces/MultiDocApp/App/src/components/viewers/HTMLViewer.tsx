
import { useEffect, useState } from 'react'
import type { Document } from '../../lib/schemas'

interface HTMLViewerProps {
    doc: Document
}

export function HTMLViewer({ doc }: HTMLViewerProps) {
    const [content, setContent] = useState<string>('')

    useEffect(() => {
        async function loadContent() {
            let htmlContent = doc.content

            if (!htmlContent && doc.url) {
                try {
                    const response = await fetch(doc.url)
                    htmlContent = await response.text()
                } catch (e) {
                    console.error('Failed to fetch HTML:', e)
                }
            }

            if (htmlContent) {
                setContent(htmlContent)
            }
        }

        loadContent()
    }, [doc.content, doc.url])

    if (!content) {
        return (
            <div className="flex items-center justify-center h-full p-8">
                <p className="text-muted-foreground">Cargando contenido HTML...</p>
            </div>
        )
    }

    return (
        <div className="h-full w-full p-4">
            <iframe
                srcDoc={content}
                sandbox="allow-scripts allow-same-origin"
                className="w-full h-full rounded-lg border bg-white"
                title={doc.title}
            />
        </div>
    )
}
