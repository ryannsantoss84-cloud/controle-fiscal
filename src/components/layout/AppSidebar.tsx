import {
  LayoutDashboard,
  Users,
  FileText,
  Calendar,
  CreditCard,
  BarChart3,
  Settings,
  FileStack,
  Command,
  ChevronRight,
  FileDown,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { KeyboardShortcutsModal } from "@/components/shared/KeyboardShortcutsModal";
import { useNavigationShortcuts } from "@/hooks/useKeyboardShortcuts";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
  SidebarHeader,
  SidebarFooter
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

const mainNav = [
  { title: "Visão Geral", url: "/", icon: LayoutDashboard },
  { title: "Agenda", url: "/calendar", icon: Calendar },
  { title: "Análise", url: "/analytics", icon: BarChart3 },
  { title: "Relatórios", url: "/reports", icon: FileDown },
];

const operationalNav = [
  { title: "Impostos", url: "/taxes", icon: FileText },
  { title: "Obrigações", url: "/obligations", icon: FileText },
  { title: "Parcelamentos", url: "/installments", icon: CreditCard },
  { title: "Clientes", url: "/clients", icon: Users },
];

const systemNav = [
  { title: "Templates", url: "/templates", icon: FileStack },
  { title: "Configurações", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  // Ativar atalhos de navegação (Alt+H, Alt+O, etc)
  useNavigationShortcuts();

  const isActive = (path: string) => {
    if (path === "/") return currentPath === "/";
    return currentPath.startsWith(path);
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border/40 glass-nav">
      <SidebarHeader className="p-4">
        <div className={`flex items-center ${state === "collapsed" ? "justify-center" : "gap-3"} transition-all duration-300`}>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl gradient-primary text-primary-foreground shadow-elegant">
            <Command className="h-6 w-6" />
          </div>
          {state !== "collapsed" && (
            <div className="flex flex-col fade-in animate-in slide-in-from-left-2">
              <span className="font-bold text-lg tracking-tight gradient-text-primary">ControlFiscal</span>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Enterprise</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <Separator className="opacity-30" />

      <SidebarContent className="px-2 py-4 space-y-6">
        {/* Grupo Principal */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-bold uppercase tracking-widest text-primary/70 px-4 mb-2">
            Dashboard
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                    className={`
                      h-10 rounded-lg transition-all duration-200
                      ${isActive(item.url)
                        ? "bg-primary/10 text-primary font-medium shadow-sm"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground font-medium"
                      }
                    `}
                  >
                    <NavLink to={item.url} end={item.url === "/"}>
                      <item.icon className={`h-5 w-5 ${isActive(item.url) ? "text-primary" : "text-muted-foreground"}`} />
                      <span>{item.title}</span>
                      {isActive(item.url) && state !== "collapsed" && (
                        <ChevronRight className="ml-auto h-4 w-4 opacity-50" />
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Grupo Operacional */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-bold uppercase tracking-widest text-emerald-600/70 dark:text-emerald-400/70 px-4 mb-2">
            Operacional
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {operationalNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                    className={`
                      h-10 rounded-lg transition-all duration-200
                      ${isActive(item.url)
                        ? "bg-primary/10 text-primary font-semibold shadow-sm border border-primary/20"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground font-medium"
                      }
                    `}
                  >
                    <NavLink to={item.url}>
                      <item.icon className={`h-5 w-5 ${isActive(item.url) ? "text-primary" : "text-muted-foreground"}`} />
                      <span>{item.title}</span>
                      {isActive(item.url) && state !== "collapsed" && (
                        <ChevronRight className="ml-auto h-4 w-4 text-primary" />
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Grupo Sistema */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-bold uppercase tracking-widest text-violet-600/70 dark:text-violet-400/70 px-4 mb-2">
            Sistema
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {systemNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                    className={`
                      h-10 rounded-lg transition-all duration-200
                      ${isActive(item.url)
                        ? "bg-violet-500/10 text-violet-600 dark:text-violet-400 font-medium shadow-sm"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground font-medium"
                      }
                    `}
                  >
                    <NavLink to={item.url}>
                      <item.icon className={`h-5 w-5 ${isActive(item.url) ? "text-violet-600 dark:text-violet-400" : "text-muted-foreground"}`} />
                      <span>{item.title}</span>
                      {isActive(item.url) && state !== "collapsed" && (
                        <ChevronRight className="ml-auto h-4 w-4 opacity-50" />
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-border/40">
        <div className={`flex ${state === "collapsed" ? "flex-col gap-2" : "gap-2"} items-center justify-center`}>
          <ThemeToggle />
          <KeyboardShortcutsModal />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
