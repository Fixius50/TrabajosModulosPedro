import React from 'react';
import { Check, Download } from 'lucide-react';
import { clsx } from 'clsx';
import { Modal } from '../UI';
import FancyLoader from '../FancyLoader';

const MarketplaceModal = ({ isOpen, onClose, ui, setUi, loadingMarket, marketData, themes, actions, showNotify, activePageId }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Marketplace" className="max-w-[75vw] h-[75vh]">
            <div className="flex flex-col h-full">
                <div className="p-4 border-b border-zinc-100 flex gap-4">
                    <button onClick={() => setUi(p => ({ ...p, marketTab: 'themes' }))} className={clsx("px-4 py-2 rounded-lg text-sm font-medium transition-colors", ui.marketTab === 'themes' ? "bg-zinc-900 text-white" : "text-zinc-500 hover:bg-zinc-100")}>Temas</button>
                    <button onClick={() => setUi(p => ({ ...p, marketTab: 'templates' }))} className={clsx("px-4 py-2 rounded-lg text-sm font-medium transition-colors", ui.marketTab === 'templates' ? "bg-zinc-900 text-white" : "text-zinc-500 hover:bg-zinc-100")}>Plantillas</button>
                    <button onClick={() => setUi(p => ({ ...p, marketTab: 'icons' }))} className={clsx("px-4 py-2 rounded-lg text-sm font-medium transition-colors", ui.marketTab === 'icons' ? "bg-zinc-900 text-white" : "text-zinc-500 hover:bg-zinc-100")}>Iconos</button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {loadingMarket ? (
                        <FancyLoader />
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
                                        <div key={t.id} className="border border-zinc-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer flex items-center gap-4" onClick={() => { actions.addPage({ title: t.name, icon: t.icon, blocks: t.blocks }); onClose(); showNotify("Plantilla aplicada"); }}>
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

                            {ui.marketTab === 'icons' && (
                                <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                                    {marketData.icons?.map(icon => {
                                        const isInstalled = parseInt(icon.id.split('-')[1]) % 2 === 0;

                                        return (
                                            <div key={icon.id} className={clsx("border rounded-lg p-4 flex flex-col items-center gap-2 transition-all cursor-pointer", isInstalled ? "border-indigo-200 bg-indigo-50 hover:bg-indigo-100" : "border-zinc-200 hover:border-zinc-300 opacity-60 grayscale hover:grayscale-0 hover:opacity-100")} onClick={() => { if (isInstalled) { actions.updatePage(activePageId, { icon: icon.char }); onClose(); showNotify("Icono aplicado"); } else { showNotify("Debes instalar este pack primero"); } }}>
                                                <div className="text-4xl">{icon.char}</div>
                                                <div className="text-xs font-medium text-zinc-600">{icon.name}</div>
                                                {isInstalled ? <div className="text-[10px] bg-indigo-200 text-indigo-700 px-1.5 py-0.5 rounded">Instalado</div> : <div className="text-[10px] bg-zinc-100 text-zinc-500 px-1.5 py-0.5 rounded flex items-center gap-1"><Download size={8} /> Obtener</div>}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default MarketplaceModal;
