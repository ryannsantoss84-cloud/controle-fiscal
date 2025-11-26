
import * as React from "react";
import {
    Calculator,
    Calendar,
    CreditCard,
    LayoutDashboard,
    Settings,
    User,
    Users,
    FileText,
    Plus,
    Moon,
    Sun,
    Laptop
} from "lucide-react";

import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
} from "@/components/ui/command";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/components/theme-provider";

export function CommandPalette() {
    const [open, setOpen] = React.useState(false);
    const navigate = useNavigate();
    const { setTheme } = useTheme();

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    const runCommand = React.useCallback((command: () => unknown) => {
        setOpen(false);
        command();
    }, []);

    return (
        <CommandDialog open={open} onOpenChange={setOpen}>
            <CommandInput placeholder="Digite um comando ou busque..." />
            <CommandList>
                <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
                <CommandGroup heading="Sugestões">
                    <CommandItem onSelect={() => runCommand(() => navigate("/taxes"))}>
                        <FileText className="mr-2 h-4 w-4" />
                        <span>Impostos</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => navigate("/obligations"))}>
                        <FileText className="mr-2 h-4 w-4" />
                        <span>Obrigações</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => navigate("/clients"))}>
                        <Users className="mr-2 h-4 w-4" />
                        <span>Clientes</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => navigate("/installments"))}>
                        <CreditCard className="mr-2 h-4 w-4" />
                        <span>Parcelamentos</span>
                    </CommandItem>
                </CommandGroup>
                <CommandGroup heading="Navegação">
                    <CommandItem onSelect={() => runCommand(() => navigate("/"))}>
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                        <CommandShortcut>⌘D</CommandShortcut>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => navigate("/calendar"))}>
                        <Calendar className="mr-2 h-4 w-4" />
                        <span>Agenda</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => navigate("/settings"))}>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Configurações</span>
                    </CommandItem>
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup heading="Ações Rápidas">
                    <CommandItem onSelect={() => runCommand(() => { navigate("/taxes"); })}>
                        <Plus className="mr-2 h-4 w-4" />
                        <span>Novo Imposto</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => { navigate("/obligations"); })}>
                        <Plus className="mr-2 h-4 w-4" />
                        <span>Nova Obrigação</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => { navigate("/clients"); })}>
                        <User className="mr-2 h-4 w-4" />
                        <span>Novo Cliente</span>
                    </CommandItem>
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup heading="Tema">
                    <CommandItem onSelect={() => runCommand(() => setTheme("light"))}>
                        <Sun className="mr-2 h-4 w-4" />
                        <span>Claro</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => setTheme("dark"))}>
                        <Moon className="mr-2 h-4 w-4" />
                        <span>Escuro</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => setTheme("system"))}>
                        <Laptop className="mr-2 h-4 w-4" />
                        <span>Sistema</span>
                    </CommandItem>
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    );
}
