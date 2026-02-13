import React, { type ReactNode } from 'react';

interface DungeonCardProps {
    children: ReactNode;
    className?: string;
    title?: string;
}

export const DungeonCard: React.FC<DungeonCardProps> = ({ children, className = '', title }) => {
    return (
        <div className={`relative bg-parchment-texture p-6 rounded-lg shadow-parchment border-2 border-iron-border ${className}`}>
            {/* Iron corner accents */}
            <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-dungeon-bg rounded-tl-sm"></div>
            <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-dungeon-bg rounded-tr-sm"></div>
            <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-dungeon-bg rounded-bl-sm"></div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-dungeon-bg rounded-br-sm"></div>

            {title && (
                <div className="mb-4 border-b-2 border-iron-border pb-2">
                    <h3 className="font-dungeon-header text-xl text-ink font-bold text-center tracking-wider uppercase">
                        {title}
                    </h3>
                </div>
            )}

            <div className="font-dungeon-body text-ink">
                {children}
            </div>
        </div>
    );
};
