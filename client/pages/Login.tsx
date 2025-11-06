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
      // Use server-side auth to avoid depending on Supabase client auth in the browser
      const resp = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const body = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        console.error('Server login failed', resp.status, body);
        setError(body.message || 'Usuário ou senha incorretos.');
        return;
      }

      const token = body.token;
      const user = body.user ?? { name: email, role: '' };
      if (token) localStorage.setItem('token', token);
      localStorage.setItem('userName', user.name ?? email);
      localStorage.setItem('userRole', user.role ?? '');

      navigate('/app');
    } catch (err: any) {
      console.error(err);
      setError('Erro ao conectar com o servidor');
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
            <div className="mx-auto mb-4 h-20 w-20 rounded-2xl bg-transparent flex items-center justify-center">
              <img src="https://cdn.builder.io/api/v1/image/assets%2Fc7a665936108422ea7c0c4c7a1027698%2Ff4f6d8a8cede428fa0c26b651908a2f8?format=webp&width=800" alt="Funcionou.AI" className="h-20 w-20 object-contain" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Funcionou.AI</h1>
            <p className="mt-1 text-sm text-text-secondary">Painel premium para agentes de IA</p>
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
