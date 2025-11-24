
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { TopBar } from "./TopBar";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-background via-background to-muted/10">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out">
          {/* Header Corporativo Elegante com Glassmorphism */}
          <header className="sticky top-0 z-50 flex h-16 items-center gap-4 glass-nav shadow-elegant px-6 md:px-8 lg:px-10">
            <SidebarTrigger className="hover:bg-primary/10 transition-colors" />
            <div className="flex-1">
              <TopBar />
            </div>
          </header>

          {/* Conteúdo Principal com Animação Suave */}
          <main className="flex-1 p-6 md:p-8 lg:p-10 overflow-x-hidden">
            <div className="corporate-container animate-slide-up">
              {children}
            </div>
          </main>

          {/* Footer Corporativo Sutil */}
          <footer className="border-t border-border/50 bg-card/30 backdrop-blur-sm py-4 px-6">
            <div className="corporate-container">
              <p className="text-xs text-muted-foreground text-center">
                © 2025 Sistema de Controle Fiscal. Todos os direitos reservados.
              </p>
            </div>
          </footer>
        </div>
      </div>
    </SidebarProvider>
  );
}
