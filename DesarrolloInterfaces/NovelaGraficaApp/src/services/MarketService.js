import { supabase } from './supabaseClient';
import { useGameStore } from '../engine/StoryEngine';

export class MarketService {

    // 1. Get User Profile (Points & Unlocks)
    static async getUserProfile(userId) {
        if (!userId) return null;

        const { data: profile } = await supabase
            .from('profiles')
            .select('points, preferences, avatar_url')
            .eq('id', userId)
            .single();

        return profile;
    }

    // 2. Get Shop Items with "Owned" status
    static async getShopItems(userId) {
        // Fetch all active shop items
        const { data: items, error } = await supabase
            .from('shop_items')
            .select('*');
        // .eq('is_active', true); // Fixed: Column does not exist

        if (error) throw error;

        // Fetch user's unlocks
        let unlockedIds = new Set();
        if (userId) {
            const { data: unlocks } = await supabase
                .from('user_library')
                .select('item_id')
                .eq('user_id', userId);

            unlocks.forEach(u => unlockedIds.add(u.item_id));
        }

        // Merge status and normalize 'price' to 'cost' for frontend consistency
        return (items || []).map(item => ({
            ...item,
            cost: item.price !== undefined ? item.price : item.cost, // Fallback to existing cost if any, or mapped price
            owned: unlockedIds.has(item.id)
        }));
    }

    // 3. Buy Item
    static async buyItem(itemId) {
        const { data, error } = await supabase.rpc('buy_shop_item', { item_uuid: itemId });

        if (error) throw error;
        return data; // { success: true/false, message: "..." }
    }

    // 4. Record Route Completion & Award Points
    static async completeRoute(userId, seriesId, endingNodeId) {
        if (!userId) return;

        // Tenta insertar en user_routes
        // Si falla por unique constraint, es que ya lo hizo.
        try {
            const { error } = await supabase
                .from('user_routes')
                .insert({ user_id: userId, series_id: seriesId, ending_node_id: endingNodeId });

            if (!error) {
                // Si fue exitoso (nuevo final), damos puntos extra
                await supabase.rpc('award_points', { amount: 500 });
                console.log("Route Completed! +500 Points");
                return true;
            }
        } catch (e) {
            console.log("Route already completed previously.");
        }
        return false;
    }
}
