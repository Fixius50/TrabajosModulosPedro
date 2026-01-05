import { supabase } from './supabaseClient';
import localStoryData from '../data/story_demo.json';
import { getAssetUrl } from '../utils/assetUtils';

export class StoryRepository {

    constructor() {
        console.log("StoryRepository initialized. LocalData:", localStoryData);

        // Robust extraction
        let nodes = localStoryData.nodes;
        if (!nodes && localStoryData.default) {
            nodes = localStoryData.default.nodes;
        }

        // Hard fallback if import failed somehow
        if (!nodes) {
            console.warn("StoryRepository: JSON import failed or empty. Using HARDCODED fallback.");
            nodes = {
                "start": { "id": "start", "text": "Fallback Start", "next": "end" },
                "end": { "id": "end", "text": "Fallback End", "next": null }
            };
        }

        this.localNodes = nodes;
        this.remoteStories = {}; // Cache for fetched JSONs
    }

    /**
     * Helper to determine image URL from scene/panel in a generic way
     */
    _resolveRemoteImage(baseUrl, sceneId, panelId) {
        // Generic Heuristic:
        // scene_01 -> No prefix -> "1.jpg"
        // scene_02a_coin -> "02a" -> "A1.jpg"

        let prefix = "";
        const lowerId = sceneId.toLowerCase();

        // More robust checks for A/B/C branches
        // Prioritize explicit "02a", "02b" etc.
        if (lowerId.includes("02a") || lowerId.includes("_a_") || /_a$/.test(lowerId)) prefix = "A";
        else if (lowerId.includes("02b") || lowerId.includes("_b_") || /_b$/.test(lowerId)) prefix = "B";
        else if (lowerId.includes("02c") || lowerId.includes("_c_") || /_c$/.test(lowerId)) prefix = "C";

        // Ensure panelId is just the number
        return `${baseUrl}/${prefix}${panelId}.jpg`;
    }

    async _fetchRemoteStory(seriesTitle, coverUrl) {
        // Generic JSON URL construction
        let baseUrl;

        // Fix: If cover is remote (Supabase), FORCE local assets path for JSON
        if (coverUrl.startsWith('http') || coverUrl.includes('supabase')) {
            const folderMap = {
                'Rick and Morty': 'RickAndMorty',
                'Dungeons & Dragons': 'DnD',
                'DnD': 'DnD',
                'Batman': 'Batman',
                'Batman: Sombras': 'Batman',
                'BoBoBo': 'BoBoBo',
                'Neon Rain': 'NeonRain',
                'Cyberpunk: Neon Rain': 'NeonRain'
            };
            const slugFallback = seriesTitle.toLowerCase().trim().replace(/[^a-z0-9]+/g, '_');
            const folder = folderMap[seriesTitle] || slugFallback;
            baseUrl = `/assets/${folder}`;
            console.log(`[Repo] Remote Cover detected. Forcing local base URL: ${baseUrl}`);
        } else {
            baseUrl = coverUrl.substring(0, coverUrl.lastIndexOf('/'));
        }

        // Manual Mapping (Hardcoded Fixes for specific titles)
        const filenameMap = {
            'Rick and Morty': 'rnm',
            'Dungeons & Dragons': 'dnd',
            'DnD': 'dnd',
            'D&D': 'dnd',
            'Neon Rain': 'neon_rain',
            'Cyberpunk: Neon Rain': 'neon_rain',
            'Batman: Sombras': 'batman',
            'Batman': 'batman'
        };

        // Try strict slug first (batman -> batman.json), OR mapped value
        let slug = seriesTitle.toLowerCase().trim().replace(/[^a-z0-9]+/g, '_');

        // Override slug if in map
        if (filenameMap[seriesTitle]) {
            slug = filenameMap[seriesTitle];
        }

        const jsonUrl = `${baseUrl}/${slug}.json`;

        if (this.remoteStories[seriesTitle]) return this.remoteStories[seriesTitle];

        try {
            console.log(`[Repo] Fetching remote JSON: ${jsonUrl}`);
            let response = await fetch(jsonUrl);

            // Fallback to story.json if slug fails
            if (!response.ok && response.status === 404) {
                console.log("[Repo] Slug JSON not found. Trying 'story.json'...");
                const fallbackUrl = `${baseUrl}/story.json`;
                response = await fetch(fallbackUrl);
            }

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const data = await response.json();
            this.remoteStories[seriesTitle] = { data, baseUrl };
            return { data, baseUrl };
        } catch (e) {
            console.warn(`[Repo] Failed to fetch remote story JSON (${slug}.json or story.json):`, e);
            return null;
        }
    }

