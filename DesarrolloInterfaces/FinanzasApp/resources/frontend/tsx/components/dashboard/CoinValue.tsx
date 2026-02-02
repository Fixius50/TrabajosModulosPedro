import React from 'react';
import { motion } from 'framer-motion';

interface CoinValueProps {
    value: number;
    type: 'income' | 'expense';
}

const CoinValue: React.FC<CoinValueProps> = ({ value, type }) => {
    const isPositive = type === 'income';
    const accentColor = isPositive ? '#10b981' : '#ef4444'; // Emerald vs Rose
    const glowColor = isPositive ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)';

    return (
        <div className="flex items-center gap-2">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative flex items-center justify-center"
            >
                {/* Visual Coin Icon (Modern Hexagon style) */}
                <div
                    style={{
                        width: '24px',
                        height: '24px',
                        background: `linear-gradient(135deg, ${accentColor}, #0f172a)`,
                        border: `1px solid ${accentColor}`,
                        boxShadow: `0 0 10px ${glowColor}`,
                        clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
                    }}
                    className="flex items-center justify-center"
                >
                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'white' }}>€</span>
                </div>
            </motion.div>

            <span
                className={`font-mono font-bold text-lg ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}
                style={{ textShadow: `0 0 8px ${glowColor}` }}
            >
                {isPositive ? '+' : '-'}{Math.abs(value).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
        </div>
    );
};

export default CoinValue;
