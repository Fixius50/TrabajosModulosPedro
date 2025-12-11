
import { useEffect, useState } from 'react'
import type { Document } from '../../lib/schemas'
import { marked } from 'marked'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface MarkdownViewerProps {
    doc: Document
    maxLength?: number
}

export function MarkdownViewer({ doc, maxLength = 5000 }: MarkdownViewerProps) {
    const [html, setHtml] = useState<string>('')
    const [fullContent, setFullContent] = useState<string>('')
    const [isExpanded, setIsExpanded] = useState(false)
    const [isTruncated, setIsTruncated] = useState(false)

    useEffect(() => {
        async function parseMarkdown() {
            let content = doc.content

            if (!content && doc.url) {
                try {
                    const response = await fetch(doc.url)
                    content = await response.text()
                } catch (e) {
                    console.error('Failed to fetch markdown:', e)
                }
            }

            if (content) {
                setFullContent(content)

                // Check if truncation needed
                const needsTruncation = content.length > maxLength
                setIsTruncated(needsTruncation)

                // Parse content (truncated or full)
                const displayContent = (!isExpanded && needsTruncation)
                    ? content.slice(0, maxLength) + '\n\n...'
                    : content

                const parsed = await marked.parse(displayContent)
                setHtml(parsed)
            }
        }

        parseMarkdown()
    }, [doc.content, doc.url, isExpanded, maxLength])

    return (
        <div className="h-full overflow-auto">
            <article
                className="prose prose-invert max-w-none p-8 mx-auto"
                dangerouslySetInnerHTML={{ __html: html }}
            />

            {/* Ver todo / Ver menos button */}
            {isTruncated && (
                <div className="flex justify-center pb-8">
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
                                Ver todo ({Math.round(fullContent.length / 1024)} KB)
                            </>
                        )}
                    </button>
                </div>
            )}

            <style>{`
                .prose {
                    --tw-prose-body: hsl(var(--foreground));
                    --tw-prose-headings: hsl(var(--foreground));
                    --tw-prose-links: hsl(var(--primary));
                    --tw-prose-code: hsl(var(--primary));
                    --tw-prose-pre-bg: hsl(var(--muted));
                }
                .prose h1 { font-size: 2rem; font-weight: 700; margin-bottom: 1rem; }
                .prose h2 { font-size: 1.5rem; font-weight: 600; margin-top: 2rem; margin-bottom: 0.75rem; }
                .prose h3 { font-size: 1.25rem; font-weight: 600; margin-top: 1.5rem; margin-bottom: 0.5rem; }
                .prose p { margin-bottom: 1rem; line-height: 1.7; }
                .prose ul, .prose ol { margin-bottom: 1rem; padding-left: 1.5rem; }
                .prose li { margin-bottom: 0.25rem; }
                .prose code { 
                    background: hsl(var(--muted)); 
                    padding: 0.2rem 0.4rem; 
                    border-radius: 0.25rem;
                    font-size: 0.875em;
                }
                .prose pre { 
                    background: hsl(var(--muted)); 
                    padding: 1rem; 
                    border-radius: 0.5rem; 
                    overflow-x: auto;
                    margin-bottom: 1rem;
                }
                .prose pre code { background: transparent; padding: 0; }
                .prose blockquote { 
                    border-left: 4px solid hsl(var(--primary)); 
                    padding-left: 1rem; 
                    font-style: italic;
                    margin: 1rem 0;
                }
                .prose a { color: hsl(var(--primary)); text-decoration: underline; }
                .prose img { max-width: 100%; border-radius: 0.5rem; margin: 1rem 0; }
                .prose table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
                .prose th, .prose td { border: 1px solid hsl(var(--border)); padding: 0.5rem; text-align: left; }
                .prose th { background: hsl(var(--muted)); font-weight: 600; }
            `}</style>
        </div>
    )
}
