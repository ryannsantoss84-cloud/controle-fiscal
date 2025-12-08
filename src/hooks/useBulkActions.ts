import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface HasId {
    id: string;
}

interface UseBulkActionsProps<T> {
    items: T[];
    getItemId?: (item: T) => string;
}

export function useBulkActions<T extends HasId>({ items, getItemId = (item) => item.id }: UseBulkActionsProps<T>) {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const { toast } = useToast();

    const handleToggleSelect = (id: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const handleSelectAll = () => {
        if (selectedIds.size === items.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(items.map(getItemId)));
        }
    };

    const clearSelection = () => {
        setSelectedIds(new Set());
    };

    const executeBulkAction = async (
        action: (ids: string[]) => Promise<void>,
        successMessage: string,
        errorMessage: string,
        confirmMessage?: string
    ) => {
        if (confirmMessage && !confirm(confirmMessage)) return;

        try {
            await action(Array.from(selectedIds));
            clearSelection();
            toast({ title: successMessage });
        } catch (error) {
            toast({ title: errorMessage, variant: "destructive" });
        }
    };

    return {
        selectedIds,
        handleToggleSelect,
        handleSelectAll,
        clearSelection,
        executeBulkAction,
        hasSelection: selectedIds.size > 0,
        selectedCount: selectedIds.size
    };
}
