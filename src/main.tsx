import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Patch global para suprimir erros removeChild do Chrome/Radix UI
// Este é um bug conhecido do Radix UI com portals no Chrome
const originalRemoveChild = Node.prototype.removeChild;
Node.prototype.removeChild = function <T extends Node>(child: T): T {
    try {
        return originalRemoveChild.call(this, child);
    } catch (error) {
        if (error instanceof Error && error.message.includes('removeChild')) {
            console.warn('[Chrome Patch] Suprimido erro removeChild do Radix UI');
            return child;
        }
        throw error;
    }
};

// Suprimir erros não capturados
window.addEventListener('error', (event) => {
    if (event.message && event.message.includes('removeChild')) {
        event.preventDefault();
        event.stopPropagation();
        console.warn('[Global Handler] Suprimido erro removeChild');
        return true;
    }
});

window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && event.reason.message && event.reason.message.includes('removeChild')) {
        event.preventDefault();
        console.warn('[Global Handler] Suprimido promise rejection removeChild');
    }
});

createRoot(document.getElementById("root")!).render(<App />);
