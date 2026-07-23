import type { AdminViewServerProps } from "payload";
import Link from "next/link";
import Image from "next/image";

const NAVY = "#1D2B3C";
const GOLD = "#C1A160";

type Shortcut = { title: string; description: string; href: string; stat?: string; highlight?: boolean };

/**
 * Home do EA HUB (registrada em admin.components.views.dashboard) — substitui
 * a tela inicial padrão do Payload por uma central organizada e com a marca
 * da Empresarial Academy. Server Component: recebe `payload`/`initPageResult`
 * como props diretas.
 */
export async function EaHubDashboard({ payload, initPageResult }: AdminViewServerProps) {
  const user = initPageResult?.req?.user;
  if (!user) {
    return <div style={{ padding: 24 }}>Acesso restrito ao EA HUB.</div>;
  }

  const [posts, materials, leads, adCampaigns] = await Promise.all([
    payload.count({ collection: "posts" }),
    payload.count({ collection: "materials" }),
    payload.count({ collection: "leads" }),
    payload.count({ collection: "ad-campaigns" }),
  ]);

  const groups: { label: string; items: Shortcut[] }[] = [
    {
      label: "Marketing",
      items: [
        {
          title: "EA Marketing Manager",
          description: "Central de marketing: conteúdo, e-mail, leads e todos os sistemas da EA.",
          href: "/eahub/marketing-manager",
          highlight: true,
        },
        {
          title: "EA ADS Manager",
          description: "Campanhas do Google Ads, forecast, CAC, ROI e concorrentes.",
          href: "/eahub/ads-performance",
          stat: `${adCampaigns.totalDocs} campanha(s)`,
        },
      ],
    },
    {
      label: "Conteúdo",
      items: [
        { title: "Artigos do blog", description: "Criar, editar, agendar e pré-visualizar posts.", href: "/eahub/collections/posts", stat: `${posts.totalDocs} artigo(s)` },
        { title: "Materiais ricos", description: "E-books e materiais para captação de leads.", href: "/eahub/collections/materials", stat: `${materials.totalDocs} material(is)` },
        { title: "Depoimentos", description: "Prova social exibida no site e na LP.", href: "/eahub/collections/testimonials" },
      ],
    },
    {
      label: "Captação",
      items: [
        { title: "Leads", description: "Contatos captados — WhatsApp, preferências e resultado comercial.", href: "/eahub/collections/leads", stat: `${leads.totalDocs} lead(s)` },
        { title: "Sistemas EA", description: "Portfólio de sistemas da Empresarial Academy.", href: "/eahub/collections/system-links" },
      ],
    },
  ];

  const firstName = (user as { name?: string; email?: string }).name?.split(" ")[0]
    ?? (user as { email?: string }).email
    ?? "";

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
        <Image src="/logo-empresarial-academy.png" alt="" width={192} height={183} style={{ width: 60, height: "auto" }} />
        <div>
          <h1 style={{ margin: 0, color: "#fff" }}>EA HUB</h1>
          <p style={{ margin: "0.25rem 0 0", color: GOLD }}>
            {firstName ? `Olá, ${firstName}. ` : ""}Central de gestão da Empresarial Academy.
          </p>
        </div>
      </header>

      <div style={{ padding: "1.5rem 2rem", display: "grid", gap: "1.75rem" }}>
        {groups.map((group) => (
          <section key={group.label}>
            <h2 style={{ margin: "0 0 0.6rem", fontSize: "1.05rem" }}>{group.label}</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "0.9rem" }}>
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    display: "block",
                    textDecoration: "none",
                    color: "inherit",
                    background: "var(--theme-elevation-50)",
                    border: "1px solid var(--theme-elevation-150)",
                    borderTop: `3px solid ${GOLD}`,
                    borderRadius: 6,
                    padding: item.highlight ? "1.3rem 1.5rem" : "1.05rem 1.25rem",
                  }}
                >
                  <strong style={item.highlight ? { fontSize: "1.05rem" } : undefined}>{item.title}</strong>
                  <p style={{ margin: "0.35rem 0 0.5rem", fontSize: "0.85rem", color: "var(--theme-elevation-700)" }}>
                    {item.description}
                  </p>
                  {item.stat ? (
                    <span style={{ fontSize: "0.8rem", color: "var(--theme-elevation-500)" }}>{item.stat}</span>
                  ) : null}
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
