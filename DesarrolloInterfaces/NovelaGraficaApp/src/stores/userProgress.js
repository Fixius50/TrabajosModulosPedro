// User Progress Store - Database First (Supabase)
// No LocalStorage persistence.

import { supabase } from '../services/supabaseClient';

const DEFAULT_STATE = {
    userId: null,
    points: 500,
    choices: {}, // { storyId: [{ nodeId, choiceLabel, timestamp }] }
    visitedNodes: {}, // { storyId: Set of visited node IDs }
    unlockedRoutes: {}, // { storyId: Set of route IDs }
    completedStories: [],
    purchases: {
        themes: ['default'],
        fonts: ['Inter'],
        effects: []
    },
    activeTheme: 'default',
    activeFont: 'Inter',
    fontSize: 100,
    borderStyle: 'black',
    profile: {
        name: 'Invitado',
        avatar: '',
        banner: ''
    },
    themeConfigs: {},
    stats: {
        totalChoicesMade: 0,
        totalNodesVisited: 0
    }
};

// Helper for Sets serialization
const serializeSets = (state) => {
    const copy = JSON.parse(JSON.stringify(state)); // Deep copy scalars
    // Manually handle Sets
    if (state.visitedNodes) {
        copy.visitedNodes = {};
        Object.keys(state.visitedNodes).forEach(k => {
            copy.visitedNodes[k] = Array.from(state.visitedNodes[k]);
        });
    }
    if (state.unlockedRoutes) {
        copy.unlockedRoutes = {};
        Object.keys(state.unlockedRoutes).forEach(k => {
            copy.unlockedRoutes[k] = Array.from(state.unlockedRoutes[k]);
        });
    }
    return copy;
};

