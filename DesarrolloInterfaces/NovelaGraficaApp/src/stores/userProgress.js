// User Progress Store - Tracks choices, visited nodes, unlocked routes, points, and purchases
// Uses localStorage for persistence

const STORAGE_KEY = 'novelaapp_user_progress';

const DEFAULT_STATE = {
    userId: null,
    points: 0,
    choices: {}, // { storyId: [{ nodeId, choiceLabel, timestamp }] }
    visitedNodes: {}, // { storyId: Set of visited node IDs }
    unlockedRoutes: {}, // { storyId: Set of route IDs }
    completedStories: [], // storyIds with 100% completion
    purchases: {
        themes: ['default'],
        fonts: ['Inter'],
        effects: []
    },
    activeTheme: 'default',
    activeFont: 'Inter',
    borderStyle: 'black', // Nuevo: 'black', 'white', 'wood'
    stats: {
        totalChoicesMade: 0,
        totalNodesVisited: 0,
        storiesStarted: 0,
        storiesCompleted: 0
    }
};

// Load from localStorage
function loadProgress() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            // Convert Sets back from Arrays
            if (parsed.unlockedRoutes) {
                Object.keys(parsed.unlockedRoutes).forEach(key => {
                    parsed.unlockedRoutes[key] = new Set(parsed.unlockedRoutes[key]);
                });
            }
            if (parsed.visitedNodes) {
                Object.keys(parsed.visitedNodes).forEach(key => {
                    parsed.visitedNodes[key] = new Set(parsed.visitedNodes[key]);
                });
            }
            return { ...DEFAULT_STATE, ...parsed };
        }
    } catch (e) {
        console.warn('Failed to load progress:', e);
    }
    return { ...DEFAULT_STATE };
}

