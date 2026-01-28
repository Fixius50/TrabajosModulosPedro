import React, { useState } from 'react';
import { IonPage, IonContent } from '@ionic/react';

const Dashboard: React.FC = () => {
    // Login State
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loginData, setLoginData] = useState({ user: '', pass: '' });

    // Hide IonTabBar when on this page to prevent "double nav" and "mystery buttons"
    React.useEffect(() => {
        const tabBar = document.querySelector('ion-tab-bar');
        if (tabBar) tabBar.style.display = 'none';
        return () => {
            if (tabBar) tabBar.style.display = 'flex';
        };
    }, []);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Mock authentication
        if (loginData.user) {
            setIsLoggedIn(true);
        }
    };

    return (
        <IonPage>
            <IonContent fullscreen className="bg-[#0f0a0a]">
                {/* Background Atmosphere */}
                <div className="fixed inset-0 pointer-events-none z-0">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')] opacity-50"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black opacity-90"></div>
                </div>

                <div className="relative min-h-screen flex items-center justify-center font-display overflow-hidden z-10 selection:bg-[#9333ea]/30">

                    {/* Header: Centered on Login -> Top on Dashboard */}
                    <div className={`absolute left-0 w-full text-center z-20 transition-all duration-1000 ease-in-out ${isLoggedIn ? 'top-8 opacity-100' : 'top-[30%] -translate-y-[150px] opacity-100'}`}>
                        <h1 className="text-3xl md:text-5xl text-[#c5a059] font-bold tracking-[0.2em] uppercase gold-text-glow font-[Cinzel]">
                            Crónicas del Reino
                        </h1>
                        {isLoggedIn && (
                            <p className="text-[10px] md:text-sm text-[#9ca3af] mt-1 font-[MedievalSharp] tracking-widest uppercase animate-fadeIn">
                                - Nivel de Patrimonio: <span className="text-[#9333ea]">Archimago</span> -
                            </p>
                        )}
                        {!isLoggedIn && (
                            <p className="text-xs text-[#9333ea] mt-2 font-[Cinzel] tracking-[0.3em] uppercase opacity-80 animate-pulse">
                                Sistema Seguro: En Línea
                            </p>
                        )}
                    </div>

                    {/* Corner Navigation Runes - Animate from Center-ish to Corners */}
                    <div className={`transition-all duration-1000 delay-300 ${isLoggedIn ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                        {/* Map Rune: Flies to Top Left */}
                        <button className={`fixed w-10 h-10 border border-[#4a4e5a] rounded flex items-center justify-center bg-[#1a1616]/80 hover:border-[#c5a059] hover:text-[#c5a059] transition-all duration-1000 z-50 group transform hover:rotate-45 backdrop-blur-sm ${isLoggedIn ? 'top-6 left-6 translate-x-0 translate-y-0 rotate-0' : 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-180'}`}>
                            <span className="material-symbols-outlined text-gray-400 group-hover:text-[#c5a059] text-sm">map</span>
                        </button>

                        {/* Backpack Rune: Flies to Top Right */}
                        <button className={`fixed w-10 h-10 border border-[#4a4e5a] rounded flex items-center justify-center bg-[#1a1616]/80 hover:border-[#c5a059] hover:text-[#c5a059] transition-all duration-1000 z-50 group backdrop-blur-sm ${isLoggedIn ? 'top-6 right-6 translate-x-0 translate-y-0' : 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-0'}`}>
                            <span className="material-symbols-outlined text-gray-400 group-hover:text-[#c5a059] text-sm">backpack</span>
                        </button>
                    </div>


                    {/* CENTRAL VISUAL: THE ASTROLABE / LOGIN GATE */}
                    <div className={`relative transition-all duration-1000 ease-in-out flex items-center justify-center mt-0 ${isLoggedIn ? 'scale-100 w-[600px] h-[600px]' : 'scale-110 w-[350px] h-[350px]'}`}>

                        {/* Background Pulsing Aura */}
                        <div className={`data-fractal absolute inset-0 opacity-20 animate-pulse bg-purple-900 blur-[80px] rounded-full transition-all duration-1000 ${isLoggedIn ? 'bg-purple-900' : 'bg-red-900'}`}></div>


                        {/* ---------------- LOGIN FORM (CENTER) ---------------- */}
                        {!isLoggedIn && (
                            <div className="absolute z-50 w-72 text-center animate-fadeIn bg-[#0f0a0a]/90 p-8 rounded-xl border border-[#c5a059]/30 backdrop-blur-md shadow-[0_0_50px_rgba(0,0,0,0.8)] mt-12">
                                <h2 className="text-[#c5a059] font-[Cinzel] text-sm mb-6 tracking-[0.3em] gold-text-glow uppercase border-b border-[#c5a059]/30 pb-2">Acceso a la Bóveda</h2>
                                <form onSubmit={handleLogin} className="flex flex-col gap-4">
                                    <div className="relative group">
                                        <input
                                            type="text"
                                            placeholder="CÓDIGO DE ACCESO"
                                            className="w-full bg-[#1a1616] border border-[#4a4e5a] text-[#c5a059] font-[MedievalSharp] px-4 py-3 rounded focus:outline-none focus:border-[#9333ea] placeholder-gray-700 text-center text-xs tracking-widest uppercase transition-colors hover:border-[#c5a059]/50"
                                            value={loginData.user}
                                            onChange={e => setLoginData({ ...loginData, user: e.target.value })}
                                        />
                                    </div>
                                    <button type="submit" className="bg-[#8a1c1c] text-[#e2d5b5] font-[Cinzel] py-3 px-6 rounded border border-[#c5a059]/50 hover:bg-[#c5a059] hover:text-[#0f0a0a] transition-all tracking-[0.2em] uppercase text-[10px] mt-2 shadow-lg hover:shadow-[#c5a059]/20 transform hover:-translate-y-0.5 active:translate-y-0">
                                        Desbloquear
                                    </button>
                                </form>
                            </div>
                        )}

                        {/* ---------------- DASHBOARD CORE (CENTER) ---------------- */}
                        {isLoggedIn && (
                            <div className="relative z-20 text-center animate-scaleIn">
                                <p className="text-[#c5a059] text-[10px] uppercase tracking-[0.4em] mb-2 font-[Cinzel] opacity-80">Tesoro Actual</p>
                                <p className="text-5xl md:text-7xl font-bold text-[#e2d5b5] gold-text-glow font-[Cinzel] tracking-tighter drop-shadow-2xl">
                                    742.108 <span className="text-2xl text-[#c5a059]">GP</span>
                                </p>
                                <div className="h-[1px] w-32 bg-gradient-to-r from-transparent via-[#c5a059] to-transparent mx-auto mt-4 opacity-50"></div>
                            </div>
                        )}


                        {/* ---------------- ANIMATED RINGS & TICKER ---------------- */}

                        {/* Ring 1: Magic Protection (Fast) */}
                        <svg className="absolute inset-0 w-full h-full animate-[spin_60s_linear_infinite] opacity-30 pointer-events-none" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" fill="transparent" r="45" stroke="#4a4e5a" strokeWidth="0.1" strokeDasharray="2 2" />
                            <path id="curve" d="M 12, 50 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0" fill="transparent" />
                            <text>
                                <textPath href="#curve" className="text-[3px] fill-[#9333ea] font-[Cinzel] uppercase tracking-[3px]" startOffset="0%">
                                    Custodia Arcana • Protección de Activos • Cifrado Místico •
                                </textPath>
                            </text>
                        </svg>

                        {/* Ring 2: Market Ticker (VERY SLOW & WIDER to avoid overlap) */}
                        <svg className="absolute inset-[-25%] w-[150%] h-[150%] animate-[spin_120s_linear_infinite_reverse] opacity-80 pointer-events-none" viewBox="0 0 200 200">
                            <path id="ticker-curve" d="M 20, 100 a 80,80 0 1,1 160,0 a 80,80 0 1,1 -160,0" fill="transparent" />
                            <text width="500">
                                <textPath href="#ticker-curve" className="text-[4px] fill-[#c5a059] font-[MedievalSharp] uppercase tracking-[4px]" startOffset="0%">
                                    ⚔️ BTC: ▲ 2.4%   •   🔮 ETH: ▼ 0.8%   •   🏰 SP500: ▲ 0.5%   •   🛡️ RUNE: ▲ 5.2%   •   ⚔️ BTC: ▲ 2.4%   •   🔮 ETH: ▼ 0.8%
                                </textPath>
                            </text>
                            {/* Outer decorative ring for the ticker */}
                            <circle cx="100" cy="100" fill="transparent" r="82" stroke="#c5a059" strokeWidth="0.1" strokeDasharray="5 5" opacity="0.3" />
                        </svg>

                        {/* Ring 3: Decoration */}
                        <svg className="absolute inset-0 w-full h-full animate-[spin_40s_linear_infinite_reverse] opacity-20 pointer-events-none" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" fill="transparent" r="30" stroke="#c5a059" strokeWidth="0.3" strokeDasharray="40 100" />
                        </svg>
                    </div>

                    {/* ---------------- SATELLITES (FIXED POSITIONING RELATIVE TO SCREEN) ---------------- */}
                    {/* Moved out of the central div to ensure they are truly at edges */}

                    {/* 1. Loot Card (Fixed Left) */}
                    <div className={`fixed top-1/2 left-4 md:left-10 -translate-y-1/2 w-56 md:w-64 rpg-card p-4 rounded-sm border-l-4 border-l-[#c5a059] transform transition-all duration-1000 z-40 ${isLoggedIn ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-full pointer-events-none'}`}>
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-[#c5a059] text-[10px] md:text-xs font-[Cinzel] uppercase tracking-widest">Botín Reciente</h3>
                            <span className="material-symbols-outlined text-[#c5a059] text-sm">diamond</span>
                        </div>
                        <div className="text-xl md:text-2xl font-[MedievalSharp] text-white">+18.42%</div>
                        <p className="text-[9px] text-gray-500 mt-1 uppercase">Rendimiento</p>
                    </div>

                    {/* 2. Quest Log (Fixed Right) */}
                    <div className={`fixed top-1/2 right-4 md:right-10 -translate-y-1/2 w-64 md:w-72 rpg-card p-4 rounded-sm border-r-4 border-r-[#8a1c1c] transform transition-all duration-1000 z-40 ${isLoggedIn ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full pointer-events-none'}`}>
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-[#8a1c1c] text-[10px] md:text-xs font-[Cinzel] uppercase tracking-widest">Gastos de Campaña</h3>
                            <span className="material-symbols-outlined text-[#8a1c1c] text-sm">local_fire_department</span>
                        </div>
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-gray-400 text-xs">Provisiones</span>
                            <span className="text-red-400 font-[MedievalSharp]">-1.120 GP</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400 text-xs">Reparaciones</span>
                            <span className="text-red-400 font-[MedievalSharp]">-450 GP</span>
                        </div>
                    </div>

                    {/* 3. Stats (Fixed Bottom Right) */}
                    <div className={`fixed bottom-6 right-6 md:bottom-10 md:right-10 w-48 md:w-56 rpg-card p-4 rounded-sm border-t-2 border-t-[#4a4e5a] transition-all duration-1000 z-40 ${isLoggedIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full pointer-events-none'}`}>
                        <h3 className="text-gray-500 text-[10px] uppercase mb-2">Mana Pool</h3>
                        <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-full bg-[#9333ea] w-[75%] shadow-[0_0_10px_#9333ea]"></div>
                        </div>
                        <div className="flex justify-between mt-1 text-[10px] text-[#9333ea]">
                            <span>75% Carga</span>
                            <span>Estable</span>
                        </div>
                    </div>

                </div>
            </IonContent>
        </IonPage>
    );
};

export default Dashboard;