// Encapsulates logic
class UserProgressStore {
    constructor() {
        this.state = { ...DEFAULT_STATE };
        this.listeners = new Set();
        this.saveTimeout = null;
        this.isSyncing = false;

        // Listen for Auth Changes to reload data
        supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                console.log('🔄 Auth Change detected: Loading Cloud Save...');
                await this.loadFromSupabase(session.user.id);
            } else {
                console.log('👋 User logged out: Resetting state.');
                this.reset();
            }
        });
    }

    async loadFromSupabase(userId) {
        this.isSyncing = true;
        try {
            // 1. Get Profile (Points, Username)
            const { data: profile } = await supabase
                .from('profiles')
                .select('username, points, avatar_url')
                .eq('id', userId)
                .single();

            // 2. Get Game State JSON
            const { data: gameState } = await supabase
                .from('user_game_state')
                .select('state_data')
                .eq('user_id', userId)
                .single();

            const cloudState = gameState?.state_data || {};

            // Rehydrate Sets
            if (cloudState.visitedNodes) {
                Object.keys(cloudState.visitedNodes).forEach(k => {
                    cloudState.visitedNodes[k] = new Set(cloudState.visitedNodes[k]);
                });
            }
            if (cloudState.unlockedRoutes) {
                Object.keys(cloudState.unlockedRoutes).forEach(k => {
                    cloudState.unlockedRoutes[k] = new Set(cloudState.unlockedRoutes[k]);
                });
            }

            // 3. Load Favorites
            const { data: favs } = await supabase
                .from('user_library')
                .select('item_id')
                .eq('user_id', userId)
                .eq('item_type', 'favorite_series');

            const favoritesSet = new Set(favs?.map(f => f.item_id) || []);

            // Merge
            this.state = {
                ...DEFAULT_STATE,
                ...cloudState,
                favorites: favoritesSet, // Add favorites

                userId: userId,
                points: profile?.points || DEFAULT_STATE.points,
                profile: {
                    ...DEFAULT_STATE.profile,
                    name: profile?.username || 'Usuario',
                    avatar: profile?.avatar_url || ''
                }
            };

            // Fetch Global Shop Configs (Themes)
            this.fetchShopConfigs();

        } catch (e) {
            console.error('❌ Error loading progress:', e);
        } finally {
            this.isSyncing = false;
            this.notify(false); // Notify internal update, don't trigger save
        }
    }

    async fetchShopConfigs() {
        const { data } = await supabase.from('shop_items').select('asset_value, style_config').eq('type', 'theme');
        if (data) {
            const configs = {};
            data.forEach(item => {
                if (item.style_config) configs[item.asset_value] = item.style_config;
            });
            this.state.themeConfigs = configs;
            this.notify(false);
        }
    }

    // Debounced Save to Supabase
    saveToSupabase() {
        if (!this.state.userId) return; // Don't save for guests

        if (this.saveTimeout) clearTimeout(this.saveTimeout);

        this.saveTimeout = setTimeout(async () => {
            try {
                const userId = this.state.userId;
                const stateToSave = serializeSets(this.state);

                // Exclude fields stored in other tables to avoid redundancy
                delete stateToSave.profile; // Stored in profiles
                // delete stateToSave.points; // We might want to sync points here solely for backup, but mainly update profiles

                // 1. Update Game State Blob
                const { error: errorState } = await supabase
                    .from('user_game_state')
                    .upsert({
                        user_id: userId,
                        state_data: stateToSave,
                        last_updated: new Date()
                    });

                if (errorState) throw errorState;

                // 2. Update Points in Profile (Source of Truth for Currency)
                const { error: errorProfile } = await supabase
                    .from('profiles')
                    .update({ points: this.state.points })
                    .eq('id', userId);

                if (errorProfile) throw errorProfile;

                console.log('✅ Progress synced to Cloud');

            } catch (e) {
                console.error('⚠️ Save failed:', e);
            }
        }, 2000); // Wait 2s of inactivity before saving
    }

    subscribe(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    notify(triggerSave = true) {
        const newState = { ...this.state };
        this.listeners.forEach(fn => fn(newState));
        if (triggerSave && !this.isSyncing) {
            this.saveToSupabase();
        }
    }

    getState() { return this.state; }

    // --- ACTIONS ---

    visitNode(storyId, nodeId) {
        if (!this.state.visitedNodes[storyId]) this.state.visitedNodes[storyId] = new Set();
        if (this.state.visitedNodes[storyId].has(nodeId)) return 0;

        this.state.visitedNodes[storyId].add(nodeId);
        this.state.stats.totalNodesVisited++;
        this.state.points += 5; // Reward
        this.notify();
        return 5;
    }

    recordChoice(storyId, nodeId, choiceLabel, targetNodeId) {
        if (!this.state.choices[storyId]) this.state.choices[storyId] = [];
        this.state.choices[storyId].push({ nodeId, choiceLabel, targetNodeId, timestamp: Date.now() });
        this.state.stats.totalChoicesMade++;
        const points = this.visitNode(storyId, targetNodeId);
        this.notify();
        return points;
    }

    // New: Handle Route Completion
    completeRoute(storyId, endingNodeId, totalEndingsCount) {
        if (!this.state.unlockedRoutes[storyId]) this.state.unlockedRoutes[storyId] = new Set();

        let reward = 0;
        let message = '';
        let isBonus = false;

        // 1. New Ending Discovered?
        if (!this.state.unlockedRoutes[storyId].has(endingNodeId)) {
            this.state.unlockedRoutes[storyId].add(endingNodeId);
            reward = 50; // Base completion reward
            message = '¡Nueva Ruta Completada!';
        } else {
            message = 'Ruta ya completada anteriormente.';
        }

        // 2. Check for 100% Completion Bonus
        const unlockedCount = this.state.unlockedRoutes[storyId].size;
        if (totalEndingsCount > 0 && unlockedCount >= totalEndingsCount) {
            // Check if we already awarded the 100% bonus for this story?
            // For simplicity, we just check if this specific ending caused the 100%
            if (reward > 0) { // Only if this was a NEW ending
                const bonus = reward * 5; // 5x Bonus
                reward += bonus;
                message = `¡100% COMPLETADO! BONUS x5 (${reward} pts)`;
                isBonus = true;
            }
        }

        if (reward > 0) {
            this.state.points += reward;
            this.notify();
        }

        return { reward, message, isBonus, unlockedCount };
    }

    // Purchase Logic
    async purchase(category, itemId, cost) {
        if (this.state.points < cost) return { success: false, error: 'Not enough points' };

        // Optimistic Update
        this.state.points -= cost;
        if (!this.state.purchases[category]) this.state.purchases[category] = [];
        this.state.purchases[category].push(itemId);
        this.notify();

        // Also record in persistent library table immediately
        if (this.state.userId) {
            try {
                await supabase.from('user_library').insert({
                    user_id: this.state.userId,
                    item_type: category,
                    item_id: itemId
                });
            } catch (e) {
                console.error("Failed to sync purchase:", e);
            }
        }
        return { success: true };
    }

    // Favorites Logic
    async toggleFavorite(seriesId) {
        if (!this.state.userId) return false; // Guest cant fave yet

        const isFave = this.isFavorite(seriesId);
        const itemType = 'favorite_series';

        // Optimistic Update
        if (!this.state.favorites) this.state.favorites = new Set();

        if (isFave) {
            this.state.favorites.delete(seriesId);
        } else {
            this.state.favorites.add(seriesId);
        }
        this.notify();

        try {
            console.log(`[UserProgress] Persisting favorite ${seriesId} (New State: ${!isFave})`);
            if (isFave) {
                // Remove from DB
                const { error } = await supabase.from('user_library')
                    .delete()
                    .match({ user_id: this.state.userId, item_type: itemType, item_id: seriesId });
                if (error) throw error;
            } else {
                // Add to DB
                const { error } = await supabase.from('user_library')
                    .insert({ user_id: this.state.userId, item_type: itemType, item_id: seriesId });
                if (error) throw error;
            }
            console.log(`[UserProgress] Favorite persisted successfully.`);
        } catch (e) {
            console.error("Error toggling favorite in DB:", e);
            // Revert local state on error
            if (isFave) this.state.favorites.add(seriesId);
            else this.state.favorites.delete(seriesId);
            this.notify();
        }
        return !isFave;
    }

    isFavorite(seriesId) {
        return this.state.favorites?.has(seriesId) || false;
    }

    setActive(type, value) {
        if (type === 'theme') this.state.activeTheme = value;
        if (type === 'font') this.state.activeFont = value;
        if (type === 'size') this.state.fontSize = value;
        this.notify();
    }

    isOwned(category, itemId) {
        return this.state.purchases[category]?.includes(itemId) || category === 'themes' && itemId === 'default';
    }

    getThemeStyles(themeName) {
        return this.state.themeConfigs?.[themeName] || null;
    }

    async updateProfile(updates) {
        // Optimistic update
        this.state.profile = { ...this.state.profile, ...updates };
        this.notify();

        if (this.state.userId) {
            const { error } = await supabase
                .from('profiles')
                .update({
                    username: this.state.profile.name,
                    avatar_url: this.state.profile.avatar,
                    // banner: this.state.profile.banner // Si tuviéramos campo banner en DB
                })
                .eq('id', this.state.userId);

            if (error) console.error("Error updating profile:", error);
        }
    }

    reset() {
        this.state = { ...DEFAULT_STATE };
        this.notify(false);
    }
}

export const userProgress = new UserProgressStore();

// React Hook
import { useState, useEffect } from 'react';

export function useUserProgress() {
    const [state, setState] = useState(userProgress.getState());
    useEffect(() => userProgress.subscribe(setState), []);

    return {
        ...state,
        visitNode: (s, n) => userProgress.visitNode(s, n),
        recordChoice: (s, n, l, t) => userProgress.recordChoice(s, n, l, t),
        purchase: (c, i, cost) => userProgress.purchase(c, i, cost),
        setActive: (t, v) => userProgress.setActive(t, v),
        isOwned: (c, i) => userProgress.isOwned(c, i),
        getThemeStyles: (t) => userProgress.getThemeStyles(t),
        updateProfile: (u) => userProgress.updateProfile(u),
        toggleFavorite: (id) => userProgress.toggleFavorite(id),
        isFavorite: (id) => userProgress.isFavorite(id),
        completeRoute: (s, n, t) => userProgress.completeRoute(s, n, t),
        reset: () => userProgress.reset()
    };
}
