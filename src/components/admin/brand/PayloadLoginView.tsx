import type { AdminViewServerProps } from "payload";
import { redirect } from "next/navigation";
import { SystemLogo } from "./SystemLogo";
import { PayloadLoginForm } from "./PayloadLoginForm";

const NAVY = "#1D2B3C";

/**
 * Tela de login própria, no lugar da tela nativa (quadrada, genérica) do
 * Payload — mesmo padrão nos 3 sistemas Payload da EA (site/EA HUB, EA
 * Post, EA Flow). Registrada em admin.components.views.login (path
 * "/login") de cada payload.config.ts; cada sistema só passa seu próprio
 * `systemName`/`tagline` — o resto (fundo, form, submit) é idêntico.
 *
 * Se o usuário já está logado, redireciona pro admin (mesmo comportamento
 * da view nativa) em vez de mostrar o form de novo.
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
          minHeight: "100vh",
          background: `linear-gradient(160deg, ${NAVY} 0%, #12192480 100%), ${NAVY}`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "2.5rem",
          padding: "2rem 1.5rem",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.9rem" }}>
          <SystemLogo systemName={systemName} size={180} />
          <p style={{ margin: 0, fontSize: "0.85rem", color: "#D9DCE1", textAlign: "center" }}>{tagline}</p>
        </div>
        <PayloadLoginForm
          userSlug={userSlug}
          apiRoute={routes.api}
          adminRoute={routes.admin}
          forgotRoute={`${forgotRoute}${redirectParam}`}
        />
        <p style={{ fontSize: "0.75rem", color: "#6B7280", marginTop: "1rem" }}>
          Empresarial Academy — Conhecimento que Impulsiona
        </p>
      </div>
    );
  };
}
