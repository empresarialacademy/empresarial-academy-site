import type { AdminViewServerProps } from "payload";
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
