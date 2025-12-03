import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import { SpotlightCard } from './UI';

export function LandingPage({ onLogin }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-b from-white to-zinc-50">
            <div className="max-w-4xl w-full text-center space-y-12">
                {/* Hero */}
                <div className="space-y-6">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-sm font-medium border border-indigo-100">
                        <Sparkles size={14} />
                        <span>Nueva Arquitectura V82</span>
                    </motion.div>
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-zinc-900">
                        Tu espacio de trabajo,<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">reimaginado.</span>
                    </h1>
                    <p className="text-xl text-zinc-500 max-w-2xl mx-auto">
                        Escribe, planifica y organiza en un solo lugar. Ahora con Vite + React.
                    </p>
                    <div className="flex justify-center gap-4">
                        <button onClick={onLogin} className="px-8 py-3 bg-zinc-900 text-white rounded-lg font-medium hover:bg-zinc-800 transition-all flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                            Entrar a Fixius
                            <ArrowRight size={18} />
                        </button>
                    </div>
                </div>

                {/* Features */}
                <div className="grid md:grid-cols-3 gap-6 text-left">
                    <SpotlightCard className="p-6 h-full">
                        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 mb-4">
                            <Sparkles size={20} />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Modular</h3>
                        <p className="text-zinc-500 text-sm">Arquitectura basada en componentes reutilizables.</p>
                    </SpotlightCard>
                    <SpotlightCard className="p-6 h-full">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 mb-4">
                            <ArrowRight size={20} />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Rápido</h3>
                        <p className="text-zinc-500 text-sm">Powered by Vite para un desarrollo ultrarrápido.</p>
                    </SpotlightCard>
                    <SpotlightCard className="p-6 h-full">
                        <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center text-pink-600 mb-4">
                            <Sparkles size={20} />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Estético</h3>
                        <p className="text-zinc-500 text-sm">Diseño premium con animaciones fluidas.</p>
                    </SpotlightCard>
                </div>
            </div>
        </div>
    );
}
