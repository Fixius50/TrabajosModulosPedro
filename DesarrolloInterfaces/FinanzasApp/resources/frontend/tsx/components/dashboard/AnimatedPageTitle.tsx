import React from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const titleMap: Record<string, string> = {
    '/app/dashboard': 'CENTRO DE COMANDO',
    '/app/finances': 'BÓVEDA FINANCIERA',
    '/app/market': 'MERCADO GLOBAL',
    '/app/inventory': 'INVENTARIO',
    '/app/account': 'PERFIL DE USUARIO'
};

const AnimatedPageTitle: React.FC = () => {
    const location = useLocation();
    const currentPath = location.pathname;

    // Fallback logic for nested routes
    let title = titleMap[currentPath];
    if (!title) {
        if (currentPath.includes('finances')) title = 'FINANZAS';
        else if (currentPath.includes('market')) title = 'MERCADO';
        else if (currentPath.includes('account')) title = 'CUENTA';
        else title = 'SISTEMA';
    }

    return (
        <div style={{
            position: 'absolute', // Absolute relative to the page content container
            top: '20px',
            left: '20px',
            zIndex: 50,
            pointerEvents: 'none' // Click-through
        }}>
            <AnimatePresence mode='wait'>
                <motion.h1
                    key={title}
                    initial={{ y: -20, opacity: 0, filter: 'blur(10px)' }}
                    animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                    exit={{ y: 20, opacity: 0, filter: 'blur(5px)' }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    style={{
                        margin: 0,
                        fontSize: '1.5rem',
                        fontWeight: 800,
                        color: '#d4af37', // Gold base
                        textTransform: 'uppercase',
                        letterSpacing: '2px',
                        textShadow: '0 0 20px rgba(212, 175, 55, 0.5)',
                        fontFamily: "'Segoe UI', sans-serif"
                    }}
                >
                    {title}
                </motion.h1>
                <motion.div
                    key={`${title}-line`}
                    initial={{ width: 0 }}
                    animate={{ width: '60px' }}
                    exit={{ width: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    style={{
                        height: '2px',
                        background: '#38bdf8', // Cyan accent
                        marginTop: '5px',
                        boxShadow: '0 0 10px #38bdf8'
                    }}
                />
            </AnimatePresence>
        </div>
    );
};

export default AnimatedPageTitle;
