import React from 'react';

interface DungeonInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}

export const DungeonInput: React.FC<DungeonInputProps> = ({ label, className = '', ...props }) => {
    return (
        <div className="flex flex-col gap-1 mb-4">
            {label && <label className="font-dungeon-header text-ink text-sm font-bold uppercase">{label}</label>}
            <div className="relative">
                <input
                    className={`w-full bg-parchment/50 border-b-2 border-iron-border p-2 font-dungeon-body text-ink placeholder-ink/50 focus:outline-none focus:border-gold-coin transition-colors ${className}`}
                    {...props}
                />
                {/* Inkwell icon or effect could go here */}
                <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-ink/20 to-transparent"></div>
            </div>
        </div>
    );
};
