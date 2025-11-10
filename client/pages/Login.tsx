import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Simple fixed authentication
    await new Promise((r) => setTimeout(r, 400));

    if (username === "Luiz" && password === "1234") {
      localStorage.setItem("userName", "Luiz");
      localStorage.setItem("userRole", "Agente");
      setLoading(false);
      navigate("/dashboard");
      return;
    }

    setLoading(false);
    setError("Usuário ou senha incorretos ⚠️");
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-[var(--text-primary)] flex items-center justify-center px-4">
      <div className="relative w-full max-w-md sm:max-w-[90%]">
        <div className="absolute inset-0 rounded-2xl" style={{ boxShadow: '0 8px 40px rgba(0,255,132,0.04)', borderRadius: 24 }} />

        <div className="relative rounded-2xl bg-[#111111] border" style={{ borderColor: 'rgba(0,255,132,0.18)', boxShadow: '0 12px 30px rgba(0,255,132,0.04)', padding: 32 }}>
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 h-20 w-20 rounded-2xl bg-transparent flex items-center justify-center">
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2Fc7a665936108422ea7c0c4c7a1027698%2F62bee75c9cf54f7db5c6005f17af3083?format=webp&width=800"
                alt="Funcionou.AI"
                className="h-20 w-20 object-contain"
              />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">Funcionou.<span className="ml-1 neon">AI</span></h1>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">Painel premium para agentes de IA</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm mb-1">Usuário</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-lg bg-transparent border px-3 py-3 outline-none text-sm"
                placeholder="Digite seu usuário"
                style={{ borderColor: 'rgba(255,255,255,0.06)', color: 'var(--text-primary)' }}
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Senha</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg bg-transparent border px-3 py-3 outline-none text-sm"
                placeholder="••••••••"
                style={{ borderColor: 'rgba(255,255,255,0.06)', color: 'var(--text-primary)' }}
              />
            </div>

            {error && (
              <div className="text-sm text-white bg-red-600/10 border border-red-600/30 rounded-md p-2 error-anim">
                {error}
              </div>
            )}

            <button
              disabled={loading}
              type="submit"
              className="w-full h-12 rounded-lg text-black font-semibold"
              style={{ background: '#00FF84', transition: 'transform .12s ease, background .12s ease' }}
              onMouseDown={() => { /* avoid focus outline flash */ }}
              onMouseUp={() => { /* noop */ }}
              onMouseLeave={() => { /* noop */ }}
              onTouchStart={() => { /* noop */ }}
            >
              <span style={{ display: 'inline-block', transform: 'translateZ(0)' }}>{loading ? 'Entrando...' : 'Entrar'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
