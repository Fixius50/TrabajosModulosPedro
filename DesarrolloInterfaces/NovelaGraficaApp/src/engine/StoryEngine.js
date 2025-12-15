import { userProgress } from '../stores/userProgress';

// ... (existing imports)

export const useStoryEngine = (seriesId) => {
  // ... (existing state)

  // 1. Initialization (DB)
  useEffect(() => {
    if (!seriesId || seriesId.startsWith('json:')) {
      setLoading(false);
      return;
    }

    const initStory = async () => {
      setLoading(true);
      try {
        const startNode = await repo.getStartNodeBySeries(seriesId);
        if (startNode) {
          setCurrentNode(startNode);
          setHistory([startNode.id]);
          // NEW: Start Session
          userProgress.startSession(seriesId);
          userProgress.visitNode(seriesId, startNode.id);
        }
      } catch (error) {
        console.error("Failed to init story:", error);
      } finally {
        setLoading(false);
      }
    };

    initStory();
  }, [seriesId]);

  // ... (Pre-fetching effect unchanged)

  // 3. Navigation
  const handleChoice = useCallback(async (targetNodeId) => {
    if (!targetNodeId) return;

    setLoading(true);
    try {
      let nextNode = storyNodes[targetNodeId];
      if (!nextNode) {
        nextNode = await repo.getNodeById(targetNodeId);
      }

      if (nextNode) {
        setCurrentNode(nextNode);
        setHistory(prev => [...prev, targetNodeId]);

        // NEW: Track Progress
        userProgress.visitNode(seriesId, targetNodeId);

        // Detect Ending (No choices or EXIT action in all choices? Or specific flag?)
        // Assuming leaf node = ending for now, or check for specific type
        const isEnding = !nextNode.choices || nextNode.choices.length === 0 || nextNode.choices.every(c => c.action === 'EXIT');

        if (isEnding) {
          // Calculate totals for bonus
          const totalNodes = Object.keys(storyNodes).length || 0;
          // Count endings in JSON (approximate: nodes with no choices or is_ending=true)
          const totalEndings = Object.values(storyNodes).filter(n => !n.choices || n.choices.length === 0 || n.is_ending).length || 1;

          userProgress.reachEnding(seriesId, targetNodeId, totalEndings, totalNodes);
        }

      } else {
        console.error(`Node ${targetNodeId} not found in cache or DB.`);
      }
    } catch (error) {
      console.error("Navigation failed:", error);
    } finally {
      setLoading(false);
    }
  }, [storyNodes, seriesId]);

  // ... (Rewind unchanged)

  // 5. JSON Story Loading
  const loadJsonStory = useCallback(async (themeName) => {
    setLoading(true);
    try {
      const { nodes, startNodeId } = await loader.loadStory(themeName);
      setStoryNodes(nodes);

      const startNode = nodes[startNodeId];
      if (startNode) {
        setCurrentNode(startNode);
        setHistory([startNodeId]);

        // NEW: Start Session
        userProgress.startSession(seriesId);
        userProgress.visitNode(seriesId, startNodeId);

      } else {
        console.error(`Start node ${startNodeId} not found.`);
      }
    } catch (e) {
      console.error(`[StoryEngine] Failed to load JSON story: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }, [seriesId]);

  return {
    currentNode,
    loading,
    handleChoice,
    history,
    rewindTo,
    loadJsonStory,
    storyNodes
  };
};
