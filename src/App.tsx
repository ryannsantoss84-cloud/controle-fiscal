
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { useAutoGenerate } from "./hooks/useAutoGenerate";
import { ErrorBoundary } from "./components/ErrorBoundary";
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
  // Hook de automação - gera obrigações automaticamente
  useAutoGenerate();
  const location = useLocation();

  useEffect(() => {
    // Fechar todos os dialogs ao navegar para prevenir erros removeChild
    const dialogs = document.querySelectorAll('[role="dialog"]');
    dialogs.forEach(dialog => {
      const closeButton = dialog.querySelector('[aria-label="Close"]');
      if (closeButton instanceof HTMLElement) {
        closeButton.click();
      }
    });
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
      <TooltipProvider>
        <BrowserRouter>
          <Toaster />
          <Sonner />
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
