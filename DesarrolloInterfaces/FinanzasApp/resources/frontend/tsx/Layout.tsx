import React from 'react';
import GlobalHUD from './GlobalHUD';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className="relative min-h-screen text-silver-zen font-sans overflow-hidden bg-stardust">
            <GlobalHUD />

            {/* Global Background (Optional Fallback) */}
            <div className="fixed inset-0 pointer-events-none -z-10">
                <div className="absolute top-[-10%] right-[10%] w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-10%] left-[10%] w-[500px] h-[500px] bg-electric-cyan/5 blur-[120px] rounded-full"></div>
            </div>

            {/* Main Content Area - Fullscreen */}
            <main className="relative z-10 h-screen overflow-y-auto custom-scrollbar p-0">
                {children}
            </main>
        </div>
    );
};

export default Layout;
