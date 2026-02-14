import React from 'react';
import { useTranslation } from 'react-i18next';
import '../../../css/DungeonLoading.css';

interface DungeonLoadingProps {
    message?: string;
}

export const DungeonLoading: React.FC<DungeonLoadingProps> = ({ message }) => {
    const { t } = useTranslation();

    // Lista de mensajes temáticos por defecto
    const loadingMessages = [
        t('dungeon.loading.msg1'),
        t('dungeon.loading.msg2'),
        t('dungeon.loading.msg3'),
        t('dungeon.loading.msg4')
    ];

    const randomMessage = message || loadingMessages[Math.floor(Math.random() * loadingMessages.length)];

    return (
        <div className="loading-overlay">
            <div className="d20-container">
                <div className="d20">
                    <div className="d20-face face1"><span>20</span></div>
                    <div className="d20-face face2"><span>1</span></div>
                    <div className="d20-face face3"><span>15</span></div>
                    <div className="d20-face face4"><span>3</span></div>
                    <div className="d20-face face5"><span>10</span></div>
                </div>
            </div>
            <div className="loading-text">
                {randomMessage}
            </div>

            {/* Ambient sparks effect */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-1 h-1 bg-[#c5a059] rounded-full animate-ping opacity-20"
                        style={{
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 5}s`,
                            animationDuration: `${2 + Math.random() * 3}s`
                        }}
                    ></div>
                ))}
            </div>
        </div>
    );
};
