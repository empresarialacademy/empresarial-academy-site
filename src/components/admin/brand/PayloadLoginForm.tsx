"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const GOLD = "#C1A160";

/**
 * Form de login próprio, reaproveitado nos 3 sistemas Payload (site/EA HUB,
 * EA Post, EA Flow) dentro do layout de PayloadLoginView — substitui o
 * LoginForm nativo do Payload (não exportado publicamente por
 * @payloadcms/next, importar de caminho interno seria frágil entre
 * versões). Mesmo endpoint REST que o form nativo usa por baixo dos panos
 * (POST /api/{userSlug}/login) — mesmo padrão já validado em produção pelo
 * login próprio do EA Flow (LoginForm.tsx).
 */
export function PayloadLoginForm({
  userSlug,
  apiRoute,
  adminRoute,
  forgotRoute,
}: {
  userSlug: string;
  apiRoute: string;
  adminRoute: string;
  forgotRoute?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiRoute}/${userSlug}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        setError("E-mail ou senha incorretos.");
        return;
      }
      const redirectTo = searchParams.get("redirect");
      router.push(redirectTo && redirectTo.startsWith("/") ? redirectTo : adminRoute);
      router.refresh();
    } catch {
      setError("Não foi possível conectar. Tente de novo.");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.7rem 0.85rem",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.18)",
    color: "#fff",
    fontSize: "0.92rem",
    borderRadius: 4,
  };

  return (
    <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: 340, display: "flex", flexDirection: "column", gap: "1.1rem" }}>
      <div>
        <label htmlFor="email" style={{ display: "block", fontSize: "0.78rem", color: "#D9DCE1", marginBottom: "0.4rem" }}>
          E-mail
        </label>
        <input
          id="email"
          type="email"
          required
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />
      </div>
      <div>
        <label htmlFor="password" style={{ display: "block", fontSize: "0.78rem", color: "#D9DCE1", marginBottom: "0.4rem" }}>
          Senha
        </label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
        />
      </div>

      {error ? <p style={{ margin: 0, color: "#E08585", fontSize: "0.82rem" }}>{error}</p> : null}

      <button
        type="submit"
        disabled={loading}
        style={{
          width: "100%",
          padding: "0.75rem",
          background: GOLD,
          color: "#1D2B3C",
          fontWeight: 700,
          fontFamily: "Montserrat, Arial, sans-serif",
          border: "none",
          borderRadius: 4,
          cursor: loading ? "default" : "pointer",
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? "Entrando..." : "Entrar"}
      </button>

      {forgotRoute ? (
        <a href={forgotRoute} style={{ fontSize: "0.78rem", color: "#9AA3AF", textAlign: "center" }}>
          Esqueci minha senha
        </a>
      ) : null}
    </form>
  );
}
