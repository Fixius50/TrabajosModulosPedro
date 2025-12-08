
import { Editor as Monaco } from '@monaco-editor/react'
import { useStore } from '../../store/useStore'
import type { Document } from '../../store/useStore'
import { useCallback } from 'react'

export function CodeEditor({ doc }: { doc: Document }) {
    const { updateDocument } = useStore()

    const handleChange = useCallback((value: string | undefined) => {
        if (value !== undefined) {
            updateDocument(doc.id, { content: value })
        }
    }, [doc.id, updateDocument])

    return (
        <div className="h-full w-full">
            <Monaco
                height="100%"
                language={doc.title.endsWith('.json') ? 'json' : 'markdown'}
                theme="vs-dark"
                value={doc.content || ''}
                onChange={handleChange}
                options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    wordWrap: 'on'
                }}
            />
        </div>
    )
}
