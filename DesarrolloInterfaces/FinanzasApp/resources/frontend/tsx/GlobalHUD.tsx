import React from 'react';
import { IonIcon } from '@ionic/react';
import { compassOutline } from 'ionicons/icons';
import { motion } from 'framer-motion';

const GlobalHUD: React.FC = () => {
    return (
        <div className="fixed inset-0 z-50 pointer-events-none flex flex-col justify-between p-4 md:p-8">
            {/* Top Bar: Navigation & Context */}
            <div className="flex justify-between items-start w-full">

                {/* Top Left: Compass (Metaphor: Orientation) */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="flex items-center gap-4"
                >
                    <div className="relative group">
                        <div className="absolute inset-0 bg-[#d4af37] rounded-full blur-md opacity-20 group-hover:opacity-40 transition-opacity"></div>
                        <div className="w-14 h-14 border border-[#d4af37]/40 bg-black/40 rounded-full flex items-center justify-center backdrop-blur-xl shadow-2xl relative overflow-hidden">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 border-t-2 border-[#d4af37]/20 rounded-full"
                            />
                            <IonIcon icon={compassOutline} className="text-[#d4af37] text-2xl" />
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-2xl text-white font-[Cinzel] font-bold tracking-[0.2em] leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                            EL ORÁCULO
                        </h1>
                        <div className="flex items-center gap-2 mt-1">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                            <span className="text-[10px] text-gray-400 font-[Manrope] uppercase tracking-[0.2em] leading-none font-bold">
                                Sistema Activo
                            </span>
                        </div>
                    </div>
                </motion.div>

                {/* Top Right: (Empty, ticker removed as per user request) */}
                <div />
            </div>

            {/* Bottom Bar Decorative Elements */}
            <div className="flex justify-between items-end pb-20 px-8">
                <div className="w-32 h-32 border-b-2 border-l-2 border-white/5 rounded-bl-[3rem] relative">
                    <div className="absolute bottom-4 left-4 w-2 h-2 bg-white/10 rounded-full"></div>
                </div>
                <div className="w-32 h-32 border-b-2 border-r-2 border-white/5 rounded-br-[3rem] relative">
                    <div className="absolute bottom-4 right-4 w-2 h-2 bg-white/10 rounded-full"></div>
                </div>
            </div>
        </div>
    );
};

export default GlobalHUD;
