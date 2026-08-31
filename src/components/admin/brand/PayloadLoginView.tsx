import type { AdminViewServerProps } from "payload";
import { redirect } from "next/navigation";
import { SystemLogo } from "./SystemLogo";
import { PayloadLoginForm } from "./PayloadLoginForm";

/**
 * Tela de login própria, no lugar da tela nativa (quadrada, genérica) do
 * Payload — mesmo padrão nos 3 sistemas Payload da EA (site/EA HUB, EA
 * Post, EA Flow). Registrada em admin.components.views.login (path
 * "/login") de cada payload.config.ts; cada sistema só passa seu próprio
 * `systemName`/`tagline` — o resto (fundo, glow, card de vidro, form) é
 * idêntico. Tratamento visual com efeito (glow atmosférico + glassmorphism
 * + sombra), pedido explícito do Thiago em 30/08/2026 — desenhado primeiro
 * em Figma (arquivo "EA Login Screens") antes de traduzir pra CSS.
 *
 * `position: fixed; inset: 0` de propósito: o template "minimal" do
 * Payload envolve a view custom num container com padding/max-width
 * próprios — sem isso o fundo não cobre a tela inteira (bug visto em
 * produção em 30/08/2026, corrigido nesta mesma sessão). O `<style>` que
 * força `body { background: #fff }` é o mesmo tipo de fallback: garante um
 * fundo neutro atrás do overlay em vez do branco/cinza padrão do navegador
 * enquanto o CSS do gradiente carrega.
 */
export function PayloadLoginView({ systemName, tagline }: { systemName: string; tagline: string }) {
  return function LoginViewForSystem({ initPageResult, searchParams }: AdminViewServerProps) {
    const { req } = initPageResult;
    if (req.user) {
      redirect(req.payload.config.routes.admin);
    }

    const { routes, admin } = req.payload.config;
    const userSlug = admin.user;
    const forgotRoute = `${routes.admin}${routes.admin.endsWith("/") ? "" : "/"}forgot`.replace(/\/{2,}/g, "/");
    const redirectParam = typeof searchParams?.redirect === "string" ? `?redirect=${encodeURIComponent(searchParams.redirect)}` : "";

    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          overflowY: "auto",
          background: `
            radial-gradient(900px 680px at 50% 5%, rgba(201,154,62,0.14) 0%, rgba(201,154,62,0) 65%),
            radial-gradient(800px 600px at 85% 75%, rgba(38,56,78,0.45) 0%, rgba(38,56,78,0) 65%),
            linear-gradient(180deg, #172433 0%, #0F1722 50%, #080D14 100%)
          `,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1.5rem",
          padding: "2.5rem 1.5rem",
          fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        }}
      >
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Sora:wght@600;700&display=swap');
          body { background: #080D14; }
        `}</style>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1.75rem",
            padding: "2.75rem 2.5rem 2.25rem",
            borderRadius: 20,
            background: "linear-gradient(180deg, rgba(255,255,255,0.065) 0%, rgba(255,255,255,0.035) 100%)",
            border: "1px solid rgba(201,154,62,0.24)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            boxShadow: "0 28px 64px -12px rgba(0,0,0,0.65), 0 0 40px rgba(201,154,62,0.06), inset 0 1px 0 rgba(255,255,255,0.12)",
            width: "100%",
            maxWidth: 400,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.85rem" }}>
            <SystemLogo systemName={systemName} size={135} glow />
            <p style={{ margin: 0, fontSize: "0.85rem", color: "rgba(229,202,140,0.9)", textAlign: "center", fontWeight: 500, letterSpacing: "0.01em" }}>
              {tagline}
            </p>
          </div>
          <PayloadLoginForm
            userSlug={userSlug}
            apiRoute={routes.api}
            adminRoute={routes.admin}
            forgotRoute={`${forgotRoute}${redirectParam}`}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.35rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#8A93A0", fontSize: "0.72rem", fontWeight: 500 }}>
            <span>🔒</span>
            <span>Ambiente Seguro & Criptografado</span>
            <span style={{ opacity: 0.4 }}>•</span>
            <span style={{ color: "#C99A3E", fontWeight: 600 }}>Empresarial Academy</span>
          </div>
          <p style={{ margin: 0, fontSize: "0.7rem", color: "#5B6472" }}>
            Conhecimento que Impulsiona
          </p>
        </div>
      </div>
    );
  };
}
