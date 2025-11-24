
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { ThemeToggle } from "@/components/theme-toggle";

export function TopBar() {

  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <div className="relative flex-1 hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar obrigações, clientes..."
            className="pl-9 w-full"
          />
        </div>
        <div className="md:hidden">
          <Search className="h-5 w-5 text-muted-foreground" />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <NotificationBell />
      </div>
    </div>
  );
}
