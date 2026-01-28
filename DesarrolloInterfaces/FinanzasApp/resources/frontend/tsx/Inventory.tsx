import React, { useState } from 'react';
import { IonPage, IonContent, IonIcon } from '@ionic/react';
import { diamond, colorPalette, watch, searchOutline, addCircleOutline } from 'ionicons/icons';

const Inventory: React.FC = () => {
    // Mock Data for "Reliquias"
    const [selectedItem, setSelectedItem] = useState(0);
    const items = [
        { id: 0, name: 'Patek Philippe Nautilus', type: 'Mítico', category: 'Relojería', value: 145200, profit: 16200, rarity: 98, icon: watch, desc: "Forjado en las minas del tiempo eterno.", color: "text-purple-400" },
        { id: 1, name: 'Doblón de Oro 1732', type: 'Legendario', category: 'Numismática', value: 24500, profit: 3400, rarity: 85, icon: diamond, desc: "Recuperado de un galeón fantasma.", color: "text-amber-400" },
        { id: 2, name: 'Óleo "Nebulosa"', type: 'Épico', category: 'Arte', value: 85000, profit: 12500, rarity: 75, icon: colorPalette, desc: "Pintado con polvo de estrellas.", color: "text-blue-400" },
    ];

    const activeItem = items[selectedItem];

    return (
        <IonPage>
            <IonContent fullscreen className="bg-[#0f0a0a]">
                {/* Background Atmosphere */}
                <div className="fixed inset-0 pointer-events-none z-0">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')] opacity-50"></div>
                </div>

                <div className="relative z-10 p-6 md:p-12 min-h-screen flex flex-col font-[MedievalSharp] text-[#e2d5b5]">

                    {/* Header */}
                    <header className="flex flex-col md:flex-row justify-between items-end mb-8 border-b border-[#c5a059]/30 pb-4">
                        <div>
                            <h1 className="text-3xl md:text-5xl text-[#c5a059] font-bold tracking-[0.1em] uppercase gold-text-glow font-[Cinzel]">
                                Galería de Reliquias
                            </h1>
                            <p className="text-[#9ca3af] text-sm mt-1 uppercase tracking-widest">
                                Bóveda de Activos Tangibles
                            </p>
                        </div>
                        <div className="flex items-center gap-4 mt-4 md:mt-0">
                            <div className="relative group">
                                <input
                                    type="text"
                                    placeholder="Buscar tesoro..."
                                    className="bg-[#1a1616] border border-[#4a4e5a] text-[#c5a059] px-4 py-2 rounded text-xs uppercase tracking-wider w-48 focus:outline-none focus:border-[#c5a059]"
                                />
                                <IonIcon icon={searchOutline} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
                            </div>
                            <button className="bg-[#8a1c1c] hover:bg-[#c5a059] hover:text-[#0f0a0a] text-[#e2d5b5] border border-[#c5a059]/50 px-4 py-2 rounded flex items-center gap-2 transition-all group">
                                <IonIcon icon={addCircleOutline} />
                                <span className="text-xs font-[Cinzel] font-bold tracking-widest uppercase">Añadir</span>
                            </button>
                        </div>
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">

                        {/* Left Panel: Inventory List */}
                        <div className="lg:col-span-3 flex flex-col gap-4 bg-[#120c0c]/80 p-4 rounded border border-[#4a4e5a]">
                            <h3 className="text-[#c5a059] text-xs font-[Cinzel] font-bold uppercase tracking-widest mb-2 border-b border-[#4a4e5a] pb-2">
                                Inventario
                            </h3>
                            <div className="flex flex-col gap-3 overflow-y-auto max-h-[600px] custom-scrollbar">
                                {items.map((item, index) => (
                                    <div
                                        key={item.id}
                                        onClick={() => setSelectedItem(index)}
                                        className={`p-3 rounded border cursor-pointer transition-all flex items-center gap-3 group ${selectedItem === index ? 'bg-[#2a1a1a] border-[#c5a059]' : 'bg-[#1a1616] border-[#2a2a2a] hover:border-[#c5a059]/50'}`}
                                    >
                                        <div className={`w-10 h-10 rounded flex items-center justify-center bg-black/50 border border-white/5 ${selectedItem === index ? 'text-[#c5a059]' : 'text-gray-500'}`}>
                                            <IonIcon icon={item.icon} />
                                        </div>
                                        <div>
                                            <p className={`text-xs font-bold uppercase ${item.color}`}>{item.type}</p>
                                            <p className="text-sm text-[#e2d5b5] font-bold leading-tight">{item.name}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Center Panel: Item Detail (Pedestal) */}
                        <div className="lg:col-span-6 flex flex-col items-center justify-center relative min-h-[400px]">
                            {/* Magic Circle Background */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                                <div className="w-96 h-96 border border-[#c5a059] rounded-full animate-[spin_60s_linear_infinite]"></div>
                                <div className="absolute w-80 h-80 border border-[#8a1c1c] rounded-full animate-[spin_40s_linear_infinite_reverse]"></div>
                            </div>

                            {/* Item Display */}
                            <div className="relative z-10 flex flex-col items-center text-center animate-scaleIn">
                                <div className="w-48 h-48 rounded-full border-4 border-[#c5a059] bg-[#0f0a0a] flex items-center justify-center shadow-[0_0_50px_rgba(197,160,89,0.2)] mb-8 relative">
                                    <IonIcon icon={activeItem.icon} className="text-6xl text-[#e2d5b5] drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                                    <div className="absolute -bottom-4 bg-[#8a1c1c] text-[#e2d5b5] text-[10px] px-3 py-1 rounded border border-[#c5a059] font-[Cinzel] tracking-widest uppercase">
                                        Nivel {activeItem.rarity}
                                    </div>
                                </div>

                                <h2 className="text-3xl text-[#c5a059] font-[Cinzel] font-bold uppercase tracking-wider mb-2">{activeItem.name}</h2>
                                <p className="text-[#9ca3af] italic max-w-md text-sm">"{activeItem.desc}"</p>
                            </div>
                        </div>

                        {/* Right Panel: Appraisal (Stats) */}
                        <div className="lg:col-span-3 flex flex-col gap-4 bg-[#120c0c]/80 p-4 rounded border border-[#4a4e5a]">
                            <h3 className="text-[#c5a059] text-xs font-[Cinzel] font-bold uppercase tracking-widest mb-2 border-b border-[#4a4e5a] pb-2">
                                Tasación del Oráculo
                            </h3>

                            <div className="bg-[#1a1616] p-4 rounded border border-[#2a2a2a] mb-4">
                                <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Valor de Mercado</p>
                                <p className="text-3xl font-[Cinzel] text-[#e2d5b5] font-bold">
                                    {activeItem.value.toLocaleString()} GP
                                </p>
                                <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[10px]">trending_up</span>
                                    +{activeItem.profit.toLocaleString()} GP (Plusvalía)
                                </p>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-xs border-b border-[#2a2a2a] pb-2">
                                    <span className="text-gray-500 uppercase">Categoría</span>
                                    <span className="text-[#c5a059]">{activeItem.category}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs border-b border-[#2a2a2a] pb-2">
                                    <span className="text-gray-500 uppercase">Rareza</span>
                                    <span className={`${activeItem.color} font-bold`}>{activeItem.type}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs border-b border-[#2a2a2a] pb-2">
                                    <span className="text-gray-500 uppercase">Estado</span>
                                    <span className="text-white">Impecable</span>
                                </div>
                            </div>

                            <button className="mt-auto w-full border border-[#c5a059] text-[#c5a059] hover:bg-[#c5a059] hover:text-black transition-colors py-3 rounded text-xs font-[Cinzel] font-bold uppercase tracking-widest">
                                Solicitar Peritaje
                            </button>
                        </div>

                    </div>

                </div>
            </IonContent>
        </IonPage>
    );
};

export default Inventory;
