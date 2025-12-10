import { useEffect, useState } from 'react';

/**
 * Hook para debounce de valores
 * Útil para otimizar buscas e evitar requisições excessivas
 * 
 * @param value - Valor a ser debounced
 * @param delay - Delay em milissegundos (default: 300ms)
 * @returns Valor debounced
 * 
 * @example
 * const [search, setSearch] = useState('');
 * const debouncedSearch = useDebounce(search, 500);
 * 
 * useEffect(() => {
 *   // Executar busca apenas após usuário parar de digitar por 500ms
 *   if (debouncedSearch) {
 *     searchAPI(debouncedSearch);
 *   }
 * }, [debouncedSearch]);
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        // Criar timer para atualizar o valor após o delay
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        // Limpar timeout se o valor mudar antes do delay
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}
