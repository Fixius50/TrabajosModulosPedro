import React, { useState } from 'react';
import {
    IonPage, IonContent
} from '@ionic/react';
import ProfilePage from './Profile';
import Settings from './Settings';

const AccountPage: React.FC = () => {
    const [selectedView, setSelectedView] = useState<'profile' | 'settings'>('profile');

    return (
        <IonPage>
            <IonContent fullscreen className="bg-[#0f0a0a]">
                {/* Background Atmosphere */}
                <div className="fixed inset-0 pointer-events-none z-0">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')] opacity-50"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black opacity-90"></div>
                </div>

                <div className="relative z-10 p-6 pt-20 h-full flex flex-col font-display">

                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-[Cinzel] text-[#9333ea] uppercase tracking-[0.2em] font-bold drop-shadow-[0_2px_5px_rgba(147,51,234,0.5)]">
                            Torre del Mago
                        </h1>
                        <p className="text-[10px] text-gray-400 font-[MedievalSharp] uppercase tracking-widest mt-1">
                            - Archivos Personales & Grimorios -
                        </p>
                    </div>

                    {/* Magic Tabs */}
                    <div className="flex justify-center gap-8 mb-8">
                        <button
                            onClick={() => setSelectedView('profile')}
                            className={`group flex items-center gap-2 px-4 py-2 transition-all ${selectedView === 'profile' ? 'opacity-100 scale-110' : 'opacity-50 hover:opacity-80'}`}
                        >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${selectedView === 'profile' ? 'bg-[#9333ea]/20 border-[#9333ea] shadow-[0_0_15px_#9333ea]' : 'border-gray-600 bg-black'}`}>
                                <span className="material-symbols-outlined text-[#e2d5b5] text-sm">person</span>
                            </div>
                            <span className="font-[Cinzel] text-[#e2d5b5] text-xs uppercase tracking-widest">Identidad</span>
                        </button>

                        <button
                            onClick={() => setSelectedView('settings')}
                            className={`group flex items-center gap-2 px-4 py-2 transition-all ${selectedView === 'settings' ? 'opacity-100 scale-110' : 'opacity-50 hover:opacity-80'}`}
                        >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${selectedView === 'settings' ? 'bg-[#9333ea]/20 border-[#9333ea] shadow-[0_0_15px_#9333ea]' : 'border-gray-600 bg-black'}`}>
                                <span className="material-symbols-outlined text-[#e2d5b5] text-sm">settings</span>
                            </div>
                            <span className="font-[Cinzel] text-[#e2d5b5] text-xs uppercase tracking-widest">Conjuración</span>
                        </button>
                    </div>

                    {/* Content Container (Grimoire Style) */}
                    <div className="flex-1 relative bg-[#1a0b1f]/60 border border-[#4a2b5a] rounded-lg backdrop-blur-md overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                        {/* Decorative Borders */}
                        <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-[#9333ea] to-transparent opacity-50"></div>
                        <div className="absolute bottom-0 w-full h-1 bg-gradient-to-r from-transparent via-[#9333ea] to-transparent opacity-50"></div>

                        <div className="h-full overflow-y-auto custom-scrollbar p-1">
                            <div style={{ display: selectedView === 'profile' ? 'block' : 'none', height: '100%' }}>
                                <ProfilePage />
                            </div>
                            <div style={{ display: selectedView === 'settings' ? 'block' : 'none', height: '100%' }}>
                                <Settings />
                            </div>
                        </div>
                    </div>

                </div>
            </IonContent>
        </IonPage>
    );
};

export default AccountPage;