// Save to localStorage
function saveProgress(state) {
    try {
        const toSave = { ...state };
        // Convert Sets to Arrays for JSON
        if (toSave.unlockedRoutes) {
            const converted = {};
            Object.keys(toSave.unlockedRoutes).forEach(key => {
                converted[key] = Array.from(toSave.unlockedRoutes[key]);
            });
            toSave.unlockedRoutes = converted;
        }
        if (toSave.visitedNodes) {
            const converted = {};
            Object.keys(toSave.visitedNodes).forEach(key => {
                converted[key] = Array.from(toSave.visitedNodes[key]);
            });
            toSave.visitedNodes = converted;
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (e) {
        console.warn('Failed to save progress:', e);
    }
}

// Points rewards
const POINTS = {
    NEW_NODE_VISITED: 5, // Only for first visit
    NEW_ROUTE_UNLOCKED: 50,
    ENDING_REACHED: 25,
    ALL_ROUTES_BONUS_MULTIPLIER: 5
};

// Create the store
class UserProgressStore {
    constructor() {
        this.state = loadProgress();
        this.listeners = new Set();
    }

    subscribe(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    notify() {
        this.listeners.forEach(fn => fn(this.state));
        saveProgress(this.state);
    }

    getState() {
        return this.state;
    }

    // Visit a node - returns points earned (0 if already visited)
    visitNode(storyId, nodeId) {
        if (!this.state.visitedNodes[storyId]) {
            this.state.visitedNodes[storyId] = new Set();
        }

        // Check if already visited - NO POINTS if replaying
        if (this.state.visitedNodes[storyId].has(nodeId)) {
            return 0; // Already visited, no points
        }

        // First time visiting this node
        this.state.visitedNodes[storyId].add(nodeId);
        this.state.stats.totalNodesVisited++;
        this.state.points += POINTS.NEW_NODE_VISITED;

        this.notify();
        return POINTS.NEW_NODE_VISITED;
    }

    // Record a choice made by the player (for history log)
    recordChoice(storyId, nodeId, choiceLabel, targetNodeId) {
        if (!this.state.choices[storyId]) {
            this.state.choices[storyId] = [];
        }

        this.state.choices[storyId].push({
            nodeId,
            choiceLabel,
            targetNodeId,
            timestamp: Date.now()
        });

        this.state.stats.totalChoicesMade++;

        // Visit the target node and get points
        const pointsEarned = this.visitNode(storyId, targetNodeId);

        this.notify();
        return pointsEarned;
    }

    // Reach an ending
    reachEnding(storyId, endingId, totalEndings) {
        if (!this.state.unlockedRoutes[storyId]) {
            this.state.unlockedRoutes[storyId] = new Set();
        }

        // Check if ending already unlocked
        if (this.state.unlockedRoutes[storyId].has(endingId)) {
            return 0; // Already reached, no points
        }

        this.state.unlockedRoutes[storyId].add(endingId);
        let pointsEarned = POINTS.ENDING_REACHED;

        // Check if all endings are now unlocked
        if (this.state.unlockedRoutes[storyId].size >= totalEndings) {
            pointsEarned = POINTS.NEW_ROUTE_UNLOCKED * POINTS.ALL_ROUTES_BONUS_MULTIPLIER;
            if (!this.state.completedStories.includes(storyId)) {
                this.state.completedStories.push(storyId);
                this.state.stats.storiesCompleted++;
            }
        }

        this.state.points += pointsEarned;
        this.notify();
        return pointsEarned;
    }

    // Get visited nodes for a story
    getVisitedNodes(storyId) {
        return this.state.visitedNodes[storyId] || new Set();
    }

    // Check if a node was visited
    isNodeVisited(storyId, nodeId) {
        return this.state.visitedNodes[storyId]?.has(nodeId) || false;
    }

    // Get unlocked endings for a story
    getUnlockedEndings(storyId) {
        return this.state.unlockedRoutes[storyId] || new Set();
    }

    // Get completion percentage
    getCompletion(storyId, totalEndings) {
        const unlocked = this.state.unlockedRoutes[storyId]?.size || 0;
        return Math.round((unlocked / totalEndings) * 100);
    }

    // Get player choices for a story
    getChoices(storyId) {
        return this.state.choices[storyId] || [];
    }

    // Purchase an item from the marketplace
    purchase(category, itemId, cost) {
        if (this.state.points < cost) {
            return { success: false, error: 'Not enough points' };
        }

        if (this.state.purchases[category]?.includes(itemId)) {
            return { success: false, error: 'Already owned' };
        }

        this.state.points -= cost;
        if (!this.state.purchases[category]) {
            this.state.purchases[category] = [];
        }
        this.state.purchases[category].push(itemId);

        this.notify();
        return { success: true };
    }

    // Set active theme/font/border
    setActive(type, value) {
        if (type === 'theme') this.state.activeTheme = value;
        if (type === 'font') this.state.activeFont = value;
        if (type === 'border') this.state.borderStyle = value;
        this.notify();
    }

    // Check if item is owned
    isOwned(category, itemId) {
        return this.state.purchases[category]?.includes(itemId) || false;
    }

    // Reset progress (for testing)
    reset() {
        this.state = { ...DEFAULT_STATE };
        localStorage.removeItem(STORAGE_KEY);
        this.notify();
    }

    setPoints(points) {
        this.state.points = points;
        this.notify();
    }
}

// Singleton instance
export const userProgress = new UserProgressStore();

// React hook
import { useState, useEffect } from 'react';

export function useUserProgress() {
    const [state, setState] = useState(userProgress.getState());

    useEffect(() => {
        return userProgress.subscribe(setState);
    }, []);

    return {
        ...state,
        visitNode: (storyId, nodeId) => userProgress.visitNode(storyId, nodeId),
        recordChoice: (storyId, nodeId, choiceLabel, targetNodeId) => userProgress.recordChoice(storyId, nodeId, choiceLabel, targetNodeId),
        reachEnding: (storyId, endingId, totalEndings) => userProgress.reachEnding(storyId, endingId, totalEndings),
        getVisitedNodes: (storyId) => userProgress.getVisitedNodes(storyId),
        isNodeVisited: (storyId, nodeId) => userProgress.isNodeVisited(storyId, nodeId),
        getUnlockedEndings: (storyId) => userProgress.getUnlockedEndings(storyId),
        getCompletion: (storyId, totalEndings) => userProgress.getCompletion(storyId, totalEndings),
        getChoices: (storyId) => userProgress.getChoices(storyId),
        purchase: (category, itemId, cost) => userProgress.purchase(category, itemId, cost),
        setActive: (type, value) => userProgress.setActive(type, value),
        isOwned: (category, itemId) => userProgress.isOwned(category, itemId),
        reset: () => userProgress.reset()
    };
}
