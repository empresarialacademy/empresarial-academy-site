import type { AdminViewServerProps } from "payload";
import Link from "next/link";
import Image from "next/image";

const NAVY = "#1D2B3C";
const GOLD = "#C1A160";

type Tool = {
  title: string;
  description: string;
  href: string;
  stat: string;
};

/**
 * "EA Marketing Manager" — hub das ferramentas de marketing, registrado em
 * payload.config.ts → admin.components.views. Ponto único de entrada; novas
 * ferramentas de marketing entram aqui como mais um card, sem mexer nas
 * telas que já existem.
 */
export async function EaMarketingManagerView({ payload, initPageResult }: AdminViewServerProps) {
  const user = initPageResult?.req?.user;
  if (!user) {
    return <div style={{ padding: 24 }}>Acesso restrito ao admin.</div>;
  }

  const [adCampaigns, emailCampaigns, emailSegments, leads] = await Promise.all([
    payload.count({ collection: "ad-campaigns" }),
    payload.count({ collection: "email-campaigns" }),
    payload.count({ collection: "email-segments" }),
    payload.count({ collection: "leads" }),
  ]);

  const tools: Tool[] = [
    {
      title: "Desempenho de Ads",
      description: "Campanhas do Google Ads, CAC, ROI e sugestões automáticas por campanha e palavra-chave.",
      href: "/admin/ads-performance",
      stat: `${adCampaigns.totalDocs} campanha(s)`,
    },
    {
      title: "Campanhas de e-mail",
      description: "Disparos manuais de e-mail marketing para um segmento de leads.",
      href: "/admin/collections/email-campaigns",
      stat: `${emailCampaigns.totalDocs} campanha(s)`,
    },
    {
      title: "Segmentos de e-mail",
      description: "Critérios salvos para selecionar leads por origem, pilar e score do diagnóstico.",
      href: "/admin/collections/email-segments",
      stat: `${emailSegments.totalDocs} segmento(s)`,
    },
    {
      title: "Leads",
      description: "Base de contatos captados pelo site — origem, consentimento e atribuição de campanha.",
      href: "/admin/collections/leads",
      stat: `${leads.totalDocs} lead(s)`,
    },
  ];

  return (
    <div>
      <header
        style={{
          background: NAVY,
          color: "#fff",
          padding: "2rem",
          display: "flex",
          alignItems: "center",
          gap: "1.25rem",
          borderBottom: `3px solid ${GOLD}`,
        }}
      >
        <Image src="/logo-empresarial-academy.png" alt="" width={192} height={183} style={{ width: 56, height: "auto" }} />
        <div>
          <h1 style={{ margin: 0, color: "#fff" }}>EA Marketing Manager</h1>
          <p style={{ margin: "0.25rem 0 0", color: GOLD }}>
            Todas as ferramentas de marketing da Empresarial Academy, num só lugar.
          </p>
        </div>
      </header>

      <div
        style={{
          padding: "1.5rem 2rem",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: "1rem",
        }}
      >
        {tools.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            style={{
              display: "block",
              textDecoration: "none",
              color: "inherit",
              background: "var(--theme-elevation-50)",
              border: "1px solid var(--theme-elevation-150)",
              borderTop: `3px solid ${GOLD}`,
              borderRadius: 6,
              padding: "1.1rem 1.3rem",
            }}
          >
            <strong>{tool.title}</strong>
            <p style={{ margin: "0.4rem 0 0.6rem", fontSize: "0.85rem", color: "var(--theme-elevation-700)" }}>
              {tool.description}
            </p>
            <span style={{ fontSize: "0.8rem", color: "var(--theme-elevation-500)" }}>{tool.stat}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
