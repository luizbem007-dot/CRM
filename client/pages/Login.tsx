import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        console.error("Supabase login error:", error);
        setError("Usuário ou senha incorretos.");
        return;
      }

      // Retrieve current session and persist it locally
      const sessionRes = await supabase.auth.getSession();
      if (sessionRes.error) {
        console.warn("Erro ao obter sessão Supabase:", sessionRes.error);
      }

      const session = sessionRes.data?.session ?? data.session ?? null;
      if (session) {
        localStorage.setItem("supabaseSession", JSON.stringify(session));
      }

      // Get user metadata (display name/role) from user.user_metadata if available
      const user = data.user ?? session?.user ?? null;
      const userName = (user?.user_metadata as any)?.name ?? user?.email ?? "Agente";
      const userRole = (user?.user_metadata as any)?.role ?? "";

      localStorage.setItem("userName", userName);
      localStorage.setItem("userRole", userRole);

      navigate("/app");
    } catch (err: any) {
      console.error(err);
      setError("Erro ao conectar com o servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0F0D] via-[#0C1411] to-[#0A0F0D] text-foreground flex items-center justify-center px-4">
      <div className="relative w-full max-w-md">
        <div className="absolute -inset-0.5 bg-[conic-gradient(at_top_left,_var(--tw-gradient-stops))] from-primary/40 via-purple-400/30 to-primary/40 blur-xl rounded-3xl" />
        <div className="relative rounded-3xl border border-border/60 bg-card/80 backdrop-blur-xl p-8 shadow-2xl">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <span className="h-6 w-6 rounded-full bg-primary shadow-[0_0_30px_hsl(var(--primary))]" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">FIQON CRM</h1>
            <p className="mt-1 text-sm text-muted-foreground">Painel premium para agentes de IA</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm mb-1">E-mail</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={cn(
                  "w-full rounded-lg bg-background/60 border border-input px-3 py-2 outline-none",
                  "focus:ring-2 focus:ring-ring focus:border-transparent",
                )}
                placeholder="voce@empresa.com"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Senha</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={cn(
                  "w-full rounded-lg bg-background/60 border border-input px-3 py-2 outline-none",
                  "focus:ring-2 focus:ring-ring focus:border-transparent",
                )}
                placeholder="••••••••"
              />
            </div>
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded border-input bg-background/60"
                />
                Lembrar login
              </label>
            </div>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md p-2">
                {error}
              </div>
            )}

            <Button disabled={loading} type="submit" className="w-full h-11 text-base font-semibold shadow-[0_0_30px_hsl(var(--primary)/0.35)]">
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
