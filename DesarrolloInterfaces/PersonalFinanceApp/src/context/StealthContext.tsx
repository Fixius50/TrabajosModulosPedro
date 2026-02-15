import React, { createContext, useContext, useState, useEffect } from 'react';

interface StealthContextType {
    isStealth: boolean;
    toggleStealth: () => void;
    formatAmount: (amount: number | string, unit?: string) => string;
}

const StealthContext = createContext<StealthContextType | undefined>(undefined);

export const StealthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isStealth, setIsStealth] = useState(() => {
        const saved = localStorage.getItem('grimoire_stealth_mode');
        return saved === 'true';
    });

    useEffect(() => {
        localStorage.setItem('grimoire_stealth_mode', String(isStealth));
    }, [isStealth]);

    const toggleStealth = () => setIsStealth(prev => !prev);

    const formatAmount = (amount: number | string, unit: string = '€') => {
        if (isStealth) {
            return '✨✨✨';
        }
        const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
        return `${unit}${numericAmount.toLocaleString()}`;
    };

    return (
        <StealthContext.Provider value={{ isStealth, toggleStealth, formatAmount }}>
            {children}
        </StealthContext.Provider>
    );
};

export const useStealth = () => {
    const context = useContext(StealthContext);
    if (!context) {
        throw new Error('useStealth must be used within a StealthProvider');
    }
    return context;
};