    _processRemoteNode(storyData, baseUrl, nodeId) {
        // NodeID format: [SceneID]__panel_[Index]
        let sceneId, panelIndex;

        if (nodeId === 'start') {
            sceneId = storyData.initial_scene_id;
            panelIndex = 0;
            // Rewrite ID for consistency
            nodeId = `${sceneId}__panel_0`;
        } else {
            const parts = nodeId.split('__panel_');
            sceneId = parts[0];
            panelIndex = parseInt(parts[1]);
        }

        const scene = storyData.scenes[sceneId];
        if (!scene) return null;

        const panel = scene.panels[panelIndex];
        if (!panel) return null;

        // Dialogue extraction
        const dialogueText = panel.dialogues ?
            panel.dialogues.map(d => `**${d.character}**: ${d.text}`).join('\n\n') :
            (panel.description || "...");

        const speaker = panel.dialogues?.[0]?.character || "Narrador";

        // Logic Priority:
        // 1. Explicit Panel Choices (allows branching mid-scene)
        // 2. Linear "Next Panel" (if not last)
        // 3. Scene-level Choices (at end of scene)
        // 4. End of Chapter

        let choices = [];
        const panelOptions = panel.options || panel.choices; // Support both naming conventions

        if (panelOptions && panelOptions.length > 0) {
            choices = panelOptions.map(opt => ({
                label: opt.text || opt.label,
                nextNodeId: opt.next_scene_id ? `${opt.next_scene_id}__panel_0` : null
            }));
        } else if ((panelIndex + 1) < scene.panels.length) {
            choices = [{
                label: "Siguiente",
                nextNodeId: `${sceneId}__panel_${panelIndex + 1}`
            }];
        } else {
            // End of Scene logic
            if (scene.choice_prompt) {
                choices = scene.choice_prompt.options.map(opt => ({
                    label: opt.text,
                    nextNodeId: `${opt.next_scene_id}__panel_0`
                }));
            } else if (scene.end_of_chapter_status) {
                choices = [{
                    label: "Terminar Capítulo",
                    nextNodeId: null, // Signals engine to exit
                    action: 'EXIT'
                }];
            }
        }

        return {
            id: nodeId,
            image_url: this._resolveRemoteImage(baseUrl, sceneId, panel.panel_id),
            dialogue_content: dialogueText,
            speaker_name: speaker,
            choices: choices,
            fx_config: null
        };
    }

    /**
     * Get a complete node by ID (including dialogues and choices)
     * Supports Supabase (Online), Remote JSON (Storage), and Local (Offline)
     */
    async getStartNodeBySeries(seriesId) {
        console.log(`[Repo] getStartNodeBySeries called for: ${seriesId}`);
        // Fallback: If not Supabase, or ID is legacy '1'/'2', or short string -> Load local 'start'
        if (!supabase || seriesId === '1' || (seriesId && seriesId.length < 20)) {
            console.log("[Repo] Using local fallback for seriesId:", seriesId);
            return this._getLocalNode('start');
        }

        try {
            // 1. Fetch Series Info (Need Title/CoverURL for Remote JSON guess)
            const { data: series } = await supabase.from('series').select('title, cover_url').eq('id', seriesId).single();

            // 2. Try DB Chapter
            const { data: chapter, error: chapterError } = await supabase
                .from('chapters')
                .select('*')
                .eq('series_id', seriesId)
                .order('order_index', { ascending: true })
                .limit(1)
                .maybeSingle();

            // === A. INTERACTIVE NODES (DB) ===
            if (chapter) {
                let node = null;
                try {
                    const { data, error } = await supabase
                        .from('story_nodes')
                        .select('id')
                        .eq('chapter_id', chapter.id)
                        .order('created_at', { ascending: true })
                        .limit(1)
                        .maybeSingle();

                    if (!error && data) {
                        node = data;
                    }
                } catch (innerErr) {
                    console.warn("Check for interactive nodes failed:", innerErr);
                }

                if (node) {
                    console.log("Found interactive start node (DB):", node.id);
                    return this.getNodeById(node.id);
                }
            }

            // === B. REMOTE JSON (NEW FALLBACK) ===
            // If DB failed or had no content, try remote JSON
            if (series) {
                console.log("[Repo] Trying Remote JSON fallback...");
                const remote = await this._fetchRemoteStory(series.title, series.cover_url);
                if (remote) {
                    console.log("[Repo] Found remote story!", remote.baseUrl);
                    return this._processRemoteNode(remote.data, remote.baseUrl, 'start');
                }
            }

            // === C. LINEAR PAGES (OLD FALLBACK) ===
            if (chapter && chapter.pages && Array.isArray(chapter.pages) && chapter.pages.length > 0) {
                console.log(`[Repo] Generating linear nodes for Chapter ${chapter.id}`);
                return this._generateLinearNode(chapter, 0);
            }

            // === D. FINAL ESCAPE ===
            return {
                id: 'error_no_chapter',
                image_url: 'https://placehold.co/600x400/black/red?text=Historia+No+Encontrada',
                dialogue_content: "No se encontró historia en DB ni JSON remoto. Intenta recargar.",
                speaker_name: "Sistema",
                choices: [{ label: "Volver", nextNodeId: null }],
                fx_config: null
            };

        } catch (err) {
            console.error("Start node fetch failed:", err);
            return null;
        }
    }

