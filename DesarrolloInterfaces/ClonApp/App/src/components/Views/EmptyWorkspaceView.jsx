import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, FileText, Database, ChevronRight } from 'lucide-react';

export function EmptyWorkspaceView({ onCreateWorkspace }) {
    const [workspaceName, setWorkspaceName] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState(null);

    const templates = [
        { id: 'empty', name: 'Espacio en blanco', icon: '📄', desc: 'Empezar desde cero' },
        { id: 'personal', name: 'Personal', icon: '🏠', desc: 'Tareas, notas y diario', pages: 3 },
        { id: 'work', name: 'Trabajo', icon: '💼', desc: 'Proyectos y reuniones', pages: 4 },
        { id: 'study', name: 'Estudios', icon: '📚', desc: 'Apuntes y recursos', pages: 3 },
    ];

    const handleCreate = () => {
        if (!workspaceName.trim()) {
            alert('Por favor ingresa un nombre para tu workspace');
            return;
        }
        onCreateWorkspace(workspaceName, selectedTemplate);
    };

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center overflow-hidden">
            {/* Animated background */}
            <div className="absolute inset-0 overflow-hidden">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 90, 0],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-indigo-200/30 to-transparent rounded-full blur-3xl"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.3, 1],
                        rotate: [0, -90, 0],
                    }}
                    transition={{
                        duration: 25,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-purple-200/30 to-transparent rounded-full blur-3xl"
                />
            </div>

            {/* Main content */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative z-10 max-w-2xl w-full mx-4"
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="text-center mb-8"
                >
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl mb-4 shadow-2xl">
                        <Sparkles className="text-white" size={40} />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        Bienvenido a tu espacio
                    </h1>
                    <p className="text-gray-600 text-lg">
                        Crea tu primer workspace para empezar a organizar tus ideas
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/50"
                >
                    <div className="mb-6">
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Nombre del Workspace
                        </label>
                        <input
                            type="text"
                            value={workspaceName}
                            onChange={(e) => setWorkspaceName(e.target.value)}
                            placeholder="Mi Workspace Personal"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all text-lg"
                            autoFocus
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-bold text-gray-700 mb-3">
                            Elige una plantilla
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            {templates.map((template, idx) => (
                                <motion.div
                                    key={template.id}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.5 + idx * 0.1 }}
                                    onClick={() => setSelectedTemplate(template.id)}
                                    className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedTemplate === template.id
                                            ? 'border-indigo-500 bg-indigo-50 shadow-lg scale-105'
                                            : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                                        }`}
                                >
                                    <div className="text-3xl mb-2">{template.icon}</div>
                                    <div className="font-semibold text-gray-900">{template.name}</div>
                                    <div className="text-xs text-gray-500">{template.desc}</div>
                                    {template.pages && (
                                        <div className="text-xs text-indigo-600 mt-1">
                                            {template.pages} páginas
                                        </div>
                                    )}
                                    {selectedTemplate === template.id && (
                                        <motion.div
                                            layoutId="selected"
                                            className="absolute top-2 right-2 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center"
                                        >
                                            <ChevronRight className="text-white" size={14} />
                                        </motion.div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleCreate}
                        className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all text-lg flex items-center justify-center gap-2"
                    >
                        <Sparkles size={20} />
                        Crear Workspace
                    </motion.button>
                </motion.div>
            </motion.div>
        </div>
    );
}
