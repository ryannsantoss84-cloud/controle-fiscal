import { useState, useEffect } from 'react';
import { Keyboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { getAvailableShortcuts } from '@/hooks/useKeyboardShortcuts';

export function KeyboardShortcutsModal() {
    const [open, setOpen] = useState(false);
    const shortcuts = getAvailableShortcuts();

    // Abrir com "?"
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === '?' && !e.ctrlKey && !e.altKey) {
                const target = e.target as HTMLElement;
                if (
                    target.tagName !== 'INPUT' &&
                    target.tagName !== 'TEXTAREA' &&
                    !target.isContentEditable
                ) {
                    e.preventDefault();
                    setOpen(true);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Ver atalhos de teclado">
                    <Keyboard className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Keyboard className="h-5 w-5" />
                        Atalhos de Teclado
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                        Use estes atalhos para navegar rapidamente:
                    </p>
                    <div className="grid gap-2">
                        {shortcuts.map((shortcut) => (
                            <div
                                key={shortcut.keys}
                                className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                            >
                                <span className="text-sm">{shortcut.description}</span>
                                <kbd className="px-2 py-1 text-xs font-mono bg-background border rounded shadow-sm">
                                    {shortcut.keys}
                                </kbd>
                            </div>
                        ))}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
