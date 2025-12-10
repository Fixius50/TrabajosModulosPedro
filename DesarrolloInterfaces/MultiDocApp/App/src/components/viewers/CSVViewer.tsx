
import { useEffect, useState } from 'react'
import type { Document } from '../../lib/schemas'
import Papa from 'papaparse'

interface CSVViewerProps {
    doc: Document
}

export function CSVViewer({ doc }: CSVViewerProps) {
    const [data, setData] = useState<Record<string, string>[]>([])
    const [headers, setHeaders] = useState<string[]>([])
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function loadCSV() {
            try {
                let content = doc.content

                if (!content && doc.url) {
                    const response = await fetch(doc.url)
                    content = await response.text()
                }

                if (!content) {
                    setError('No se encontró contenido')
                    return
                }

                const result = Papa.parse<Record<string, string>>(content, {
                    header: true,
                    skipEmptyLines: true
                })

                if (result.errors.length > 0) {
                    console.warn('CSV parse warnings:', result.errors)
                }

                if (result.data.length > 0) {
                    setHeaders(Object.keys(result.data[0]))
                    setData(result.data)
                }
            } catch (e) {
                console.error('CSV load error:', e)
                setError('Error al cargar el archivo CSV')
            }
        }

        loadCSV()
    }, [doc.content, doc.url])

    if (error) {
        return (
            <div className="flex items-center justify-center h-full p-8">
                <p className="text-destructive">{error}</p>
            </div>
        )
    }

    if (data.length === 0) {
        return (
            <div className="flex items-center justify-center h-full p-8">
                <p className="text-muted-foreground">Cargando datos...</p>
            </div>
        )
    }

    return (
        <div className="h-full overflow-auto p-4">
            <div className="rounded-lg border overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-muted">
                            {headers.map((header, i) => (
                                <th
                                    key={i}
                                    className="px-4 py-3 text-left font-semibold text-primary border-b whitespace-nowrap"
                                >
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.slice(0, 100).map((row, rowIndex) => (
                            <tr
                                key={rowIndex}
                                className="hover:bg-muted/50 transition-colors"
                            >
                                {headers.map((header, colIndex) => (
                                    <td
                                        key={colIndex}
                                        className="px-4 py-2 border-b border-border/50"
                                    >
                                        {row[header]}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {data.length > 100 && (
                <p className="text-center text-sm text-muted-foreground mt-4">
                    Mostrando 100 de {data.length} filas
                </p>
            )}
        </div>
    )
}
