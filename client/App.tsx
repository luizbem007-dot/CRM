import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [showSplash, setShowSplash] = React.useState(true);
  React.useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), 1800);
    return () => clearTimeout(t);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {showSplash && (
          <div className="fixed inset-0 flex items-center justify-center bg-black z-50">
            <img src="https://cdn.builder.io/api/v1/image/assets%2Fc7a665936108422ea7c0c4c7a1027698%2F6dec44841bf641cc89eed145dcb1ffe6?format=webp&width=800" alt="Funcionou.AI" className="h-40 w-40 animate-fade-in" />
          </div>
        )}
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/app" element={<Dashboard />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

const container = document.getElementById("root")!;
// Avoid createRoot being called multiple times during HMR reloads
if (!(window as any).__root) {
  (window as any).__root = createRoot(container);
}
(window as any).__root.render(<App />);
