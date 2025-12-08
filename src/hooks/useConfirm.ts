import { useState, useCallback } from 'react';

interface UseConfirmOptions {
    title?: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'destructive' | 'default';
}

interface ConfirmState extends UseConfirmOptions {
    isOpen: boolean;
    onConfirm: (() => void) | (() => Promise<void>);
}

/**
 * Hook para gerenciar diálogos de confirmação de forma reutilizável.
 * 
 * @example
 * const { confirm, ConfirmDialog } = useConfirm();
 * 
 * const handleDelete = async () => {
 *   const confirmed = await confirm({
 *     title: 'Excluir item?',
 *     description: 'Esta ação não pode ser desfeita.',
 *     variant: 'destructive'
 *   });
 *   if (confirmed) {
 *     // executar exclusão
 *   }
 * };
 */
export function useConfirm() {
    const [state, setState] = useState<ConfirmState>({
        isOpen: false,
        title: 'Confirmar ação',
        description: 'Tem certeza que deseja continuar?',
        confirmText: 'Confirmar',
        cancelText: 'Cancelar',
        variant: 'default',
        onConfirm: () => { },
    });

    const [resolveRef, setResolveRef] = useState<((value: boolean) => void) | null>(null);

    const confirm = useCallback((options: UseConfirmOptions = {}): Promise<boolean> => {
        return new Promise((resolve) => {
            setResolveRef(() => resolve);
            setState({
                isOpen: true,
                title: options.title || 'Confirmar ação',
                description: options.description || 'Tem certeza que deseja continuar?',
                confirmText: options.confirmText || 'Confirmar',
                cancelText: options.cancelText || 'Cancelar',
                variant: options.variant || 'default',
                onConfirm: () => { },
            });
        });
    }, []);

    const handleConfirm = useCallback(() => {
        setState(prev => ({ ...prev, isOpen: false }));
        resolveRef?.(true);
        setResolveRef(null);
    }, [resolveRef]);

    const handleCancel = useCallback(() => {
        setState(prev => ({ ...prev, isOpen: false }));
        resolveRef?.(false);
        setResolveRef(null);
    }, [resolveRef]);

    return {
        confirm,
        isOpen: state.isOpen,
        title: state.title,
        description: state.description,
        confirmText: state.confirmText,
        cancelText: state.cancelText,
        variant: state.variant,
        onConfirm: handleConfirm,
        onCancel: handleCancel,
    };
}
