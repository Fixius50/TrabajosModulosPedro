import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const TypewriterEffect = ({ text, speed = 25, onComplete }) => {
    const [displayedText, setDisplayedText] = useState('');
    const [isComplete, setIsComplete] = useState(false);

    const indexRef = useRef(0);
    const timerRef = useRef(null);

    // Reset when text changes
    useEffect(() => {
        setDisplayedText('');
        setIsComplete(false);
        indexRef.current = 0;

        if (timerRef.current) clearInterval(timerRef.current);

        // Start typing
        timerRef.current = setInterval(() => {
            if (indexRef.current < text.length) {
                setDisplayedText(text.slice(0, indexRef.current + 1));
                indexRef.current++;
            } else {
                clearInterval(timerRef.current);
                setIsComplete(true);
                if (onComplete) onComplete();
            }
        }, speed);

        return () => clearInterval(timerRef.current);
    }, [text, speed, onComplete]);

    // Click to skip
    const handleSkip = () => {
        if (!isComplete) {
            clearInterval(timerRef.current);
            setDisplayedText(text);
            setIsComplete(true);
            if (onComplete) onComplete();
        }
    };

    return (
        <span
            onClick={handleSkip}
            className={`cursor-${isComplete ? 'default' : 'pointer'}`}
        >
            {displayedText}
            {!isComplete && (
                <span className="animate-pulse text-yellow-400 ml-1">▋</span>
            )}
        </span>
    );
};

TypewriterEffect.propTypes = {
    text: PropTypes.string.isRequired,
    speed: PropTypes.number,
    onComplete: PropTypes.func
};

export default TypewriterEffect;
