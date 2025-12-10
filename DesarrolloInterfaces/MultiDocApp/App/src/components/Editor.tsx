
import { ArrowLeft, Share, Save, FileImage, FileText, ZoomIn, ZoomOut, Edit, X } from 'lucide-react'
import { CodeEditor } from './editors/CodeEditor'
import { ImageViewer } from './editors/ImageViewer'
import { PDFViewer } from './editors/PDFViewer'
import { VideoViewer } from './viewers/VideoViewer'
import { AudioViewer } from './viewers/AudioViewer'
import { ExcelViewer } from './viewers/ExcelViewer'
import { CSVViewer } from './viewers/CSVViewer'
import { MarkdownViewer } from './viewers/MarkdownViewer'
import { HTMLViewer } from './viewers/HTMLViewer'
import { JSONViewer } from './viewers/JSONViewer'
import { MediaEditor } from './editors/MediaEditor'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { Transformer } from '../lib/transformer'
import { useState } from 'react'
import { toast } from 'sonner'
import { Link } from '@tanstack/react-router'
import { useDocument } from '../hooks/useDocuments'

export function Editor({ docId }: { docId: string }) {
    const { data: doc, isLoading } = useDocument(docId)
    const [isExporting, setIsExporting] = useState(false)
    const [zoomLevel, setZoomLevel] = useState(1)
    const [isEditing, setIsEditing] = useState(false)

    if (isLoading) return <div className="p-8">Cargando documento...</div>
    if (!doc) return <div className="p-8">Documento no encontrado</div>

    const canEdit = doc.type === 'image' || doc.type === 'video'

    const handleZoom = (delta: number) => {
        setZoomLevel(prev => Math.max(0.25, Math.min(3, prev + delta)))
    }

    const renderContent = () => {
        // If editing an image/video, show MediaEditor
        if (isEditing && canEdit) {
            return <MediaEditor doc={doc} onClose={() => setIsEditing(false)} />
        }

        const commonStyle = { transform: `scale(${zoomLevel})`, transformOrigin: 'top center' }

        switch (doc.type) {
            case 'text':
            case 'code':
                return (
                    <div style={commonStyle}>
                        <CodeEditor doc={doc} />
                    </div>
                )
            case 'image':
                return (
                    <div style={commonStyle}>
                        <ImageViewer doc={doc} />
                    </div>
                )
            case 'pdf':
                return (
                    <div style={commonStyle}>
                        <PDFViewer doc={doc} />
                    </div>
                )
            case 'video':
                return <VideoViewer doc={doc} />
            case 'audio':
                return <AudioViewer doc={doc} />
            case 'excel':
                return <ExcelViewer doc={doc} />
            case 'csv':
                return <CSVViewer doc={doc} />
            case 'markdown':
                return (
                    <div style={commonStyle}>
                        <MarkdownViewer doc={doc} />
                    </div>
                )
            case 'html':
                return <HTMLViewer doc={doc} />
            case 'json':
                return (
                    <div style={commonStyle}>
                        <JSONViewer doc={doc} />
                    </div>
                )
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

    const handleSave = async () => {
        toast.success('Documento guardado')
    }

    return (
        <div className="flex flex-col h-full bg-background">
            <header className="h-14 border-b border-border flex items-center justify-between px-4 bg-card z-10 relative shadow-sm">
                <div className="flex items-center gap-4">
                    <Link
                        to="/dashboard"
                        className="p-2 hover:bg-accent rounded-full transition-colors focus:ring-2 focus:ring-primary/20"
                        aria-label="Volver"
                    >
                        <ArrowLeft size={20} />
                    </Link>
                    <div className="flex flex-col">
                        <h1 className="font-semibold text-lg leading-none">{doc.title}</h1>
                        <span className="text-xs text-muted-foreground uppercase">{doc.type}</span>
                    </div>
                </div>

                <div className="flex gap-2 items-center">
                    {/* Edit button for images/videos */}
                    {canEdit && (
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${isEditing
                                    ? 'bg-primary text-primary-foreground'
                                    : 'hover:bg-accent text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            {isEditing ? <X size={16} /> : <Edit size={16} />}
                            {isEditing ? 'Cerrar Editor' : 'Editar'}
                        </button>
                    )}

                    {/* Zoom controls */}
                    {!isEditing && (
                        <div className="flex items-center gap-1 border-r border-border pr-3 mr-2">
                            <button
                                onClick={() => handleZoom(-0.1)}
                                className="p-1.5 hover:bg-accent rounded-md transition-colors"
                                title="Reducir"
                            >
                                <ZoomOut size={18} />
                            </button>
                            <span className="text-xs text-muted-foreground w-12 text-center">
                                {Math.round(zoomLevel * 100)}%
                            </span>
                            <button
                                onClick={() => handleZoom(0.1)}
                                className="p-1.5 hover:bg-accent rounded-md transition-colors"
                                title="Ampliar"
                            >
                                <ZoomIn size={18} />
                            </button>
                        </div>
                    )}

                    {/* Export dropdown */}
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

                    <button
                        onClick={handleSave}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors shadow-sm"
                    >
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
