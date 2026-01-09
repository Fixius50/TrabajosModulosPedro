import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import PropTypes from 'prop-types';

const TypewriterEffect = forwardRef(({ text, speed = 25, onComplete }, ref) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isComplete, setIsComplete] = useState(false);

    // Parsed segments: [{ text: "Batman", bold: true }, { text: ": Hola", bold: false }]
    const segmentsRef = useRef([]);
    const totalLengthRef = useRef(0);
    const timerRef = useRef(null);

    useImperativeHandle(ref, () => ({
        skip: handleSkip,
        get isTyping() { return !isComplete; }
    }));

    // Parser Function: Supports **bold**
    const parseText = (rawText) => {
        const parts = rawText.split(/(\*\*.*?\*\*)/g);
        return parts.map(part => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return { text: part.slice(2, -2), bold: true };
            }
            return { text: part, bold: false };
        }).filter(p => p.text.length > 0);
    };

    // Reset when text changes
    useEffect(() => {
        // 1. Parse and setup
        segmentsRef.current = parseText(text);
        totalLengthRef.current = segmentsRef.current.reduce((acc, seg) => acc + seg.text.length, 0);

        setCurrentIndex(0);
        setIsComplete(false);

        if (timerRef.current) clearInterval(timerRef.current);

        // 2. Start Typing Loop
        timerRef.current = setInterval(() => {
            setCurrentIndex(prev => {
                const next = prev + 1;
                if (next >= totalLengthRef.current) {
                    clearInterval(timerRef.current);
                    setIsComplete(true);
                    if (onComplete) onComplete();
                    return totalLengthRef.current;
                }
                return next;
            });
        }, speed);

        return () => clearInterval(timerRef.current);
    }, [text, speed, onComplete]);

    // Click to skip
    const handleSkip = () => {
        if (!isComplete) {
            clearInterval(timerRef.current);
            setCurrentIndex(totalLengthRef.current);
            setIsComplete(true);
            if (onComplete) onComplete();
        }
    };

    // Render Logic: Reconstruct text up to currentIndex
    const renderContent = () => {
        let charsRemaining = currentIndex;
        return segmentsRef.current.map((seg, i) => {
            if (charsRemaining <= 0) return null;

            const textToRender = seg.text.slice(0, charsRemaining);
            charsRemaining -= seg.text.length;

            return (
                <span key={i} className={seg.bold ? "font-extrabold text-yellow-500" : ""}>
                    {textToRender}
                </span>
            );
        });
    };

    return (
        <span
            onClick={(e) => { e.stopPropagation(); handleSkip(); }}
            className={`cursor-${isComplete ? 'default' : 'pointer'}`}
        >
            {renderContent()}
            {!isComplete && (
                <span className="animate-pulse text-yellow-400 ml-1">▋</span>
            )}
        </span>
    );
});

TypewriterEffect.displayName = 'TypewriterEffect';

TypewriterEffect.propTypes = {
    text: PropTypes.string.isRequired,
    speed: PropTypes.number,
    onComplete: PropTypes.func
};

export default TypewriterEffect;
