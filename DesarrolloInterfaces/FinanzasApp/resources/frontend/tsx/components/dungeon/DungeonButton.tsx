import React from 'react';

interface DungeonButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger';
}

export const DungeonButton: React.FC<DungeonButtonProps> = ({ children, variant = 'primary', className = '', ...props }) => {
    const baseStyles = "font-dungeon-header font-bold py-2 px-6 rounded shadow-md transform transition-transform active:scale-95 flex items-center justify-center gap-2";

    const variants = {
        primary: "bg-gold-coin text-ink border border-yellow-600 shadow-coin hover:brightness-110", // Wax seal / Gold coin vibe
        secondary: "bg-iron-border text-silver-zen border border-gray-600 hover:brightness-110",
        danger: "bg-ruby-expense text-parchment border border-red-900 hover:brightness-110",
    };

    return (
        <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
            {children}
        </button>
    );
};
