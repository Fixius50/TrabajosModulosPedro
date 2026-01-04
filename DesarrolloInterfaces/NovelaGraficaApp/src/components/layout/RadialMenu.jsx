import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useUserProgress } from '../../stores/userProgress';

export default function RadialMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const { activeTheme } = useUserProgress();

    const toggleOpen = () => setIsOpen(!isOpen);

    const menuItems = [
        { icon: '🏠', label: 'Inicio', path: '/' },
        { icon: '📚', label: 'Biblioteca', path: '/saves' }, // Route remains /saves for now to avoid breaking router
        { icon: '⚙️', label: 'Ajustes', action: 'settings' }, // We might need to trigger modal
        // Profile removed as per user feedback (redundant)
    ];

    // Animation Variants for Satellite Buttons
    // Distribute them in a quarter circle (0 to 90 degrees)
    // Angles: 0, 30, 60, 90? Or just 15, 45, 75?
    // Let's do 4 items: 0deg (right), 30, 60, 90 (up) relative to the corner... 
    // Actually, bottom-left corner means expanding Up and Right. 
    // Bottom-Right corner (standard FAB) means expanding Up and Left.
    // Let's assume Bottom-Right.

    // Radius of expansion in px
    const radius = 120;

    // Calculate position for item i of N
    // We want angles from 180 (Left) to 270 (Up) if it's bottom right? 
    // No, standard math: 0 is Right, 90 is Up, 180 is Left, 270 is Down.
    // Bottom Right corner position: Needs to expand towards Top (270?) and Left (180).
    // So angles between 180 and 270.

    // Let's simplify: Just hardcode x/y offsets for a nice arc.

    const itemVariants = {
        closed: { x: 0, y: 0, opacity: 0, scale: 0 },
        open: (i) => {
            // Distribute 4 items in 90 degrees (180 to 270)
            const angle = 180 + (90 / 3) * i; // i=0->180, i=1->210, i=2->240, i=3->270
            const rad = (angle * Math.PI) / 180;
            return {
                x: Math.cos(rad) * radius,
                y: Math.sin(rad) * radius,
                opacity: 1,
                scale: 1,
                transition: {
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                    delay: i * 0.05
                }
            };
        }
    };

    const handleNavigation = (item) => {
        if (item.path) {
            navigate(item.path);
        } else if (item.action) {
            // For now, simple alerts or placeholder logic. 
            // Ideally this opens the Modals which are currently in MainMenu... 
            // We might need to move State up to AppLayout context! 
            // For this iteration, let's just make them navigate to placeholder routes or allow passing callbacks?
            // "Settings" is a View now, "Profile" is a View now per previous plan approval.
            if (item.action === 'settings') navigate('/settings');
            if (item.action === 'profile') navigate('/profile');
        }
        setIsOpen(false);
    };

    return (
        <div className="fixed bottom-8 right-8 z-50 flex items-center justify-center">
            {/* Satellite Buttons */}
            <AnimatePresence>
                {isOpen && menuItems.map((item, i) => (
                    <motion.button
                        key={item.label}
                        custom={i}
                        variants={itemVariants}
                        initial="closed"
                        animate="open"
                        exit="closed"
                        onClick={() => handleNavigation(item)}
                        className="absolute w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-xl font-bold border-2 border-white/20 backdrop-blur-md"
                        style={{
                            backgroundColor: activeTheme === 'modern' ? '#7f13ec' : '#3b82f6',
                            color: 'white',
                            boxShadow: activeTheme === 'modern' ? '0 0 15px #d946ef' : '0 4px 6px rgba(0,0,0,0.3)'
                        }}
                        title={item.label}
                    >
                        {item.icon}
                    </motion.button>
                ))}
            </AnimatePresence>

            {/* Main Toggle Button */}
            <motion.button
                onClick={toggleOpen}
                animate={{ rotate: isOpen ? 45 : 0 }}
                className="relative w-16 h-16 rounded-full shadow-2xl flex items-center justify-center text-3xl z-50"
                style={{
                    background: activeTheme === 'modern' ? 'linear-gradient(135deg, #7f13ec, #d946ef)' : 'black',
                    color: 'white',
                    border: '2px solid rgba(255,255,255,0.2)'
                }}
            >
                ➕
            </motion.button>
        </div>
    );
}
