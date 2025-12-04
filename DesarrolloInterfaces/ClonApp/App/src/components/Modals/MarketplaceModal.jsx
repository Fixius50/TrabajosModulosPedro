import React from 'react';
import { Loader2, Check, Download } from 'lucide-react';
import { clsx } from 'clsx';
import { Modal } from '../UI';

export function MarketplaceModal({ ui, setUi, loadingMarket, marketData, themes, actions, showNotify }) {
    return (
        <Modal isOpen={ui.modals.marketplace} onClose={() => setUi(p => ({ ...p, modals: { ...p.modals, marketplace: false } }))} title="Marketplace">
            <div className="flex flex-col h-[80vh]">
                <div className="p-4 border-b border-zinc-100 flex gap-4">
                    <button onClick={() => setUi(p => ({ ...p, marketTab: 'themes' }))} className={clsx("px-4 py-2 rounded-lg text-sm font-medium transition-colors", ui.marketTab === 'themes' ? "bg-zinc-900 text-white" : "text-zinc-500 hover:bg-zinc-100")}>Temas</button>
                    <button onClick={() => setUi(p => ({ ...p, marketTab: 'templates' }))} className={clsx("px-4 py-2 rounded-lg text-sm font-medium transition-colors", ui.marketTab === 'templates' ? "bg-zinc-900 text-white" : "text-zinc-500 hover:bg-zinc-100")}>Plantillas</button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {loadingMarket ? (
                        <div className="flex items-center justify-center h-full text-zinc-400 gap-2"><Loader2 className="animate-spin" /> Cargando marketplace...</div>
                    ) : (
                        <>
                            {ui.marketTab === 'themes' && (
                                <div className="grid grid-cols-2 gap-4">
                                    {marketData.styles.map(t => {
                                        const isInstalled = themes.some(th => th.id === t.id);
                                        return (
                                            <div key={t.id} className="border border-zinc-200 rounded-lg p-4 hover:shadow-md transition-shadow group">
                                                <div className="h-32 rounded-md mb-3 flex items-center justify-center text-4xl font-bold text-white shadow-inner relative overflow-hidden" style={{ backgroundColor: t.colors?.bg || '#333', color: t.colors?.text || '#fff' }}>
                                                    Aa
                                                    {isInstalled && <div className="absolute inset-0 bg-black/20 flex items-center justify-center"><Check size={32} className="text-white" /></div>}
                                                </div>
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <div className="font-bold text-zinc-900">{t.name}</div>
                                                        <div className="text-xs text-zinc-500">Por {t.author}</div>
                                                    </div>
                                                    {isInstalled ? (
                                                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-medium">Instalado</span>
                                                    ) : (
                                                        <button onClick={() => { actions.addTheme(t); showNotify("Tema descargado"); }} className="text-xs bg-zinc-900 text-white px-2 py-1 rounded hover:bg-black flex items-center gap-1"><Download size={12} /> Descargar</button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {ui.marketTab === 'templates' && (
                                <div className="grid grid-cols-1 gap-4">
                                    {marketData.templates?.map(t => (
                                        <div key={t.id} className="border border-zinc-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer flex items-center gap-4" onClick={() => { actions.addPage({ title: t.name, icon: t.icon, blocks: t.blocks }); setUi(p => ({ ...p, modals: { ...p.modals, marketplace: false } })); showNotify("Plantilla aplicada"); }}>
                                            <div className="w-12 h-12 bg-zinc-100 rounded-lg flex items-center justify-center text-2xl">{t.icon}</div>
                                            <div className="flex-1">
                                                <div className="font-bold text-zinc-900">{t.name}</div>
                                                <div className="text-sm text-zinc-500">{t.description}</div>
                                            </div>
                                            <button className="px-3 py-1.5 bg-zinc-900 text-white text-xs rounded hover:bg-black">Usar</button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </Modal>
    );
}
