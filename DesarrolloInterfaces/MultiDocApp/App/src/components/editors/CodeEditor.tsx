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
    'shell': 'bash', // Monaco uses 'shell', Piston uses 'bash'
    'csharp': 'csharp'
}

const BOILERPLATES: Record<string, string> = {
    'java': `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello World");
    }
}`,
    'python': `print("Hello World")`,
    'c': `#include <stdio.h>

int main() {
    printf("Hello World\\n");
    return 0;
}`,
    'cpp': `#include <iostream>

int main() {
    std::cout << "Hello World" << std::endl;
    return 0;
}`,
    'javascript': `console.log("Hello World");`,
    'typescript': `console.log("Hello World");`,
    'shell': `echo "Hello World"`,
    'csharp': `using System;

class Program {
    static void Main() {
        Console.WriteLine("Hello World");
    }
}`
}

export function CodeEditor({ doc, content, onChange, zoom = 1 }: { doc: Document, content: string, onChange: (val: string) => void, zoom?: number }) {
    // const { updateDocument } = useStore() // Removed: controlled by parent
    const [fontSize, setFontSize] = useState(16)
    const [isRunning, setIsRunning] = useState(false)
    const [output, setOutput] = useState<string | null>(null)
    const [showOutput, setShowOutput] = useState(false)
    const editorRef = useRef<any>(null)

    // Update font size when zoom changes
    useEffect(() => {
        // Base size 15px, scale with zoom
        setFontSize(Math.round(15 * zoom))
    }, [zoom])

    const handleChange = useCallback((value: string | undefined) => {
        if (value !== undefined) {
            onChange(value)
        }
    }, [onChange])

    // Update height based on content
    const handleEditorDidMount = (editor: any) => {
        editorRef.current = editor

        // Add command for running
        editor.addCommand(2048 | 41, () => { // Ctrl/Cmd + Enter
            runCode()
        })

        // Ensure focus
        editor.focus()
    }

    // Determine language from file extension or type
    const getLanguage = () => {
        const title = doc.title.toLowerCase()
        const ext = doc.ext?.toLowerCase() || title.split('.').pop()?.toLowerCase() || 'txt'

        // Piston/Monaco language map
        if (title === 'pom.xml') return 'xml'
        if (title === 'package.json') return 'json'
        if (title.startsWith('dockerfile')) return 'dockerfile'
        if (title === 'makefile') return 'makefile'

        const langMap: Record<string, string> = {
            'js': 'javascript', 'jsx': 'javascript', 'ts': 'typescript', 'tsx': 'typescript',
            'py': 'python', 'pyw': 'python',
            'java': 'java', 'kt': 'kotlin',
            'c': 'c', 'cpp': 'cpp', 'cs': 'csharp',
            'html': 'html', 'css': 'css', 'scss': 'scss',
            'json': 'json', 'xml': 'xml', 'yaml': 'yaml',
            'sh': 'shell', 'bash': 'shell', 'zsh': 'shell',
            'sql': 'sql', 'md': 'markdown', 'txt': 'plaintext'
        }
        return langMap[ext] || 'plaintext'
    }

    const detectedLanguage = getLanguage()
    const [selectedLanguage, setSelectedLanguage] = useState(detectedLanguage)

    // Handle language change and boilerplate
    useEffect(() => {
        // Only update if detected changes significantly or on mount
        if (detectedLanguage !== 'plaintext' && selectedLanguage === 'plaintext') {
            setSelectedLanguage(detectedLanguage)
        }
    }, [detectedLanguage, selectedLanguage])

    const handleLanguageChange = (newLang: string) => {
        setSelectedLanguage(newLang)

        // Optional: Insert boilerplate if empty
        if ((!content || content.trim() === '') && BOILERPLATES[newLang]) {
            const boilerplate = BOILERPLATES[newLang]
            onChange(boilerplate)
        }
    }

    // Use selected language for Piston
    const language = selectedLanguage

    const runCode = async () => {
        if (!content) return

        const supportedLangs = Object.keys(PISTON_LANGUAGES)
        if (!supportedLangs.includes(language)) {
            toast.error(`Ejecución no soportada para ${language}. Intenta cambiar de lenguaje.`)
            return
        }

        setIsRunning(true)
        setShowOutput(true)
        setOutput(null)

        // Get the Piston ID from the map
        let pistLang = PISTON_LANGUAGES[language]

        // Special internal mappings for Piston variants if needed
        if (language === 'cpp') pistLang = 'c++'
        if (language === 'csharp') pistLang = 'csharp' // Piston uses csharp usually

        try {
            const res = await fetch('https://emkc.org/api/v2/piston/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    language: pistLang,
                    version: '*',
                    files: [{ content }]
                })
            })

            const data = await res.json()

            if (data.run) {
                // Construct output from stdout and stderr explicitly to avoid missing data
                let outputText = data.run.output || ''

                // Fallback if output is empty but we have components
                if (!outputText) {
                    if (data.run.stdout) outputText += data.run.stdout
                    if (data.run.stderr) outputText += '\nERROR:\n' + data.run.stderr
                }

                // Logic for empty output on success
                if (!outputText.trim()) {
                    if (data.run.code === 0) {
                        outputText = 'Programa ejecutado correctamente.\n(No hubo salida en consola. ¿Usaste print/console.log?)'
                    } else {
                        outputText = 'El programa terminó sin salida explícita.'
                    }
                }

                setOutput(outputText)

                if (data.run.code === 0) {
                    toast.success('Ejecución exitosa')
                } else {
                    toast.warning('El programa terminó con errores')
                }

            } else {
                setOutput(data.message || 'Error desconocido al comunicar con el compilador')
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
        <div className="flex h-full w-full bg-[#1e1e1e] overflow-hidden relative">
            {/* Editor Panel */}
            <div className={`flex flex-col h-full transition-all duration-300 ${showOutput ? 'w-1/2 border-r border-[#333]' : 'w-full'}`}>

                {/* Header Controls (Floating overlay) */}
                <div className="absolute top-4 right-6 z-20 flex gap-2">
                    <div className="flex items-center bg-[#2d2d2d]/90 backdrop-blur border border-[#404040] rounded-md px-2 shadow-sm">
                        <select
                            value={selectedLanguage}
                            onChange={(e) => handleLanguageChange(e.target.value)}
                            className="bg-transparent border-none text-xs font-mono uppercase text-[#eee] focus:outline-none py-1.5 cursor-pointer min-w-[80px] text-center"
                        >
                            {Object.keys(PISTON_LANGUAGES).map(lang => (
                                <option key={lang} value={lang} className="bg-[#2d2d2d]">
                                    {lang}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={runCode}
                        disabled={isRunning}
                        className="flex items-center gap-2 px-3 py-1.5 bg-green-600/90 hover:bg-green-500 backdrop-blur disabled:opacity-50 text-white rounded-md text-xs font-medium transition-colors shadow-lg"
                        title="Ejecutar (Ctrl+Enter)"
                    >
                        {isRunning ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
                        {isRunning ? '...' : 'Run'}
                    </button>
                </div>

                <div className="flex-1 w-full relative">
                    <Monaco
                        height="100%"
                        language={language}
                        theme="vs-dark"
                        value={content || ''}
                        onChange={handleChange}
                        onMount={handleEditorDidMount}
                        options={{
                            fontSize: fontSize,
                            fontFamily: "'Fira Code', 'Cascadia Code', 'JetBrains Mono', Consolas, monospace",
                            fontLigatures: true,
                            minimap: { enabled: true, scale: 0.75 },
                            wordWrap: 'on',
                            padding: { top: 24, bottom: 16 },
                            scrollBeyondLastLine: false,
                            smoothScrolling: true,
                            cursorBlinking: 'smooth',
                            lineNumbers: 'on',
                            folding: true,
                            renderValidationDecorations: 'on',
                            automaticLayout: true,
                            // Simplified IntelliSense
                            quickSuggestions: true,
                            suggestOnTriggerCharacters: true,
                            snippetSuggestions: 'inline',
                            tabCompletion: 'on',
                            wordBasedSuggestions: 'currentDocument',
                            acceptSuggestionOnEnter: 'on',
                        }}
                    />
                </div>
            </div>

            {/* Output Panel Side-by-Side */}
            <div className={`flex flex-col bg-[#1e1e1e] border-l border-[#333] transition-all duration-300 overflow-hidden ${showOutput ? 'w-1/2 opacity-100' : 'w-0 opacity-0'}`}>
                <div className="h-10 border-b border-[#333] bg-[#252526] flex items-center justify-between px-4 shrink-0">
                    <div className="flex items-center gap-2 text-sm text-[#ccc] font-medium">
                        <Terminal size={14} />
                        <span>Consola</span>
                    </div>
                    <button
                        onClick={() => setShowOutput(false)}
                        className="p-1 hover:bg-[#333] text-[#888] hover:text-white rounded transition-colors"
                        title="Cerrar"
                    >
                        <X size={16} />
                    </button>
                </div>

                <div className="flex-1 overflow-auto p-4 font-mono text-sm bg-[#1e1e1e]">
                    {isRunning ? (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3">
                            <Loader2 size={24} className="animate-spin text-primary" />
                            <span className="text-xs">Ejecutando...</span>
                        </div>
                    ) : output ? (
                        <pre className="whitespace-pre-wrap text-[#d4d4d4] leading-relaxed select-text font-mono text-xs">
                            {output}
                        </pre>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-[#444] select-none">
                            <Terminal size={32} className="mb-2 opacity-20" />
                            <p className="text-xs">Esperando salida...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
