import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

interface KeyboardShortcut {
    key: string;
    ctrl?: boolean;
    alt?: boolean;
    shift?: boolean;
    action: () => void;
    description: string;
}

/**
 * Hook para gerenciar atalhos de teclado globais.
 * 
 * @example
 * useKeyboardShortcuts([
 *   { key: 'd', ctrl: true, action: () => navigate('/'), description: 'Ir para Dashboard' }
 * ]);
 */
export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
    const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
            // Ignorar se estiver digitando em um input
            const target = event.target as HTMLElement;
            if (
                target.tagName === 'INPUT' ||
                target.tagName === 'TEXTAREA' ||
                target.isContentEditable
            ) {
                return;
            }

            for (const shortcut of shortcuts) {
                const ctrlMatch = shortcut.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
                const altMatch = shortcut.alt ? event.altKey : !event.altKey;
                const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
                const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();

                if (keyMatch && ctrlMatch && altMatch && shiftMatch) {
                    event.preventDefault();
                    shortcut.action();
                    return;
                }
            }
        },
        [shortcuts]
    );

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);
}

/**
 * Atalhos de navegação pré-definidos para usar em toda a aplicação.
 */
export function useNavigationShortcuts() {
    const navigate = useNavigate();

    const shortcuts: KeyboardShortcut[] = [
        {
            key: 'h',
            alt: true,
            action: () => navigate('/'),
            description: 'Ir para Dashboard',
        },
        {
            key: 'o',
            alt: true,
            action: () => navigate('/obligations'),
            description: 'Ir para Obrigações',
        },
        {
            key: 'c',
            alt: true,
            action: () => navigate('/clients'),
            description: 'Ir para Clientes',
        },
        {
            key: 'p',
            alt: true,
            action: () => navigate('/installments'),
            description: 'Ir para Parcelas',
        },
        {
            key: 'k',
            alt: true,
            action: () => navigate('/calendar'),
            description: 'Ir para Calendário',
        },
        {
            key: 'a',
            alt: true,
            action: () => navigate('/analytics'),
            description: 'Ir para Análises',
        },
        {
            key: 's',
            alt: true,
            action: () => navigate('/settings'),
            description: 'Ir para Configurações',
        },
    ];

    useKeyboardShortcuts(shortcuts);

    return shortcuts;
}

/**
 * Retorna lista de atalhos disponíveis para exibição.
 */
export function getAvailableShortcuts() {
    return [
        { keys: 'Alt + H', description: 'Dashboard' },
        { keys: 'Alt + O', description: 'Obrigações' },
        { keys: 'Alt + C', description: 'Clientes' },
        { keys: 'Alt + P', description: 'Parcelas' },
        { keys: 'Alt + K', description: 'Calendário' },
        { keys: 'Alt + A', description: 'Análises' },
        { keys: 'Alt + S', description: 'Configurações' },
        { keys: '?', description: 'Mostrar atalhos' },
    ];
}
