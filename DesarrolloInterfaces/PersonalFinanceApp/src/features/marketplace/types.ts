export type MarketplaceItemType = 'avatar' | 'theme' | 'title';
export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface MarketplaceItem {
    id: string;
    name: string;
    description: string;
    type: MarketplaceItemType;
    price_xp: number;
    price_gold: number;
    image_url?: string;
    rarity: Rarity;
}

export interface UserInventoryItem {
    id: string; // unique id in inventory table
    item_id: string;
    user_id: string;
    is_equipped: boolean;
    purchased_at: string;
    item?: MarketplaceItem; // Joined data
}
