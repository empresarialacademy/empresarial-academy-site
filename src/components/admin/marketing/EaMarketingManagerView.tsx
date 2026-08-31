import type { AdminViewServerProps } from "payload";
import { SystemLogo } from "@/components/admin/brand/SystemLogo";
import { EaHubThemeWrapper } from "./EaHubThemeWrapper";
import { EaHubCommercialCockpit } from "./EaHubCommercialCockpit";

type SystemLinkDoc = {
  id: string | number;
  name: string;
  url?: string | null;
  description?: string | null;
  order?: number | null;
};

export async function EaMarketingManagerView({ payload, initPageResult }: AdminViewServerProps) {
  const user = initPageResult?.req?.user;
  if (!user) {
    return <div style={{ padding: 24 }}>Acesso restrito ao admin.</div>;
  }

  const firstName = (user as { name?: string; email?: string }).name?.split(" ")[0]
    ?? (user as { email?: string }).email
    ?? "";

  const [
    adCampaigns,
    emailCampaigns,
    leads,
    dmeLeads,
    contracts,
    signedContracts,
    systemLinksRes,
  ] = await Promise.all([
    payload.count({ collection: "ad-campaigns" }).catch(() => ({ totalDocs: 0 })),
    payload.count({ collection: "email-campaigns" }).catch(() => ({ totalDocs: 0 })),
    payload.count({ collection: "leads" }).catch(() => ({ totalDocs: 0 })),
    payload.count({
      collection: "leads",
      where: { origin: { equals: "diagnostico-maturidade" } },
    }).catch(() => ({ totalDocs: 0 })),
    payload.count({ collection: "contracts" }).catch(() => ({ totalDocs: 0 })),
    payload.count({
      collection: "contracts",
      where: { status: { equals: "signed" } },
    }).catch(() => ({ totalDocs: 0 })),
    payload.find({ collection: "system-links", limit: 100, depth: 0, sort: "order" }).catch(() => ({ docs: [] })),
  ]);

  // O hub não lista a si mesmo nem itens duplicados
  const systemLinks = (systemLinksRes.docs as unknown as SystemLinkDoc[]).filter((l) => {
    const url = (l.url ?? "").trim().replace(/\/+$/, "");
    return url !== "/eahub" && !url.includes("/eahub/marketing-manager");
  });

  return (
    <EaHubThemeWrapper userName={firstName}>
      <header
        style={{
          background: "#1D2B3C",
          color: "#FFFFFF",
          borderRadius: 16,
          borderBottom: "3px solid #C99A3E",
          padding: "1.6rem 1.85rem",
          marginBottom: "1.75rem",
          display: "flex",
          alignItems: "center",
          gap: "1.5rem",
          boxShadow: "0 4px 20px rgba(29, 43, 60, 0.12)",
        }}
      >
        <SystemLogo systemName="Hub" size={78} glow />
        <div style={{ display: "grid", gap: "0.25rem" }}>
          <p style={{ margin: 0, color: "#C99A3E", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "'Sora', sans-serif" }}>
            Empresarial Academy · Cockpit Comercial
          </p>
          <h1 style={{ margin: 0, color: "#FFFFFF", fontFamily: "'Sora', sans-serif", fontSize: "clamp(1.4rem, 2vw, 1.9rem)", fontWeight: 700, lineHeight: 1.2, letterSpacing: "-0.02em" }}>
            {firstName ? `Olá, ${firstName}.` : "Painel Central EA HUB"}
          </h1>
          <p style={{ margin: 0, color: "#D7C089", fontSize: "0.9rem", lineHeight: 1.5 }}>
            Central de comando comercial: tração de tráfego, diagnósticos de maturidade, reuniões de fechamento e gestão de contratos.
          </p>
        </div>
      </header>

      {/* Cockpit Comercial Linear em 4 Fases */}
      <EaHubCommercialCockpit
        leadsCount={leads.totalDocs}
        dmeLeadsCount={dmeLeads.totalDocs}
        emailsCount={emailCampaigns.totalDocs}
        adsCount={adCampaigns.totalDocs}
        contractsCount={contracts.totalDocs}
        signedContractsCount={signedContracts.totalDocs}
        systemLinks={systemLinks}
      />
    </EaHubThemeWrapper>
  );
}
