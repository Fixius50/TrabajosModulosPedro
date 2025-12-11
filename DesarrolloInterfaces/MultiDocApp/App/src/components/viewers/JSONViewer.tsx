
import { useEffect, useState } from 'react'
import type { Document } from '../../lib/schemas'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface JSONViewerProps {
    doc: Document
    maxLines?: number
}

export function JSONViewer({ doc, maxLines = 100 }: JSONViewerProps) {
    const [formattedJson, setFormattedJson] = useState<string>('')
    const [fullJson, setFullJson] = useState<string>('')
    const [error, setError] = useState<string | null>(null)
    const [isExpanded, setIsExpanded] = useState(false)
    const [isTruncated, setIsTruncated] = useState(false)

    useEffect(() => {
        async function loadJSON() {
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

                // Parse and format
                const parsed = JSON.parse(content)
                const formatted = JSON.stringify(parsed, null, 2)
                setFullJson(formatted)

                // Check truncation
                const lines = formatted.split('\n')
                const needsTruncation = lines.length > maxLines
                setIsTruncated(needsTruncation)

                // Set displayed content
                if (!isExpanded && needsTruncation) {
                    const truncated = lines.slice(0, maxLines).join('\n') + '\n...'
                    setFormattedJson(truncated)
                } else {
                    setFormattedJson(formatted)
                }
            } catch (e) {
                console.error('JSON parse error:', e)
                setError('Error al parsear JSON')
                if (doc.content) {
                    setFormattedJson(doc.content)
                }
            }
        }

        loadJSON()
    }, [doc.content, doc.url, isExpanded, maxLines])

    if (error && !formattedJson) {
        return (
            <div className="flex items-center justify-center h-full p-8">
                <p className="text-destructive">{error}</p>
            </div>
        )
    }

    // Simple syntax highlighting
    const highlightJSON = (json: string) => {
        return json
            .replace(/(".*?")\s*:/g, '<span class="json-key">$1</span>:')
            .replace(/:\s*(".*?")/g, ': <span class="json-string">$1</span>')
            .replace(/:\s*(\d+\.?\d*)/g, ': <span class="json-number">$1</span>')
            .replace(/:\s*(true|false)/g, ': <span class="json-boolean">$1</span>')
            .replace(/:\s*(null)/g, ': <span class="json-null">$1</span>')
    }

    return (
        <div className="h-full overflow-auto p-6">
            <pre className="bg-muted/50 rounded-xl p-6 border overflow-x-auto text-sm font-mono">
                <code dangerouslySetInnerHTML={{ __html: highlightJSON(formattedJson) }} />
            </pre>

            {/* Ver todo / Ver menos button */}
            {isTruncated && (
                <div className="flex justify-center py-4">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
                    >
                        {isExpanded ? (
                            <>
                                <ChevronUp size={18} />
                                Ver menos
                            </>
                        ) : (
                            <>
                                <ChevronDown size={18} />
                                Ver todo ({fullJson.split('\n').length} líneas)
                            </>
                        )}
                    </button>
                </div>
            )}

            <style>{`
                .json-key { color: hsl(var(--primary)); }
                .json-string { color: #a5d6ff; }
                .json-number { color: #ffa657; }
                .json-boolean { color: #ff7b72; }
                .json-null { color: #8b949e; }
            `}</style>
        </div>
    )
}
