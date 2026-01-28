import React from 'react';
import { useLocation } from 'react-router-dom';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const location = useLocation();
    const isDashboard = location.pathname.includes('/dashboard');

    return (
        <div className="relative min-h-screen text-silver-zen font-sans overflow-hidden bg-stardust">
            {/* Background Ambience - Keep for other pages, Dashboard has its own */}
            {!isDashboard && (
                <div className="fixed inset-0 pointer-events-none -z-10">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[1000px] border border-white/5 rounded-full opacity-20"></div>
                    <div className="absolute top-[-10%] right-[10%] w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full"></div>
                    <div className="absolute bottom-[-10%] left-[10%] w-[500px] h-[500px] bg-electric-cyan/5 blur-[120px] rounded-full"></div>
                </div>
            )}

            {/* Top Navigation Bar / Header - HIDDEN ON DASHBOARD */}
            {!isDashboard && (
                <header className="fixed top-0 left-0 w-full p-6 flex items-center justify-between z-50 pointer-events-none">
                    <div className="flex flex-col pointer-events-auto">
                        <h1 className="text-2xl font-display font-light tracking-[0.2em] uppercase text-silver-zen/90">
                            El Astrolabio
                        </h1>
                        <p className="text-[10px] text-primary font-technical tracking-widest uppercase mt-1">
                            System Status: ONLINE
                        </p>
                    </div>

                    {/* Nav Runes (Right) */}
                    <nav className="flex items-center gap-4 pointer-events-auto">
                        <button className="nav-rune group relative">
                            <span className="material-symbols-outlined text-silver-muted group-hover:text-electric-cyan transition-colors">dashboard</span>
                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-electric-cyan rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </button>
                        <button className="nav-rune group relative">
                            <span className="material-symbols-outlined text-silver-muted group-hover:text-electric-cyan transition-colors">account_balance_wallet</span>
                        </button>
                        <button className="nav-rune group relative">
                            <span className="material-symbols-outlined text-silver-muted group-hover:text-electric-cyan transition-colors">settings</span>
                        </button>
                    </nav>
                </header>
            )}

            {/* Main Content Area - Fullscreen for Dashboard */}
            <main className={`relative z-10 h-screen overflow-y-auto custom-scrollbar ${isDashboard ? 'p-0' : 'pt-24 px-6 md:px-12 pb-20'}`}>
                {children}
            </main>

            {/* Bottom Ticker Bar - HIDDEN ON DASHBOARD */}
            {!isDashboard && (
                <footer className="fixed bottom-0 left-0 w-full h-12 bg-surface/80 backdrop-blur-md border-t border-white/5 flex items-center px-6 z-50">
                    <div className="flex items-center gap-6 text-[10px] font-technical text-silver-muted/60 overflow-hidden whitespace-nowrap w-full">
                        <span className="text-primary">● SYNC: ACTIVE</span>
                        <span>BTC/EUR 64,230.12</span>
                        <span>ETH/EUR 3,450.22</span>
                        <span>NET WORTH: CALCULATING...</span>
                    </div>
                </footer>
            )}
        </div>
    );
};

export default Layout;
