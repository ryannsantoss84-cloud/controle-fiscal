import { useState } from 'react';

export type SortDirection = 'asc' | 'desc';

export interface SortConfig<T> {
    key: keyof T | string;
    direction: SortDirection;
}

export function useSorting<T>(initialKey: keyof T | string, initialDirection: SortDirection = 'asc') {
    const [sortConfig, setSortConfig] = useState<SortConfig<T>>({
        key: initialKey,
        direction: initialDirection,
    });

    const handleSort = (key: keyof T | string) => {
        setSortConfig((current) => ({
            key,
            direction:
                current.key === key && current.direction === 'asc'
                    ? 'desc'
                    : 'asc',
        }));
    };

    const sortData = (data: T[]): T[] => {
        if (!data) return [];

        return [...data].sort((a, b) => {
            // Handle nested keys (e.g. 'clients.name')
            const getValue = (obj: Record<string, unknown>, path: string): unknown => {
                return path.split('.').reduce<unknown>((acc, part) => {
                    if (acc && typeof acc === 'object' && part in (acc as Record<string, unknown>)) {
                        return (acc as Record<string, unknown>)[part];
                    }
                    return undefined;
                }, obj);
            };

            const aValue = getValue(a as unknown as Record<string, unknown>, sortConfig.key as string);
            const bValue = getValue(b as unknown as Record<string, unknown>, sortConfig.key as string);

            if (aValue === bValue) return 0;

            // Handle null/undefined values (always at the bottom)
            if (aValue === null || aValue === undefined) return 1;
            if (bValue === null || bValue === undefined) return -1;

            const result = aValue < bValue ? -1 : 1;
            return sortConfig.direction === 'asc' ? result : -result;
        });
    };

    return {
        sortConfig,
        handleSort,
        sortData,
    };
}
