import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { userProgress } from '../stores/userProgress';

export function useInventory() {
    const [stories, setStories] = useState([]);
    const [myLibrary, setMyLibrary] = useState([]);
    const [userPoints, setUserPoints] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch initial data
    useEffect(() => {
        if (!supabase) return;

        async function fetchData() {
            setLoading(true);
            try {
                // 1. Get User Points
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('points')
                        .eq('id', user.id)
                        .single();
                    const pts = profile?.points || 0;
                    setUserPoints(pts);
                    userProgress.setPoints(pts); // Sync with store

                    // 2. Get User Library
                    const { data: library } = await supabase
                        .from('user_library')
                        .select('series_id')
                        .eq('user_id', user.id);
                    setMyLibrary(library?.map(l => l.series_id) || []);
                }

                // 3. Get All Series (Marketplace)
                const { data: allSeries } = await supabase
                    .from('series')
                    .select('*')
                    .order('created_at', { ascending: false });
                setStories(allSeries || []);

            } catch (err) {
                console.error("Inventory fetch error:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    // Buy a story
    const buyStory = async (series) => {
        if (!supabase) return { success: false, msg: "No connection" };

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return { success: false, msg: "Login required" };

            // 1. Validate Balance
            if (userPoints < series.price) {
                return { success: false, msg: "Not enough points" };
            }

            // 2. Deduct Points
            const newPoints = userPoints - series.price;
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ points: newPoints })
                .eq('id', user.id);

            if (updateError) throw updateError;
            setUserPoints(newPoints);

            // 3. Add to Library
            const { error: libError } = await supabase
                .from('user_library')
                .insert({ user_id: user.id, series_id: series.id });

            if (libError) throw libError;

            // Update local state
            setMyLibrary(prev => [...prev, series.id]);

            return { success: true };

        } catch (err) {
            console.error("Purchase failed:", err);
            return { success: false, msg: err.message };
        }
    };

    return {
        stories,
        myLibrary,
        userPoints,
        buyStory,
        loading,
        error
    };
}
