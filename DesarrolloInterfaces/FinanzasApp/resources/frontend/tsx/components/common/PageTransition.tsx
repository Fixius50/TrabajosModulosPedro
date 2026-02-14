import React, { useRef } from 'react';
import type { ReactNode } from 'react';

interface PageTransitionProps {
    children?: ReactNode;
}

export const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
    const nodeRef = useRef<HTMLDivElement>(null);

    // Simple wrapper for now, relying on CSS animations triggered by key changes in parent
    return (
        <div ref={nodeRef} className="page-transition-wrapper animate-fade-in w-full h-full">
            {children}
        </div>
    );
};
