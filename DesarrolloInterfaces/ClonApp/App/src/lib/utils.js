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
    workspaces: [{
        id: 'ws-demo',
        name: 'Fixius Workspace',
        initial: 'F',
        color: 'from-indigo-500 to-purple-500',
        email: 'user@example.com',
        pages: [],
        databases: [{
            id: 'db-demo-proyectos',
            title: 'Proyectos',
            icon: '📊',
            type: 'fullpage',
            parentPageId: null,
            properties: [
                { id: 'prop-title', name: 'Nombre', type: 'title', visible: true, order: 0 },
                {
                    id: 'prop-estado',
                    name: 'Estado',
                    type: 'select',
                    visible: true,
                    order: 1,
                    config: {
                        options: [
                            { label: 'Por Hacer', color: '#6b7280' },
                            { label: 'En Progreso', color: '#3b82f6' },
                            { label: 'Terminado', color: '#22c55e' }
                        ]
                    }
                },
                {
                    id: 'prop-prioridad',
                    name: 'Prioridad',
                    type: 'select',
                    visible: true,
                    order: 2,
                    config: {
                        options: [
                            { label: 'Alta', color: '#ef4444' },
                            { label: 'Media', color: '#f97316' },
                            { label: 'Baja', color: '#22c55e' }
                        ]
                    }
                },
                { id: 'prop-fecha', name: 'Fecha Límite', type: 'date', visible: true, order: 3 }
            ],
            items: [
                {
                    id: 'item-1',
                    pageId: 'page-db-1',
                    values: {
                        'prop-title': 'Diseño de UI/UX',
                        'prop-estado': 'En Progreso',
                        'prop-prioridad': 'Alta',
                        'prop-fecha': '2025-12-15'
                    }
                },
                {
                    id: 'item-2',
                    pageId: 'page-db-2',
                    values: {
                        'prop-title': 'Implementar Base de Datos',
                        'prop-estado': 'Terminado',
                        'prop-prioridad': 'Alta',
                        'prop-fecha': '2025-12-05'
                    }
                },
                {
                    id: 'item-3',
                    pageId: 'page-db-3',
                    values: {
                        'prop-title': 'Pruebas de Usuario',
                        'prop-estado': 'Por Hacer',
                        'prop-prioridad': 'Media',
                        'prop-fecha': '2025-12-20'
                    }
                }
            ],
            views: [
                {
                    id: 'view-table',
                    name: 'Tabla',
                    type: 'table',
                    filters: [],
                    sorts: [],
                    visibleProperties: []
                },
                {
                    id: 'view-board',
                    name: 'Tablero',
                    type: 'board',
                    groupBy: 'prop-estado',
                    filters: [],
                    sorts: [],
                    visibleProperties: []
                }
            ],
            activeViewId: 'view-table'
        }]
    }],
    profile: { name: "Usuario Fixius", email: "usuario@ejemplo.com", bio: "Productivity enthusiast.", avatar: null },
    themes: [DEFAULT_THEME],
    fonts: [
        { id: 'sans', name: 'Sans Serif', value: 'ui-sans-serif, system-ui, sans-serif', preview: 'Aa' },
        { id: 'serif', name: 'Serif', value: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif', preview: 'Aa' },
        { id: 'mono', name: 'Mono', value: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace', preview: 'Aa' }
    ]
};
