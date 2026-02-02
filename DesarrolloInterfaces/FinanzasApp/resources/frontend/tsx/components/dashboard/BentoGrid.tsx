import React from 'react';

interface BentoGridProps {
    children: React.ReactNode;
}

export const BentoGrid: React.FC<BentoGridProps> = ({ children }) => {
    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
            padding: '1rem',
            maxWidth: '1200px',
            margin: '0 auto'
        }}>
            {children}
        </div>
    );
};

interface BentoItemProps {
    children: React.ReactNode;
    colSpan?: number; // 1 or 2
    rowSpan?: number; // 1 or 2
    onClick?: () => void;
    glowColor?: string; // Hex color for hover glow
}

export const BentoItem: React.FC<BentoItemProps> = ({
    children,
    colSpan = 1,
    rowSpan = 1,
    onClick,
    glowColor = '#38bdf8'
}) => {
    return (
        <div
            onClick={onClick}
            className="bento-card"
            style={{
                gridColumn: `span ${colSpan}`,
                gridRow: `span ${rowSpan}`,
                background: 'rgba(15, 23, 42, 0.6)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                padding: '0', // Control padding internally
                cursor: onClick ? 'pointer' : 'default',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                display: 'flex',
                flexDirection: 'column',
                minHeight: '200px'
            }}
            onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-5px) scale(1.02)';
                e.currentTarget.style.boxShadow = `0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 0 15px ${glowColor}40`; // 40 = 25% opacity
                e.currentTarget.style.border = `1px solid ${glowColor}80`;
            }}
            onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.1)';
            }}
        >
            {children}
        </div>
    );
};
