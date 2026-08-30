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
            radial-gradient(760px 620px at 50% 8%, rgba(193,161,96,0.18) 0%, rgba(193,161,96,0) 60%),
            radial-gradient(600px 520px at 82% 68%, rgba(61,92,128,0.35) 0%, rgba(61,92,128,0) 60%),
            radial-gradient(1200px 900px at 50% 0%, #26374C 0%, #1D2B3C 45%, #0E1420 100%)
          `,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1.75rem",
          padding: "2rem 1.5rem",
        }}
      >
        <style>{`body { background: #fff; }`}</style>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1.75rem",
            padding: "3rem 2.75rem",
            borderRadius: 24,
            background: "rgba(255,255,255,0.045)",
            border: "1px solid rgba(193,161,96,0.22)",
            backdropFilter: "blur(28px)",
            WebkitBackdropFilter: "blur(28px)",
            boxShadow: "0 24px 60px -8px rgba(0,0,0,0.5), 0 0 50px rgba(193,161,96,0.08)",
            width: "100%",
            maxWidth: 380,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.9rem" }}>
            <SystemLogo systemName={systemName} size={140} glow />
            <p style={{ margin: 0, fontSize: "0.85rem", color: "#D9DCE1", textAlign: "center" }}>{tagline}</p>
          </div>
          <PayloadLoginForm
            userSlug={userSlug}
            apiRoute={routes.api}
            adminRoute={routes.admin}
            forgotRoute={`${forgotRoute}${redirectParam}`}
          />
        </div>
        <p style={{ fontSize: "0.75rem", color: "#6B7280", marginTop: "0.25rem" }}>
          Empresarial Academy — Conhecimento que Impulsiona
        </p>
      </div>
    );
  };
}
