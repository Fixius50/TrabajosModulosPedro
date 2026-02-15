import { useState } from 'react';
import './fantasy.css';
import { useNavigate } from 'react-router-dom';

const CATEGORIES = [
    { id: 'food', icon: 'restaurant', label: 'Food', color: 'bg-mana-blue' },
    { id: 'transport', icon: 'commute', label: 'Transport', color: 'bg-emerald-500' },
    { id: 'shopping', icon: 'shopping_bag', label: 'Shopping', color: 'bg-purple-500' },
    { id: 'entertainment', icon: 'movie', label: 'Fun', color: 'bg-orange-500' },
    { id: 'health', icon: 'medical_services', label: 'Health', color: 'bg-red-500' },
    { id: 'bills', icon: 'receipt', label: 'Bills', color: 'bg-stone-500' },
];

export default function QuickAddMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const handleCategorySelect = (categoryId: string) => {
        // Navigate to add transaction with pre-selected category
        // In a real app, we might show a quick amount modal here first
        navigate(`/add-transaction?category=${categoryId}`);
        setIsOpen(false);
    };

    return (
        <div className="fixed bottom-8 right-6 z-50 flex items-end justify-end pointer-events-none">

            {/* Circular Menu Items */}
            <div className={`absolute bottom-2 right-2 transition-all duration-300 ease-out ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
                {CATEGORIES.map((cat, index) => {
                    const angle = (index / (CATEGORIES.length - 1)) * 90; // Spread over 90 degrees (quarter circle)
                    // Calculate simplified position for a fan-out effect
                    // For a proper circle we'd use sin/cos, but for this specific "Monefy" style fan-out:
                    const radius = 100; // Distance from center
                    const radians = (angle * Math.PI) / 180;
                    const bottom = Math.sin(radians) * radius;
                    const right = Math.cos(radians) * radius;

                    return (
                        <button
                            key={cat.id}
                            onClick={() => handleCategorySelect(cat.id)}
                            className="absolute w-12 h-12 rounded-full border border-primary/40 bg-stone-900 flex items-center justify-center shadow-lg pointer-events-auto transform transition-transform hover:scale-110 active:scale-95 group"
                            style={{
                                bottom: `${bottom}px`,
                                right: `${right}px`,
                                transitionDelay: `${isOpen ? index * 50 : 0}ms`
                            }}
                            aria-label={cat.label}
                        >
                            <div className={`absolute inset-0 rounded-full ${cat.color} opacity-20 group-hover:opacity-40`}></div>
                            <span className="material-icons text-white text-lg relative z-10">{cat.icon}</span>
                            <span className="absolute -bottom-5 text-[0.625rem] text-primary/80 bg-black/80 px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                {cat.label}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Main Toggle Button (Rune Style) */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`pointer-events-auto w-16 h-16 rounded-full bg-stone-900 border-2 border-primary/50 flex items-center justify-center shadow-[0_0_0.9375rem_rgba(236,182,19,0.3)] transition-all duration-300 hover:scale-105 active:scale-95 z-50 ${isOpen ? 'rotate-45 bg-primary/10' : ''}`}
            >
                <div className="absolute inset-0 rounded-full border border-primary/20 animate-spin-slow opacity-50"></div>
                <span className="material-icons text-3xl text-primary drop-shadow-md">add</span>
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
