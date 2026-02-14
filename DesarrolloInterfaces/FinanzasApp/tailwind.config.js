/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./resources/frontend/**/*.{js,ts,jsx,tsx,html}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                // Stitch Theme (High Fidelity)
                "stitch-gold": "#f2b90d",    // The Grand Market Gold
                "stitch-stone": "#1a1814",   // Dark Stone

                // Dungeon Theme
                "dungeon-bg": "#1a1614",     // Dark Wood
                "parchment": "#dcd0b3",      // Card Background
                "ink": "#2b2118",            // Text
                "gold-coin": "#ffcc00",      // Highlights
                "iron-border": "#4a4a4a",    // Borders
                "ruby-expense": "#8a1c1c",   // Expense
                "emerald-income": "#1c5c2e", // Income
                "mana-blue": "#1c3d5c",      // Info

                // Legacy (Keep for now)
                "primary": "#d4af37",
                "electric-cyan": "#00f5ff",
                "background-dark": "#05070a",
                "surface": "#0a0c12",
            },
            fontFamily: {
                "dungeon-header": ["Cinzel", "serif"],
                "dungeon-body": ["Merriweather", "serif"],
                "display": ["Cinzel", "serif"], // Stitch Header
                "serif": ["Merriweather", "serif"], // Stitch Body
                "sans": ["Manrope", "sans-serif"],
            },
            backgroundImage: {
                'parchment-texture': "linear-gradient(to bottom right, #dcd0b3, #c5b593)",
                'wood-texture': "repeating-linear-gradient(45deg, #2b2118 0px, #2b2118 10px, #1a1614 10px, #1a1614 20px)",
                'stardust': "radial-gradient(circle, #fff 1px, transparent 1px)",
            },
            boxShadow: {
                'parchment': 'inset 0 0 20px rgba(0,0,0,0.2), 0 4px 6px rgba(0,0,0,0.3)',
                'coin': '0 0 10px rgba(255, 204, 0, 0.5)',
            }
        },
    },
    plugins: [],
}
