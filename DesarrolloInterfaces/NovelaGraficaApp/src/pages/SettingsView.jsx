import { useState } from 'react';
import { useUserProgress } from '../stores/userProgress';

export default function SettingsView() {
    const { activeTheme, activeFont, setActive, fontSize, getThemeStyles: getRemoteStyles } = useUserProgress();

    // Local state for things not yet in global store or for UI simulation
    const [localFontSize, setLocalFontSize] = useState(fontSize || 18);
    const [textSpeed, setTextSpeed] = useState(30);
    const [bgOpacity, setBgOpacity] = useState(90);
    const [volumeMaster, setVolumeMaster] = useState(80);
    const [volumeMusic, setVolumeMusic] = useState(60);

    const getThemeStyles = () => {
        // A. REMOTE (Database)
        const remote = getRemoteStyles(activeTheme);
        if (remote) return remote;

        switch (activeTheme) {
            case 'modern':
                return {
                    bg: { background: '#1a0b2e', color: '#e2e8f0' },
                    accent: '#d946ef',
                    cardBg: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.1)'
                };
            case 'comic':
                return {
                    bg: { background: '#fff', color: 'black', backgroundImage: 'radial-gradient(circle, #e5e5e5 1px, transparent 1px)', backgroundSize: '20px 20px' },
                    accent: '#000',
                    cardBg: 'white',
                    border: '3px solid black',
                    shadow: '5px 5px 0px black'
                };
            case 'manga':
                return {
                    bg: { background: 'white', color: 'black' },
                    accent: 'black',
                    cardBg: 'white',
                    border: '1px solid black'
                };
            default: // standard
                return {
                    bg: { background: '#0a0a12', color: 'white' },
                    accent: '#8b5cf6',
                    cardBg: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)'
                };
        }
    };

    const rawTheme = getThemeStyles();
    // Adapter for SettingsView
    const theme = {
        bg: typeof rawTheme.bg === 'string' ? { background: rawTheme.bg, color: rawTheme.text } : rawTheme.bg,
        accent: rawTheme.accent,
        border: rawTheme.border || rawTheme.cardBorder,
        shadow: rawTheme.shadow || rawTheme.cardShadow,
        cardBg: rawTheme.cardBg || (activeTheme === 'comic' ? 'white' : 'rgba(255,255,255,0.05)')
    };

    const handleSave = () => {
        alert('Ajustes Guardados (Simulación)');
        // Here we would actually call setActive() for all changed values
    };

    return (
        <div style={{ ...theme.bg, minHeight: '100vh', padding: '2rem', paddingBottom: '120px' }}>
            <h1 className="text-4xl font-black mb-2">Configuración</h1>
            <p className="opacity-60 mb-8">Personaliza tu experiencia de lectura.</p>

            <div className="max-w-3xl mx-auto space-y-6">

                {/* VISUAL THEME */}
                <Section title="Tema Visual" icon="🎨" theme={theme}>
                    <div className="space-y-4">
                        <label className="block text-sm font-bold opacity-70 mb-2">Estilo de la Interfaz</label>
                        <select
                            value={activeTheme}
                            onChange={(e) => setActive('theme', e.target.value)}
                            className="w-full bg-black/10 border rounded-lg p-3 outline-none focus:border-current"
                            style={{ borderColor: theme.accent, color: 'inherit' }}
                        >
                            <option value="modern">Modern (Default)</option>
                            <option value="comic">Comic Style</option>
                            <option value="manga">Manga (B&W)</option>
                        </select>
                        <p className="text-xs opacity-50">Desbloquea más temas en el Mercado.</p>
                    </div>
                </Section>

                {/* TIPOGRAFÍA */}
                <Section title="Tipografía" icon="Tt" theme={theme}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold opacity-70 mb-2">Fuente del Texto</label>
                            <select
                                value={activeFont}
                                onChange={(e) => setActive('font', e.target.value)}
                                className="w-full bg-black/10 border rounded-lg p-3 outline-none focus:border-current"
                                style={{ borderColor: theme.accent, color: 'inherit' }}
                            >
                                <option value="sans">Sans Serif (Moderna)</option>
                                <option value="serif">Serif (Clásica)</option>
                                <option value="mono">Monospace (Terminal)</option>
                                <option value="bangers">Bangers (Cómic)</option>
                            </select>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm font-bold mb-2">
                                <span className="opacity-70">Tamaño de Fuente</span>
                                <span>{localFontSize}px</span>
                            </div>
                            <input
                                type="range" min="12" max="32"
                                value={localFontSize}
                                onChange={(e) => setLocalFontSize(e.target.value)}
                                className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                                style={{ accentColor: theme.accent, background: 'rgba(128,128,128,0.3)' }}
                            />
                        </div>
                    </div>
                </Section>

                {/* CAJA DE TEXTO */}
                <Section title="Caja de Texto" icon="⬜" theme={theme}>
                    <div>
                        <div className="flex justify-between text-sm font-bold mb-2">
                            <span className="opacity-70">Opacidad del Fondo</span>
                            <span>{bgOpacity}%</span>
                        </div>
                        <input
                            type="range" min="0" max="100"
                            value={bgOpacity}
                            onChange={(e) => setBgOpacity(e.target.value)}
                            className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                            style={{ accentColor: theme.accent, background: 'rgba(128,128,128,0.3)' }}
                        />
                    </div>
                </Section>

                {/* VELOCIDAD */}
                <Section title="Velocidad" icon="⚡" theme={theme}>
                    <div>
                        <div className="flex justify-between text-sm font-bold mb-2">
                            <span className="opacity-70">Velocidad de Texto</span>
                            <span>{textSpeed > 50 ? 'Rápido' : 'Normal'}</span>
                        </div>
                        <input
                            type="range" min="1" max="100"
                            value={textSpeed}
                            onChange={(e) => setTextSpeed(e.target.value)}
                            className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                            style={{ accentColor: theme.accent, background: 'rgba(128,128,128,0.3)' }}
                        />
                    </div>
                </Section>

                {/* AUDIO */}
                <Section title="Audio" icon="ılı" theme={theme}>
                    <div className="space-y-4">
                        <VolumeSlider label="Maestro" value={volumeMaster} setValue={setVolumeMaster} theme={theme} />
                        <VolumeSlider label="Música" value={volumeMusic} setValue={setVolumeMusic} theme={theme} />
                    </div>
                </Section>

                {/* Actions */}
                <div className="flex justify-end gap-4 pt-4 border-t" style={{ borderColor: theme.border }}>
                    <button className="px-6 py-3 rounded-lg border font-bold hover:opacity-80" style={{ borderColor: theme.border }}>
                        Restaurar
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-8 py-3 rounded-lg font-bold shadow-lg hover:brightness-110 active:scale-95 transition flex items-center gap-2"
                        style={{ background: theme.accent, color: activeTheme === 'modern' ? 'white' : 'white', border: '1px solid transparent' }}
                    >
                        💾 Guardar Cambios
                    </button>
                </div>

            </div>
        </div>
    );
}

function Section({ title, icon, children, theme }) {
    return (
        <div className="p-6 rounded-xl" style={{ background: theme.cardBg, border: theme.border, boxShadow: theme.shadow || 'none' }}>
            <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl" style={{ color: theme.accent }}>{icon}</span>
                <h2 className="text-xl font-bold">{title}</h2>
            </div>
            {children}
        </div>
    );
}

function VolumeSlider({ label, value, setValue, theme }) {
    return (
        <div className="flex items-center gap-4">
            <span className="w-8 text-xl opacity-50">🔊</span>
            <div className="flex-1">
                <div className="flex justify-between text-xs font-bold mb-1 opacity-60">
                    <span>{label}</span>
                </div>
                <input
                    type="range" min="0" max="100"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                    style={{ accentColor: theme.accent, background: 'rgba(128,128,128,0.3)' }}
                />
            </div>
        </div>
    );
}
