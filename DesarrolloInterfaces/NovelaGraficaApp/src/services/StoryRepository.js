import { supabase } from './supabaseClient';
import localStoryData from '../data/story_demo.json';

export class StoryRepository {

    constructor() {
        this.localNodes = localStoryData.nodes; // For fallback
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
            story_choices ( to_node_id, label, condition_logic )
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
}
