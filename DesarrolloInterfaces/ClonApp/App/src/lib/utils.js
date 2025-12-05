export const utils = {
    generateId: () => Math.random().toString(36).substr(2, 9),
    getRandomColor: () => ['from-indigo-500 to-purple-500', 'from-pink-500 to-rose-500', 'from-emerald-500 to-teal-500', 'from-blue-500 to-cyan-500', 'from-orange-500 to-amber-500'][Math.floor(Math.random() * 5)],
    delay: (ms) => new Promise(resolve => setTimeout(resolve, ms))
};

export const ICONS_LIST = ['📄', '🎵', '🚀', '💼', '💡', '🎨', '🏈', '🪐', '🍎', '🍕', '⚽', '🚗', '🐶', '🐱', '🎉', '📚', '💸', '🏠', '❤️', '💀', '🔥', '✨', '🌟', '👨‍💻', '🎯', '📱', '💻', '🎬', '🎮', '☕', '🌍', '🚴', '🏃', '✈️', '🎸', '📷', '🖼️', '🎭', '🎪', '🎨', '🎯', '🏆', '🎓'];

export const COVER_COLORS = [
    { id: 'red', name: 'Rojo', color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { id: 'orange', name: 'Naranja', color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
    { id: 'blue', name: 'Azul', color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
    { id: 'beige', name: 'Beige', color: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' },
    { id: 'teal', name: 'Verde azulado', color: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' },
    { id: 'pink', name: 'Rosa', color: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)' },
    { id: 'orange-red', name: 'Naranja rojizo', color: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' },
    { id: 'purple', name: 'Morado', color: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)' },
];

export const COVER_IMAGES = [
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    'https://images.unsplash.com/photo-1497493292307-31c376b6e479?w=800',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800',
    'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800',
];

export const DEFAULT_THEME = { id: 'default', name: 'Original', author: 'System', colors: { bg: '#ffffff', text: '#37352f', sidebar: '#F7F7F5' } };

export const INITIAL_STATE = {
    workspaces: [{ id: 'ws-demo', name: 'Fixius Workspace', initial: 'F', color: 'from-indigo-500 to-purple-500', email: 'user@example.com', pages: [] }],
    profile: { name: "Usuario Fixius", email: "usuario@ejemplo.com", bio: "Productivity enthusiast.", avatar: null },
    themes: [DEFAULT_THEME],
    fonts: [
        { id: 'sans', name: 'Sans Serif', value: 'ui-sans-serif, system-ui, sans-serif', preview: 'Aa' },
        { id: 'serif', name: 'Serif', value: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif', preview: 'Aa' },
        { id: 'mono', name: 'Mono', value: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace', preview: 'Aa' }
    ]
};