    _generateLinearNode(chapter, pageIndex) {
        const totalPages = chapter.pages.length;
        const isLastPage = pageIndex >= totalPages - 1;
        const currentImage = getAssetUrl(chapter.pages[pageIndex]);
        const nodeId = `virtual_${chapter.id}_${pageIndex}`;

        return {
            id: nodeId,
            image_url: currentImage,
            dialogue_content: "",
            speaker_name: "",
            choices: [{
                label: isLastPage ? "Terminar Capítulo" : "Siguiente",
                nextNodeId: isLastPage ? null : `virtual_${chapter.id}_${pageIndex + 1}`
            }],
            fx_config: null
        };
    }

    // Override getNodeById to intercept virtual IDs
    async getNodeById(nodeId) {
        if (typeof nodeId === 'string') {
            // A. Linear Virtual ID
            if (nodeId.startsWith('virtual_')) {
                const parts = nodeId.split('_');
                const chapterId = parts[1];
                const pageIndex = parseInt(parts[2]);
                const { data: chapter } = await supabase.from('chapters').select('*').eq('id', chapterId).single();
                if (chapter) return this._generateLinearNode(chapter, pageIndex);
            }

            // B. Remote JSON ID or 'start'
            if (nodeId === 'start') {
                // Trying to resolve 'start' in remote context... tough without series context.
                // But wait, getStartNode calls this with data.initial_scene_id, NOT 'start'.
                // If 'start' is passed here, check all loaded remotes?
                for (const key in this.remoteStories) {
                    const { data, baseUrl } = this.remoteStories[key];
                    if (data.initial_scene_id) return this._processRemoteNode(data, baseUrl, 'start');
                }
            }

            // Check Remotes for Scene ID matches
            for (const key in this.remoteStories) {
                const { data, baseUrl } = this.remoteStories[key];
                if (nodeId.includes('__panel_')) {
                    const sceneId = nodeId.split('__panel_')[0];
                    if (data.scenes && data.scenes[sceneId]) {
                        return this._processRemoteNode(data, baseUrl, nodeId);
                    }
                }
            }
        }

        if (supabase) {
            try {
                // Complex query: Node + Dialogues + Choices
                const { data, error } = await supabase
                    .from('story_nodes')
                    .select(`*, dialogues ( speaker_name, content, style_override ), story_choices!from_node_id ( to_node_id, label, condition_logic )`)
                    .eq('id', nodeId)
                    .single();

                if (error) throw error;
                if (data) return this._transformSupabaseNode(data);
            } catch (error) {
                console.warn("Supabase fetch failed/skipped. Using local fallback.", error.message);
            }
        }

        // Fallback Logic
        return this._getLocalNode(nodeId);
    }

    _getLocalNode(id) {
        const node = this.localNodes[id];
        if (!node) return null;

        return {
            id: node.id,
            image_url: getAssetUrl(node.image),
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
            image_url: getAssetUrl(data.image_url),
            dialogue_content: data.dialogues?.[0]?.content || "...",
            speaker_name: data.dialogues?.[0]?.speaker_name || "",
            choices: data.story_choices?.map(c => ({
                label: c.label,
                nextNodeId: c.to_node_id
            })) || [],
            fx_config: data.fx_config
        };
    }

