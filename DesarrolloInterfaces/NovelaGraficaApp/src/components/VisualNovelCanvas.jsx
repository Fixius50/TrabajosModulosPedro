import { useEffect, useRef, useState } from 'react';
import { Application, Assets, Sprite, ColorMatrixFilter, Container, Graphics } from 'pixi.js';
import { Typewriter } from './Typewriter';
import { StoryRepository } from '../services/StoryRepository';

export function VisualNovelCanvas({ currentNode, userPreferences = {}, onTypingComplete }) {
    const canvasRef = useRef(null);
    const appRef = useRef(null);
    const spriteRef = useRef(null);
    const fadeRef = useRef(null);

    // State for image loading status (Backbone Req: Asset Resolver)
    const [imageStatus, setImageStatus] = useState('LOADING'); // LOADING | LOADED | ERROR

    // 1. INITIALIZE PIXIJS
    useEffect(() => {
        if (appRef.current) return;

        const initPixi = async () => {
            const app = new Application();
            await app.init({
                width: 800,
                height: 600,
                backgroundColor: '#000000',
                preference: 'webgl',
            });

            if (canvasRef.current) {
                canvasRef.current.appendChild(app.canvas);
            }
            appRef.current = app;

            // Container
            const sceneContainer = new Container();
            app.stage.addChild(sceneContainer);

            // Sprite
            const sprite = new Sprite();
            sprite.anchor.set(0.5);
            sprite.x = app.screen.width / 2;
            sprite.y = app.screen.height / 2;
            sceneContainer.addChild(sprite);
            spriteRef.current = sprite;

            // Fade Overlay
            const fade = new Graphics();
            fade.rect(0, 0, app.screen.width, app.screen.height);
            fade.fill({ color: 0x000000, alpha: 1 });
            app.stage.addChild(fade);
            fadeRef.current = fade;
        };
        initPixi();

        return () => {
            if (appRef.current) {
                appRef.current.destroy(true, { children: true, texture: true });
                appRef.current = null;
                spriteRef.current = null;
                fadeRef.current = null;
            }
        };
    }, []);

    // 2. SCENE ORCHESTRATOR
    useEffect(() => {
        if (!appRef.current || !currentNode || !spriteRef.current || !fadeRef.current) return;

        // Reset typing status on node change
        // We assume the parent hides buttons initially when node changes

        // ASSET RESOLVER: Determine Path
        const bgPath = currentNode.data?.background_image || currentNode.background_image || currentNode.image_url;

        const updateScene = async () => {
            // A. FADE OUT
            let alpha = 0;
            const fadeOutTicker = (ticker) => {
                alpha += 0.1 * ticker.deltaTime;
                if (alpha >= 1) {
                    alpha = 1;
                    appRef.current.ticker.remove(fadeOutTicker);
                    loadAsset();
                }
                fadeRef.current.clear();
                fadeRef.current.rect(0, 0, appRef.current.screen.width, appRef.current.screen.height);
                fadeRef.current.fill({ color: 0x000000, alpha });
            };
            appRef.current.ticker.add(fadeOutTicker);

            const loadAsset = async () => {
                setImageStatus('LOADING');
                try {
                    // FALLBACK LOGIC
                    let texture;
                    if (!bgPath) {
                        throw new Error("No image path provided");
                    }

                    try {
                        texture = await Assets.load(bgPath);
                        setImageStatus('LOADED');
                    } catch (loadErr) {
                        console.warn(`Failed to load ${bgPath}, using placeholder.`);
                        // Fallback to a generated placeholder texture or specific asset
                        // For now, we will fail gracefully so the ERROR status handles UI
                        throw loadErr;
                    }

                    // If success:
                    const scaleX = appRef.current.screen.width / texture.width;
                    const scaleY = appRef.current.screen.height / texture.height;
                    const scale = Math.max(scaleX, scaleY);

                    spriteRef.current.texture = texture;
                    spriteRef.current.scale.set(scale);

                    // ACCESSIBILITY & FX
                    if (userPreferences.highContrast) {
                        const colorMatrix = new ColorMatrixFilter();
                        colorMatrix.desaturate();
                        colorMatrix.contrast(1.5, false);
                        spriteRef.current.filters = [colorMatrix];
                    } else {
                        if (currentNode.type === 'stealth') {
                            const matrix = new ColorMatrixFilter();
                            matrix.desaturate();
                            spriteRef.current.filters = [matrix];
                        } else if (currentNode.type === 'glitch') {
                            const matrix = new ColorMatrixFilter();
                            matrix.lsd(true);
                            spriteRef.current.filters = [matrix];
                        } else {
                            spriteRef.current.filters = null;
                        }
                    }

                } catch (err) {
                    console.error("Asset Resolver Error:", err);
                    setImageStatus('ERROR');
                    // Create a colored placeholder for the sprite so it's not empty
                    const placeholder = new Graphics();
                    placeholder.rect(0, 0, 800, 600);
                    placeholder.fill(0x333333); // Gray background
                    // Use a generated texture from this graphics
                    // Note: In real app, load a 'placeholder.png' from assets
                } finally {
                    fadeIn();
                }
            };

            const fadeIn = () => {
                let inAlpha = 1;
                const fadeInTicker = (ticker) => {
                    inAlpha -= 0.05 * ticker.deltaTime;
                    if (inAlpha <= 0) {
                        inAlpha = 0;
                        appRef.current.ticker.remove(fadeInTicker);
                    }
                    fadeRef.current.clear();
                    fadeRef.current.rect(0, 0, appRef.current.screen.width, appRef.current.screen.height);
                    fadeRef.current.fill({ color: 0x000000, alpha: inAlpha });
                };
                appRef.current.ticker.add(fadeInTicker);

                // PRELOADING: The Rule of +1
                const choices = currentNode.options || currentNode.choices || [];
                choices.forEach(choice => {
                    // In a real system, we look up the node ID to get the image URL.
                    // For this loop, we'll placeholder the logic:
                    // console.log(`Rule of +1: Preloading assets for Node ID: ${choice.target || choice.nextNodeId}`);
                    // Asset.load(repo.getImageForNode(choice.target));
                });
            };
        };

        updateScene();

    }, [currentNode, userPreferences.highContrast]);

    return (
        <div className="relative w-full h-[600px] overflow-hidden rounded-xl border-2 border-gray-700 bg-black">
            {/* LAYER 0: PIXIJS (Backbone) */}
            <div ref={canvasRef} className="absolute top-0 left-0 w-full h-full z-0" />

            {/* LAYER 1: VIGNETTE (Readability) */}
            <div className="absolute inset-0 z-5 pointer-events-none bg-gradient-to-t from-black/90 via-transparent to-black/20" />

            {/* LAYER 2: FALLBACK UI (If Pixi fails or loading) */}
            {imageStatus === 'ERROR' && (
                <div className="absolute inset-0 z-1 flex items-center justify-center pointer-events-none">
                    <div className="text-gray-500 font-mono text-sm bg-black/80 p-2 rounded">
                        [NO SIGNAL] - Placeholder Activated
                    </div>
                </div>
            )}

            {/* LAYER 3: ACCESSIBLE TEXT OVERLAY */}
            <div className="absolute bottom-0 left-0 w-full z-10 p-8">
                {currentNode.dialogue_content && (
                    <div
                        className="border-l-4 border-yellow-400 pl-6 bg-black/60 p-6 rounded-r-xl backdrop-blur-md shadow-lg max-w-3xl"
                        style={{
                            fontFamily: userPreferences.fontFamily || 'Inter, sans-serif',
                            color: userPreferences.textColor || '#ffffff'
                        }}
                    >
                        {(currentNode.speaker_name && currentNode.speaker_name !== 'Narrator') && (
                            <h3 className="text-xl font-bold mb-2 text-yellow-400 uppercase tracking-widest drop-shadow-md">
                                {currentNode.speaker_name}
                            </h3>
                        )}
                        <p className="text-xl leading-relaxed drop-shadow-sm min-h-[3rem]">
                            <Typewriter
                                text={currentNode.dialogue_content}
                                speed={30}
                                onComplete={onTypingComplete}
                            />
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
