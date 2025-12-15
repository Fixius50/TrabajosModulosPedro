import { useState, useEffect, useCallback } from 'react';
import { StoryRepository } from '../services/StoryRepository';
import { StoryLoader } from '../services/StoryLoader';

// Initialize services
const repo = new StoryRepository();
const loader = new StoryLoader();

export function useStoryEngine(startNodeId) {
    const [currentNode, setCurrentNode] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [storyNodes, setStoryNodes] = useState({}); // Local cache for JSON stories

    // Consequence Engine State: Flags / Inventory
    const [storyState, setStoryState] = useState({
        flags: {},     // e.g. { has_key: true, met_alice: true }
        inventory: []  // List of items
    });

    // Helper: Verify conditions
    const checkCondition = (condition) => {
        if (!condition) return true;
        if (condition.required_flag) return !!storyState.flags[condition.required_flag];
        if (condition.required_item) return storyState.inventory.includes(condition.required_item);
        return true;
    };

    // Function to navigate
    const goToNode = useCallback(async (nodeId) => {
        if (!nodeId) return;
        setLoading(true);
        setError(null);

        try {
            // Check if node exists in local JSON cache
            let nodeData = storyNodes[nodeId];

            // If not found locally, try Repository (DB)
            if (!nodeData) {
                // If we are in "JSON mode" (have local nodes) but ID is not found, it might be an issue.
                // But for hybrid compat, we allow checking DB.
                try {
                    nodeData = await repo.getNodeById(nodeId);
                } catch (e) {
                    // Ignore DB error if we rely on JSON
                }
            }

            if (nodeData) {
                // 1. PROCESS CONSEQUENCES
                if (nodeData.consequences) {
                    setStoryState(prev => {
                        const newState = { ...prev };
                        const cons = nodeData.consequences;
                        if (cons.set_flag) newState.flags = { ...newState.flags, [cons.set_flag]: true };
                        if (cons.add_item && !newState.inventory.includes(cons.add_item)) {
                            newState.inventory = [...newState.inventory, cons.add_item];
                        }
                        return newState;
                    });
                }

                // 2. FILTER OPTIONS
                // JSON Loader pre-processes choices into 'choices', DB logic is similar.
                if (nodeData.choices && nodeData.choices.length > 0) {
                    nodeData.displayOptions = nodeData.choices.filter(opt => checkCondition(opt.condition));
                } else if (nodeData.next) {
                    nodeData.displayOptions = [{
                        label: 'Continuar', // Click to continue
                        nextNodeId: nodeData.next,
                        condition: null
                    }];
                } else {
                    nodeData.displayOptions = []; // Ending
                }

                setCurrentNode(nodeData);
            } else {
                setError(`Node ${nodeId} not found`);
            }
        } catch (err) {
            console.error("Error loading story node:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [storyState, storyNodes]);

    // Initialize
    useEffect(() => {
        // If startNodeId is provided (and it's not a JSON load call which handles itself), try to load.
        if (startNodeId && !currentNode) {
            goToNode(startNodeId);
        }
    }, [startNodeId]);

    const loadSeries = useCallback(async (seriesId) => {
        setLoading(true);
        try {
            const node = await repo.getStartNodeBySeries(seriesId);
            if (node) setCurrentNode(node);
            else setError("Could not load story start.");
        } catch (e) { setError(e.message); }
        setLoading(false);
    }, []);

    const loadJsonStory = useCallback(async (themeName) => {
        setLoading(true);
        try {
            const { nodes, startNodeId } = await loader.loadStory(themeName);
            setStoryNodes(nodes); // Store the entire graph
            goToNode(startNodeId); // Jump to start
        } catch (e) {
            setError(`Failed to load JSON story: ${e.message}`);
        } finally {
            // setLoading(false); // goToNode handles loading state
        }
    }, [goToNode]);

    return { currentNode, loading, error, goToNode, loadSeries, loadJsonStory, storyState };
}