    async getAllNodesBySeries(seriesId) {
        if (!supabase || seriesId === '1' || (seriesId && seriesId.length < 20)) {
            if (!this.localNodes) return [];
            return Object.values(this.localNodes).map(n => ({
                id: n.id,
                label: n.id === 'start' ? 'Inicio' : 'Escena',
                type: n.options?.length ? 'decision' : (n.end_id ? 'ending' : 'normal'),
                children: n.options?.map(o => o.target) || (n.next ? [n.next] : [])
            }));
        }

        try {
            // 1. Try fetching from Database first
            const { data: chapters } = await supabase.from('chapters').select('id').eq('series_id', seriesId);

            if (chapters && chapters.length > 0) {
                const chapterIds = chapters.map(c => c.id);
                const { data: nodes, error } = await supabase
                    .from('story_nodes')
                    .select(`id, story_choices ( to_node_id )`)
                    .in('chapter_id', chapterIds);

                if (!error && nodes && nodes.length > 0) {
                    return nodes.map(n => ({
                        id: n.id,
                        label: 'Escena',
                        children: n.story_choices?.map(c => c.to_node_id) || []
                    }));
                }
            }

            // 2. Fallback: Remote JSON (like getStartNodeBySeries)
            console.log("[Repo] No DB nodes found for Map. Trying Remote JSON fallback...");
            const { data: series } = await supabase.from('series').select('title, cover_url').eq('id', seriesId).single();

            if (series) {
                // FALLBACK: Use title mapping here too, just like _fetchRemoteStory needs it
                // We rely on _fetchRemoteStory to handle the mapping, but we pass the raw DB title.
                // If DB title is "Batman: Sombras", _fetchRemoteStory needs to map it to "batman" (we added this above).

                const remote = await this._fetchRemoteStory(series.title, series.cover_url);
                if (remote && remote.data) {
                    console.log("[Repo] Generating Map from Remote JSON...");
                    return this._generateMapFromRemoteJson(remote.data);
                } else {
                    console.warn(`[Repo] Failed to load remote JSON for map for title: ${series.title}`);
                }
            }

            // 3. Last Result: Local Fallback
            return Object.values(this.localNodes).map(n => ({
                id: n.id,
                label: n.id === 'start' ? 'Inicio' : 'Escena',
                type: n.options?.length ? 'decision' : (n.end_id ? 'ending' : 'normal'),
                children: n.options?.map(o => o.target) || (n.next ? [n.next] : [])
            }));

        } catch (error) {
            console.error("Error fetching all nodes for map:", error);
            return [];
        }
    }

    _generateMapFromRemoteJson(data) {
        const nodes = [];
        const seen = new Set();

        // Helper to process a scene/panel
        const processScene = (sceneId, sceneData) => {
            if (!sceneData.panels) return;

            sceneData.panels.forEach((panel, index) => {
                const isLastPanel = index === sceneData.panels.length - 1;
                const nodeId = `${sceneId}__panel_${index}`;

                if (seen.has(nodeId)) return;
                seen.add(nodeId);

                const children = [];

                if (panel.options && panel.options.length > 0) {
                    // Explicit Options
                    panel.options.forEach(opt => {
                        if (opt.next_scene_id) {
                            children.push(`${opt.next_scene_id}__panel_0`);
                        }
                    });
                } else if (!isLastPanel) {
                    // Linear Next Panel
                    children.push(`${sceneId}__panel_${index + 1}`);
                } else {
                    // End of Scene logic
                    if (sceneData.choice_prompt) {
                        sceneData.choice_prompt.options.forEach(opt => {
                            children.push(`${opt.next_scene_id}__panel_0`);
                        });
                    } else if (sceneData.end_of_chapter_status) {
                        // End node, no children
                    }
                }

                nodes.push({
                    id: nodeId,
                    label: index === 0 ? `Escena ${sceneId}` : `Panel ${index}`,
                    children: children
                });
            });
        };

        if (data.scenes) {
            Object.keys(data.scenes).forEach(sceneId => {
                processScene(sceneId, data.scenes[sceneId]);
            });
        }

        return nodes;
    }
}
