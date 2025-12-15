
export class StoryLoader {
    constructor() {
        this.cache = {};
    }

    async loadStory(themeName) {
        // Filename mapping
        let filename = themeName.toLowerCase();
        if (themeName === 'RickAndMorty') filename = 'rnm';

        const jsonPath = `/assets/${themeName}/${filename}.json`;

        try {
            const response = await fetch(jsonPath);
            if (!response.ok) throw new Error(`Failed to load story for ${themeName} at ${jsonPath}`);

            const data = await response.json();
            return this.processStoryData(data, themeName);
        } catch (error) {
            console.error("StoryLoader Error:", error);
            throw error;
        }
    }

    processStoryData(data, themeName) {
        // Flatten Scenes -> Panels into Nodes
        const nodes = {};
        const scenes = data.scenes;
        const initialSceneId = data.initial_scene_id;
        const rootUrl = `/assets/${themeName}`;

        Object.values(scenes).forEach(scene => {
            const panels = scene.panels || [];

            // Heuristic for Image Filenames
            // scene_01... -> "1"
            // scene_02a... -> "A"
            // scene_02b... -> "B"
            let imgPrefix = "";
            if (scene.id.includes("01")) imgPrefix = ""; // 1.jpg is essentially 1. But wait, if files are 1.jpg, 2.jpg...
            // Let's look at the known files: 1.jpg, 2.jpg, A1.jpg, A2.jpg, B1.jpg, B2.jpg
            // Scene 01 Panels: 1 -> 1.jpg, 2 -> 2.jpg, 3 -> 2.jpg (reuse?)
            // Scene 02a Panels: 1 -> A1.jpg, 2 -> A2.jpg
            // Scene 02b Panels: 1 -> B1.jpg, 2 -> B2.jpg

            if (scene.id.includes("scene_02a")) imgPrefix = "A";
            else if (scene.id.includes("scene_02b")) imgPrefix = "B";
            else if (scene.id.includes("scene_01")) imgPrefix = "";

            panels.forEach((panel, index) => {
                const nodeId = `${scene.id}_panel_${panel.panel_id}`;
                const isLastPanel = index === panels.length - 1;

                // Image Logic
                // If prefix is empty (Scene 1), we use PanelID directly? 1.jpg, 2.jpg.
                // If prefix is A, we usage A + PanelID. A1.jpg.
                const imgName = `${imgPrefix}${panel.panel_id}.jpg`;
                const imageUrl = `${rootUrl}/${imgName}`;

                // Construct Node
                const node = {
                    id: nodeId,
                    type: 'panel',
                    image_url: imageUrl,
                    speaker_name: panel.dialogues?.[0]?.character || '', // Taking first speaker for simplicity or UI handles array?
                    // The UI currently handles one speaker/content. We might need to support multiple lines per panel step?
                    // Or we treat each dialogue line as a node step?
                    // User said: "reimagines las fotos añadiendoles los dialogos".
                    // The JSON has multiple dialogues per panel.
                    // To handle this in "Visual Novel" style, usually you stay on the same image and click to advance text.
                    // So we should generate SUB-NODES for each dialogue line?
                    // YES.
                };

                // Actually, let's create a node per DIALOGUE line to allow clicking through.
                // Re-doing the loop.
            });
        });

        // Better Approach: Flatten by Dialogue Line
        // Each dialogue line is a "Step".
        Object.values(scenes).forEach(scene => {
            const panels = scene.panels || [];

            let imgPrefix = "";
            // Flexible heuristic: detect branch indicators like 02a, 02b, _a_, _b_ etc.
            if (scene.id.includes("02a") || scene.id.includes("_a_")) imgPrefix = "A";
            else if (scene.id.includes("02b") || scene.id.includes("_b_")) imgPrefix = "B";
            else if (scene.id.includes("02c") || scene.id.includes("_c_")) imgPrefix = "C";
            // Else: no prefix (linear scenes like scene_01)

            panels.forEach((panel, pIndex) => {
                const dialogues = panel.dialogues || [{ character: '', text: '...' }];

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
                    } else if (nextPanel) {
                        // Go to next panel/image
                        nextNodeId = `${scene.id}_p${nextPanel.panel_id}_d0`;
                    } else {
                        // End of Scene -> Show Choices or Next Scene
                        if (scene.choice_prompt) {
                            choices = scene.choice_prompt.options.map(opt => ({
                                label: opt.text,
                                nextNodeId: `${opt.next_scene_id}_p1_d0`, // Jump to first dialogue of next scene
                                condition: null
                            }));
                        } else if (scene.end_of_chapter_status) {
                            // End logic
                            choices = []; // Or specific end node
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
                    console.log(`[StoryLoader] Generated Node: ${uniqueId}, Children: ${children.length}`);
                });
            });
        });

        // Find true start node
        const firstScene = scenes[initialSceneId];
        const startNodeId = `${initialSceneId}_p${firstScene.panels[0].panel_id}_d0`;

        return { nodes, startNodeId };
    }
}
