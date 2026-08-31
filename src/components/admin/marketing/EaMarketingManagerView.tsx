import type { AdminViewServerProps } from "payload";
import Link from "next/link";
import { SystemLogo } from "@/components/admin/brand/SystemLogo";
import { isBasicAuthProtectedPath } from "@/lib/basic-auth-protected-paths";

const GOLD = "#C99A3E";

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
 *
 * Visual redesenhado em 31/08/2026 — pedido explícito do Thiago: mesmo
 * tratamento de efeito da tela de login (fundo navy com glow atmosférico,
 * cards em glassmorphism, sombra dourada), "totalmente diferente" do
 * padrão flat anterior. Nenhuma consulta de dados mudou, só a apresentação.
 */
export async function EaMarketingManagerView({ payload, initPageResult }: AdminViewServerProps) {
  const user = initPageResult?.req?.user;
  if (!user) {
    return <div style={{ padding: 24 }}>Acesso restrito ao admin.</div>;
  }

  const firstName = (user as { name?: string; email?: string }).name?.split(" ")[0]
    ?? (user as { email?: string }).email
    ?? "";

  const [adCampaigns, emailCampaigns, emailSegments, leads, contracts, systemLinksRes] =
    await Promise.all([
      payload.count({ collection: "ad-campaigns" }),
      payload.count({ collection: "email-campaigns" }),
      payload.count({ collection: "email-segments" }),
      payload.count({ collection: "leads" }),
      payload.count({ collection: "contracts" }),
      payload.find({ collection: "system-links", limit: 100, depth: 0, sort: "order" }),
    ]);

  // O hub não lista a si mesmo (home /eahub nem a rota antiga /marketing-manager).
  const systemLinks = (systemLinksRes.docs as unknown as SystemLinkDoc[]).filter((l) => {
    const url = (l.url ?? "").trim().replace(/\/+$/, "");
    return url !== "/eahub" && !url.includes("/eahub/marketing-manager");
  });

  const secretariaCard: Card = {
    title: "EA Assessor",
    description:
      "Assessoria executiva e torre de controle via WhatsApp — Google Calendar, Gmail, Outlook, EA Post, EA Flow e Antigravity integrados com Gemini AI.",
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

  // Artigos e Materiais saíram daqui: planejamento/geração dos dois agora é
  // comandado pelo EA Post (posting-rules + content-plan), que grava direto
  // nestas mesmas collections do site via API — ver socialCards abaixo.
  // Mídia/Depoimentos continuam aqui por não fazerem parte dessa esteira.
  const contentCards: Card[] = [
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

  const diagnosticCards: Card[] = [
    {
      title: "Diagnóstico de Maturidade (Online)",
      description:
        "Ferramenta interativa de autoavaliação empresarial nos 6 pilares da metodologia Gestão 360 (36 perguntas com resultado, radar e plano de ação na hora).",
      href: "/diagnostico-maturidade-empresarial.html",
      external: true,
      stat: "Abrir ferramenta pública ↗",
    },
    {
      title: "Apresentação Comercial Gestão 360",
      description:
        "Deck interativo 16:9 personalizado para reuniões de fechamento — basta digitar o ID do DME para carregar os dados e o plano de ação do cliente.",
      href: "/eahub/apresentacao",
      stat: "Abrir Apresentador ↗",
    },
  ];

  const socialCards: Card[] = [
    {
      title: "EA Post",
      description: "Comando único de conteúdo: Blog, Materiais Gratuitos e redes sociais (Instagram, Facebook, LinkedIn, YouTube, TikTok) — planejamento, geração, aprovação e publicação, tudo num sistema só.",
      href: "https://ea-social-engine.vercel.app/admin",
      external: true,
    },
  ];

  const infraCards: Card[] = [
    {
      title: "Painel de APIs",
      description: "Todas as APIs/credenciais dos sistemas da EA — provedor, sistema(s), vencimento e faturamento.",
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
      description: "Todos os contratos gerados — rascunho, enviado para assinatura ou assinado, com o certificado eletrônico de cada um.",
      href: "/eahub/collections/contracts",
      stat: `${contracts.totalDocs} contrato(s)`,
    },
  ];

  const emailCards: Card[] = [
    { title: "EA Leads", description: "Base unificada de todos os leads captados por DME, WhatsApp, formulários, e-mail e materiais.", href: "/eahub/collections/leads", stat: `${leads.totalDocs} lead(s)` },
    { title: "Campanhas de e-mail", description: "Campanhas manuais e todas as regras automáticas de disparo de e-mails da EA.", href: "/eahub/collections/email-campaigns", stat: `${emailCampaigns.totalDocs} campanha(s)` },
    { title: "Segmentos", description: "Critérios de seleção de leads (origem, pilar, score).", href: "/eahub/collections/email-segments", stat: `${emailSegments.totalDocs} segmento(s)` },
    { title: "Envios", description: "Histórico de e-mails enviados (nutrição, alertas, campanhas).", href: "/eahub/collections/email-logs" },
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
      description: "Assessoria executiva e torre de controle — WhatsApp, agenda (Google/Outlook), e-mails, EA Post, EA Flow e Antigravity via Gemini AI.",
      href: "/eahub/secretaria",
    });
  }

  return (
    <div style={{ minHeight: "100vh", position: "relative", color: "#F4F1E9", fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
      {/* Fundo imersivo executivo com iluminação atmosférica dupla */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: -1,
          background: `
            radial-gradient(1100px 650px at 10% 0%, rgba(201,154,62,0.12) 0%, rgba(201,154,62,0) 60%),
            radial-gradient(900px 600px at 90% 15%, rgba(38,56,78,0.35) 0%, rgba(38,56,78,0) 60%),
            radial-gradient(1000px 800px at 50% 90%, rgba(201,154,62,0.06) 0%, rgba(201,154,62,0) 60%),
            linear-gradient(180deg, #131E2B 0%, #0F1722 45%, #080D14 100%)
          `,
        }}
      />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Sora:wght@600;700;800&display=swap');

        .ea-hub-shell {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0.5rem 0.5rem 4rem;
        }
        .ea-hub-header {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          padding: 1.5rem 0 2rem;
          border-bottom: 1px solid rgba(201,154,62,0.18);
          margin-bottom: 2.25rem;
        }
        .ea-hub-header__copy {
          display: grid;
          gap: 0.35rem;
        }
        .ea-hub-header__eyebrow {
          margin: 0;
          color: #C99A3E;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          font-family: 'Sora', sans-serif;
        }
        .ea-hub-header__title {
          margin: 0;
          color: #FFFFFF;
          font-family: 'Sora', sans-serif;
          font-size: clamp(1.6rem, 2.2vw, 2.3rem);
          font-weight: 700;
          line-height: 1.2;
          letter-spacing: -0.02em;
        }
        .ea-hub-header__subtitle {
          margin: 0;
          color: #A0ABC0;
          font-size: 0.94rem;
          line-height: 1.55;
          max-width: 800px;
        }
        .ea-hub-card {
          display: flex;
          flex-direction: column;
          text-decoration: none;
          color: inherit;
          background: linear-gradient(180deg, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.025) 100%);
          border: 1px solid rgba(201,154,62,0.16);
          border-radius: 16px;
          padding: 1.35rem 1.4rem 1.2rem;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          box-shadow: 0 10px 28px -10px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08);
          transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
          min-height: 100%;
          position: relative;
          overflow: hidden;
        }
        .ea-hub-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, transparent, rgba(201,154,62,0.3), transparent);
          opacity: 0;
          transition: opacity 0.22s ease;
        }
        .ea-hub-card:hover {
          transform: translateY(-3px);
          border-color: rgba(201,154,62,0.45);
          background: linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.035) 100%);
          box-shadow: 0 18px 40px -12px rgba(0,0,0,0.7), 0 0 24px rgba(201,154,62,0.12), inset 0 1px 0 rgba(255,255,255,0.14);
        }
        .ea-hub-card:hover::before {
          opacity: 1;
        }
        .ea-hub-card--disabled { opacity: 0.55; cursor: default; }
        .ea-hub-card--disabled:hover { transform: none; box-shadow: 0 10px 28px -10px rgba(0,0,0,0.5); border-color: rgba(201,154,62,0.16); }
        .ea-hub-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.15rem; }
        .ea-hub-section-title {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.95rem;
          gap: 1rem;
        }
        .ea-hub-section-link {
          font-size: 0.8rem;
          font-weight: 600;
          color: #C99A3E;
          text-decoration: none;
          transition: all 0.18s ease;
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
        }
        .ea-hub-section-link:hover {
          color: #E5CA8C;
          text-decoration: underline;
        }
        .ea-pulse-dot {
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #3F7D58;
          box-shadow: 0 0 0 0 rgba(63,125,88,0.7);
          animation: eaPulse 2s infinite;
        }
        @keyframes eaPulse {
          0% { box-shadow: 0 0 0 0 rgba(63,125,88,0.7); }
          70% { box-shadow: 0 0 0 6px rgba(63,125,88,0); }
          100% { box-shadow: 0 0 0 0 rgba(63,125,88,0); }
        }
      `}</style>

      <div className="ea-hub-shell">
        <header className="ea-hub-header">
          <SystemLogo systemName="Hub" size={86} glow />
          <div className="ea-hub-header__copy">
            <p className="ea-hub-header__eyebrow">Empresarial Academy · Hub Central</p>
            <h1 className="ea-hub-header__title">
              {firstName ? `Olá, ${firstName}.` : "Painel Central EA HUB"}
            </h1>
            <p className="ea-hub-header__subtitle">
              Centro de comando integrado da Empresarial Academy — inteligência artificial, tráfego, campanhas de e-mail, diagnósticos e ecossistema de gestão.
            </p>
          </div>
        </header>

        <div style={{ display: "grid", gap: "2.4rem", paddingBottom: "2rem" }}>
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
      <div className="ea-hub-section-title">
        <h2
          style={{
            margin: 0,
            fontSize: "0.82rem",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#C99A3E",
            fontFamily: "'Sora', sans-serif",
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
          }}
        >
          {title}
        </h2>
        {action ? (
          <Link href={action.href} className="ea-hub-section-link">
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
            <strong style={{ fontSize: "1.02rem", color: "#FFFFFF", fontFamily: "'Sora', sans-serif", fontWeight: 600 }}>
              {card.title}
            </strong>
            {card.description ? (
              <p style={{ margin: "0.45rem 0 0.85rem", fontSize: "0.85rem", color: "#9EABC0", lineHeight: 1.55, flexGrow: 1 }}>
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
                    fontSize: "0.74rem",
                    fontWeight: 600,
                    padding: "0.22rem 0.65rem",
                    borderRadius: 20,
                    background: hasLiveStat ? "rgba(63,125,88,0.18)" : "rgba(201,154,62,0.12)",
                    border: `1px solid ${hasLiveStat ? "rgba(63,125,88,0.4)" : "rgba(201,154,62,0.28)"}`,
                    color: hasLiveStat ? "#55BA7F" : "#E5CA8C",
                  }}
                >
                  {hasLiveStat ? <span className="ea-pulse-dot" /> : null}
                  <span>{card.stat.replace(/^●\s*/, "")}</span>
                </span>
              </div>
            ) : null}
            {card.disabled ? (
              <span style={{ display: "inline-block", fontSize: "0.75rem", color: "#64748B", marginTop: "auto" }}>
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
