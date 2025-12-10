
import { useEffect, useState } from 'react'
import type { Document } from '../../lib/schemas'
import * as XLSX from 'xlsx'

interface ExcelViewerProps {
    doc: Document
}

export function ExcelViewer({ doc }: ExcelViewerProps) {
    const [tableHtml, setTableHtml] = useState<string>('')
    const [sheetNames, setSheetNames] = useState<string[]>([])
    const [activeSheet, setActiveSheet] = useState<string>('')
    const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function loadExcel() {
            try {
                if (!doc.url) {
                    setError('No se encontró el archivo')
                    return
                }

                const response = await fetch(doc.url)
                const arrayBuffer = await response.arrayBuffer()
                const wb = XLSX.read(arrayBuffer)

                setWorkbook(wb)
                setSheetNames(wb.SheetNames)
                setActiveSheet(wb.SheetNames[0])

                // Render first sheet
                const html = XLSX.utils.sheet_to_html(wb.Sheets[wb.SheetNames[0]])
                setTableHtml(html)
            } catch (e) {
                console.error('Excel load error:', e)
                setError('Error al cargar el archivo Excel')
            }
        }

        loadExcel()
    }, [doc.url])

    const handleSheetChange = (sheetName: string) => {
        if (!workbook) return
        setActiveSheet(sheetName)
        const html = XLSX.utils.sheet_to_html(workbook.Sheets[sheetName])
        setTableHtml(html)
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-full p-8">
                <p className="text-destructive">{error}</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full">
            {/* Sheet tabs */}
            {sheetNames.length > 1 && (
                <div className="flex gap-1 p-2 bg-muted/50 border-b overflow-x-auto">
                    {sheetNames.map(name => (
                        <button
                            key={name}
                            onClick={() => handleSheetChange(name)}
                            className={`px-3 py-1.5 text-sm rounded-md transition-colors whitespace-nowrap ${activeSheet === name
                                    ? 'bg-primary text-primary-foreground'
                                    : 'hover:bg-muted'
                                }`}
                        >
                            {name}
                        </button>
                    ))}
                </div>
            )}

            {/* Table content */}
            <div className="flex-1 overflow-auto p-4">
                <div
                    className="excel-table-wrapper"
                    dangerouslySetInnerHTML={{ __html: tableHtml }}
                />
            </div>

            <style>{`
                .excel-table-wrapper table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 0.875rem;
                }
                .excel-table-wrapper th,
                .excel-table-wrapper td {
                    padding: 0.5rem 0.75rem;
                    text-align: left;
                    border: 1px solid hsl(var(--border));
                }
                .excel-table-wrapper th {
                    background: hsl(var(--muted));
                    font-weight: 600;
                }
                .excel-table-wrapper tr:hover {
                    background: hsl(var(--muted) / 0.5);
                }
            `}</style>
        </div>
    )
}
