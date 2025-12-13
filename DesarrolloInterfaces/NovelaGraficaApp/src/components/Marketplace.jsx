import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserProgress } from '../stores/userProgress';

// Marketplace items
const SHOP_ITEMS = {
    themes: [
        { id: 'default', name: 'Clásico Oscuro', cost: 0, preview: '#0f172a' },
        { id: 'midnight', name: 'Medianoche', cost: 100, preview: '#1a1a2e' },
        { id: 'forest', name: 'Bosque Mágico', cost: 150, preview: '#1a3a2a' },
        { id: 'sunset', name: 'Atardecer', cost: 200, preview: '#2d1b3d' },
        { id: 'ocean', name: 'Océano Profundo', cost: 250, preview: '#0a2a3a' },
        { id: 'cyberpunk', name: 'Cyberpunk', cost: 500, preview: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)' }
    ],
    fonts: [
        { id: 'Inter', name: 'Inter (Default)', cost: 0, preview: 'Inter' },
        { id: 'Georgia', name: 'Georgia (Clásica)', cost: 75, preview: 'Georgia' },
        { id: 'Roboto Mono', name: 'Roboto Mono (Tech)', cost: 100, preview: 'Roboto Mono' },
        { id: 'Playfair Display', name: 'Playfair (Elegante)', cost: 150, preview: 'Playfair Display' },
        { id: 'OpenDyslexic', name: 'OpenDyslexic', cost: 0, preview: 'OpenDyslexic' },
        { id: 'Comic Neue', name: 'Comic Style', cost: 200, preview: 'Comic Neue' }
    ],
    effects: [
        { id: 'particles', name: 'Partículas Flotantes', cost: 300, preview: '✨' },
        { id: 'glitch', name: 'Efecto Glitch', cost: 400, preview: '🔀' },
        { id: 'vignette', name: 'Viñeta Cinematográfica', cost: 250, preview: '🎬' },
        { id: 'scanlines', name: 'Líneas CRT', cost: 200, preview: '📺' }
    ]
};

