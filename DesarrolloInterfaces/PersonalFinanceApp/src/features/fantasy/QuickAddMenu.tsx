import { useState } from 'react';
import './fantasy.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Wallet, User, LogOut } from 'lucide-react';

const NAV_ITEMS = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Grimorio', color: 'bg-amber-500', path: '/' },
    { id: 'transactions', icon: Wallet, label: 'Bolsa', color: 'bg-emerald-500', path: '/transactions' },
    { id: 'profile', icon: User, label: 'Licencia', color: 'bg-purple-500', path: '/adventurer-license' },
    { id: 'logout', icon: LogOut, label: 'Huir', color: 'bg-red-500', action: 'logout' },
];

export default function QuickAddMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const { signOut } = useAuth();

    const handleSelect = async (item: typeof NAV_ITEMS[0]) => {
        if (item.action === 'logout') {
            await signOut();
        } else if (item.path) {
            navigate(item.path);
        }
        setIsOpen(false);
    };

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[110] flex flex-col items-center justify-end pointer-events-none">

            {/* Vertical Menu Items (Hamburger Style) */}
            <div className={`flex flex-col-reverse items-center gap-3 mb-20 transition-all duration-300 ease-out z-50 ${isOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-8 pointer-events-none'}`}>
                {NAV_ITEMS.map((item, index) => {
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.id}
                            onClick={() => handleSelect(item)}
                            className="w-48 h-12 rounded-xl border border-primary/40 bg-stone-900/95 flex items-center gap-4 px-4 shadow-xl backdrop-blur-md transform transition-all hover:scale-105 active:scale-95 group"
                            style={{
                                transitionDelay: `${isOpen ? index * 50 : 0}ms`
                            }}
                        >
                            <div className={`p-2 rounded-lg ${item.color} bg-opacity-20 group-hover:bg-opacity-30 transition-colors`}>
                                <Icon size={20} className="text-white" />
                            </div>
                            <span className="text-sm font-bold text-stone-200 uppercase tracking-wider group-hover:text-primary transition-colors flex-1 text-left">
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Main Toggle Button (Rune Style) */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`pointer-events-auto absolute bottom-0 w-16 h-16 rounded-full bg-stone-900 border-2 border-primary/50 flex items-center justify-center shadow-[0_0_0.9375rem_rgba(236,182,19,0.3)] transition-all duration-300 hover:scale-105 active:scale-95 z-50 ${isOpen ? 'rotate-90 bg-primary/10' : ''}`}
            >
                <div className="absolute inset-0 rounded-full border border-primary/20 animate-spin-slow opacity-50"></div>
                <span className="material-icons text-3xl text-primary drop-shadow-md">menu</span>
            </button>

            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto z-40"
                    onClick={() => setIsOpen(false)}
                ></div>
            )}
        </div>
    );
}
