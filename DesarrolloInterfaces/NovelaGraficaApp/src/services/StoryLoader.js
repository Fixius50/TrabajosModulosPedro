import { supabase } from './supabaseClient';

const SUPABASE_PROJECT_URL = import.meta.env.VITE_SUPABASE_URL;
const STORAGE_BUCKET = 'novel-assets';

export class StoryLoader {
    constructor() {
        this.cache = {};
    }

    /**
     * Tries to load the story JSON from Cloud first, then falls back to local.
     */
    async loadStory(themeName) {
        // Filename mapping
        let filename = themeName.toLowerCase();
        if (themeName === 'RickAndMorty') filename = 'rnm';

        const jsonFileName = `${filename}.json`;
        const relativePath = `${themeName}/${jsonFileName}`;

        // 1. Construct Cloud URL
        // https://[PROJECT].supabase.co/storage/v1/object/public/[BUCKET]/[PATH]
        const cloudUrl = `${SUPABASE_PROJECT_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${relativePath}`;
        const localPath = `/assets/${themeName}/${filename}.json`;

        try {
            console.log(`[StoryLoader] Attempting cloud load: ${cloudUrl}`);
            const response = await fetch(cloudUrl);

            if (response.ok) {
                const data = await response.json();
                console.log(`[StoryLoader] Cloud load success for ${themeName}`);
                return this.processStoryData(data, themeName, true); // true = isCloud
            } else {
                throw new Error("Cloud load failed");
            }

        } catch (cloudError) {
            console.warn(`[StoryLoader] Cloud failed (${cloudError.message}). Falling back to local: ${localPath}`);
            try {
                const response = await fetch(localPath);
                if (!response.ok) throw new Error(`Failed to load story for ${themeName} at ${localPath}`);

                const data = await response.json();
                return this.processStoryData(data, themeName, false); // false = local
            } catch (localError) {
                console.error("StoryLoader Error:", localError);
                throw localError;
            }
        }
    }

