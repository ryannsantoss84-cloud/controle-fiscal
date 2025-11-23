
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { useAutoGenerate } from "./hooks/useAutoGenerate";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ThemeProvider } from "./components/theme-provider";
import { useEffect } from "react";
import Dashboard from "./pages/Dashboard";
import Deadlines from "./pages/Deadlines";
import Clients from "./pages/Clients";
import Calendar from "./pages/Calendar";
import Installments from "./pages/Installments";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Templates from "./pages/Templates";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

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
    <Routes>
      <Route path="/" element={<AppLayout><Dashboard /></AppLayout>} />
      <Route path="/deadlines" element={<AppLayout><Deadlines /></AppLayout>} />
      <Route path="/clients" element={<AppLayout><Clients /></AppLayout>} />
      <Route path="/installments" element={<AppLayout><Installments /></AppLayout>} />
      <Route path="/calendar" element={<AppLayout><Calendar /></AppLayout>} />
      <Route path="/analytics" element={<AppLayout><Analytics /></AppLayout>} />
      <Route path="/templates" element={<AppLayout><Templates /></AppLayout>} />
      <Route path="/settings" element={<AppLayout><Settings /></AppLayout>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
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
            <AppContent />
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
