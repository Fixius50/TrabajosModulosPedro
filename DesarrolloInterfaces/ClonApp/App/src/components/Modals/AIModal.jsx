import React from 'react';
import { Sparkles, Wand2, Loader2 } from 'lucide-react';
import { Modal } from '../UI';
import { utils } from '../../lib/utils';

export function AIModal({ ui, setUi, aiPrompt, setAiPrompt, isAiGenerating, setIsAiGenerating, actions, showNotify }) {
    return (
        <Modal isOpen={ui.modals.ai} onClose={() => setUi(p => ({ ...p, modals: { ...p.modals, ai: false } }))} title="Fixius AI">
            <div className="p-6 text-center">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4"><Sparkles size={24} /></div>
                <h3 className="text-lg font-semibold mb-2">Generar Página con IA</h3>
                <p className="text-zinc-500 text-sm mb-6">Describe qué tipo de página necesitas y la IA la creará por ti.</p>
                <textarea value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-lg mb-4 h-32 outline-none focus:border-indigo-500 resize-none" placeholder="Ej: Plan de marketing para Q4..." />
                <button onClick={() => {
                    const newPageId = actions.addPage({ title: 'Generando...', isGenerating: true, icon: '✨' });
                    setUi(p => ({ ...p, modals: { ...p.modals, ai: false } }));
                    setIsAiGenerating(true);

                    // Simulate AI Generation
                    setTimeout(() => {
                        const generatedContent = [
                            { id: utils.generateId(), type: 'h1', content: aiPrompt || 'Página Generada' },
                            { id: utils.generateId(), type: 'p', content: 'Esta página ha sido generada automáticamente por Fixius AI basándose en tu descripción.' },
                            { id: utils.generateId(), type: 'callout', content: `Prompt original: "${aiPrompt}"` },
                            { id: utils.generateId(), type: 'h2', content: 'Contenido Sugerido' },
                            { id: utils.generateId(), type: 'todo', content: 'Revisar el contenido generado', checked: false },
                            { id: utils.generateId(), type: 'todo', content: 'Personalizar los bloques', checked: false },
                            { id: utils.generateId(), type: 'quote', content: 'La creatividad es la inteligencia divirtiéndose. - Albert Einstein' }
                        ];

                        actions.updatePage(newPageId, {
                            title: aiPrompt ? aiPrompt.slice(0, 20) + (aiPrompt.length > 20 ? '...' : '') : 'Página Generada',
                            isGenerating: false,
                            blocks: generatedContent,
                            icon: '🤖'
                        });
                        setIsAiGenerating(false);
                        showNotify("Página generada con éxito");
                    }, 3000);
                }} disabled={!aiPrompt.trim() || isAiGenerating} className="w-full py-2 bg-zinc-900 text-white rounded-lg font-medium hover:bg-zinc-800 disabled:opacity-50 flex items-center justify-center gap-2">
                    {isAiGenerating ? <Loader2 className="animate-spin" size={18} /> : <Wand2 size={18} />}
                    {isAiGenerating ? 'Generando...' : 'Generar Página'}
                </button>
            </div>
        </Modal>
    );
}
