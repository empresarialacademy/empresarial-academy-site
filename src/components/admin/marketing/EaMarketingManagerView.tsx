import type { AdminViewServerProps } from "payload";
import Link from "next/link";
import Image from "next/image";

const NAVY = "#1D2B3C";
const GOLD = "#C1A160";

type Card = {
  title: string;
  description: string;
  href: string;
  stat?: string;
  external?: boolean;
  disabled?: boolean;
};

type SystemLinkDoc = {
  id: string | number;
  name: string;
  url?: string | null;
  description?: string | null;
  order?: number | null;
};

/**
 * "EA Marketing Manager" — HUB de sistemas da EA (definição do Thiago,
 * 2026-07-23): links de todos os sistemas criados + gestão de conteúdo do
 * site + e-mail marketing. O EA ADS Manager é apartado, mas a origem dele é
 * este hub. Os cards de "Sistemas EA" vêm da coleção `system-links` — o
 * Thiago adiciona sistemas novos por lá, sem código.
 */
export async function EaMarketingManagerView({ payload, initPageResult }: AdminViewServerProps) {
  const user = initPageResult?.req?.user;
  if (!user) {
    return <div style={{ padding: 24 }}>Acesso restrito ao admin.</div>;
  }

  const firstName = (user as { name?: string; email?: string }).name?.split(" ")[0]
    ?? (user as { email?: string }).email
    ?? "";

  const [adCampaigns, emailCampaigns, emailSegments, leads, posts, materials, contentCalendar, systemLinksRes] =
    await Promise.all([
      payload.count({ collection: "ad-campaigns" }),
      payload.count({ collection: "email-campaigns" }),
      payload.count({ collection: "email-segments" }),
      payload.count({ collection: "leads" }),
      payload.count({ collection: "posts" }),
      payload.count({ collection: "materials" }),
      payload.count({ collection: "content-calendar" }),
      payload.find({ collection: "system-links", limit: 100, depth: 0, sort: "order" }),
    ]);

  // O hub não lista a si mesmo (home /eahub nem a rota antiga /marketing-manager).
  const systemLinks = (systemLinksRes.docs as unknown as SystemLinkDoc[]).filter((l) => {
    const url = (l.url ?? "").trim().replace(/\/+$/, "");
    return url !== "/eahub" && !url.includes("/eahub/marketing-manager");
  });

  const adsCard: Card = {
    title: "EA ADS Manager",
    description:
      "Desempenho das campanhas do Google Ads, forecast pré-investimento, CAC, ROI, concorrentes e sugestões automáticas.",
    href: "/eahub/ads-performance",
    stat: `${adCampaigns.totalDocs} campanha(s)`,
  };

  const contentCards: Card[] = [
    { title: "Artigos do blog", description: "Criar, editar e agendar publicações.", href: "/eahub/collections/posts", stat: `${posts.totalDocs} artigo(s)` },
    { title: "Materiais ricos", description: "E-books e materiais para captação de leads.", href: "/eahub/collections/materials", stat: `${materials.totalDocs} material(is)` },
    { title: "Mídia", description: "Imagens e arquivos usados no site.", href: "/eahub/collections/media" },
    { title: "Depoimentos", description: "Prova social exibida no site e na LP.", href: "/eahub/collections/testimonials" },
  ];

  /** LPs dedicadas por palavra-chave do Google Ads (Frente 2, 12/08/2026) —
   * as 3 páginas compartilham o mesmo template (ConsultoriaLPTemplate), só o
   * topo muda por keyword. Cards abrem em nova aba (são páginas publicadas,
   * não telas do admin). */
  const landingPageCards: Card[] = [
    { title: "LP · Consultoria PME (canônica)", description: "Página principal, usada como canonical das outras 2.", href: "/consultoria-pme", external: true },
    { title: "LP · Consultoria de Gestão Empresarial", description: "Dedicada à keyword \"consultoria de gestão empresarial\".", href: "/consultoria-de-gestao-empresarial", external: true },
    { title: "LP · Consultoria para Pequenas Empresas", description: "Dedicada à keyword \"consultoria empresarial para pequenas empresas\".", href: "/consultoria-empresarial-para-pequenas-empresas", external: true },
  ];

  const socialCards: Card[] = [
    {
      title: "Calendário de Conteúdo",
      description: "Posts de Instagram, Facebook, YouTube e LinkedIn — lançamento do site e reaproveitamento de blog/materiais.",
      href: "/eahub/collections/content-calendar",
      stat: `${contentCalendar.totalDocs} item(ns)`,
    },
  ];

  const emailCards: Card[] = [
    { title: "Campanhas de e-mail", description: "Disparos manuais para um segmento de leads.", href: "/eahub/collections/email-campaigns", stat: `${emailCampaigns.totalDocs} campanha(s)` },
    { title: "Segmentos", description: "Critérios de seleção de leads (origem, pilar, score).", href: "/eahub/collections/email-segments", stat: `${emailSegments.totalDocs} segmento(s)` },
    { title: "Envios", description: "Histórico de e-mails enviados (nutrição, alertas, campanhas).", href: "/eahub/collections/email-logs" },
    { title: "Leads", description: "Base de contatos — origem, consentimento, atribuição de campanha e resultado comercial.", href: "/eahub/collections/leads", stat: `${leads.totalDocs} lead(s)` },
  ];

  /** Regras automáticas ativas (12/08/2026) — vivem no código
   * (nurture-emails.ts, diagnostic-email.ts, content-alerts.ts), não numa
   * coleção, então não há tela pra editar por aqui. Este bloco é só de
   * controle/visibilidade: toda vez que uma regra nova entrar em produção,
   * adicionar uma linha aqui. */
  const automationRules: {
    nome: string;
    gatilho: string;
    quando: string;
    publico: string;
  }[] = [
    {
      nome: "Resultado do diagnóstico",
      gatilho: "Lead conclui o Diagnóstico de Maturidade",
      quando: "Imediato",
      publico: "Quem termina o diagnóstico — personalizado pelo pilar mais fraco",
    },
    {
      nome: "Nutrição pós-diagnóstico (E1/E2/E3)",
      gatilho: "Cron diário (mesmo lead do diagnóstico)",
      quando: "D+2 (custo + ações) · D+5 (método) · D+7 (convite pra call)",
      publico: "Leads do diagnóstico com consentimento e sem opt-out, criados a partir de 18/07/2026 — encerra sem enviar após 30 dias parado",
    },
    {
      nome: "Alerta de novo conteúdo",
      gatilho: "Publicação de Artigo ou Material",
      quando: "Imediato (publicação direta) ou no cron diário (agendados)",
      publico: "Assinantes da newsletter/pop-up com consentimento e sem opt-out de marketing",
    },
  ];

  const systemCards: Card[] = systemLinks.map((l) => {
    const url = (l.url ?? "").trim();
    return {
      title: l.name,
      description: l.description ?? "",
      href: url || "#",
      external: /^https?:\/\//.test(url),
      disabled: !url,
    };
  });

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
          <h1 style={{ margin: 0, color: "#fff" }}>Empresarial Academy Hub</h1>
          <p style={{ margin: "0.25rem 0 0", color: GOLD }}>
            {firstName ? `Olá, ${firstName}. ` : ""}Hub de sistemas da Empresarial Academy — conteúdo, e-mail marketing, Ads e todos os sistemas num só lugar.
          </p>
        </div>
      </header>

      <div style={{ padding: "1.5rem 2rem", display: "grid", gap: "1.75rem" }}>
        <Section title="Anúncios">
          <CardGrid cards={[adsCard]} highlight />
        </Section>

        <Section title="Conteúdo do site">
          <CardGrid cards={contentCards} />
        </Section>

        <Section title="Landing Pages (Ads)">
          <CardGrid cards={landingPageCards} />
        </Section>

        <Section title="Redes sociais">
          <CardGrid cards={socialCards} />
        </Section>

        <Section title="E-mail marketing e leads">
          <CardGrid cards={emailCards} />
          <RuleTable title="Regras automáticas ativas" rules={automationRules} />
        </Section>

        <Section
          title="Sistemas EA"
          action={{ label: "Gerenciar links", href: "/eahub/collections/system-links" }}
        >
          <CardGrid cards={systemCards} />
        </Section>
      </div>
    </div>
  );
}

