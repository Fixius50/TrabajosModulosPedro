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
                "primary": "#d4af37",      // Gold
                "electric-cyan": "#00f5ff",    // Cyan
                "background-dark": "#05070a",   // Midnight
                "background-light": "#f8f6f6",
                "surface": "#0a0c12",      // Deep Charcoal
                "vault-panel": "#191022",        // Purple Tint
                "primary-purple": "#7f13ec",
                "primary-red": "#d41132",       // Crimson
                "gold-accent": "#c5a059",
                "silver-zen": "#e2e8f0",
                "silver-muted": "#cbd5e1"
            },
            fontFamily: {
                "display": ["Newsreader", "serif"],
                "sans": ["Manrope", "sans-serif"],
                "technical": ["JetBrains Mono", "monospace"]
            },
            backgroundImage: {
                'stardust': "radial-gradient(circle, #fff 1px, transparent 1px)",
            },
            boxShadow: {
                'hologram': '0 0 40px rgba(127, 19, 236, 0.3), inset 0 0 20px rgba(127, 19, 236, 0.2)',
                'zen': '0 4px 30px rgba(0, 0, 0, 0.5)',
            }
        },
    },
    plugins: [],
}
