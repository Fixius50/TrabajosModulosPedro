import React from 'react';
import { useError } from '../../context/ErrorContext';
import { useTranslation } from 'react-i18next';

export const GlobalErrorModal: React.FC = () => {
    const { error, clearError } = useError();
    const { t } = useTranslation();

    if (!error) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in px-6">
            <div className="relative w-full max-w-md bg-[#1a0a0c] border-2 border-[#d41121] rounded-lg shadow-[0_0_30px_rgba(212,17,33,0.5)] overflow-hidden animate-slide-up">
                {/* Header with Skull Icon */}
                <div className="bg-[#2d0f12] p-4 flex items-center justify-between border-b border-[#d41121]/50">
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-[#d41121] text-3xl">error_skull</span>
                        <h2 className="text-[#f2e8cf] font-serif font-bold text-lg tracking-wider uppercase">
                            {t('dungeon.error.title') || 'Error Crítico'}
                        </h2>
                    </div>
                    <button
                        onClick={clearError}
                        className="text-[#d41121] hover:text-white transition-colors"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 relative">
                    <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #d41121 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

                    <p className="text-[#f2e8cf] font-medium text-center leading-relaxed relative z-10">
                        {error}
                    </p>
                </div>

                {/* Footer action */}
                <div className="p-4 bg-[#0f0506] border-t border-[#d41121]/30 flex justify-center">
                    <button
                        onClick={clearError}
                        className="px-8 py-2 bg-[#d41121] text-white font-bold rounded hover:bg-[#8a1c1c] transition-colors shadow-lg uppercase text-sm tracking-widest"
                    >
                        {t('dungeon.error.dismiss') || 'Entendido'}
                    </button>
                </div>
            </div>
        </div>
    );
};
