import React, { useState } from "react";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  MessageSquare,
  Settings,
  PlugZap,
  LogOut,
  Search,
  Bell,
  Menu,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export type TabKey =
  | "conversas"
  | "configuracoes"
  | "integracoes";

interface LayoutProps {
  userName?: string;
  userRole?: string;
  active: TabKey;
  onChange: (tab: TabKey) => void;
  children: ReactNode;
}

const tabs: { key: TabKey; label: string; icon: any }[] = [
  { key: "conversas", label: "Conversas", icon: MessageSquare },
  { key: "configuracoes", label: "Configurações", icon: Settings },
  { key: "integracoes", label: "Integrações", icon: PlugZap },
];

export default function Layout({
  userName = "Usuário",
  userRole = "",
  active,
  onChange,
  children,
}: LayoutProps) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("supabaseSession");
    localStorage.removeItem("userName");
    localStorage.removeItem("userRole");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-black text-foreground">
      <div className="flex">
        {/* Sidebar - desktop */}
        <aside className="hidden md:flex md:w-64 lg:w-72 shrink-0 h-screen sticky top-0 flex-col border-r border-border/60 bg-sidebar shadow-inner" aria-label="Sidebar">
          <div className="h-16 flex items-center gap-3 px-5 border-b border-border/60">
            <div className="h-9 w-9 flex items-center justify-center" aria-hidden>
              <img src="https://cdn.builder.io/api/v1/image/assets%2Fc7a665936108422ea7c0c4c7a1027698%2Fa33e52d5d58c411c9ab9b2443c5520b9?format=webp&width=800" alt="Funcionou.AI" className="h-8 w-8 object-contain" />
            </div>
            <div className="text-lg font-bold tracking-tight">Funcionou.<span className="ml-1 text-[#00FF66]">AI</span></div>
          </div>

          <nav className="p-3 space-y-2" role="navigation" aria-label="Main navigation">
            {tabs.map(({ key, label, icon: Icon }) => {
              const isActive = active === key;
              return (
                <button
                  key={key}
                  onClick={() => onChange(key)}
                  title={label}
                  aria-label={label}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-left",
                    "transition-all focus:outline-none focus:ring-2 focus:ring-offset-1",
                    isActive
                      ? "bg-[#07120e] neon-glow-outline text-foreground border-primary/30"
                      : "hover:bg-[#08110f]/60 text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon className={cn("h-5 w-5", isActive && "text-primary")} aria-hidden />
                  <span className="flex-1 truncate">{label}</span>
                  {key === "conversas" && (
                    <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-[#00FF66]/12 text-[#00FF66]">
                      3
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="mt-auto p-3">
            <button
              onClick={handleLogout}
              title="Sair"
              aria-label="Sair"
              className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-[#08110f]/60 focus:outline-none focus:ring-2 focus:ring-offset-1"
            >
              <LogOut className="h-5 w-5" aria-hidden />
              <span>Sair</span>
            </button>
            <div className="mt-3 text-[11px] text-muted-foreground/80 px-3">
              © {new Date().getFullYear()} FIQON
            </div>
          </div>
        </aside>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="md:hidden fixed inset-0 z-40">
            <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} aria-hidden />
            <aside className="absolute left-0 top-0 h-full w-72 bg-sidebar border-r border-border/60 p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 flex items-center justify-center">
                    <img src="https://cdn.builder.io/api/v1/image/assets%2Fc7a665936108422ea7c0c4c7a1027698%2Fa33e52d5d58c411c9ab9b2443c5520b9?format=webp&width=800" alt="Funcionou.AI" className="h-8 w-8 object-contain" />
                  </div>
                  <div className="text-lg font-bold tracking-tight">Funcionou.<span className="ml-1 text-[#00FF66]">AI</span></div>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-1">Fechar</button>
              </div>
              <nav className="space-y-2">
                {tabs.map(({ key, label, icon: Icon }) => (
                  <button key={key} onClick={() => { onChange(key); setSidebarOpen(false); }} title={label} className="w-full text-left px-3 py-3 rounded-lg hover:bg-[#08110f]/60"> <Icon className="inline-block h-5 w-5 mr-3" /> {label}</button>
                ))}
              </nav>
            </aside>
          </div>
        )}

        {/* Main */}
        <div className="flex-1 min-w-0">
          {/* Topbar */}
          <header className="h-16 sticky top-0 backdrop-blur bg-background/60 border-b border-border/60 flex items-center px-3 lg:px-6 gap-3 neon-glow">
            <div className="flex items-center gap-3 md:hidden">
              <button onClick={() => setSidebarOpen(true)} aria-label="Abrir menu" title="Abrir menu" className="p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-1">
                <Menu className="h-6 w-6" />
              </button>
            </div>

            <div className="flex items-center gap-4">
              <div className="f-logo" aria-hidden>
                <img src="https://cdn.builder.io/api/v1/image/assets%2Fc7a665936108422ea7c0c4c7a1027698%2Ff4f6d8a8cede428fa0c26b651908a2f8?format=webp&width=800" alt="Funcionou.AI" className="h-8 w-8 object-contain" />
              </div>
              <div className="hidden sm:block">
                <div className="text-lg font-bold">Central de Conversas</div>
                <div className="text-[11px] text-text-secondary">Painel</div>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-xl bg-background/60 border border-input px-3 h-10 flex-1 max-w-xl neon-glow" role="search" aria-label="Busca rápida">
              <Search className="h-4 w-4 text-muted-foreground" aria-hidden />
              <input
                placeholder="Busca rápida"
                className="bg-transparent outline-none text-sm flex-1"
              />
            </div>

            <div className="flex items-center gap-3 ml-3">
              <div className="h-10 px-3 rounded-xl border panel-border-neon bg-background/60 flex items-center gap-3">
                <div className="text-[13px] status-online" aria-hidden>🟢</div>
                <div className="text-sm">Status: <span className="text-text-secondary">Ativo</span></div>
              </div>

              <button className="relative h-10 w-10 rounded-xl border border-input bg-background/60 hover:bg-sidebar-accent/70" aria-label="Notificações">
                <Bell className="h-4 w-4 m-auto" aria-hidden />
                <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-primary" />
              </button>

              <div className="h-10 px-3 rounded-xl border border-input bg-background/60 flex items-center gap-3">
                <div className="h-6 w-6 rounded-full bg-gradient-to-br from-primary to-secondary" aria-hidden />
                <div className="flex flex-col">
                  <div className="text-sm font-medium">{userName}</div>
                  {userRole && <div className="text-[11px] text-muted-foreground">{userRole}</div>}
                </div>
              </div>
            </div>
          </header>

          <main className="p-4 lg:p-6">{children}
            <div className="watermark">⚡ Funcionou.AI</div>
          </main>
        </div>
      </div>
    </div>
  );
}
