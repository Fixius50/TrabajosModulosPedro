import React from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { IonIcon } from '@ionic/react';
import {
    homeOutline,
    walletOutline,
    statsChartOutline,
    briefcaseOutline,
    personOutline
} from 'ionicons/icons';

interface PageMetadata {
    title: string;
    icon: string;
    color: string;
}

const routeMap: Record<string, PageMetadata> = {
    '/app/dashboard': { title: 'CENTRO DE COMANDO', icon: homeOutline, color: '#38bdf8' },
    '/app/finances': { title: 'BÓVEDA FINANCIERA', icon: walletOutline, color: '#c084fc' },
    '/app/market': { title: 'MERCADO GLOBAL', icon: statsChartOutline, color: '#facc15' },
    '/app/inventory': { title: 'INVENTARIO', icon: briefcaseOutline, color: '#f87171' },
    '/app/account': { title: 'PERFIL DE USUARIO', icon: personOutline, color: '#10b981' }
};

const AnimatedPageTitle: React.FC = () => {
    const location = useLocation();
    const currentPath = location.pathname;

    let metadata = routeMap[currentPath];
    if (!metadata) {
        if (currentPath.includes('finances')) metadata = routeMap['/app/finances'];
        else if (currentPath.includes('market')) metadata = routeMap['/app/market'];
        else if (currentPath.includes('account')) metadata = routeMap['/app/account'];
        else metadata = { title: 'SISTEMA', icon: homeOutline, color: '#d4af37' };
    }

    return (
        <div style={{
            position: 'absolute',
            top: '100px', // Lowered a bit to avoid overlapping EL ORÁCULO
            left: '32px',
            zIndex: 50,
            pointerEvents: 'none'
        }}>
            <AnimatePresence mode='wait'>
                <motion.div
                    key={metadata.title}
                    initial={{ x: -20, opacity: 0, filter: 'blur(10px)' }}
                    animate={{ x: 0, opacity: 1, filter: 'blur(0px)' }}
                    exit={{ x: 20, opacity: 0, filter: 'blur(5px)' }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="flex flex-col gap-2"
                >
                    <div className="flex items-center gap-4">
                        <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center border border-white/10 backdrop-blur-md"
                            style={{
                                backgroundColor: `${metadata.color}22`,
                                boxShadow: `0 0 15px ${metadata.color}33`
                            }}
                        >
                            <IonIcon icon={metadata.icon} style={{ color: metadata.color, fontSize: '20px' }} />
                        </div>
                        <h1
                            style={{
                                margin: 0,
                                fontSize: '1.4rem',
                                fontWeight: 800,
                                color: 'white',
                                textTransform: 'uppercase',
                                letterSpacing: '4px',
                                textShadow: '0 2px 10px rgba(0,0,0,0.5)',
                                fontFamily: "'Cinzel', serif"
                            }}
                        >
                            {metadata.title}
                        </h1>
                    </div>
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        style={{
                            height: '1px',
                            background: `linear-gradient(to right, ${metadata.color}, transparent)`,
                            boxShadow: `0 0 10px ${metadata.color}44`
                        }}
                    />
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default AnimatedPageTitle;
