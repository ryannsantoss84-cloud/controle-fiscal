import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

/**
 * Hook para gerenciar o tema da aplicação (claro/escuro/sistema).
 */
export function useTheme() {
    const [theme, setThemeState] = useState<Theme>(() => {
        if (typeof window !== 'undefined') {
            return (localStorage.getItem('theme') as Theme) || 'system';
        }
        return 'system';
    });

    useEffect(() => {
        const root = window.document.documentElement;

        const applyTheme = (newTheme: Theme) => {
            root.classList.remove('light', 'dark');

            if (newTheme === 'system') {
                const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
                    ? 'dark'
                    : 'light';
                root.classList.add(systemTheme);
            } else {
                root.classList.add(newTheme);
            }
        };

        applyTheme(theme);
        localStorage.setItem('theme', theme);

        // Listener para mudanças no tema do sistema
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
            if (theme === 'system') {
                applyTheme('system');
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme]);

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
    };

    return { theme, setTheme };
}
