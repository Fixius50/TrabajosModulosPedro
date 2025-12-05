import { useEffect } from 'react';

// Default CSS variables
export const DEFAULT_CSS_VARIABLES = {
    // Colors
    '--bg-color': '#ffffff',
    '--text-color': '#37352f',
    '--sidebar-bg': '#F7F7F5',
    '--border-color': '#e5e7eb',
    '--accent-primary': '#3b82f6',
    '--accent-hover': '#2563eb',
    '--hover-bg': '#f4f4f5',

    // Typography
    '--font-main': 'ui-sans-serif, system-ui, sans-serif',
    '--font-size-base': '14px',
    '--line-height': '1.5',

    // Spacing
    '--padding-page': '1.5rem',
    '--sidebar-width': '240px',

    // Effects
    '--shadow-sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    '--shadow-md': '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    '--shadow-lg': '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    '--radius-sm': '0.25rem',
    '--radius-md': '0.5rem',
    '--radius-lg': '0.75rem',
};

/**
 * Hook to apply CSS variables to document.documentElement
 * @param {Object} variables - CSS variables object { '--var-name': 'value' }
 */
export function useCSSVariables(variables = {}) {
    useEffect(() => {
        // Merge default with custom variables
        const mergedVariables = { ...DEFAULT_CSS_VARIABLES, ...variables };

        // Apply to document root
        Object.entries(mergedVariables).forEach(([key, value]) => {
            document.documentElement.style.setProperty(key, value);
        });

        // Cleanup function to restore defaults
        return () => {
            Object.keys(variables).forEach((key) => {
                if (!DEFAULT_CSS_VARIABLES[key]) {
                    document.documentElement.style.removeProperty(key);
                }
            });
        };
    }, [variables]);
}

/**
 * Convert a theme object to CSS variables format
 * @param {Object} theme - Theme object with colors
 * @returns {Object} CSS variables object
 */
export function themeToVariables(theme) {
    if (!theme || !theme.colors) return {};

    const variables = {};

    // Map theme colors to CSS variables
    if (theme.colors.bg) variables['--bg-color'] = theme.colors.bg;
    if (theme.colors.text) variables['--text-color'] = theme.colors.text;
    if (theme.colors.sidebar) variables['--sidebar-bg'] = theme.colors.sidebar;
    if (theme.colors.border) variables['--border-color'] = theme.colors.border;
    if (theme.colors.accent) variables['--accent-primary'] = theme.colors.accent;
    if (theme.colors.accentHover) variables['--accent-hover'] = theme.colors.accentHover;
    if (theme.colors.hover) variables['--hover-bg'] = theme.colors.hover;

    return variables;
}
