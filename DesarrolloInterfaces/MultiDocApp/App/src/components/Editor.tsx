
import { useStore } from '../store/useStore'
import { ArrowLeft, Share, Save, FileImage, FileText } from 'lucide-react'
import { CodeEditor } from './editors/CodeEditor'
import { ImageViewer } from './editors/ImageViewer'
import { PDFViewer } from './editors/PDFViewer'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { Transformer } from '../lib/transformer'
import { useState } from 'react'
import { toast } from 'sonner'

export function Editor({ docId }: { docId: string }) {
    const { documents, setActiveDoc } = useStore()
    const doc = documents.find(d => d.id === docId)
    const [isExporting, setIsExporting] = useState(false)

    if (!doc) return <div>Documento no encontrado</div>

    const renderContent = () => {
        switch (doc.type) {
            case 'text':
            case 'code':
                return <CodeEditor doc={doc} />
            case 'image':
                return <ImageViewer doc={doc} />
            case 'pdf':
                return <PDFViewer doc={doc} />
            default:
                return <div className="p-10 text-center">Tipo de archivo no soportado: {doc.type}</div>
        }
    }

    const handleExport = async (type: 'pdf' | 'img') => {
        setIsExporting(true)
        try {
            if (type === 'pdf') {
                await Transformer.toPDF('document-capture', `${doc.title}.pdf`)
            } else {
                await Transformer.toImage('document-capture', `${doc.title}.png`)
            }
            toast.success(`Documento exportado como ${type.toUpperCase()}`)
        } catch (e) {
            console.error("Export failed", e)
            toast.error("Error al exportar el documento")
        } finally {
            setIsExporting(false)
        }
    }

    return (
        <div className="flex flex-col h-full bg-background">
            <header className="h-14 border-b border-border flex items-center justify-between px-4 bg-card z-10 relative shadow-sm">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setActiveDoc(null)}
                        className="p-2 hover:bg-accent rounded-full transition-colors focus:ring-2 focus:ring-primary/20"
                        aria-label="Volver"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex flex-col">
                        <h1 className="font-semibold text-lg leading-none">{doc.title}</h1>
                        <span className="text-xs text-muted-foreground uppercase">{doc.type}</span>
                    </div>
                </div>

                <div className="flex gap-2">
                    <DropdownMenu.Root>
                        <DropdownMenu.Trigger asChild>
                            <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium hover:bg-accent rounded-md transition-colors text-muted-foreground hover:text-foreground outline-none focus:ring-2 focus:ring-primary/20">
                                <Share size={16} />
                                {isExporting ? 'Exportando...' : 'Exportar'}
                            </button>
                        </DropdownMenu.Trigger>

                        <DropdownMenu.Portal>
                            <DropdownMenu.Content className="min-w-[160px] bg-popover rounded-md border border-border shadow-md p-1 z-50 animate-in fade-in zoom-in-95 data-[side=bottom]:slide-in-from-top-2">
                                <DropdownMenu.Item
                                    className="flex items-center gap-2 px-2 py-1.5 text-sm outline-none cursor-pointer hover:bg-accent hover:text-accent-foreground rounded-sm"
                                    onClick={() => handleExport('pdf')}
                                >
                                    <FileText size={14} />
                                    <span>Guardar como PDF</span>
                                </DropdownMenu.Item>
                                <DropdownMenu.Item
                                    className="flex items-center gap-2 px-2 py-1.5 text-sm outline-none cursor-pointer hover:bg-accent hover:text-accent-foreground rounded-sm"
                                    onClick={() => handleExport('img')}
                                >
                                    <FileImage size={14} />
                                    <span>Guardar como Imagen</span>
                                </DropdownMenu.Item>
                            </DropdownMenu.Content>
                        </DropdownMenu.Portal>
                    </DropdownMenu.Root>

                    <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors shadow-sm">
                        <Save size={16} />
                        Guardar
                    </button>
                </div>
            </header>

            <div className="flex-1 overflow-auto bg-muted/10 relative">
                <div id="document-capture" className="min-h-full h-full bg-background/50">
                    {renderContent()}
                </div>
            </div>
        </div>
    )
}
