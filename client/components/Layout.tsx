import React, { useState } from "react";
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
  children: React.ReactNode;
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
    <div className="min-h-screen bg-func-bg text-[var(--text-primary)]">
      <div className="flex h-screen">
        {/* Sidebar - desktop */}
        <aside className="sidebar-desktop hidden lg:flex w-[360px] shrink-0 h-screen sticky top-0 flex-col glass-panel" aria-label="Sidebar">
          <div className="h-20 flex items-center gap-3 px-6 border-b" style={{ borderColor: 'var(--border-weak)' }}>
            <div className="h-10 w-10 flex items-center justify-center rounded-md f-logo bg-transparent" aria-hidden>
              <img src="https://cdn.builder.io/api/v1/image/assets%2Fc7a665936108422ea7c0c4c7a1027698%2F62bee75c9cf54f7db5c6005f17af3083?format=webp&width=800" alt="Funcionou.AI" className="h-8 w-8 object-contain rounded-md" />
            </div>
            <div className="text-lg font-semibold tracking-tight">Funcionou.<span className="ml-1 neon">AI</span></div>
            <div className="ml-auto flex items-center gap-3 text-[13px]">
              <div className="text-sm text-[var(--text-secondary)]">{userName}</div>
            </div>
          </div>

          <nav className="p-4 space-y-3" role="navigation" aria-label="Main navigation">
            {tabs.map(({ key, label, icon: Icon }) => {
              const isActive = active === key;
              return (
                <button
                  key={key}
                  onClick={() => onChange(key)}
                  title={label}
                  aria-label={label}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-left contact-card",
                    "transition-all focus:outline-none focus:ring-2 focus:ring-offset-1",
                    isActive
                      ? "bg-[var(--hover-neon)] text-[var(--text-primary)] border border-[var(--border-weak)]"
                      : "hover:bg-[var(--hover-neon)] text-[var(--text-secondary)]",
                  )}
                >
                  <Icon className={cn("h-5 w-5", isActive && "neon")} aria-hidden />
                  <span className="flex-1 truncate">{label}</span>
                  {key === "conversas" && (
                    <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-[rgba(0,255,132,0.08)] text-[var(--neon-green)]">
                      3
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="mt-auto p-4">
            <button
              onClick={handleLogout}
              title="Sair"
              aria-label="Sair"
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover-neon)] focus:outline-none"
            >
              <LogOut className="h-5 w-5" aria-hidden />
              <span>Sair</span>
            </button>
            <div className="mt-3 text-[11px] text-[var(--text-secondary)]/80 px-3">
              © {new Date().getFullYear()} Funcionou.AI
            </div>
          </div>
        </aside>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="md:hidden fixed inset-0 z-40">
            <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} aria-hidden />
            <aside className="absolute left-0 top-0 h-full w-full bg-func-bg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 flex items-center justify-center">
                    <img src="https://cdn.builder.io/api/v1/image/assets%2Fc7a665936108422ea7c0c4c7a1027698%2F62bee75c9cf54f7db5c6005f17af3083?format=webp&width=800" alt="Funcionou.AI" className="h-8 w-8 object-contain" />
                  </div>
                  <div className="text-lg font-semibold tracking-tight">Funcionou.<span className="ml-1 neon">AI</span></div>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-md focus:outline-none">Fechar</button>
              </div>
              <nav className="space-y-2">
                {tabs.map(({ key, label, icon: Icon }) => (
                  <button key={key} onClick={() => { onChange(key); setSidebarOpen(false); }} title={label} className="w-full text-left px-3 py-3 rounded-xl hover:bg-[var(--hover-neon)]"> <Icon className="inline-block h-5 w-5 mr-3" /> {label}</button>
                ))}
              </nav>
            </aside>
          </div>
        )}

        {/* Main */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Topbar */}
          <header className="h-16 sticky top-0 backdrop-blur bg-func-bg/60 border-b flex items-center px-3 lg:px-6 gap-3" style={{ borderColor: 'var(--border-weak)' }}>
            <div className="flex items-center gap-4">
              <div className="md:hidden">
                <button onClick={() => setSidebarOpen(true)} aria-label="Abrir menu" title="Abrir menu" className="p-2 rounded-md focus:outline-none">
                  <Menu className="h-6 w-6" />
                </button>
              </div>

              <div className="flex items-center gap-3">
            <div className="h-10 w-10 flex items-center justify-center">
              <img src="https://cdn.builder.io/api/v1/image/assets%2Fc7a665936108422ea7c0c4c7a1027698%2F62bee75c9cf54f7db5c6005f17af3083?format=webp&width=800" alt="Funcionou.AI" className="h-10 w-10 object-contain rounded-md shadow-neon" />
            </div>
            <div className="hidden sm:block">
              <div className="text-lg font-semibold tracking-tight">Funcionou.<span className="ml-1 neon">AI</span></div>
              <div className="text-[11px] text-[var(--text-secondary)]">Central de Conversas</div>
            </div>
          </div>
            </div>

            <div className="flex items-center gap-2 rounded-xl bg-func-bg/60 border px-3 h-10 flex-1 max-w-xl" style={{ borderColor: 'var(--border-weak)' }} role="search" aria-label="Busca rápida">
              <Search className="h-4 w-4 text-[var(--text-secondary)]" aria-hidden />
              <input
                placeholder="Busca rápida"
                className="bg-transparent outline-none text-sm flex-1 text-[var(--text-primary)] pl-2"
              />
            </div>

            <div className="flex items-center gap-3 ml-3">
              <button className="relative h-10 w-10 rounded-xl border bg-func-bg/60" aria-label="Notificações" style={{ borderColor: 'var(--border-weak)' }}>
                <Bell className="h-4 w-4 m-auto text-[var(--text-secondary)]" aria-hidden />
                <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-[var(--neon-green)]" />
              </button>

              <div className="h-10 px-3 rounded-xl border bg-func-bg/60 flex items-center gap-3" style={{ borderColor: 'var(--border-weak)' }}>
                <div className="h-6 w-6 rounded-full bg-gradient-to-br from-[var(--neon-green)] to-[rgba(0,255,132,0.6)]" aria-hidden />
                <div className="flex flex-col">
                  <div className="text-sm font-medium">{userName}</div>
                  {userRole && <div className="text-[11px] text-[var(--text-secondary)]">{userRole}</div>}
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-hidden p-4 lg:p-6">{children}
            <div className="watermark">⚡ Funcionou.AI</div>
          </main>
        </div>
      </div>
    </div>
  );
}
