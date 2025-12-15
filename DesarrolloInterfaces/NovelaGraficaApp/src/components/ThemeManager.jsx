
import { useEffect } from 'react';
import { useUserProgress } from '../stores/userProgress';
import { THEMES, FONTS } from '../styles/themes';

export default function ThemeManager() {
    const { activeTheme, activeFont } = useUserProgress();

    useEffect(() => {
        const root = document.documentElement;

        // Apply Font
        const fontStack = FONTS[activeFont] || FONTS['Inter'];
        root.style.setProperty('--font-dynamic', fontStack); // Check if this var is used or we override body directly
        document.body.style.fontFamily = fontStack;

        // Apply Theme Colors
        const theme = THEMES[activeTheme] || THEMES['default'];
        Object.entries(theme.colors).forEach(([key, value]) => {
            root.style.setProperty(key, value);
        });

    }, [activeTheme, activeFont]);

    return null; // This component handles side effects only
}
