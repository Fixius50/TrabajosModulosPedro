import { motion } from 'framer-motion';
import { useUserProgress } from '../stores/userProgress';
import { getAssetUrl } from '../utils/assetUtils';

export default function MyGamesView() {
    const { activeTheme } = useUserProgress();

    // Mock Data for Save Slots
    const saves = [
        { id: 'auto', label: 'AUTOGUARDADO', title: 'Capítulo 5: El Encuentro', date: '24 Oct, 2023', time: '14:30', playtime: '45m', img: getAssetUrl('/assets/portadas/forest_entrance.jpg') },
        { id: 'slot1', label: 'SLOT 1', title: 'Capítulo 3: La Decisión', date: '20 Oct, 2023', time: '09:15', playtime: '2h 10m', img: getAssetUrl('/assets/portadas/city_street.jpg') },
        { id: 'slot2', label: 'SLOT 2', title: 'Vacío', date: '-', time: '-', playtime: '-', img: null }
    ];

    const getThemeStyles = () => {
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
            default:
                return {
                    bg: { background: '#0a0a12', color: 'white' },
                    accent: '#8b5cf6',
                    cardBg: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)'
                };
        }
    };

    const theme = getThemeStyles();

    return (
        <div style={{ ...theme.bg, minHeight: '100vh', padding: '2rem', paddingBottom: '120px' }}>
            <h1 className="text-4xl font-black mb-2">Mis Partidas Guardadas</h1>
            <p className="opacity-60 mb-8">Gestiona tu progreso y explora diferentes finales.</p>

            <div className="flex gap-4 mb-8">
                <button className="px-6 py-2 rounded-full font-bold text-sm border" style={{ borderColor: theme.border, background: theme.cardBg }}>Más recientes ▼</button>
                <button className="px-6 py-2 rounded-full font-bold text-sm opacity-50 border border-transparent">Por Capítulo ▼</button>
            </div>

            <main className="space-y-6 max-w-5xl mx-auto">
                {saves.map((save) => (
                    <motion.div
                        key={save.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`relative rounded-2xl overflow-hidden ${save.img ? 'h-64' : 'h-48 flex items-center justify-center'}`}
                        style={{
                            background: save.img ? 'black' : theme.cardBg,
                            border: theme.border,
                            boxShadow: theme.shadow || 'none'
                        }}
                    >
                        {save.img ? (
                            <>
                                {/* Background Image with gradient */}
                                <div className="absolute inset-0 bg-cover bg-center opacity-60 transition-transform hover:scale-105 duration-700" style={{ backgroundImage: `url(${save.img})` }} />
                                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />

                                <div className="absolute inset-0 p-8 flex flex-col justify-center items-start z-10">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className={`px-2 py-1 text-xs font-bold rounded uppercase`} style={{ background: theme.accent, color: 'white' }}>
                                            {save.label}
                                        </span>
                                    </div>
                                    <h2 className="text-3xl font-bold text-white mb-2">{save.title}</h2>
                                    <p className="text-sm text-gray-400 mb-6">Justo antes de entrar al templo antiguo...</p>

                                    <div className="flex gap-6 text-sm font-mono text-gray-300 mb-6">
                                        <span>📅 {save.date}</span>
                                        <span>🕓 {save.time}</span>
                                        <span>hourglass {save.playtime}</span>
                                    </div>

                                    <div className="flex gap-3">
                                        <button className="w-12 h-12 flex items-center justify-center rounded-lg border border-white/20 hover:bg-white/10 text-white">
                                            🗑️
                                        </button>
                                        <button className="px-6 py-3 rounded-lg border border-white/20 font-bold hover:bg-white/10 text-white">
                                            Sobrescribir
                                        </button>
                                        <button
                                            className="px-8 py-3 rounded-lg font-bold flex items-center gap-2 shadow-lg hover:brightness-110 active:scale-95 transition"
                                            style={{ background: theme.accent, color: 'white' }}
                                        >
                                            ▶ Cargar
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="text-center opacity-40">
                                <div className="text-5xl mb-4">⊕</div>
                                <h3 className="text-xl font-bold">{save.label} Vacío</h3>
                                <p>Guarda una partida nueva aquí</p>
                            </div>
                        )}
                    </motion.div>
                ))}
            </main>
        </div>
    );
}
