import { useState, useEffect, useCallback } from 'react';
import { create } from 'zustand';
import { StoryRepository } from '../services/StoryRepository';

const repo = new StoryRepository();

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
 */
export const useStoryEngine = (seriesId) => {
  const [currentNode, setCurrentNode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);

  // 1. Initialization
  useEffect(() => {
    if (!seriesId) return;

    const initStory = async () => {
      setLoading(true);
      try {
        // Try to load from saved progress first? (TODO for Offline Phase)
        // For now, load start node
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
          // Fetch node data (Logic)
          const nextNode = await repo.getNodeById(targetId);

          // Preload Image (Asset)
          if (nextNode && nextNode.image_url) {
            const img = new Image();
            img.src = nextNode.image_url; // Triggers browser cache
            console.log(`[StoryEngine] +1 Preloaded: ${targetId}`);
          }
        } catch (e) {
          console.warn(`[StoryEngine] Failed to preload ${targetId}`, e);
        }
      }
    });
  }, [currentNode]);

  // 3. Navigation
  const handleChoice = useCallback(async (targetNodeId) => {
    if (!targetNodeId) return;

    setLoading(true);
    try {
      const nextNode = await repo.getNodeById(targetNodeId);
      setCurrentNode(nextNode);
      setHistory(prev => [...prev, targetNodeId]);

      // TODO: Save progress to Supabase/Dexie here
    } catch (error) {
      console.error("Navigation failed:", error);
    } finally {
      setLoading(false);
    }
  }, []);

// 4. Rewind (Time Travel)
const rewindTo = useCallback(async (targetNodeId) => {
  const index = history.indexOf(targetNodeId);
  if (index === -1) {
    console.warn("[StoryEngine] Cannot rewind to unknown node:", targetNodeId);
    return;
  }

  if (targetNodeId === currentNode?.id) return; // Already here

  setLoading(true);
  try {
    const node = await repo.getNodeById(targetNodeId);
    setCurrentNode(node);
    // Truncate history to discard future
    setHistory(prev => prev.slice(0, index + 1));
    console.log(`[StoryEngine] Rewound time to: ${targetNodeId}`);
  } catch (error) {
    console.error("Rewind failed:", error);
  } finally {
    setLoading(false);
  }
}, [history, currentNode]);

return {
  currentNode,
  loading,
  handleChoice,
  history,
  rewindTo
};
};
