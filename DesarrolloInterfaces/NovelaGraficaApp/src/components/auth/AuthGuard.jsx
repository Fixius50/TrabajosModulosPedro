import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabaseClient';

// AuthGuard Component
export default function AuthGuard({ children, allowGuest = false }) {
    const [loading, setLoading] = useState(true);
    const [session, setSession] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        let mounted = true;

        // 1. Get initial session with timeout
        const initSession = async () => {
            try {
                // Race between Supabase and a 2-second timeout
                const sessionPromise = supabase.auth.getSession();
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Timeout')), 2000)
                );

                const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]);

                if (mounted) {
                    setSession(session);
                    setLoading(false);
                }
            } catch (error) {
                console.warn("AuthGuard Session Check:", error);
                // If timeout or error, we assume no session but stop loading
                if (mounted) setLoading(false);
            }
        };

        initSession();

        // 2. Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            if (mounted) {
                setSession(session);
                setLoading(false);
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    useEffect(() => {
        if (!loading && !session && !allowGuest) {
            navigate('/login');
        }
    }, [session, loading, navigate, allowGuest]);

    if (loading) {
        return (
            <div style={{
                height: '100vh',
                width: '100vw',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#0a0a0a',
                color: '#4ade80',
                fontFamily: 'monospace'
            }}>
                INIT_SEQ...
            </div>
        );
    }

    if (!session && !allowGuest) {
        return null;
    }

    return children;
}
