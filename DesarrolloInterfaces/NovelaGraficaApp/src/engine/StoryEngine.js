import { useState, useEffect, useCallback } from 'react';
import { create } from 'zustand';
import { StoryRepository } from '../services/StoryRepository';
import { StoryLoader } from '../services/StoryLoader';

const repo = new StoryRepository();
const loader = new StoryLoader();

// Global Game State (Inventory, Flags)
export const useGameStore = create((set) => ({
  inventory: [],
  flags: {},
  addItem: (item) => set((state) => ({ inventory: [...state.inventory, item] })),
  setFlag: (key, value) => set((state) => ({ flags: { ...state.flags, [key]: value } })),
}));

/**
 * useStoryEngine - The Central Brain
 * Handles:
 * 1. Node Navigation
 * 2. Data Fetching
 * 3. Pre-fetching (+1 Rule)
 * 4. History Tracking
 * 5. JSON Story Loading (NEW)
 */
export const useStoryEngine = (seriesId) => {
  const [currentNode, setCurrentNode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [storyNodes, setStoryNodes] = useState({}); // Local cache for JSON stories

  // 1. Initialization (Only for DB-based stories)
  useEffect(() => {
    // Skip init if this is a JSON story (handled by loadJsonStory)
    if (!seriesId || seriesId.startsWith('json:')) {
      setLoading(false); // Stop loading spinner for JSON, loadJsonStory will handle it
      return;
    }

    const initStory = async () => {
      setLoading(true);
      try {
        const startNode = await repo.getStartNodeBySeries(seriesId);
        if (startNode) {
          setCurrentNode(startNode);
          setHistory([startNode.id]);
        }
      } catch (error) {
        console.error("Failed to init story:", error);
      } finally {
        setLoading(false);
      }
    };

    initStory();
  }, [seriesId]);

  // 2. The "+1 Rule" (Pre-fetching)
  useEffect(() => {
    if (!currentNode || !currentNode.choices) return;

    currentNode.choices.forEach(async (choice) => {
      const targetId = choice.nextNodeId || choice.target;
      if (targetId) {
        try {
          // Check local cache first (for JSON stories)
          let nextNode = storyNodes[targetId];
          if (!nextNode) {
            nextNode = await repo.getNodeById(targetId);
          }

          if (nextNode && nextNode.image_url) {
            const img = new Image();
            img.src = nextNode.image_url;
            console.log(`[StoryEngine] +1 Preloaded: ${targetId}`);
          }
        } catch (e) {
          console.warn(`[StoryEngine] Failed to preload ${targetId}`, e);
        }
      }
    });
  }, [currentNode, storyNodes]);

  // 3. Navigation (Hybrid: JSON cache first, then DB)
  const handleChoice = useCallback(async (targetNodeId) => {
    if (!targetNodeId) return;

    setLoading(true);
    try {
      // Check local JSON cache first
      let nextNode = storyNodes[targetNodeId];

      // If not in cache, try DB
      if (!nextNode) {
        nextNode = await repo.getNodeById(targetNodeId);
      }

      if (nextNode) {
        setCurrentNode(nextNode);
        setHistory(prev => [...prev, targetNodeId]);
      } else {
        console.error(`Node ${targetNodeId} not found in cache or DB.`);
      }
    } catch (error) {
      console.error("Navigation failed:", error);
    } finally {
      setLoading(false);
    }
  }, [storyNodes]);

  // 4. Rewind (Time Travel)
  const rewindTo = useCallback(async (targetNodeId) => {
    const index = history.indexOf(targetNodeId);
    if (index === -1) {
      console.warn("[StoryEngine] Cannot rewind to unknown node:", targetNodeId);
      return;
    }

    if (targetNodeId === currentNode?.id) return;

    setLoading(true);
    try {
      let node = storyNodes[targetNodeId];
      if (!node) {
        node = await repo.getNodeById(targetNodeId);
      }
      setCurrentNode(node);
      setHistory(prev => prev.slice(0, index + 1));
      console.log(`[StoryEngine] Rewound time to: ${targetNodeId}`);
    } catch (error) {
      console.error("Rewind failed:", error);
    } finally {
      setLoading(false);
    }
  }, [history, currentNode, storyNodes]);

  // 5. JSON Story Loading (NEW)
  const loadJsonStory = useCallback(async (themeName) => {
    setLoading(true);
    try {
      const { nodes, startNodeId } = await loader.loadStory(themeName);
      setStoryNodes(nodes); // Store the entire graph locally

      // Set start node
      const startNode = nodes[startNodeId];
      if (startNode) {
        setCurrentNode(startNode);
        setHistory([startNodeId]);
        console.log(`[StoryEngine] Loaded JSON story: ${themeName}, start: ${startNodeId}`);
      } else {
        console.error(`Start node ${startNodeId} not found in loaded nodes.`);
      }
    } catch (e) {
      console.error(`[StoryEngine] Failed to load JSON story: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    currentNode,
    loading,
    handleChoice,
    history,
    rewindTo,
    loadJsonStory, // Export the new function
    storyNodes // Export the full graph for the Map
  };
};
