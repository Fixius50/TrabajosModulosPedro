// dndService.ts
// Handles interactions with D&D 5e API for inventory gamification.

export interface DndItem {
    overview: string;
    name: string;
    cost_gp: number; // Cost in Gold Pieces
    rarity: string;
    desc: string[];
}

// MOCK DATA: Mapping real money to fantasy purchasing power
// Assumption: 1 Real Currency Unit = 1 Gold Piece (GP) for simplicity
const FANTASY_SHOP: DndItem[] = [
    { name: "Potion of Healing", cost_gp: 50, rarity: "Common", desc: ["Restores 2d4 + 2 hit points."], overview: "A red liquid that glimmers when agitated." },
    { name: "Spell Scroll (Level 1)", cost_gp: 75, rarity: "Common", desc: ["A scroll bearing the words of a single spell."], overview: "Parchment inscribed with magical runes." },
    { name: "Bag of Holding", cost_gp: 500, rarity: "Uncommon", desc: ["Holds up to 500 pounds, not exceeding a volume of 64 cubic feet."], overview: "This bag has an interior space considerably larger than its outside dimensions." },
    { name: "Mithril Armor", cost_gp: 800, rarity: "Uncommon", desc: ["Armor made of mithril light and flexible."], overview: "Light metal mesh that feels like silk." },
    { name: "Ring of Protection", cost_gp: 3500, rarity: "Rare", desc: ["You gain a +1 bonus to AC and saving throws."], overview: "A heavy gold ring set with a sapphire." },
    { name: "Vorpal Sword", cost_gp: 50000, rarity: "Legendary", desc: ["On a natural 20, you cut off one of the creature's heads."], overview: "A blade that seems to cut the very air around it." }
];

export const dndService = {
    // Returns items that the user can 'afford' with their balance
    calculatePurchasingPower: async (balance: number): Promise<{ affordable: DndItem[], nextGoal: DndItem | null }> => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        const affordable = FANTASY_SHOP.filter(item => item.cost_gp <= balance);
        const nextGoal = FANTASY_SHOP.find(item => item.cost_gp > balance) || null; // First item they can't afford

        return {
            affordable: affordable.sort((a, b) => b.cost_gp - a.cost_gp), // Most expensive first
            nextGoal
        };
    }
};
