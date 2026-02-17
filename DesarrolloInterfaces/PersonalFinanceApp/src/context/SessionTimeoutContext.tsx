import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import SessionTimeoutModal from '../components/SessionTimeoutModal';

interface SessionTimeoutContextType {
    timeLeft: number;
    showWarning: boolean;
    resetTimer: () => void;
    remainActive: () => void;
}

const SessionTimeoutContext = createContext<SessionTimeoutContextType>({
    timeLeft: 60,
    showWarning: false,
    resetTimer: () => { },
    remainActive: () => { },
});

const TIMEOUT_DURATION = 30 * 60 * 1000; // 30 minutes
const WARNING_THRESHOLD = 15 * 1000; // 15 seconds remaining (45s elapsed)

export const SessionTimeoutProvider = ({ children }: { children: React.ReactNode }) => {
    const { user, signOut } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    // Use refs for values that change frequently to avoid re-renders on every tick if not needed for UI
    const lastActivityRef = useRef<number>(Date.now());

    const [timeLeft, setTimeLeft] = useState(TIMEOUT_DURATION / 1000);
    const [showWarning, setShowWarning] = useState(false);

    const resetTimer = useCallback(() => {
        lastActivityRef.current = Date.now();
        setShowWarning(false);
        setTimeLeft(TIMEOUT_DURATION / 1000);
    }, []);

    const remainActive = useCallback(() => {
        resetTimer();
    }, [resetTimer]);

    // Effect to handle activity listeners
    useEffect(() => {
        // Don't monitor activity on auth pages
        if (!user || ['/login', '/signup'].includes(location.pathname)) return;

        const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove'];

        const handleActivity = () => {
            // Only reset if we are NOT in the warning state
            // If in warning state, user must explicitly click "Remain Active" in modal
            // OR we can decide any activity dismisses it. 
            // User request: "cuando este cerca de los 15 segundos lo avisa por un dialogo personalizado"
            // Usually, any activity should reset it unless we want to force a specific action.
            // Let's make it so any activity resets it ONLY IF NOT WARNING. 
            // If warning is shown, we might want to force the modal interaction or just let them continue.
            // A common pattern is: any activity resets timer.
            // BUT if the modal is open, we might want to keep it until they acknowledge, or just close it.
            // Let's go with: Any activity resets timer and closes modal (seamless).

            // Optimization: throttle updates?
            // Actually, let's just update the ref. The interval checks the ref.
            if (!showWarning) {
                lastActivityRef.current = Date.now();
            }
        };

        // Throttle slightly
        let timeoutId: NodeJS.Timeout;
        const throttledHandler = () => {
            if (!timeoutId) {
                handleActivity();
                timeoutId = setTimeout(() => {
                    // @ts-expect-error: window.navigation is not yet in all type definitions
                    timeoutId = null;
                }, 500);
            }
        };

        events.forEach(event => window.addEventListener(event, throttledHandler));

        return () => {
            events.forEach(event => window.removeEventListener(event, throttledHandler));
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [user, showWarning]);

    // Effect for the timer interval
    useEffect(() => {
        // Don't run timer on auth pages
        if (!user || ['/login', '/signup'].includes(location.pathname)) return;

        const interval = setInterval(() => {
            const now = Date.now();
            const elapsed = now - lastActivityRef.current;
            const remaining = Math.max(0, TIMEOUT_DURATION - elapsed);

            setTimeLeft(Math.ceil(remaining / 1000));

            if (remaining <= 0) {
                // Timeout
                clearInterval(interval);
                signOut();
                // Force a reload/redirect to ensure clean state and avoid blank page
                window.location.href = '/login';
            } else if (remaining <= WARNING_THRESHOLD) {
                if (!showWarning) setShowWarning(true);
            } else {
                if (showWarning) setShowWarning(false);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [user, showWarning, signOut, navigate]);

    // Reset on route change (optional, but good for SPA feel)
    useEffect(() => {
        resetTimer();
    }, [location.pathname, resetTimer]);

    return (
        <SessionTimeoutContext.Provider value={{ timeLeft, showWarning, resetTimer, remainActive }}>
            {children}
            {showWarning && user && !['/login', '/signup'].includes(location.pathname) && (
                <SessionTimeoutModal
                    timeLeft={timeLeft}
                    onRemainActive={remainActive}
                    onLogout={signOut}
                />
            )}
        </SessionTimeoutContext.Provider>
    );
};

export const useSessionTimeout = () => useContext(SessionTimeoutContext);


