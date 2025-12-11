
import { Editor as Monaco } from '@monaco-editor/react'
import { useStore } from '../../store/useStore'
import type { Document } from '../../lib/schemas'
import { useCallback, useEffect, useState, useRef } from 'react'

export function CodeEditor({ doc }: { doc: Document }) {
    const { updateDocument } = useStore()
    const [fontSize, setFontSize] = useState(18)
    const [editorHeight, setEditorHeight] = useState('100vh')
    const editorRef = useRef<any>(null)

    // Calculate responsive font size based on viewport
    useEffect(() => {
        const calculateFontSize = () => {
            // Base: 1.2vw with min 16px and max 24px
            const vwSize = window.innerWidth * 0.012
            const clampedSize = Math.min(Math.max(vwSize, 16), 24)
            setFontSize(Math.round(clampedSize))
        }

        calculateFontSize()
        window.addEventListener('resize', calculateFontSize)
        return () => window.removeEventListener('resize', calculateFontSize)
    }, [])

    const handleChange = useCallback((value: string | undefined) => {
        if (value !== undefined) {
            updateDocument(doc.id, { content: value })
        }
    }, [doc.id, updateDocument])

    // Update height based on content
    const handleEditorDidMount = (editor: any) => {
        editorRef.current = editor

        const updateHeight = () => {
            const contentHeight = editor.getContentHeight()
            const viewportHeight = window.innerHeight - 56 // minus header
            const newHeight = Math.max(contentHeight + 100, viewportHeight)
            setEditorHeight(`${newHeight}px`)
        }

        editor.onDidContentSizeChange(updateHeight)
        updateHeight()
    }

    // Determine language from file extension or type
    const getLanguage = () => {
        const ext = doc.ext?.toLowerCase() || doc.title.split('.').pop()?.toLowerCase()
        const langMap: Record<string, string> = {
            // JavaScript/TypeScript
            'js': 'javascript',
            'jsx': 'javascript',
            'ts': 'typescript',
            'tsx': 'typescript',
            'mjs': 'javascript',
            'cjs': 'javascript',
            // Python
            'py': 'python',
            'pyw': 'python',
            // Java/Kotlin
            'java': 'java',
            'kt': 'kotlin',
            'kts': 'kotlin',
            // C/C++/C#
            'c': 'c',
            'h': 'c',
            'cpp': 'cpp',
            'hpp': 'cpp',
            'cc': 'cpp',
            'cs': 'csharp',
            // Web
            'html': 'html',
            'htm': 'html',
            'css': 'css',
            'scss': 'scss',
            'sass': 'scss',
            'less': 'less',
            // Data
            'json': 'json',
            'xml': 'xml',
            'yaml': 'yaml',
            'yml': 'yaml',
            'toml': 'ini',
            // Scripting
            'sh': 'shell',
            'bash': 'shell',
            'zsh': 'shell',
            'ps1': 'powershell',
            'bat': 'bat',
            'cmd': 'bat',
            // Database
            'sql': 'sql',
            'mysql': 'sql',
            'pgsql': 'pgsql',
            // Markup
            'md': 'markdown',
            'markdown': 'markdown',
            'tex': 'latex',
            'rst': 'restructuredtext',
            // Config
            'ini': 'ini',
            'conf': 'ini',
            'cfg': 'ini',
            'env': 'ini',
            // Other
            'php': 'php',
            'rb': 'ruby',
            'go': 'go',
            'rs': 'rust',
            'swift': 'swift',
            'r': 'r',
            'lua': 'lua',
            'perl': 'perl',
            'pl': 'perl',
            'txt': 'plaintext',
        }
        return langMap[ext || ''] || 'plaintext'
    }

    const language = getLanguage()

    return (
        <div className="min-h-full w-full bg-[#1e1e1e] flex justify-center">
            {/* Centered container - 75% width */}
            <div className="w-full max-w-[75%] relative" style={{ minHeight: editorHeight }}>
                {/* Language indicator */}
                <div className="absolute top-4 right-4 z-10 px-3 py-1.5 bg-[#2d2d2d] border border-[#404040] rounded-md text-xs font-mono uppercase text-[#888]">
                    {language}
                </div>

                <Monaco
                    height={editorHeight}
                    language={language}
                    theme="vs-dark"
                    value={doc.content || ''}
                    onChange={handleChange}
                    onMount={handleEditorDidMount}
                    options={{
                        // Font settings (responsive)
                        fontSize: fontSize,
                        lineHeight: Math.round(fontSize * 1.6),
                        fontFamily: "'Fira Code', 'Cascadia Code', 'JetBrains Mono', Consolas, 'Courier New', monospace",
                        fontLigatures: true,

                        // Editor appearance
                        minimap: { enabled: true, scale: 1, showSlider: 'mouseover' },
                        wordWrap: 'on',
                        padding: { top: 48, bottom: 48 },
                        scrollBeyondLastLine: false,
                        smoothScrolling: true,
                        cursorBlinking: 'smooth',
                        cursorSmoothCaretAnimation: 'on',
                        cursorStyle: 'line',
                        cursorWidth: 2,

                        // Line numbers and decorations
                        lineNumbers: 'on',
                        lineDecorationsWidth: 10,
                        lineNumbersMinChars: 4,
                        renderLineHighlight: 'all',
                        renderLineHighlightOnlyWhenFocus: false,

                        // Code features
                        folding: true,
                        foldingStrategy: 'indentation',
                        showFoldingControls: 'mouseover',
                        bracketPairColorization: { enabled: true },
                        guides: {
                            bracketPairs: true,
                            indentation: true,
                            highlightActiveIndentation: true,
                        },

                        // Autocomplete & suggestions
                        quickSuggestions: true,
                        suggestOnTriggerCharacters: true,
                        acceptSuggestionOnEnter: 'on',
                        tabCompletion: 'on',
                        wordBasedSuggestions: 'currentDocument',

                        // Selection
                        multiCursorModifier: 'ctrlCmd',
                        columnSelection: true,

                        // Formatting
                        formatOnPaste: true,
                        formatOnType: true,
                        autoIndent: 'full',
                        tabSize: 4,
                        insertSpaces: true,

                        // Scrolling - disable internal scrollbar since we use page scroll
                        scrollbar: {
                            vertical: 'hidden',
                            horizontal: 'visible',
                            horizontalScrollbarSize: 10,
                        },
                        overviewRulerBorder: false,
                        overviewRulerLanes: 0,
                        hideCursorInOverviewRuler: true,

                        // Misc
                        links: true,
                        colorDecorators: true,
                        accessibilitySupport: 'auto',
                    }}
                />
            </div>
        </div>
    )
}
