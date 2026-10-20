'use client';

import { useEffect, useState } from "react";

/** Follow the site dark mode (prefers-color-scheme) for the charts */
export function useDarkMode(): boolean {
    const [isDark, setDark] = useState<boolean>(() => {
        if (typeof window === 'undefined') return false
        return document.documentElement.classList.contains('dark') || window.matchMedia('(prefers-color-scheme: dark)').matches
    });
    useEffect(() => {
        const mq = window.matchMedia('(prefers-color-scheme: dark)')
        const handler = (e: MediaQueryListEvent) => setDark(e.matches)
        mq.addEventListener('change', handler)
        return () => mq.removeEventListener('change', handler)
    }, []);
    return isDark;
}
