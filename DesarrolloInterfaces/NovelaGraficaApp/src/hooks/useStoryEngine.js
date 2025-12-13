import { useState, useEffect, useCallback } from 'react';
import { StoryRepository } from '../services/StoryRepository';

// Initialize repo singleton
const repo = new StoryRepository();

export function useStoryEngine(startNodeId) {
    const [currentNode, setCurrentNode] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Consequence Engine State: Flags / Inventory
    const [storyState, setStoryState] = useState({
        flags: {},     // e.g. { has_key: true, met_alice: true }
        inventory: []  // List of items
    });

    // Helper: Verify conditions
    const checkCondition = (condition) => {
        if (!condition) return true;
        // Simple logic: { required_flag: 'has_key' } or { not_flag: 'dead' }
        if (condition.required_flag) {
            return !!storyState.flags[condition.required_flag];
        }
        if (condition.required_item) {
            return storyState.inventory.includes(condition.required_item);
        }
        return true;
    };

    // Function to navigate
    const goToNode = useCallback(async (nodeId) => {
        if (!nodeId) return;

        setLoading(true);
        setError(null);

        try {
            const nodeData = await repo.getNodeById(nodeId);

            if (nodeData) {
                // 1. PROCESS CONSEQUENCES (Update State)
                // e.g. nodeData.consequences = { set_flag: 'entered_forest', add_item: 'map' }
                if (nodeData.consequences) {
                    setStoryState(prev => {
                        const newState = { ...prev };
                        const cons = nodeData.consequences;

                        // Set Flags
                        if (cons.set_flag) {
                            newState.flags = { ...newState.flags, [cons.set_flag]: true };
                        }
                        // Inventory
                        if (cons.add_item && !newState.inventory.includes(cons.add_item)) {
                            newState.inventory = [...newState.inventory, cons.add_item];
                        }

                        return newState;
                    });
                }

                // 2. FILTER OPTIONS based on Conditions
                // We modify the nodeData we pass to the UI to only show valid choices
                // Note: Repository returns 'choices', not 'options'.
                if (nodeData.choices && nodeData.choices.length > 0) {
                    nodeData.displayOptions = nodeData.choices.filter(opt => {
                        return checkCondition(opt.condition);
                    });
                } else if (nodeData.next) {
                    // Fallback for raw nodes or unmapped structure
                    nodeData.displayOptions = [{
                        label: 'Continuar',
                        nextNodeId: nodeData.next,
                        condition: null
                    }];
                } else {
                    nodeData.displayOptions = [];
                }

                setCurrentNode(nodeData);

                // Here we could save progress to Supabase
                // await repo.saveProgress(nodeId, storyState); 
            } else {
                setError(`Node ${nodeId} not found`);
            }
        } catch (err) {
            console.error("Error loading story node:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [storyState]); // Dependency on state for updates

    // Load start node on mount
    useEffect(() => {
        if (startNodeId && !currentNode) {
            goToNode(startNodeId);
        }
    }, [startNodeId, goToNode]);

    return { currentNode, loading, error, goToNode, storyState };
}