    processStoryData(data, themeName, isCloud) {
        // Flatten Scenes -> Panels into Nodes
        const nodes = {};
        const scenes = data.scenes;
        const initialSceneId = data.initial_scene_id;

        // Determine Root URL for Images
        let rootUrl;
        if (isCloud) {
            rootUrl = `${SUPABASE_PROJECT_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${themeName}`;
        } else {
            rootUrl = `/assets/${themeName}`;
        }

        // Better Approach: Flatten by Dialogue Line
        // Each dialogue line is a "Step".
        Object.values(scenes).forEach(scene => {
            const panels = scene.panels || [];
            const lowerId = scene.id.toLowerCase();

            let imgPrefix = "";
            // Robust heuristic for branches (matching StoryRepository)
            if (lowerId.includes("02a") || lowerId.includes("_a_") || /_a$/.test(lowerId)) imgPrefix = "A";
            else if (lowerId.includes("02b") || lowerId.includes("_b_") || /_b$/.test(lowerId)) imgPrefix = "B";
            else if (lowerId.includes("02c") || lowerId.includes("_c_") || /_c$/.test(lowerId)) imgPrefix = "C";

            panels.forEach((panel, pIndex) => {
                let dialogues = panel.dialogues;
                if (!dialogues || dialogues.length === 0) {
                    const desc = panel.description || "...";
                    dialogues = [{ character: "", text: desc }];
                }

                dialogues.forEach((dial, dIndex) => {
                    const uniqueId = `${scene.id}_p${panel.panel_id}_d${dIndex}`;
                    const nextDial = dialogues[dIndex + 1];
                    const nextPanel = panels[pIndex + 1];

                    // Determine Next Node ID
                    let nextNodeId = null;
                    let choices = null;

                    if (nextDial) {
                        // Go to next dialogue in same panel
                        nextNodeId = `${scene.id}_p${panel.panel_id}_d${dIndex + 1}`;
                    } else {
                        // Last dialogue of the panel. Check for interactions.

                        // 1. Panel Level Choices (Priority)
                        const panelOptions = panel.options || panel.choices;
                        if (panelOptions && panelOptions.length > 0) {
                            choices = panelOptions.map(opt => {
                                // Resolve target: assume next_scene_id points to start of that scene
                                let targetId = null;
                                if (opt.next_scene_id) {
                                    // Try to find first panel of target scene to build correct ID
                                    const targetScene = scenes[opt.next_scene_id];
                                    const firstPanelId = targetScene?.panels?.[0]?.panel_id || 1;
                                    targetId = `${opt.next_scene_id}_p${firstPanelId}_d0`;
                                }

                                return {
                                    label: opt.text || opt.label,
                                    nextNodeId: targetId,
                                    condition: null
                                };
                            });
                        }
                        // 2. Linear Next Panel
                        else if (nextPanel) {
                            nextNodeId = `${scene.id}_p${nextPanel.panel_id}_d0`;
                        }
                        // 3. End of Scene Logic
                        else {
                            if (scene.choice_prompt) {
                                choices = scene.choice_prompt.options.map(opt => {
                                    const targetScene = scenes[opt.next_scene_id];
                                    const firstPanelId = targetScene?.panels?.[0]?.panel_id || 1;
                                    return {
                                        label: opt.text,
                                        nextNodeId: `${opt.next_scene_id}_p${firstPanelId}_d0`,
                                        condition: null
                                    };
                                });
                                // Append Prompt Text to Dialogue
                                if (scene.choice_prompt.text) {
                                    dial.text += `\n\n${scene.choice_prompt.text}`;
                                }
                            } else if (scene.end_of_chapter_status) {
                                choices = [{
                                    label: "Terminar Capítulo",
                                    nextNodeId: null,
                                    action: 'EXIT',
                                    style: "bottom-center"
                                }];
                            }
                        }
                    }

                    // Image Logic
                    const imgName = `${imgPrefix}${panel.panel_id}.jpg`;

                    // Calculate children for Tree Layout
                    const children = [];
                    if (nextNodeId) children.push(nextNodeId);
                    if (choices) choices.forEach(c => {
                        if (c.nextNodeId) children.push(c.nextNodeId);
                    });

                    nodes[uniqueId] = {
                        id: uniqueId,
                        image_url: `${rootUrl}/${imgName}`,
                        text: dial.text, // Mapped to 'text' for VisualNovelCanvas compatibility
                        speaker_name: dial.character,
                        choices: choices,
                        next: nextNodeId, // Helper for lineal flow
                        children: children, // REQUIRED for DestinyTreeModal layout
                        is_json: true
                    };

                });
            });
        });


        // Find true start node
        const firstScene = scenes[initialSceneId];
        const startNodeId = `${initialSceneId}_p${firstScene.panels[0].panel_id}_d0`;

        // INJECTION: "To Be Continued" Screen
        const toBeContinuedNodeId = 'global_to_be_continued';
        const tbcImgUrl = `${rootUrl.split('/').slice(0, -1).join('/')}/common/to_be_continued.jpg`;
        // Logic: Try to access ../common from current rootUrl. 
        // Ideally, we construct it properly.
        // Cloud: .../novel-assets/theme -> .../novel-assets/common/to_be_continued.jpg? 
        // Actually, let's look at rootUrl. 
        // Local: /assets/themeName -> /assets/common/to_be_continued.jpg
        // Cloud: .../objects/public/novel-assets/themeName -> .../novel-assets/common/to_be_continued.jpg

        let tbcUrl = '/assets/common/to_be_continued.jpg'; // Default Local
        if (isCloud) {
            // https://[...]/novel-assets/ThemeName
            // We want https://[...]/novel-assets/common/to_be_continued.jpg
            const baseUrl = rootUrl.substring(0, rootUrl.lastIndexOf('/'));
            tbcUrl = `${baseUrl}/common/to_be_continued.jpg`;
        }

        // Add the TBC Node
        nodes[toBeContinuedNodeId] = {
            id: toBeContinuedNodeId,
            image_url: tbcUrl,
            text: "", // Remove text to keep it clean cinematic
            speaker_name: null,
            layout: 'contain', // Custom property for UI to handle image sizing
            choices: [
                {
                    label: "Volver al Menú",
                    nextNodeId: null,
                    action: "EXIT", // Custom action for engine
                    style: "bottom-center" // Custom hint for button placement
                }
            ],
            next: null,
            children: [],
            is_json: true
        };

        // Connect all "Leaf" nodes (Endings) to this node
        Object.values(nodes).forEach(node => {
            if (node.id === toBeContinuedNodeId) return;

            // Definition of Leaf: No 'next' AND (No 'choices' OR empty choices)
            const isLeaf = !node.next && (!node.choices || node.choices.length === 0);

            // Also check if choices lead to valid nodes. Sometimes logic is complex.
            // But strict leaf is safer.

            if (isLeaf) {
                // Append a "Continue" choice or set next
                node.next = toBeContinuedNodeId;
                // If it had empty choices array, clear it or ensure Engine follows 'next'
                node.choices = [
                    { label: "Continuar...", nextNodeId: toBeContinuedNodeId }
                ];
                node.children.push(toBeContinuedNodeId);
            }
        });

        return { nodes, startNodeId };
    }
}

