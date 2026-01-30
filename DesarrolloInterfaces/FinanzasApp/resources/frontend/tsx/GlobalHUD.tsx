import React from 'react';
import { IonIcon } from '@ionic/react';
import { compassOutline } from 'ionicons/icons';

const GlobalHUD: React.FC = () => {
    return (
        <div className="fixed inset-0 z-50 pointer-events-none flex flex-col justify-between p-4">
            {/* Top Bar: Navigation & Context */}
            <div className="flex justify-between items-start">

                {/* Top Left: Compass (Metaphor: Orientation) */}
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 border border-[#d4af37] bg-black/60 rounded-full flex items-center justify-center backdrop-blur-sm shadow-[0_0_15px_rgba(212,175,55,0.3)]">
                        <IonIcon icon={compassOutline} className="text-[#d4af37] text-2xl animate-[spin_10s_linear_infinite]" />
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-xl text-[#d4af37] font-[Cinzel] font-bold tracking-widest leading-none drop-shadow-md">
                            EL ORÁCULO
                        </h1>
                        <span className="text-[10px] text-white/60 font-[Manrope] uppercase tracking-[0.2em] leading-none mt-1">
                            Finanzas Personales
                        </span>
                    </div>
                </div>

                {/* Top Right: Market Ticker (Metaphor: Astral Alignments) */}
                <div className="flex flex-col items-end">
                    <div className="h-8 overflow-hidden bg-black/60 border-l-2 border-[#7f13ec] px-4 flex items-center backdrop-blur-sm">
                        <div className="animate-pulse flex gap-4 text-xs font-[JetBrains_Mono]">
                            <span className="text-[#00f5ff]">BTC/ETH: ALINEADO</span>
                            <span className="text-red-400">RIESGO: ALTO</span>
                        </div>
                    </div>
                    <span className="text-[9px] text-[#7f13ec] font-[Manrope] uppercase tracking-[0.1em] mt-1 text-right">
                        Mercado Global
                    </span>
                </div>
            </div>

            {/* Bottom Bar is handled by Ionic Tabs, but we can add decorative corners here */}
            <div className="flex justify-between items-end pb-16">
                <div className="w-24 h-24 border-b-2 border-l-2 border-white/10 rounded-bl-3xl"></div>
                <div className="w-24 h-24 border-b-2 border-r-2 border-white/10 rounded-br-3xl"></div>
            </div>
        </div>
    );
};

export default GlobalHUD;