export default function Marketplace({ isOpen, onClose }) {
    const { points, purchases, purchase, setActive, isOwned, activeTheme, activeFont } = useUserProgress();
    const [activeTab, setActiveTab] = useState('themes');
    const [notification, setNotification] = useState(null);

    const handlePurchase = (category, item) => {
        if (isOwned(category, item.id)) {
            // Already owned, just activate it
            if (category === 'themes') setActive('theme', item.id);
            if (category === 'fonts') setActive('font', item.id);
            setNotification({ type: 'success', message: `${item.name} activado` });
        } else {
            const result = purchase(category, item.id, item.cost);
            if (result.success) {
                setNotification({ type: 'success', message: `¡${item.name} desbloqueado! -${item.cost} puntos` });
                if (category === 'themes') setActive('theme', item.id);
                if (category === 'fonts') setActive('font', item.id);
            } else {
                setNotification({ type: 'error', message: result.error });
            }
        }
        setTimeout(() => setNotification(null), 2000);
    };

    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.85)',
                backdropFilter: 'blur(8px)',
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem'
            }}
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                onClick={(e) => e.stopPropagation()}
                style={{
                    width: '100%',
                    maxWidth: '40rem',
                    maxHeight: '85vh',
                    background: 'linear-gradient(135deg, #1e1b4b, #0f172a)',
                    borderRadius: '1.5rem',
                    border: '1px solid rgba(255,255,255,0.1)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                {/* Header */}
                <div style={{
                    padding: '1.25rem 1.5rem',
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white', marginBottom: '0.25rem' }}>
                            🛒 Tienda de Personalización
                        </h2>
                        <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
                            Gasta tus puntos en estilos y efectos
                        </p>
                    </div>
                    <div style={{
                        background: 'linear-gradient(135deg, #fbbf24, #f97316)',
                        padding: '0.5rem 1rem',
                        borderRadius: '1rem',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        color: '#000'
                    }}>
                        💰 {points} pts
                    </div>
                </div>

                {/* Tabs */}
                <div style={{
                    display: 'flex',
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    padding: '0 1rem'
                }}>
                    {[
                        { id: 'themes', label: '🎨 Temas', count: SHOP_ITEMS.themes.length },
                        { id: 'fonts', label: '🔤 Fuentes', count: SHOP_ITEMS.fonts.length },
                        { id: 'effects', label: '✨ Efectos', count: SHOP_ITEMS.effects.length }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                padding: '0.75rem 1rem',
                                background: 'transparent',
                                border: 'none',
                                borderBottom: activeTab === tab.id ? '2px solid #8b5cf6' : '2px solid transparent',
                                color: activeTab === tab.id ? 'white' : 'rgba(255,255,255,0.5)',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                fontWeight: 500,
                                transition: 'all 0.2s'
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Items Grid */}
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '1rem'
                }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(10rem, 1fr))',
                        gap: '0.75rem'
                    }}>
                        {SHOP_ITEMS[activeTab].map(item => {
                            const owned = isOwned(activeTab, item.id);
                            const isActive = (activeTab === 'themes' && activeTheme === item.id) ||
                                (activeTab === 'fonts' && activeFont === item.id);
                            const canAfford = points >= item.cost;

                            return (
                                <motion.button
                                    key={item.id}
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handlePurchase(activeTab, item)}
                                    disabled={!owned && !canAfford}
                                    style={{
                                        background: isActive
                                            ? 'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(168,85,247,0.3))'
                                            : 'rgba(255,255,255,0.05)',
                                        border: isActive ? '2px solid #8b5cf6' : '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '0.75rem',
                                        padding: '1rem',
                                        cursor: (!owned && !canAfford) ? 'not-allowed' : 'pointer',
                                        opacity: (!owned && !canAfford) ? 0.5 : 1,
                                        textAlign: 'center',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {/* Preview */}
                                    <div style={{
                                        width: '3rem',
                                        height: '3rem',
                                        margin: '0 auto 0.5rem',
                                        borderRadius: '0.5rem',
                                        background: activeTab === 'themes' ? item.preview : 'rgba(139,92,246,0.2)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontFamily: activeTab === 'fonts' ? item.preview : 'inherit',
                                        fontSize: activeTab === 'effects' ? '1.5rem' : '1rem',
                                        color: 'white'
                                    }}>
                                        {activeTab === 'fonts' && 'Aa'}
                                        {activeTab === 'effects' && item.preview}
                                    </div>

                                    <p style={{ color: 'white', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                                        {item.name}
                                    </p>

                                    {owned ? (
                                        <span style={{
                                            fontSize: '0.7rem',
                                            color: isActive ? '#22c55e' : 'rgba(255,255,255,0.5)',
                                            fontWeight: 500
                                        }}>
                                            {isActive ? '✓ Activo' : 'Desbloqueado'}
                                        </span>
                                    ) : (
                                        <span style={{
                                            fontSize: '0.75rem',
                                            color: '#fbbf24',
                                            fontWeight: 600
                                        }}>
                                            {item.cost} pts
                                        </span>
                                    )}
                                </motion.button>
                            );
                        })}
                    </div>
                </div>

                {/* Notification */}
                <AnimatePresence>
                    {notification && (
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 20, opacity: 0 }}
                            style={{
                                position: 'absolute',
                                bottom: '1rem',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                background: notification.type === 'success' ? '#22c55e' : '#ef4444',
                                padding: '0.5rem 1rem',
                                borderRadius: '0.5rem',
                                fontSize: '0.85rem',
                                fontWeight: 500,
                                color: 'white'
                            }}
                        >
                            {notification.message}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Close button */}
                <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <button
                        onClick={onClose}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            background: 'rgba(255,255,255,0.1)',
                            border: 'none',
                            borderRadius: '0.5rem',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            fontWeight: 500
                        }}
                    >
                        Cerrar
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}
