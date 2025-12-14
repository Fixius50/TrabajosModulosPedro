import { supabase } from './supabaseClient';
import localStoryData from '../data/story_demo.json';

export class StoryRepository {

    constructor() {
        console.log("StoryRepository initialized. LocalData:", localStoryData);
        this.localNodes = localStoryData.nodes || (localStoryData.default && localStoryData.default.nodes); // Handle Vite JSON import variations
    }

    /**
     * Get a complete node by ID (including dialogues and choices)
     * Supports both Supabase (Online) and Local JSON (Offline/Fallback)
     */
    async getNodeById(nodeId) {
        if (supabase) {
            try {
                console.log(`Fetching node ${nodeId} from Supabase...`);

                // Complex query: Node + Dialogues + Choices
                const { data, error } = await supabase
                    .from('story_nodes')
                    .select(`
            *,
            dialogues ( speaker_name, content, style_override ),
            story_choices!from_node_id ( to_node_id, label, condition_logic )
          `)
                    .eq('id', nodeId) // Note: In DB we use UUIDs, in JSON we used strings ('start'). This might mismatch if not careful.
                    // For Hybrid capability, we might need a mapping or strict UUID usage.
                    // However, the Seed Script uses RETURNING ID, so real IDs are UUIDs.
                    // The JSON uses string IDs. 
                    // This creates a divergence.
                    // FIX: If ID is not UUID (like 'start'), force Fallback immediately.
                    .single();

                if (error) {
                    // If error is code 'PGRST116' (row not found) it might mean asking for 'start' vs uuid
                    console.warn("Supabase fetch warning:", error.message);
                    throw error;
                }

                if (data) {
                    return this._transformSupabaseNode(data);
                }
            } catch (error) {
                console.warn("Supabase fetch failed/skipped. Using local fallback.", error.message);
            }
        }

        // Fallback Logic
        return this._getLocalNode(nodeId);
    }

    _getLocalNode(id) {
        // Local JSON structure handling
        const node = this.localNodes[id];
        if (!node) {
            // Try mapping 'start' to the actual first key if needed, or return null
            return null;
        }

        // Normalize to match the structure returned by _transformSupabaseNode
        return {
            id: node.id,
            image_url: node.image,
            // In local JSON, text is a string, not separated dialogues. We map it to 1 dialogue.
            dialogue_content: node.text,
            speaker_name: "Narrator",
            choices: this._mapOptionsInternal(node),
            fx_config: null
        };
    }

    _mapOptionsInternal(node) {
        if (node.options && node.options.length > 0) {
            return node.options.map(opt => ({
                label: opt.label,
                nextNodeId: opt.target
            }));
        }

        // If no options but 'next' exists, it's a linear transition (Continue button)
        if (node.next) {
            return [{
                label: "Continuar",
                nextNodeId: node.next
            }];
        }

        return [];
    }

    _transformSupabaseNode(data) {
        return {
            id: data.id,
            image_url: data.image_url,
            // Take first dialogue or join them
            dialogue_content: data.dialogues?.[0]?.content || "...",
            speaker_name: data.dialogues?.[0]?.speaker_name || "",
            choices: data.story_choices?.map(c => ({
                label: c.label,
                nextNodeId: c.to_node_id
            })) || [],
            fx_config: data.fx_config
        };
    }

    async getStartNodeBySeries(seriesId) {
        // Fallback: If not Supabase, or ID is legacy '1'/'2', or short string -> Load local 'start'
        if (!supabase || seriesId === '1' || (seriesId && seriesId.length < 20)) {
            console.log("Using local fallback for seriesId:", seriesId);
            return this._getLocalNode('start');
        }

        try {
            const { data: chapter, error: chapterError } = await supabase
                .from('chapters')
                .select('id')
                .eq('series_id', seriesId)
                .eq('order_index', 1)
                .single();

            if (chapterError || !chapter) {
                console.warn("No chapter found for series", seriesId);
                return null;
            }

            const { data: node, error: nodeError } = await supabase
                .from('story_nodes')
                .select('id')
                .eq('chapter_id', chapter.id)
                .order('created_at', { ascending: true })
                .limit(1)
                .single();

            if (nodeError || !node) throw nodeError || new Error("No nodes");

            return this.getNodeById(node.id);

        } catch (err) {
            console.error("Start node fetch failed:", err);
            return null;
        }
    }

    /**
     * Get ALL nodes for a series (for Route Map)
     */
    async getAllNodesBySeries(seriesId) {
        // Fallback for demo
        if (!supabase || seriesId === '1' || (seriesId && seriesId.length < 20)) {
            console.log("Repo: Using local nodes for map. LocalNodes:", this.localNodes);
            if (!this.localNodes) return [];
            // Local fallback: Convert object to array
            return Object.values(this.localNodes).map(n => ({
                id: n.id,
                label: n.id === 'start' ? 'Inicio' : 'Escena',
                type: n.options?.length ? 'decision' : (n.end_id ? 'ending' : 'normal'),
                children: n.options?.map(o => o.target) || (n.next ? [n.next] : [])
            }));
        }

        try {
            // 1. Get Chapter(s)
            const { data: chapters } = await supabase
                .from('chapters')
                .select('id')
                .eq('series_id', seriesId);

            if (!chapters || chapters.length === 0) return [];

            // 2. Get Nodes
            const chapterIds = chapters.map(c => c.id);
            const { data: nodes } = await supabase
                .from('story_nodes')
                .select(`
                    id, 
                    story_choices ( to_node_id )
                `)
                .in('chapter_id', chapterIds);

            // 3. Map to simple tree format
            return nodes.map(n => ({
                id: n.id,
                label: 'Escena', // Can't easily get label without content analysis
                children: n.story_choices?.map(c => c.to_node_id) || []
            }));

        } catch (error) {
            console.error("Error fetching all nodes:", error);
            return [];
        }
    }
}
