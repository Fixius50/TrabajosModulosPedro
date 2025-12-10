
import { useCallback, useState } from 'react'
import { Upload, FolderOpen, Loader2 } from 'lucide-react'
import { useCreateDocument, useCreateFolder } from '../hooks/useDocuments'
import { detectFileType, type Document, type Folder } from '../lib/schemas'
import JSZip from 'jszip'
import { v4 as uuidv4 } from 'uuid'

interface FileUploaderProps {
    currentFolderId: string | null
    onUploadComplete?: () => void
}

export function FileUploader({ currentFolderId, onUploadComplete }: FileUploaderProps) {
    const [isDragging, setIsDragging] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    const createDocument = useCreateDocument()
    const createFolder = useCreateFolder()

    // Process a single file
    const processFile = useCallback(async (file: File, folderId: string | null): Promise<Document> => {
        const ext = file.name.split('.').pop()?.toLowerCase() || ''
        const type = detectFileType(file.name)

        // For text-based files, read content
        let content: string | undefined
        let url: string | undefined

        if (['text', 'code', 'markdown', 'json', 'csv', 'html'].includes(type)) {
            content = await file.text()
        } else {
            // For binary files (images, videos, audio, pdf, excel), create object URL
            url = URL.createObjectURL(file)
        }

        return {
            id: uuidv4(),
            title: file.name,
            type,
            content,
            url,
            folderId,
            pinned: false,
            order: 0,
            ext,
            size: file.size,
            createdAt: new Date()
        }
    }, [])

    // Process ZIP file
    const processZip = useCallback(async (file: File, parentFolderId: string | null) => {
        const zip = await JSZip.loadAsync(file)
        const folderName = file.name.replace('.zip', '')

        // Create main folder for ZIP
        const mainFolder: Folder = {
            id: uuidv4(),
            name: folderName,
            parentId: parentFolderId,
            pinned: false,
            order: 0,
            createdAt: new Date()
        }
        await createFolder.mutateAsync(mainFolder)

        // Process ZIP contents
        const entries = Object.entries(zip.files)
        for (const [path, zipEntry] of entries) {
            if (zipEntry.dir || path.includes('__MACOSX')) continue

            const blob = await zipEntry.async('blob')
            const fileName = path.split('/').pop() || path
            const pseudoFile = new File([blob], fileName)
            const doc = await processFile(pseudoFile, mainFolder.id)
            await createDocument.mutateAsync(doc)
        }
    }, [createFolder, createDocument, processFile])

    // Recursive folder scanner
    const scanEntry = async (entry: FileSystemEntry): Promise<{ files: File[], subFolders: Map<string, File[]> }> => {
        const files: File[] = []
        const subFolders = new Map<string, File[]>()

        if (entry.isFile) {
            const file = await new Promise<File>((resolve) => {
                (entry as FileSystemFileEntry).file(resolve)
            })
            files.push(file)
        } else if (entry.isDirectory) {
            const dirReader = (entry as FileSystemDirectoryEntry).createReader()
            const entries = await new Promise<FileSystemEntry[]>((resolve) => {
                dirReader.readEntries(resolve)
            })

            for (const childEntry of entries) {
                if (childEntry.isFile) {
                    const file = await new Promise<File>((resolve) => {
                        (childEntry as FileSystemFileEntry).file(resolve)
                    })
                    files.push(file)
                } else {
                    const subResult = await scanEntry(childEntry)
                    subFolders.set(childEntry.name, subResult.files)
                }
            }
        }

        return { files, subFolders }
    }

    // Process dropped items
    const handleDrop = useCallback(async (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)
        setIsProcessing(true)

        try {
            const items = e.dataTransfer.items
            const regularFiles: File[] = []
            const folderEntries: FileSystemDirectoryEntry[] = []

            // Separate files and folders
            for (let i = 0; i < items.length; i++) {
                const entry = items[i].webkitGetAsEntry()
                if (entry) {
                    if (entry.isDirectory) {
                        folderEntries.push(entry as FileSystemDirectoryEntry)
                    } else {
                        const file = items[i].getAsFile()
                        if (file) regularFiles.push(file)
                    }
                }
            }

            // Process regular files
            for (const file of regularFiles) {
                if (file.name.endsWith('.zip')) {
                    await processZip(file, currentFolderId)
                } else {
                    const doc = await processFile(file, currentFolderId)
                    await createDocument.mutateAsync(doc)
                }
            }

            // Process folder entries
            for (const folderEntry of folderEntries) {
                const folder: Folder = {
                    id: uuidv4(),
                    name: folderEntry.name,
                    parentId: currentFolderId,
                    pinned: false,
                    order: 0,
                    createdAt: new Date()
                }
                await createFolder.mutateAsync(folder)

                const { files } = await scanEntry(folderEntry)
                for (const file of files) {
                    const doc = await processFile(file, folder.id)
                    await createDocument.mutateAsync(doc)
                }
            }

            onUploadComplete?.()
        } catch (error) {
            console.error('Upload error:', error)
        } finally {
            setIsProcessing(false)
        }
    }, [currentFolderId, processFile, processZip, createDocument, createFolder, onUploadComplete])

    // Handle file input
    const handleFileInput = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files) return

        setIsProcessing(true)
        try {
            for (const file of Array.from(files)) {
                if (file.name.endsWith('.zip')) {
                    await processZip(file, currentFolderId)
                } else {
                    const doc = await processFile(file, currentFolderId)
                    await createDocument.mutateAsync(doc)
                }
            }
            onUploadComplete?.()
        } finally {
            setIsProcessing(false)
            e.target.value = ''
        }
    }, [currentFolderId, processFile, processZip, createDocument, onUploadComplete])

    return (
        <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${isDragging
                ? 'border-primary bg-primary/5 scale-[1.02]'
                : 'border-border hover:border-primary/50'
                }`}
        >
            {isProcessing ? (
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="animate-spin text-primary" size={40} />
                    <p className="text-muted-foreground">Procesando archivos...</p>
                </div>
            ) : (
                <>
                    <div className="flex flex-col items-center gap-4">
                        <div className="p-4 bg-muted rounded-full">
                            <Upload size={32} className="text-muted-foreground" />
                        </div>
                        <div>
                            <p className="font-medium">Arrastra archivos o carpetas aquí</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                o haz clic para seleccionar
                            </p>
                        </div>

                        <div className="flex gap-2 mt-2">
                            <label className="px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 cursor-pointer transition-colors">
                                <input
                                    type="file"
                                    multiple
                                    className="hidden"
                                    onChange={handleFileInput}
                                />
                                Archivos
                            </label>
                            <label className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md font-medium hover:bg-secondary/80 cursor-pointer transition-colors flex items-center gap-2">
                                <FolderOpen size={16} />
                                <input
                                    type="file"
                                    // @ts-ignore - webkitdirectory is not in types
                                    webkitdirectory=""
                                    directory=""
                                    multiple
                                    className="hidden"
                                    onChange={handleFileInput}
                                />
                                Carpeta
                            </label>
                        </div>
                    </div>

                    <p className="text-xs text-muted-foreground mt-4">
                        Soporta: Imágenes, Videos, Audio, PDF, Excel, CSV, Markdown, JSON, HTML, Código, ZIP
                    </p>
                </>
            )}
        </div>
    )
}
