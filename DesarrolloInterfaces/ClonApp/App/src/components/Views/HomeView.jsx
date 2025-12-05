import React from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function HomeView({ activeWorkspace, actions, setUi, userProfile }) {
    const visiblePages = activeWorkspace?.pages.filter(p => !p.isDeleted && !p.inInbox) || [];

    if (visiblePages.length === 0) {
        return (
            <div className="max-w-2xl mx-auto h-full flex flex-col items-center justify-center p-8">
                <motion.div initial={{ scale: 0.8, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} transition={{ type: "spring", duration: 0.8 }} className="text-center">
                    <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }} className="text-6xl mb-6">✨</motion.div>
                    <h2 className="text-3xl font-bold mb-3 text-current">Empecemos a crear una página</h2>
                    <p className="text-zinc-500 mb-8 max-w-md">Crea tu primera página y comienza a organizar tus ideas, proyectos y notas.</p>
                    <motion.button onClick={() => { const id = actions.addPage(); actions.setActivePageId(id); setUi(p => ({ ...p, currentView: 'page' })); }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="bg-zinc-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-black transition-colors flex items-center gap-2 mx-auto shadow-lg"><Plus size={18} /> Crear primera página</motion.button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto py-12 px-6">
            <div className="mb-8"><h1 className="text-2xl font-bold mb-2 text-current">Hola, {userProfile?.name}</h1><p className="text-zinc-500">Continúa donde lo dejaste</p></div>

            {/* Pages Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {visiblePages.slice(0, 12).map(page => (
                    <motion.div key={page.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -4, scale: 1.02 }} onClick={() => { actions.setActivePageId(page.id); setUi(p => ({ ...p, currentView: 'page' })); }} className="bg-white border border-zinc-200 rounded-lg overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-all">
                        <div className="h-32 relative overflow-hidden">
                            {page.cover ? (
                                (page.cover.startsWith('http') || page.cover.startsWith('data:image')) ? (
                                    <img src={page.cover} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full" style={{ background: page.cover }} />
                                )
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600" />
                            )}
                        </div>
                        <div className="p-4">
                            <div className="flex items-start gap-3">
                                <div className="text-3xl shrink-0">
                                    {page.icon?.startsWith('http') || page.icon?.startsWith('data:') ?
                                        <img src={page.icon} alt="" className="w-8 h-8 object-contain" /> :
                                        (page.icon || '📄')
                                    }
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-zinc-900 truncate mb-1">{page.title || 'Sin título'}</h3>
                                    <p className="text-xs text-zinc-400">Editado {formatDistanceToNow(new Date(page.updatedAt))} ago</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Databases Section */}
            {activeWorkspace?.databases && activeWorkspace.databases.length > 0 && (
                <div className="mt-12">
                    <h2 className="text-xl font-semibold mb-4 text-current">Bases de Datos</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {activeWorkspace.databases.slice(0, 12).map(database => (
                            <motion.div
                                key={database.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                whileHover={{ y: -4, scale: 1.02 }}
                                onClick={() => {
                                    actions.setActiveDatabaseId(database.id);
                                    setUi(p => ({ ...p, currentView: 'database' }));
                                }}
                                className="bg-white border border-zinc-200 rounded-lg overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-all"
                            >
                                <div className="h-32 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                    <div className="text-6xl">{database.icon || '📊'}</div>
                                </div>
                                <div className="p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-zinc-900 truncate mb-1">{database.title}</h3>
                                            <p className="text-xs text-zinc-400">{database.items?.length || 0} elementos</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
