
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { useAutoGenerate } from "./hooks/useAutoGenerate";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ThemeProvider } from "./components/theme-provider";
import { useEffect, lazy, Suspense } from "react";
import { CommandPalette } from "./components/layout/CommandPalette";
import { ConnectionStatus } from "./components/shared/ConnectionStatus";

// Lazy load pages
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Taxes = lazy(() => import("./pages/Taxes"));
const Obligations = lazy(() => import("./pages/Obligations"));
const Clients = lazy(() => import("./pages/Clients"));
const Calendar = lazy(() => import("./pages/Calendar"));
const Installments = lazy(() =>
  import("./pages/Installments").catch((error) => {
    console.error("Failed to load Installments page, retrying...", error);
    // Retry once after a short delay
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(import("./pages/Installments"));
      }, 100);
    });
  })
);
const Analytics = lazy(() => import("./pages/Analytics"));
const Settings = lazy(() => import("./pages/Settings"));
const Templates = lazy(() => import("./pages/Templates"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos - dados são considerados frescos
      gcTime: 10 * 60 * 1000,   // 10 minutos - mantém em cache
      retry: 2,
      refetchOnWindowFocus: false, // Evita refetch desnecessário ao focar janela
    },
  },
});

const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen w-full bg-background">
    <div className="flex flex-col items-center gap-4">
      <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      <p className="text-muted-foreground animate-pulse">Carregando...</p>
    </div>
  </div>
);

const AppContent = () => {
  useAutoGenerate();
  const location = useLocation();

  useEffect(() => {
    // Detectar Chrome
    const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);

    // Suprimir erros removeChild (problema conhecido no Chrome com Radix UI)
    const handleError = (event: ErrorEvent) => {
      if (event.message && event.message.includes('removeChild')) {
        event.preventDefault();
        event.stopPropagation();
        if (isChrome) {
          console.warn('[Chrome Fix] Suprimido erro removeChild do Radix UI');
        }
        return true;
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (event.reason && event.reason.message && event.reason.message.includes('removeChild')) {
        event.preventDefault();
        console.warn('[Chrome Fix] Suprimido promise rejection removeChild');
      }
    };

    window.addEventListener('error', handleError, true);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError, true);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  useEffect(() => {
    const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);

    // Fechar dialogs ao navegar
    const closeDialogs = () => {
      const dialogs = document.querySelectorAll('[role="dialog"]');
      dialogs.forEach(dialog => {
        const closeButton = dialog.querySelector('[aria-label="Close"]');
        if (closeButton instanceof HTMLElement) {
          closeButton.click();
        }
      });

      // No Chrome, limpar portals órfãos após um delay
      if (isChrome) {
        setTimeout(() => {
          const portals = document.querySelectorAll('[data-radix-portal]');
          portals.forEach(portal => {
            if (portal.childNodes.length === 0) {
              portal.remove();
            }
          });
        }, 100);
      }
    };

    closeDialogs();
  }, [location.pathname]);

  return (
    <>
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-background focus:text-foreground">
        Pular para o conteúdo principal
      </a>
      <CommandPalette />
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<AppLayout><Dashboard /></AppLayout>} />
          <Route path="/taxes" element={<AppLayout><Taxes /></AppLayout>} />
          <Route path="/obligations" element={<AppLayout><Obligations /></AppLayout>} />
          <Route path="/clients" element={<AppLayout><Clients /></AppLayout>} />
          <Route path="/installments" element={<AppLayout><Installments /></AppLayout>} />
          <Route path="/calendar" element={<AppLayout><Calendar /></AppLayout>} />
          <Route path="/analytics" element={<AppLayout><Analytics /></AppLayout>} />
          <Route path="/templates" element={<AppLayout><Templates /></AppLayout>} />
          <Route path="/settings" element={<AppLayout><Settings /></AppLayout>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="fiscal-theme">
        <TooltipProvider>
          <BrowserRouter>
            <Toaster />
            <Sonner />
            <ConnectionStatus />
            <AppContent />
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
