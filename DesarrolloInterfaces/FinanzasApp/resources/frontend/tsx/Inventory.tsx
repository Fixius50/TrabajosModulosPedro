import React from 'react';
import { IonPage, IonContent, IonHeader, IonToolbar, IonButtons, IonMenuButton, IonTitle } from '@ionic/react';
// import { useTranslation } from 'react-i18next';

const Inventory: React.FC = () => {
    // const { t } = useTranslation(); // Translations disabled for cohesive UI adherence

    return (
        <IonPage className="bg-[#0a080c]">
            {/* Simple Ionic Header for Mobile Nav (Hidden on Desktop if desired, or styled to match) */}
            <IonHeader className="ion-no-border lg:hidden">
                <IonToolbar style={{ '--background': '#0a080c', '--color': '#fff' }}>
                    <IonButtons slot="start">
                        <IonMenuButton color="light" />
                    </IonButtons>
                    <IonTitle>Galería</IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent className="ion-padding" style={{ '--background': '#0a080c' }}>
                <div className="relative flex min-h-screen flex-col font-display text-white selection:bg-primary-purple/40">

                    {/* TopNavBar Navigation (Desktop Custom Header from Reference) */}
                    <header className="hidden lg:flex items-center justify-between border-b border-solid border-white/10 px-10 py-4 bg-[#0a080c]/80 backdrop-blur-md sticky top-0 z-50">
                        <div className="flex items-center gap-8">
                            <div className="flex items-center gap-4 text-white">
                                <div className="text-primary-purple">
                                    <span className="material-symbols-outlined text-4xl">astrophotography_mode</span>
                                </div>
                                <div className="flex flex-col">
                                    <h2 className="text-white text-lg font-bold leading-tight tracking-tight">El Astrolabio</h2>
                                    <span className="text-[10px] uppercase tracking-widest text-[#d4af37] opacity-80">Gestión de Patrimonio Premium</span>
                                </div>
                            </div>
                            <nav className="flex items-center gap-9 ml-4">
                                <a className="text-white/70 hover:text-primary-purple transition-colors text-sm font-medium" href="#">Inventario</a>
                                <a className="text-white/70 hover:text-primary-purple transition-colors text-sm font-medium" href="#">Mercado</a>
                                <a className="text-white text-sm font-bold border-b-2 border-primary-purple pb-1" href="#">Galería de Reliquias</a>
                                <a className="text-white/70 hover:text-primary-purple transition-colors text-sm font-medium" href="#">Bóveda</a>
                            </nav>
                        </div>
                        <div className="flex items-center gap-6">
                            {/* Search Bar */}
                            <div className="flex items-center bg-[#191022] rounded-lg px-3 py-1.5 border border-white/5">
                                <span className="material-symbols-outlined text-primary-purple text-xl mr-2">search</span>
                                <input className="bg-transparent border-none focus:outline-none text-sm w-48 placeholder:text-white/30 text-white" placeholder="Buscar en la bóveda..." />
                            </div>
                        </div>
                    </header>

                    <main className="flex-1 flex flex-col px-4 lg:px-12 py-8 gap-8">
                        {/* PageHeading */}
                        <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                            <div className="max-w-2xl">
                                <h1 className="text-white text-3xl md:text-5xl font-black leading-tight tracking-tighter">Galería de Reliquias <span className="text-primary-purple">&</span> Activos Tangibles</h1>
                                <p className="text-white/50 text-sm md:text-lg mt-2 font-light">Visualización holográfica y tasación en tiempo real de su patrimonio físico más exclusivo.</p>
                            </div>
                            <button className="flex items-center gap-2 bg-primary-purple hover:bg-primary-purple/80 text-white px-6 py-3 rounded-lg font-bold transition-all shadow-lg shadow-primary-purple/20">
                                <span className="material-symbols-outlined">add_circle</span>
                                Añadir Nueva Reliquia
                            </button>
                        </div>

                        {/* Main Workspace Layout */}
                        <div className="grid grid-cols-12 gap-6 flex-1 h-full min-h-[800px]">

                            {/* Left Panel: Catálogo de Rarezas */}
                            <div className="col-span-12 lg:col-span-3 flex flex-col gap-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-[#d4af37] text-xs font-bold uppercase tracking-[0.2em]">Catálogo de Rarezas</h3>
                                    <span className="bg-primary-purple/20 text-primary-purple text-[10px] px-2 py-0.5 rounded-full border border-primary-purple/30">12 Objetos</span>
                                </div>
                                <div className="flex flex-col gap-4 overflow-y-auto pr-2 max-h-[750px]">

                                    {/* Active Card */}
                                    <div className="metallic-border p-3 rounded-xl border border-primary-purple bg-primary-purple/10 shadow-xl cursor-pointer">
                                        <div className="flex gap-4">
                                            <div className="w-16 h-16 rounded-lg bg-gray-700 shrink-0 border border-white/10 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-white/50">watch</span>
                                            </div>
                                            <div className="flex flex-col justify-center">
                                                <span className="text-[10px] text-primary-purple font-bold uppercase">Mítico</span>
                                                <h4 className="text-white font-bold text-sm">Patek Philippe Nautilus</h4>
                                                <p className="text-white/40 text-[10px]">Relojería Fina</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Other Cards */}
                                    <div className="metallic-border p-3 rounded-xl hover:bg-white/5 transition-all cursor-pointer opacity-70 hover:opacity-100">
                                        <div className="flex gap-4">
                                            <div className="w-16 h-16 rounded-lg bg-gray-800 shrink-0 border border-white/10 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-white/30">monetization_on</span>
                                            </div>
                                            <div className="flex flex-col justify-center">
                                                <span className="text-[10px] text-orange-400 font-bold uppercase">Legendario</span>
                                                <h4 className="text-white/70 font-bold text-sm">Doblón de Oro 1732</h4>
                                                <p className="text-white/40 text-[10px]">Numismática</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="metallic-border p-3 rounded-xl hover:bg-white/5 transition-all cursor-pointer opacity-70 hover:opacity-100">
                                        <div className="flex gap-4">
                                            <div className="w-16 h-16 rounded-lg bg-gray-800 shrink-0 border border-white/10 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-white/30">palette</span>
                                            </div>
                                            <div className="flex flex-col justify-center">
                                                <span className="text-[10px] text-blue-400 font-bold uppercase">Épico</span>
                                                <h4 className="text-white/70 font-bold text-sm">Óleo 'Nebulosa'</h4>
                                                <p className="text-white/40 text-[10px]">Arte Moderno</p>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>

                            {/* Center: Hologram Pedestal */}
                            <div className="col-span-12 lg:col-span-6 relative flex flex-col items-center justify-center py-10 min-h-[400px]">
                                {/* Diagonal Navigation Dots Overlay */}
                                <div className="absolute inset-0 pointer-events-none hidden md:block">
                                    <div className="absolute top-0 left-0 w-32 h-32 border-l border-t border-primary-purple/30 rounded-tl-3xl"></div>
                                    <div className="absolute top-0 right-0 w-32 h-32 border-r border-t border-primary-purple/30 rounded-tr-3xl"></div>
                                    <div className="absolute bottom-0 left-0 w-32 h-32 border-l border-b border-primary-purple/30 rounded-bl-3xl"></div>
                                    <div className="absolute bottom-0 right-0 w-32 h-32 border-r border-b border-primary-purple/30 rounded-br-3xl"></div>
                                </div>

                                {/* Central Hologram */}
                                <div className="relative w-full max-w-md aspect-square flex items-center justify-center">
                                    <div className="absolute w-64 h-24 bg-primary-purple/20 blur-[80px] rounded-full bottom-10"></div>

                                    <div className="relative z-20 w-4/5 aspect-square rounded-2xl hologram-glow border border-primary-purple/40 p-1 backdrop-blur-sm overflow-hidden flex items-center justify-center bg-black/40">
                                        <div className="scanline"></div>
                                        {/* Image Placeholder */}
                                        <div className="w-full h-full bg-gradient-to-br from-gray-900 to-black flex items-center justify-center text-white/20">
                                            <span className="material-symbols-outlined text-9xl animate-pulse">watch</span>
                                        </div>

                                        <div className="absolute inset-0 bg-gradient-to-t from-primary-purple/20 to-transparent pointer-events-none"></div>
                                    </div>

                                    {/* Pedestal Base */}
                                    <div className="absolute -bottom-4 w-72 h-8 bg-zinc-800 rounded-full flex items-center justify-center border-t-2 border-primary-purple/50 shadow-2xl">
                                        <div className="w-64 h-1 bg-primary-purple/40 rounded-full blur-sm"></div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Panel: Tasación del Oráculo */}
                            <div className="col-span-12 lg:col-span-3 flex flex-col gap-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-[#d4af37] text-xs font-bold uppercase tracking-[0.2em]">Tasación del Oráculo</h3>
                                    <span className="text-primary-purple material-symbols-outlined text-sm">query_stats</span>
                                </div>

                                <div className="metallic-border p-5 rounded-2xl flex flex-col gap-6">
                                    <div className="flex flex-col gap-1">
                                        <p className="text-white/50 text-xs font-medium">Valor de Mercado Actual</p>
                                        <p className="text-3xl font-black text-white">$145,200 <span className="text-[10px] font-bold text-green-400 align-middle ml-2">+12.4%</span></p>
                                    </div>

                                    {/* Tiny Chart Visualization */}
                                    <div className="h-24 w-full bg-primary-purple/5 rounded-lg border border-primary-purple/10 flex items-end px-2 pb-1 gap-1">
                                        {[40, 55, 45, 70, 60, 90].map((h, i) => (
                                            <div key={i} className={`w-full rounded-t-sm ${i === 5 ? 'bg-primary-purple shadow-[0_0_10px_#7f13ec]' : 'bg-primary-purple/30'}`} style={{ height: `${h}%` }}></div>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                                            <p className="text-[10px] text-white/40 uppercase">Precio Compra</p>
                                            <p className="text-sm font-bold text-white">$129,000</p>
                                        </div>
                                        <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                                            <p className="text-[10px] text-white/40 uppercase">Plusvalía</p>
                                            <p className="text-sm font-bold text-green-400">+$16,200</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        <div className="flex justify-between text-[10px]">
                                            <span className="text-white/50 italic">Estado: Moderado</span>
                                            <span className="text-[#d4af37]">Rareza: 98/100</span>
                                        </div>
                                        <button className="w-full bg-[#191022] hover:bg-primary-purple transition-all text-white border border-primary-purple/40 py-2 rounded-lg text-xs font-bold uppercase tracking-wider">
                                            Solicitar Peritaje
                                        </button>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </main>

                    {/* Footer Stats */}
                    <footer className="mt-auto px-10 py-4 bg-[#191022] border-t border-white/5 flex flex-wrap justify-between items-center gap-4">
                        <div className="flex gap-8">
                            <div className="flex flex-col">
                                <span className="text-[10px] text-white/40 uppercase">Patrimonio Físico</span>
                                <span className="text-lg font-bold text-[#d4af37]">$1,245,000</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] text-white/40 uppercase">Activos en Gestión</span>
                                <span className="text-lg font-bold text-white">24 Reliquias</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-[10px] text-primary-purple font-bold animate-pulse">● BÓVEDA CONECTADA</span>
                        </div>
                    </footer>

                </div>
            </IonContent>
        </IonPage>
    );
};

export default Inventory;
