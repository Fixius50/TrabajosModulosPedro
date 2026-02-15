import { supabase } from '../lib/supabase';
import { MarketplaceItem, UserInventoryItem } from '../features/marketplace/types';
import { storageService } from './storageService';

export class MarketplaceService {
    async getItems(): Promise<MarketplaceItem[]> {
        const { data, error } = await supabase
            .from('marketplace_items')
            .select('*')
            .order('price_xp', { ascending: true });

        if (error) throw error;
        return (data as MarketplaceItem[]) || [];
    }

    async getUserInventory(userId: string): Promise<UserInventoryItem[]> {
        const { data, error } = await supabase
            .from('user_inventory')
            .select(`
                *,
                item:marketplace_items (*)
            `)
            .eq('user_id', userId);

        if (error) throw error;
        return (data as any) || []; // Cast to any because of the join structure
    }

    async purchaseItem(userId: string, item: MarketplaceItem): Promise<{ success: boolean; message: string }> {
        // 1. Check local funds
        if (!storageService.hasFunds(item.price_xp, item.price_gold)) {
            return { success: false, message: 'Fondos insuficientes (XP u Oro)' };
        }

        try {
            // 2. Insert into Supabase
            const { error } = await supabase
                .from('user_inventory')
                .insert({
                    user_id: userId,
                    item_id: item.id,
                    is_equipped: false
                });

            if (error) {
                if (error.code === '23505') { // Unique violation
                    return { success: false, message: 'Ya posees este objeto' };
                }
                throw error;
            }

            // 3. Deduct local funds only after successful DB insert
            storageService.deductFunds(item.price_xp, item.price_gold);

            return { success: true, message: '¡Compra realizada con éxito!' };
        } catch (error: any) {
            console.error('Purchase error:', error);
            return { success: false, message: 'Error al procesar la compra' };
        }
    }
}

export const marketplaceService = new MarketplaceService();
