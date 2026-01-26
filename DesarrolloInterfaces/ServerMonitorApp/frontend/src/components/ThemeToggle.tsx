"use client";

import { useTheme } from "next-themes";
import { Button } from "@tremor/react";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    if (!mounted) return null;

    return (
        <Button
            size="xs"
            variant="secondary"
            color="slate"
            icon={theme === 'dark' ? Moon : Sun}
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            tooltip="Toggle Theme"
        >
            {theme === 'dark' ? 'Dark' : 'Light'}
        </Button>
    );
}
