
import { useState, useRef } from 'react'
import { useUpdateDocument } from '../../hooks/useDocuments'
import type { Document } from '../../lib/schemas'
import { toast } from 'sonner'
import { Save, RotateCw, Sun, Contrast, Droplets, RefreshCcw } from 'lucide-react'

interface MediaEditorProps {
    doc: Document
    onClose?: () => void
}

export function MediaEditor({ doc, onClose }: MediaEditorProps) {
    const updateDocument = useUpdateDocument()
    const mediaRef = useRef<HTMLImageElement | HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)

    const [brightness, setBrightness] = useState(100)
    const [contrast, setContrast] = useState(100)
    const [saturation, setSaturation] = useState(100)
    const [rotation, setRotation] = useState(0)
    const [isSaving, setIsSaving] = useState(false)

    const isVideo = doc.type === 'video'
    const src = doc.url || doc.content

    // Reset filters
    const handleReset = () => {
        setBrightness(100)
        setContrast(100)
        setSaturation(100)
        setRotation(0)
    }

    // Generate CSS filter string
    const filterStyle = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`

    // Save edited media
    const handleSave = async () => {
        if (!mediaRef.current || !canvasRef.current) return
        setIsSaving(true)

        try {
            const canvas = canvasRef.current
            const ctx = canvas.getContext('2d')
            if (!ctx) throw new Error('Canvas context not available')

            const media = mediaRef.current
            const width = isVideo
                ? (media as HTMLVideoElement).videoWidth
                : (media as HTMLImageElement).naturalWidth
            const height = isVideo
                ? (media as HTMLVideoElement).videoHeight
                : (media as HTMLImageElement).naturalHeight

            // Set canvas size accounting for rotation
            const rotated = rotation === 90 || rotation === 270
            canvas.width = rotated ? height : width
            canvas.height = rotated ? width : height

            // Apply transformations
            ctx.filter = filterStyle
            ctx.translate(canvas.width / 2, canvas.height / 2)
            ctx.rotate((rotation * Math.PI) / 180)
            ctx.drawImage(media, -width / 2, -height / 2)

            // Convert to blob
            const blob = await new Promise<Blob>((resolve, reject) => {
                canvas.toBlob(
                    (blob) => blob ? resolve(blob) : reject(new Error('Failed to create blob')),
                    'image/png',
                    1
                )
            })

            // Create new URL
            const newUrl = URL.createObjectURL(blob)

            // Update document
            await updateDocument.mutateAsync({
                id: doc.id,
                updates: { url: newUrl }
            })

            toast.success('Cambios guardados')
            onClose?.()
        } catch (error) {
            console.error('Save error:', error)
            toast.error('Error al guardar los cambios')
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="flex flex-col h-full bg-background">
            {/* Toolbar */}
            <div className="p-4 border-b bg-card flex items-center justify-between">
                <h2 className="font-semibold">Estudio Multimedia</h2>
                <div className="flex gap-2">
                    <button
                        onClick={handleReset}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-muted rounded-md transition-colors"
                    >
                        <RefreshCcw size={16} />
                        Resetear
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                        <Save size={16} />
                        {isSaving ? 'Guardando...' : 'Guardar'}
                    </button>
                </div>
            </div>

            {/* Preview area */}
            <div className="flex-1 flex items-center justify-center p-8 bg-muted/20 overflow-hidden">
                {isVideo ? (
                    <video
                        ref={mediaRef as React.RefObject<HTMLVideoElement>}
                        src={src}
                        controls
                        muted
                        loop
                        className="max-w-full max-h-[60vh] rounded-lg shadow-2xl transition-all"
                        style={{
                            filter: filterStyle,
                            transform: `rotate(${rotation}deg)`
                        }}
                    />
                ) : (
                    <img
                        ref={mediaRef as React.RefObject<HTMLImageElement>}
                        src={src}
                        alt={doc.title}
                        className="max-w-full max-h-[60vh] rounded-lg shadow-2xl transition-all"
                        style={{
                            filter: filterStyle,
                            transform: `rotate(${rotation}deg)`
                        }}
                    />
                )}

                {/* Hidden canvas for saving */}
                <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* Controls */}
            <div className="p-6 bg-card border-t">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
                    {/* Brightness */}
                    <div className="flex flex-col gap-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                            <Sun size={16} />
                            Brillo
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="200"
                            value={brightness}
                            onChange={(e) => setBrightness(Number(e.target.value))}
                            className="w-full accent-primary"
                        />
                        <span className="text-xs text-center text-muted-foreground">{brightness}%</span>
                    </div>

                    {/* Contrast */}
                    <div className="flex flex-col gap-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                            <Contrast size={16} />
                            Contraste
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="200"
                            value={contrast}
                            onChange={(e) => setContrast(Number(e.target.value))}
                            className="w-full accent-primary"
                        />
                        <span className="text-xs text-center text-muted-foreground">{contrast}%</span>
                    </div>

                    {/* Saturation */}
                    <div className="flex flex-col gap-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                            <Droplets size={16} />
                            Saturación
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="200"
                            value={saturation}
                            onChange={(e) => setSaturation(Number(e.target.value))}
                            className="w-full accent-primary"
                        />
                        <span className="text-xs text-center text-muted-foreground">{saturation}%</span>
                    </div>

                    {/* Rotation */}
                    <div className="flex flex-col gap-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                            <RotateCw size={16} />
                            Rotación
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="360"
                            step="90"
                            value={rotation}
                            onChange={(e) => setRotation(Number(e.target.value))}
                            className="w-full accent-primary"
                        />
                        <span className="text-xs text-center text-muted-foreground">{rotation}°</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
