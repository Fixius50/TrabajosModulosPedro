import { Editor as Monaco } from '@monaco-editor/react'
import { useStore } from '../../store/useStore'
import type { Document } from '../../lib/schemas'
import { useCallback, useEffect, useState, useRef } from 'react'
import { Play, Terminal, Loader2, X } from 'lucide-react'
import { toast } from 'sonner'

const PISTON_LANGUAGES: Record<string, string> = {
    'javascript': 'javascript',
    'typescript': 'typescript',
    'python': 'python',
    'java': 'java',
    'c': 'c',
    'cpp': 'cpp',
    'go': 'go',
    'rust': 'rust',
    'php': 'php',
    'ruby': 'ruby',
    'swift': 'swift',
    'kotlin': 'kotlin',
    'bash': 'bash'
}

export function CodeEditor({ doc }: { doc: Document }) {
    const { updateDocument } = useStore()
    const [fontSize, setFontSize] = useState(18)
    const [isRunning, setIsRunning] = useState(false)
    const [output, setOutput] = useState<string | null>(null)
    const [showOutput, setShowOutput] = useState(false)
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

        // Add command for running
        editor.addCommand(2048 | 41, () => { // Ctrl/Cmd + Enter
            runCode()
        })
    }

    // Determine language from file extension or type
    const getLanguage = () => {
        const title = doc.title.toLowerCase()
        const ext = doc.ext?.toLowerCase() || title.split('.').pop()?.toLowerCase()

        // Specific filenames
        if (title === 'pom.xml') return 'xml'
        if (title === 'package.json') return 'json'
        if (title.startsWith('dockerfile')) return 'dockerfile'
        if (title === 'makefile') return 'makefile'

        const langMap: Record<string, string> = {
            // JavaScript/TypeScript
            'js': 'javascript', 'jsx': 'javascript', 'ts': 'typescript', 'tsx': 'typescript',
            'mjs': 'javascript', 'cjs': 'javascript',
            // Python
            'py': 'python', 'pyw': 'python',
            // Java/Kotlin
            'java': 'java', 'kt': 'kotlin', 'kts': 'kotlin',
            // C/C++/C#
            'c': 'c', 'h': 'c', 'cpp': 'cpp', 'hpp': 'cpp', 'cc': 'cpp', 'cs': 'csharp',
            // Web
            'html': 'html', 'htm': 'html', 'css': 'css', 'scss': 'scss', 'sass': 'scss', 'less': 'less',
            // Data
            'json': 'json', 'xml': 'xml', 'yaml': 'yaml', 'yml': 'yaml', 'toml': 'ini',
            // Scripting
            'sh': 'bash', 'bash': 'bash', 'zsh': 'bash', 'ps1': 'powershell', 'bat': 'batch', 'cmd': 'batch',
            // Database
            'sql': 'sql', 'mysql': 'sql', 'pgsql': 'pgsql',
            // Markup
            'md': 'markdown', 'markdown': 'markdown',
            // Config
            'ini': 'ini', 'conf': 'ini', 'cfg': 'ini', 'env': 'ini',
            // Other
            'php': 'php', 'rb': 'ruby', 'go': 'go', 'rs': 'rust', 'swift': 'swift',
            'r': 'r', 'lua': 'lua', 'pl': 'perl', 'txt': 'plaintext',
        }
        return langMap[ext || ''] || 'plaintext'
    }

    const detectedLanguage = getLanguage()
    const [selectedLanguage, setSelectedLanguage] = useState(detectedLanguage)

    useEffect(() => {
        setSelectedLanguage(detectedLanguage)
    }, [detectedLanguage])

    // Use selected language for Piston
    const language = selectedLanguage

    const runCode = async () => {
        if (!doc.content) return

        const supportedLangs = Object.keys(PISTON_LANGUAGES)
        if (!supportedLangs.includes(language)) {
            toast.error(`Ejecución no soportada para ${language}`)
            return
        }

        setIsRunning(true)
        setShowOutput(true)
        setOutput(null)

        const pistLang = language === 'cpp' ? 'c++' : language

        try {
            const res = await fetch('https://emkc.org/api/v2/piston/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    language: pistLang,
                    version: '*',
                    files: [{ content: doc.content }]
                })
            })

            const data = await res.json()

            if (data.run) {
                setOutput(data.run.output || 'Sin salida')
                if (data.run.stderr) {
                    toast.error('Error en ejecución')
                } else {
                    toast.success('Ejecución completada')
                }
            } else {
                setOutput(data.message || 'Error desconocido')
                toast.error('Fallo al ejecutar')
            }
        } catch (e) {
            setOutput('Error de conexión con la API de ejecución')
            toast.error('Error de red')
        } finally {
            setIsRunning(false)
        }
    }

    return (
        <div className="flex h-full w-full bg-[#1e1e1e] overflow-hidden">
            {/* Editor Panel (Left) */}
            <div className={`flex flex-col relative transition-all duration-300 ${showOutput ? 'w-1/2 border-r border-[#333]' : 'w-full'}`}>

                {/* Header Controls (Floating) */}
                <div className="absolute top-4 right-4 z-10 flex gap-2">
                    <div className="flex items-center bg-[#2d2d2d] border border-[#404040] rounded-md px-2">
                        <select
                            value={selectedLanguage}
                            onChange={(e) => setSelectedLanguage(e.target.value)}
                            className="bg-transparent border-none text-xs font-mono uppercase text-[#eee] focus:outline-none py-1.5 cursor-pointer appearance-none min-w-[80px] text-center"
                        >
                            {Object.keys(PISTON_LANGUAGES).map(lang => (
                                <option key={lang} value={lang} className="bg-[#2d2d2d] text-white">
                                    {lang}
                                </option>
                            ))}
                            {!PISTON_LANGUAGES[selectedLanguage] && (
                                <option value={selectedLanguage} className="bg-[#2d2d2d] text-white">
                                    {selectedLanguage}
                                </option>
                            )}
                        </select>
                    </div>

                    <button
                        onClick={runCode}
                        disabled={isRunning}
                        className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white rounded-md text-xs font-medium transition-colors shadow-lg"
                        title="Ejecutar (Ctrl+Enter)"
                    >
                        {isRunning ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
                        {isRunning ? '...' : 'Run'}
                    </button>
                </div>

                <div className="flex-1 relative">
                    <Monaco
                        height="100%"
                        language={language}
                        theme="vs-dark"
                        value={doc.content || ''}
                        onChange={handleChange}
                        onMount={handleEditorDidMount}
                        options={{
                            fontSize: fontSize,
                            fontFamily: "'Fira Code', 'Cascadia Code', 'JetBrains Mono', Consolas, 'Courier New', monospace",
                            fontLigatures: true,
                            minimap: { enabled: true, scale: 0.75 },
                            wordWrap: 'on',
                            padding: { top: 48, bottom: 16 }, // Adjusted top padding for floating controls
                            scrollBeyondLastLine: false,
                            smoothScrolling: true,
                            cursorBlinking: 'smooth',
                            cursorSmoothCaretAnimation: 'on',
                            lineNumbers: 'on',
                            folding: true,
                            bracketPairColorization: { enabled: true },
                            autoIndent: 'full',
                            formatOnType: true,
                            formatOnPaste: true,
                            tabSize: 4,
                            automaticLayout: true, // Enable automatic layout adjustment
                        }}
                    />
                </div>
            </div>

            {/* Output Panel (Right - Fixed/Sticky) */}
            {showOutput && (
                <div className="w-1/2 flex flex-col bg-[#1e1e1e] sticky top-0 h-screen border-l border-[#333]">
                    <div className="h-10 border-b border-[#333] bg-[#252526] flex items-center justify-between px-4 shrink-0">
                        <div className="flex items-center gap-2 text-sm text-[#ccc] font-medium">
                            <Terminal size={14} />
                            <span>Salida / Terminal</span>
                        </div>
                        <button
                            onClick={() => setShowOutput(false)}
                            className="p-1.5 hover:bg-[#333] text-[#888] hover:text-white rounded-md transition-colors"
                            title="Cerrar panel"
                        >
                            <X size={14} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-auto p-4 font-mono text-sm bg-[#1e1e1e]">
                        {isRunning ? (
                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3">
                                <Loader2 size={24} className="animate-spin text-primary" />
                                <span className="text-xs">Ejecutando código remotamente...</span>
                            </div>
                        ) : output ? (
                            <pre className="whitespace-pre-wrap text-[#d4d4d4] leading-relaxed select-text">
                                {output}
                            </pre>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-[#444] select-none">
                                <Play size={32} className="mb-2 opacity-20" />
                                <p className="text-xs">Ejecuta el código para ver el resultado aquí.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
