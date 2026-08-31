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
 *
 * Estilo com efeito (cantos suavizados, glow dourado no foco, botão com
 * gradiente e sombra) — pedido explícito do Thiago em 30/08/2026, desenhado
 * primeiro em Figma antes de traduzir pra CSS. `<style>` local com classe
 * `.ea-login-input` porque `:focus` não dá pra expressar em inline style.
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

  return (
    <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: 340, display: "flex", flexDirection: "column", gap: "1.2rem" }}>
      <style>{`
        .ea-login-input {
          width: 100%;
          padding: 0.8rem 1rem;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.14);
          color: #ffffff;
          font-size: 0.92rem;
          font-family: inherit;
          border-radius: 12px;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .ea-login-input::placeholder { color: rgba(255,255,255,0.3); font-size: 0.85rem; }
        .ea-login-input:focus {
          outline: none;
          border-color: #C99A3E;
          background: rgba(255,255,255,0.09);
          box-shadow: 0 0 0 3px rgba(201,154,62,0.22);
        }
        .ea-login-submit {
          width: 100%;
          padding: 0.85rem;
          background: linear-gradient(180deg, #E5CA8C 0%, #C99A3E 100%);
          color: #0F1722;
          font-weight: 700;
          font-family: 'Sora', 'Montserrat', Arial, sans-serif;
          font-size: 0.92rem;
          letter-spacing: 0.02em;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          box-shadow: 0 8px 24px -4px rgba(201,154,62,0.45), inset 0 1px 0 rgba(255,255,255,0.3);
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          margin-top: 0.3rem;
        }
        .ea-login-submit:hover:not(:disabled) {
          transform: translateY(-1.5px);
          background: linear-gradient(180deg, #EED79E 0%, #D8A94D 100%);
          box-shadow: 0 12px 28px -4px rgba(201,154,62,0.6);
        }
        .ea-login-submit:disabled { opacity: 0.65; cursor: not-allowed; transform: none; }
        .ea-login-forgot {
          transition: all 0.2s ease;
          text-decoration: none;
        }
        .ea-login-forgot:hover {
          color: #C99A3E !important;
          text-decoration: underline;
        }
      `}</style>

      <div>
        <label htmlFor="email" style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.78rem", fontWeight: 600, color: "rgba(255,255,255,0.85)", marginBottom: "0.45rem" }}>
          <span>✉️</span>
          <span>E-mail Corporativo</span>
        </label>
        <input
          id="email"
          type="email"
          required
          autoFocus
          placeholder="exemplo@empresarialacademy.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="ea-login-input"
        />
      </div>

      <div>
        <label htmlFor="password" style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.78rem", fontWeight: 600, color: "rgba(255,255,255,0.85)", marginBottom: "0.45rem" }}>
          <span>🔑</span>
          <span>Senha de Acesso</span>
        </label>
        <input
          id="password"
          type="password"
          required
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="ea-login-input"
        />
      </div>

      {error ? (
        <div style={{
          background: "rgba(181,72,43,0.18)",
          border: "1px solid rgba(181,72,43,0.45)",
          borderRadius: 8,
          padding: "0.55rem 0.75rem",
          color: "#FFA894",
          fontSize: "0.82rem",
          fontWeight: 500,
          textAlign: "center"
        }}>
          ⚠️ {error}
        </div>
      ) : null}

      <button type="submit" disabled={loading} className="ea-login-submit">
        {loading ? "Autenticando..." : "Acessar EA HUB →"}
      </button>

      {forgotRoute ? (
        <a href={forgotRoute} className="ea-login-forgot" style={{ fontSize: "0.78rem", color: "#8A93A0", textAlign: "center", marginTop: "0.2rem" }}>
          Esqueci minha senha
        </a>
      ) : null}
    </form>
  );
}
