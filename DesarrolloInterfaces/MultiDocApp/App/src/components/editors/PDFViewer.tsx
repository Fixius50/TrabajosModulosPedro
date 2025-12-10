
import { Document as PDFDoc, Page, pdfjs } from 'react-pdf'
import type { Document } from '../../lib/schemas'
import { useState } from 'react'

// Set worker to CDN for simplicity in this demo environment
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export function PDFViewer({ doc }: { doc: Document }) {
    const [numPages, setNumPages] = useState<number | null>(null)

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages)
    }

    if (!doc.url) return <div className="p-8 text-muted-foreground">No se encontró URL del PDF</div>

    return (
        <div className="h-full bg-slate-100 dark:bg-slate-900 overflow-auto flex justify-center p-8">
            <PDFDoc
                file={doc.url}
                onLoadSuccess={onDocumentLoadSuccess}
                className="shadow-lg"
            >
                {Array.from(new Array(numPages), (_, index) => (
                    <Page
                        key={`page_${index + 1}`}
                        pageNumber={index + 1}
                        className="mb-4"
                        width={800}
                        renderAnnotationLayer={true}
                        renderTextLayer={true}
                    />
                ))}
            </PDFDoc>
        </div>
    )
}
