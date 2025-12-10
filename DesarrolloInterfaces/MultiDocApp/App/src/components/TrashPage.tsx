
import { useTrash, useRestoreFromTrash, usePermanentDelete, useEmptyTrash } from '../hooks/useDocuments'
import { Trash2, RotateCcw, XCircle, AlertTriangle } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import * as AlertDialog from '@radix-ui/react-alert-dialog'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export function TrashPage() {
    const { data: trashItems = [], isLoading } = useTrash()
    const restoreFromTrash = useRestoreFromTrash()
    const permanentDelete = usePermanentDelete()
    const emptyTrash = useEmptyTrash()

    if (isLoading) {
        return <div className="p-8">Cargando papelera...</div>
    }

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <header className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        to="/dashboard"
                        className="p-2 hover:bg-muted rounded-full transition-colors"
                    >
                        ←
                    </Link>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                            <Trash2 className="text-destructive" />
                            Papelera
                        </h2>
                        <p className="text-muted-foreground mt-1">
                            {trashItems.length} {trashItems.length === 1 ? 'elemento' : 'elementos'}
                        </p>
                    </div>
                </div>

                {trashItems.length > 0 && (
                    <AlertDialog.Root>
                        <AlertDialog.Trigger asChild>
                            <button className="flex items-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground rounded-md font-medium hover:bg-destructive/90 transition-colors">
                                <XCircle size={16} />
                                Vaciar Papelera
                            </button>
                        </AlertDialog.Trigger>
                        <AlertDialog.Portal>
                            <AlertDialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
                            <AlertDialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background border rounded-xl p-6 max-w-md w-full z-50 shadow-xl">
                                <AlertDialog.Title className="text-xl font-bold flex items-center gap-2">
                                    <AlertTriangle className="text-destructive" />
                                    Vaciar Papelera
                                </AlertDialog.Title>
                                <AlertDialog.Description className="text-muted-foreground mt-2">
                                    Esta acción eliminará permanentemente todos los elementos de la papelera. Esta acción no se puede deshacer.
                                </AlertDialog.Description>
                                <div className="flex justify-end gap-3 mt-6">
                                    <AlertDialog.Cancel asChild>
                                        <button className="px-4 py-2 hover:bg-muted rounded-md transition-colors">
                                            Cancelar
                                        </button>
                                    </AlertDialog.Cancel>
                                    <AlertDialog.Action asChild>
                                        <button
                                            onClick={() => emptyTrash.mutate()}
                                            className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors"
                                        >
                                            Eliminar Todo
                                        </button>
                                    </AlertDialog.Action>
                                </div>
                            </AlertDialog.Content>
                        </AlertDialog.Portal>
                    </AlertDialog.Root>
                )}
            </header>

            {trashItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-xl text-center">
                    <Trash2 size={64} className="text-muted-foreground/30 mb-4" />
                    <h3 className="text-xl font-semibold">La papelera está vacía</h3>
                    <p className="text-muted-foreground mt-2">
                        Los elementos eliminados aparecerán aquí.
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {trashItems.map(item => (
                        <div
                            key={item.id}
                            className="flex items-center gap-4 p-4 bg-card border rounded-lg hover:border-border transition-colors"
                        >
                            <div className={`p-2 rounded-md ${item.originalType === 'folder' ? 'bg-primary/10' : 'bg-muted'}`}>
                                {item.originalType === 'folder' ? (
                                    <span className="text-primary">📁</span>
                                ) : (
                                    <span>📄</span>
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">
                                    {item.data.name || item.data.title}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Eliminado {format(new Date(item.deletedAt), "d 'de' MMMM, HH:mm", { locale: es })}
                                </p>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => restoreFromTrash.mutate(item.id)}
                                    className="flex items-center gap-1 px-3 py-1.5 text-sm hover:bg-muted rounded-md transition-colors"
                                    title="Restaurar"
                                >
                                    <RotateCcw size={14} />
                                    Restaurar
                                </button>

                                <AlertDialog.Root>
                                    <AlertDialog.Trigger asChild>
                                        <button
                                            className="flex items-center gap-1 px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                                            title="Eliminar permanentemente"
                                        >
                                            <XCircle size={14} />
                                            Eliminar
                                        </button>
                                    </AlertDialog.Trigger>
                                    <AlertDialog.Portal>
                                        <AlertDialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
                                        <AlertDialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background border rounded-xl p-6 max-w-md w-full z-50 shadow-xl">
                                            <AlertDialog.Title className="text-lg font-bold">
                                                ¿Eliminar permanentemente?
                                            </AlertDialog.Title>
                                            <AlertDialog.Description className="text-muted-foreground mt-2">
                                                Esta acción no se puede deshacer.
                                            </AlertDialog.Description>
                                            <div className="flex justify-end gap-3 mt-4">
                                                <AlertDialog.Cancel asChild>
                                                    <button className="px-3 py-1.5 hover:bg-muted rounded-md transition-colors">
                                                        Cancelar
                                                    </button>
                                                </AlertDialog.Cancel>
                                                <AlertDialog.Action asChild>
                                                    <button
                                                        onClick={() => permanentDelete.mutate(item.id)}
                                                        className="px-3 py-1.5 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors"
                                                    >
                                                        Eliminar
                                                    </button>
                                                </AlertDialog.Action>
                                            </div>
                                        </AlertDialog.Content>
                                    </AlertDialog.Portal>
                                </AlertDialog.Root>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
