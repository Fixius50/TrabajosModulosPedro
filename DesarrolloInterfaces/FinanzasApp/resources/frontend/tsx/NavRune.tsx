import React from 'react';
import { IonIcon } from '@ionic/react';
import {
    layersOutline,
    walletOutline,
    trendingUpOutline,
    personOutline
} from 'ionicons/icons';
import { useNavigate, useLocation } from 'react-router-dom';

interface NavRuneProps {
    isVisible: boolean;
}

const NavRune: React.FC<NavRuneProps> = ({ isVisible }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isExpanded, setIsExpanded] = React.useState(false);

    const currentPath = location.pathname;

    const navigateTo = (path: string) => {
        if (!isVisible) return;
        navigate(path);
        setIsExpanded(false);
    };

    if (!isVisible) return null;

    return (
        <>
            {/* DESKTOP VERSION: Compact Corner Gate (Bottom-Right) */}
            <div
                className="hidden md:block fixed bottom-6 right-6 z-[100]"
                onMouseEnter={() => setIsExpanded(true)}
                onMouseLeave={() => setIsExpanded(false)}
            >
                <div className="relative flex items-center justify-center">

                    {/* The menu items (visible when expanded) */}
                    <div className={`absolute transition-all duration-500 ease-out ${isExpanded ? 'opacity-100 scale-100' : 'opacity-0 scale-50 pointer-events-none'}`}>
                        <div className="relative w-48 h-48">
                            {/* North: Inventory */}
                            <button
                                onClick={() => navigateTo('/app/inventory')}
                                className={`absolute top-0 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full flex items-center justify-center bg-black/90 border border-[#d4af37]/40 text-[#d4af37] hover:scale-110 transition-all ${currentPath.includes('inventory') ? 'bg-[#d4af37]/20 border-[#d4af37] shadow-[0_0_10px_rgba(212,175,55,0.3)]' : ''}`}
                                title="Cofre"
                            >
                                <IonIcon icon={layersOutline} />
                            </button>
                            {/* West: Market */}
                            <button
                                onClick={() => navigateTo('/app/market')}
                                className={`absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center bg-black/90 border border-[#d4af37]/40 text-[#d4af37] hover:scale-110 transition-all ${currentPath.includes('market') ? 'bg-[#d4af37]/20 border-[#d4af37] shadow-[0_0_10px_rgba(212,175,55,0.3)]' : ''}`}
                                title="Mercado"
                            >
                                <IonIcon icon={trendingUpOutline} />
                            </button>
                            {/* East: Finances */}
                            <button
                                onClick={() => navigateTo('/app/finances')}
                                className={`absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center bg-black/90 border border-[#d4af37]/40 text-[#d4af37] hover:scale-110 transition-all ${currentPath.includes('finances') ? 'bg-[#d4af37]/20 border-[#d4af37] shadow-[0_0_10px_rgba(212,175,55,0.3)]' : ''}`}
                                title="Arcas"
                            >
                                <IonIcon icon={walletOutline} />
                            </button>
                            {/* South: Account */}
                            <button
                                onClick={() => navigateTo('/app/account')}
                                className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full flex items-center justify-center bg-black/90 border border-[#d4af37]/40 text-[#d4af37] hover:scale-110 transition-all ${currentPath.includes('account') ? 'bg-[#d4af37]/20 border-[#d4af37] shadow-[0_0_10px_rgba(212,175,55,0.3)]' : ''}`}
                                title="Altar"
                            >
                                <IonIcon icon={personOutline} />
                            </button>
                        </div>
                    </div>

                    {/* Central Trigger Rune */}
                    <button
                        onClick={() => navigateTo('/app/dashboard')}
                        className={`relative z-20 w-16 h-16 rounded-full flex items-center justify-center bg-black/90 border-2 transition-all duration-500 shadow-[0_0_20px_rgba(0,0,0,0.5)] ${isExpanded ? 'border-[#d4af37] rotate-180 scale-110' : 'border-[#d4af37]/20 hover:border-[#d4af37]/60'}`}
                    >
                        <div className={`absolute inset-0 rounded-full border border-[#d4af37]/20 animate-pulse ${isExpanded ? 'scale-125' : 'scale-100'}`}></div>
                        <span className={`font-[MedievalSharp] text-2xl transition-all duration-500 ${isExpanded ? 'text-[#d4af37] drop-shadow-[0_0_8px_rgba(212,175,55,0.8)]' : 'text-[#d4af37]/40'}`}>
                            {currentPath.includes('dashboard') ? 'ᚦ' : 'ᛟ'}
                        </span>

                        {/* Miniature indicators */}
                        {!isExpanded && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-1 h-1 bg-[#d4af37]/40 rounded-full absolute top-2"></div>
                                <div className="w-1 h-1 bg-[#d4af37]/40 rounded-full absolute bottom-2"></div>
                                <div className="w-1 h-1 bg-[#d4af37]/40 rounded-full absolute left-2"></div>
                                <div className="w-1 h-1 bg-[#d4af37]/40 rounded-full absolute right-2"></div>
                            </div>
                        )}
                    </button>
                </div>
            </div>

            {/* MOBILE VERSION: Mystical Bottom Dock */}
            <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-sm">
                <div className="bg-black/80 backdrop-blur-xl border border-[#d4af37]/30 rounded-full h-16 flex items-center justify-around px-4 shadow-[0_10px_30px_rgba(0,0,0,0.8)] relative overflow-hidden">

                    {/* Background glow for active item */}
                    <div className="absolute inset-x-4 h-full pointer-events-none flex justify-around">
                        {['inventory', 'market', 'dashboard', 'finances', 'account'].map((tab) => (
                            <div key={tab} className={`w-12 h-full flex flex-col items-center justify-center transition-opacity duration-500 ${currentPath.includes(tab) ? 'opacity-100' : 'opacity-0'}`}>
                                <div className="w-8 h-8 bg-[#d4af37]/10 blur-md rounded-full absolute"></div>
                                <div className="w-4 h-[2px] bg-[#d4af37] absolute bottom-0 shadow-[0_0_10px_rgba(212,175,55,1)]"></div>
                            </div>
                        ))}
                    </div>

                    <button onClick={() => navigateTo('/app/inventory')} className={`relative z-10 p-2 transition-all ${currentPath.includes('inventory') ? 'text-[#d4af37] scale-125' : 'text-gray-500'}`}>
                        <IonIcon icon={layersOutline} className="text-xl" />
                    </button>

                    <button onClick={() => navigateTo('/app/market')} className={`relative z-10 p-2 transition-all ${currentPath.includes('market') ? 'text-[#d4af37] scale-125' : 'text-gray-500'}`}>
                        <IonIcon icon={trendingUpOutline} className="text-xl" />
                    </button>

                    <button onClick={() => navigateTo('/app/dashboard')} className={`relative z-10 w-12 h-12 rounded-full bg-black/40 border border-[#d4af37]/40 flex items-center justify-center transition-all ${currentPath.includes('dashboard') ? 'text-[#d4af37] border-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.4)]' : 'text-gray-500'}`}>
                        <span className="font-[MedievalSharp] text-xl">ᛟ</span>
                    </button>

                    <button onClick={() => navigateTo('/app/finances')} className={`relative z-10 p-2 transition-all ${currentPath.includes('finances') ? 'text-[#d4af37] scale-125' : 'text-gray-500'}`}>
                        <IonIcon icon={walletOutline} className="text-xl" />
                    </button>

                    <button onClick={() => navigateTo('/app/account')} className={`relative z-10 p-2 transition-all ${currentPath.includes('account') ? 'text-[#d4af37] scale-125' : 'text-gray-500'}`}>
                        <IonIcon icon={personOutline} className="text-xl" />
                    </button>
                </div>
            </div>
        </>
    );
};

export default NavRune;