function Section({
  title,
  action,
  children,
}: {
  title: string;
  action?: { label: string; href: string };
  children: React.ReactNode;
}) {
  return (
    <section>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "0.6rem" }}>
        <h2 style={{ margin: 0, fontSize: "1.05rem" }}>{title}</h2>
        {action ? (
          <Link href={action.href} style={{ fontSize: "0.8rem" }}>
            {action.label}
          </Link>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function RuleTable({
  title,
  rules,
}: {
  title: string;
  rules: { nome: string; gatilho: string; quando: string; publico: string }[];
}) {
  return (
    <div style={{ marginTop: "1.1rem" }}>
      <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--theme-elevation-700)", marginBottom: "0.5rem" }}>
        {title}
      </div>
      <div style={{ overflowX: "auto", border: "1px solid var(--theme-elevation-150)", borderRadius: 6 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
          <thead>
            <tr style={{ background: "var(--theme-elevation-50)", borderBottom: `2px solid ${GOLD}` }}>
              <th style={{ textAlign: "left", padding: "0.6rem 0.9rem" }}>Regra</th>
              <th style={{ textAlign: "left", padding: "0.6rem 0.9rem" }}>Gatilho</th>
              <th style={{ textAlign: "left", padding: "0.6rem 0.9rem" }}>Quando</th>
              <th style={{ textAlign: "left", padding: "0.6rem 0.9rem" }}>Público</th>
            </tr>
          </thead>
          <tbody>
            {rules.map((r) => (
              <tr key={r.nome} style={{ borderTop: "1px solid var(--theme-elevation-150)" }}>
                <td style={{ padding: "0.6rem 0.9rem", fontWeight: 600 }}>{r.nome}</td>
                <td style={{ padding: "0.6rem 0.9rem", color: "var(--theme-elevation-700)" }}>{r.gatilho}</td>
                <td style={{ padding: "0.6rem 0.9rem", color: "var(--theme-elevation-700)" }}>{r.quando}</td>
                <td style={{ padding: "0.6rem 0.9rem", color: "var(--theme-elevation-700)" }}>{r.publico}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CardGrid({ cards, highlight = false }: { cards: Card[]; highlight?: boolean }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: highlight ? "1fr" : "repeat(auto-fill, minmax(240px, 1fr))",
        gap: "0.9rem",
      }}
    >
      {cards.map((card) => {
        const style: React.CSSProperties = {
          display: "block",
          textDecoration: "none",
          color: "inherit",
          background: "var(--theme-elevation-50)",
          border: "1px solid var(--theme-elevation-150)",
          borderTop: `3px solid ${card.disabled ? "var(--theme-elevation-200)" : GOLD}`,
          borderRadius: 6,
          padding: highlight ? "1.3rem 1.5rem" : "1.05rem 1.25rem",
          opacity: card.disabled ? 0.6 : 1,
        };
        const content = (
          <>
            <strong style={highlight ? { fontSize: "1.05rem" } : undefined}>{card.title}</strong>
            {card.description ? (
              <p style={{ margin: "0.35rem 0 0.5rem", fontSize: "0.85rem", color: "var(--theme-elevation-700)" }}>
                {card.description}
              </p>
            ) : null}
            {card.stat ? (
              <span style={{ fontSize: "0.8rem", color: "var(--theme-elevation-500)" }}>{card.stat}</span>
            ) : null}
            {card.disabled ? (
              <span style={{ display: "inline-block", fontSize: "0.75rem", color: "var(--theme-elevation-500)" }}>
                Em breve
              </span>
            ) : null}
          </>
        );

        if (card.disabled) {
          return (
            <div key={card.title} style={style}>
              {content}
            </div>
          );
        }
        if (card.external) {
          return (
            <a key={card.title} href={card.href} target="_blank" rel="noopener noreferrer" style={style}>
              {content}
            </a>
          );
        }
        return (
          <Link key={card.title} href={card.href} style={style}>
            {content}
          </Link>
        );
      })}
    </div>
  );
}
