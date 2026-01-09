import { useState } from 'react';
import { motion } from 'framer-motion';

export default function StarRating({ rating, setRating, readOnly = false, size = 24, color = '#fbbf24' }) {
    const [hoverRating, setHoverRating] = useState(0);

    const handleMouseMove = (e, starIndex) => {
        if (readOnly) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const width = rect.width;
        const x = e.clientX - rect.left;

        // Si el puntero está en la primera mitad, es .5, si no 1.0
        const isHalf = x < width / 2;
        setHoverRating(isHalf ? starIndex - 0.5 : starIndex);
    };

    const handleClick = () => {
        if (!readOnly && setRating) {
            setRating(hoverRating);
        }
    };

    const activeRating = hoverRating || rating;

    return (
        <div
            className="flex items-center gap-1"
            onMouseLeave={() => !readOnly && setHoverRating(0)}
        >
            {[1, 2, 3, 4, 5].map((index) => {
                const filled = activeRating >= index;
                const half = activeRating === index - 0.5;

                return (
                    <div
                        key={index}
                        style={{ width: size, height: size, cursor: readOnly ? 'default' : 'pointer' }}
                        onMouseMove={(e) => handleMouseMove(e, index)}
                        onClick={handleClick}
                        className="relative"
                    >
                        {/* Empty Star Background */}
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                            style={{ color: 'rgba(255,255,255,0.2)', position: 'absolute', inset: 0 }}>
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>

                        {/* Filled Star Overlay */}
                        {(filled || half) && (
                            <motion.div
                                initial={false}
                                animate={{ opacity: 1, scale: 1 }}
                                style={{
                                    position: 'absolute',
                                    inset: 0,
                                    overflow: 'hidden',
                                    width: half ? '50%' : '100%' // CROP FOR HALF STAR
                                }}
                            >
                                <svg viewBox="0 0 24 24" fill={color} stroke="none"
                                    style={{ width: size, height: size, minWidth: size }} // minWidth keeps aspect ratio in cropped div
                                >
                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                </svg>
                            </motion.div>
                        )}
                    </div>
                );
            })}
            {!readOnly && <span className="ml-2 text-sm font-bold opacity-70 w-8">{activeRating > 0 ? activeRating : ''}</span>}
        </div>
    );
}
