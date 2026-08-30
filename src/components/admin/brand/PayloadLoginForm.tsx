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
    <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: 340, display: "flex", flexDirection: "column", gap: "1.1rem" }}>
      <style>{`
        .ea-login-input {
          width: 100%;
          padding: 0.75rem 0.95rem;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.14);
          color: #fff;
          font-size: 0.92rem;
          border-radius: 12px;
          transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
        }
        .ea-login-input::placeholder { color: rgba(255,255,255,0.35); }
        .ea-login-input:focus {
          outline: none;
          border-color: rgba(193,161,96,0.65);
          background: rgba(255,255,255,0.08);
          box-shadow: 0 0 0 4px rgba(193,161,96,0.12);
        }
        .ea-login-submit {
          width: 100%;
          padding: 0.8rem;
          background: linear-gradient(180deg, #D4BD90 0%, #C1A160 100%);
          color: #1D2B3C;
          font-weight: 700;
          font-family: Montserrat, Arial, sans-serif;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          box-shadow: 0 8px 24px -4px rgba(193,161,96,0.45);
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .ea-login-submit:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 12px 28px -4px rgba(193,161,96,0.55);
        }
        .ea-login-submit:disabled { opacity: 0.7; cursor: default; }
        .ea-login-forgot { transition: color 0.2s ease; }
        .ea-login-forgot:hover { color: ${GOLD}; }
      `}</style>

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
          className="ea-login-input"
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
          className="ea-login-input"
        />
      </div>

      {error ? <p style={{ margin: 0, color: "#E08585", fontSize: "0.82rem" }}>{error}</p> : null}

      <button type="submit" disabled={loading} className="ea-login-submit">
        {loading ? "Entrando..." : "Entrar"}
      </button>

      {forgotRoute ? (
        <a href={forgotRoute} className="ea-login-forgot" style={{ fontSize: "0.78rem", color: "#9AA3AF", textAlign: "center" }}>
          Esqueci minha senha
        </a>
      ) : null}
    </form>
  );
}
