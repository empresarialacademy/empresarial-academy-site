import type { AdminViewServerProps } from "payload";
import Link from "next/link";
import { SystemLogo } from "@/components/admin/brand/SystemLogo";
import { isBasicAuthProtectedPath } from "@/lib/basic-auth-protected-paths";
import { EaHubThemeWrapper } from "./EaHubThemeWrapper";
import { EaHubKpiOverview } from "./EaHubKpiOverview";
import { EaHubAlertsBanner } from "./EaHubAlertsBanner";

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
    emailSegments,
    leads,
    dmeLeads,
    contracts,
    signedContracts,
    pendingContracts,
    systemLinksRes,
  ] = await Promise.all([
    payload.count({ collection: "ad-campaigns" }).catch(() => ({ totalDocs: 0 })),
    payload.count({ collection: "email-campaigns" }).catch(() => ({ totalDocs: 0 })),
    payload.count({ collection: "email-segments" }).catch(() => ({ totalDocs: 0 })),
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
    payload.count({
      collection: "contracts",
      where: { status: { equals: "sent" } },
    }).catch(() => ({ totalDocs: 0 })),
    payload.find({ collection: "system-links", limit: 100, depth: 0, sort: "order" }).catch(() => ({ docs: [] })),
  ]);

  // O hub não lista a si mesmo (home /eahub nem a rota antiga /marketing-manager).
  const systemLinks = (systemLinksRes.docs as unknown as SystemLinkDoc[]).filter((l) => {
    const url = (l.url ?? "").trim().replace(/\/+$/, "");
    return url !== "/eahub" && !url.includes("/eahub/marketing-manager");
  });

  const secretariaCard: Card = {
    title: "EA Assessor",
    description:
      "Assessoria executiva e torre de controle via WhatsApp: Google Calendar, Gmail, Outlook, EA Post, EA Flow e Antigravity integrados com Gemini AI.",
    href: "/eahub/secretaria",
    stat: "● Sessão WhatsApp Ativa (Nuvem 24/7)",
  };

  const adsCard: Card = {
    title: "EA ADS Manager",
    description:
      "Desempenho das campanhas do Google Ads, forecast pré-investimento, CAC, ROI, concorrentes e sugestões automáticas.",
    href: "/eahub/ads-performance",
    stat: `${adCampaigns.totalDocs} campanha(s)`,
  };

  const contentCards: Card[] = [
    { title: "Mídia", description: "Imagens e arquivos usados no site.", href: "/eahub/collections/media" },
    { title: "Depoimentos", description: "Prova social exibida no site e na LP.", href: "/eahub/collections/testimonials" },
  ];

  const landingPageCards: Card[] = [
    { title: "LP · Consultoria PME (canônica)", description: "Página principal, usada como canonical das outras duas páginas.", href: "/consultoria-pme", external: true },
    { title: "LP · Consultoria de Gestão Empresarial", description: "Dedicada à palavra-chave de consultoria de gestão empresarial.", href: "/consultoria-de-gestao-empresarial", external: true },
    { title: "LP · Consultoria para Pequenas Empresas", description: "Dedicada à palavra-chave de consultoria empresarial para pequenas empresas.", href: "/consultoria-empresarial-para-pequenas-empresas", external: true },
  ];

  const diagnosticCards: Card[] = [
    {
      title: "Diagnóstico de Maturidade (Online)",
      description:
        "Ferramenta interativa de autoavaliação empresarial nos 6 pilares da metodologia Gestão 360: 36 perguntas com resultado, radar e plano de ação na hora.",
      href: "/diagnostico-maturidade-empresarial.html",
      external: true,
      stat: "Abrir ferramenta pública ↗",
    },
    {
      title: "Apresentação Comercial Gestão 360",
      description:
        "Deck interativo 16:9 personalizado para reuniões de fechamento: basta digitar o ID do DME para carregar os dados e o plano de ação do cliente.",
      href: "/eahub/apresentacao",
      stat: "Abrir Apresentador ↗",
    },
  ];

  const socialCards: Card[] = [
    {
      title: "EA Post",
      description: "Comando único de conteúdo: Blog, Materiais Gratuitos e redes sociais (Instagram, Facebook, LinkedIn, YouTube, TikTok), unificando planejamento, geração, aprovação e publicação.",
      href: "https://ea-social-engine.vercel.app/admin",
      external: true,
    },
  ];

  const infraCards: Card[] = [
    {
      title: "Painel de APIs",
      description: "Todas as APIs e credenciais dos sistemas da EA: provedor, sistema, vencimento e faturamento.",
      href: "/eahub/apis",
    },
    {
      title: "Dashboard de pendências (TV)",
      description: "Visão consolidada para tela grande: aprovações pendentes, tokens vencendo e falhas de automação.",
      href: "/eahub/tv",
    },
  ];

  const contractCards: Card[] = [
    {
      title: "Gerador de Contratos",
      description: "Monta o contrato (Mentoria, Consultoria, Conselho, Diagnóstico ou Projeto Personalizado) e envia para assinatura eletrônica.",
      href: "/eahub/contratos/novo",
    },
    {
      title: "Contratos",
      description: "Todos os contratos gerados: rascunho, enviado para assinatura ou assinado, com o certificado eletrônico de cada um.",
      href: "/eahub/collections/contracts",
      stat: `${contracts.totalDocs} contrato(s)`,
    },
  ];

  const emailCards: Card[] = [
    { title: "EA Leads", description: "Base unificada de todos os leads captados por DME, WhatsApp, formulários, e-mail e materiais.", href: "/eahub/collections/leads", stat: `${leads.totalDocs} lead(s)` },
    { title: "Campanhas de e-mail", description: "Campanhas manuais e todas as regras automáticas de disparo de e-mails da EA.", href: "/eahub/collections/email-campaigns", stat: `${emailCampaigns.totalDocs} campanha(s)` },
    { title: "Segmentos", description: "Critérios de seleção de leads: origem, pilar e pontuação.", href: "/eahub/collections/email-segments", stat: `${emailSegments.totalDocs} segmento(s)` },
    { title: "Envios", description: "Histórico de e-mails enviados: nutrição, alertas e campanhas.", href: "/eahub/collections/email-logs" },
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

  const hasSecretaria = systemLinks.some((l) => l.name.toLowerCase().includes("assessor") || l.name.toLowerCase().includes("secretaria"));
  if (!hasSecretaria) {
    systemCards.unshift({
      title: "EA Assessor",
      description: "Assessoria executiva e torre de controle: WhatsApp, agenda (Google/Outlook), e-mails, EA Post, EA Flow e Antigravity via Gemini AI.",
      href: "/eahub/secretaria",
    });
  }

  return (
    <EaHubThemeWrapper userName={firstName}>
      <header
        style={{
          background: "#1D2B3C",
          color: "#FFFFFF",
          borderRadius: 16,
          borderBottom: "3px solid #C99A3E",
          padding: "1.6rem 1.85rem",
          marginBottom: "2rem",
          display: "flex",
          alignItems: "center",
          gap: "1.5rem",
          boxShadow: "0 4px 20px rgba(29, 43, 60, 0.12)",
        }}
      >
        <SystemLogo systemName="Hub" size={78} glow />
        <div style={{ display: "grid", gap: "0.25rem" }}>
          <p style={{ margin: 0, color: "#C99A3E", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "'Sora', sans-serif" }}>
            Empresarial Academy · Hub Central
          </p>
          <h1 style={{ margin: 0, color: "#FFFFFF", fontFamily: "'Sora', sans-serif", fontSize: "clamp(1.4rem, 2vw, 1.9rem)", fontWeight: 700, lineHeight: 1.2, letterSpacing: "-0.02em" }}>
            {firstName ? `Olá, ${firstName}.` : "Painel Central EA HUB"}
          </h1>
          <p style={{ margin: 0, color: "#D7C089", fontSize: "0.9rem", lineHeight: 1.5 }}>
            Centro de comando integrado da Empresarial Academy: inteligência artificial, tráfego, campanhas de e-mail, diagnósticos e ecossistema de gestão.
          </p>
        </div>
      </header>

      {/* Quadro de Pendências & Notificações Urgentes */}
      <EaHubAlertsBanner pendingContractsCount={pendingContracts.totalDocs} />

      {/* Faixa de KPIs em Tempo Real & Gráfico de Maturidade DME */}
      <EaHubKpiOverview
        totalLeads={leads.totalDocs}
        dmeLeads={dmeLeads.totalDocs}
        totalEmails={emailCampaigns.totalDocs}
        activeAds={adCampaigns.totalDocs}
        totalContracts={contracts.totalDocs}
        signedContracts={signedContracts.totalDocs}
      />

      {/* Seções Modulares com Micro-interações */}
      <div style={{ display: "grid", gap: "2.25rem" }}>
        <Section title="⚡ Inteligência Artificial & Automação">
          <CardGrid cards={[secretariaCard, ...socialCards]} />
        </Section>

        <Section title="🎯 Tráfego Pago & Performance">
          <CardGrid cards={[adsCard]} />
        </Section>

        <Section title="✉️ Campanhas de E-mail & Base de Leads">
          <CardGrid cards={emailCards} />
        </Section>

        <Section
          title="📈 Diagnóstico de Maturidade Empresarial & Comercial"
          action={{ label: "Ver todos os leads do diagnóstico ↗", href: "/eahub/collections/leads" }}
        >
          <CardGrid cards={diagnosticCards} />
        </Section>

        <Section title="🌐 Landing Pages Dedicadas (Google Ads)">
          <CardGrid cards={landingPageCards} />
        </Section>

        <Section title="📑 Contratos & Formalização Jurídica">
          <CardGrid cards={contractCards} />
        </Section>

        <Section title="🖼️ Ativos do Site Oficial">
          <CardGrid cards={contentCards} />
        </Section>

        <Section
          title="🔗 Sistemas Integrados do Ecossistema EA"
          action={{ label: "Gerenciar links ⚙", href: "/eahub/collections/system-links" }}
        >
          <CardGrid cards={systemCards} />
        </Section>

        <Section title="🖥️ Torre de Controle & Governança">
          <CardGrid cards={infraCards} />
        </Section>
      </div>
    </EaHubThemeWrapper>
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
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.95rem", gap: "1rem" }}>
        <h2
          style={{
            margin: 0,
            fontSize: "0.85rem",
            fontWeight: 800,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "var(--ea-text-primary, #1D2B3C)",
            fontFamily: "'Sora', sans-serif",
            display: "flex",
            alignItems: "center",
            gap: "0.45rem",
          }}
        >
          {title}
        </h2>
        {action ? (
          <Link
            href={action.href}
            style={{
              fontSize: "0.8rem",
              fontWeight: 700,
              color: "#C99A3E",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.3rem",
            }}
          >
            {action.label}
          </Link>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function CardGrid({ cards }: { cards: Card[] }) {
  return (
    <div className="ea-hub-grid">
      {cards.map((card) => {
        const className = `ea-hub-card${card.disabled ? " ea-hub-card--disabled" : ""}`;
        const hasLiveStat = card.stat?.includes("●");
        const content = (
          <>
            <strong style={{ fontSize: "1.05rem", fontFamily: "'Sora', sans-serif", fontWeight: 700, letterSpacing: "-0.01em" }}>
              {card.title}
            </strong>
            {card.description ? (
              <p style={{ margin: "0.45rem 0 0.85rem", fontSize: "0.88rem", lineHeight: 1.55, flexGrow: 1 }}>
                {card.description}
              </p>
            ) : null}
            {card.stat ? (
              <div style={{ marginTop: "auto" }}>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    fontSize: "0.76rem",
                    fontWeight: 700,
                    padding: "0.25rem 0.65rem",
                    borderRadius: 20,
                    background: hasLiveStat ? "rgba(63,125,88,0.14)" : "rgba(201,154,62,0.14)",
                    border: `1px solid ${hasLiveStat ? "rgba(63,125,88,0.35)" : "rgba(201,154,62,0.35)"}`,
                    color: hasLiveStat ? "#2E7D5B" : "#C99A3E",
                  }}
                >
                  {hasLiveStat ? <span className="ea-pulse-dot" /> : null}
                  <span>{card.stat.replace(/^●\s*/, "")}</span>
                </span>
              </div>
            ) : null}
            {card.disabled ? (
              <span style={{ display: "inline-block", fontSize: "0.75rem", color: "#8A93A0", marginTop: "auto", fontWeight: 600 }}>
                Em breve
              </span>
            ) : null}
          </>
        );

        if (card.disabled) {
          return (
            <div key={card.title} className={className}>
              {content}
            </div>
          );
        }
        if (card.external) {
          return (
            <a key={card.title} href={card.href} target="_blank" rel="noopener noreferrer" className={className}>
              {content}
            </a>
          );
        }
        return (
          <Link
            key={card.title}
            href={card.href}
            className={className}
            prefetch={isBasicAuthProtectedPath(card.href) ? false : undefined}
          >
            {content}
          </Link>
        );
      })}
    </div>
  );
}
