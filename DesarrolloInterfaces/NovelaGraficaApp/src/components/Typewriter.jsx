import { useState, useEffect } from 'react';

export function Typewriter({ text, speed = 30, onComplete }) {
    const [charCount, setCharCount] = useState(0);

    useEffect(() => {
        setCharCount(0);

        // Use local variable for cleanup to ensure we clear the specific interval creating this scope
        const timerId = setInterval(() => {
            setCharCount((prev) => {
                if (prev < text.length) {
                    return prev + 1;
                } else {
                    clearInterval(timerId);
                    // We can't safely call onComplete here multiple times if effect re-runs
                    // Better to handle onComplete in a separate effect
                    return prev;
                }
            });
        }, speed);

        return () => clearInterval(timerId);
    }, [text, speed]);

    // Separate effect for completion to avoid side-effects in the interval updater or cleanup races
    useEffect(() => {
        if (charCount >= text.length && text.length > 0) {
            if (onComplete) onComplete();
        }
    }, [charCount, text, onComplete]);

    return <span>{text.slice(0, charCount)}</span>;
}
