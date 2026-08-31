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

  const [adCampaigns, emailCampaigns, emailSegments, leads, diagnosticLeads, contracts, systemLinksRes] =
    await Promise.all([
      payload.count({ collection: "ad-campaigns" }),
      payload.count({ collection: "email-campaigns" }),
      payload.count({ collection: "email-segments" }),
      payload.count({ collection: "leads" }),
      payload.count({
        collection: "leads",
        where: { source: { equals: "Diagnóstico de Maturidade Empresarial" } },
      }),
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
      title: "Diagnósticos Realizados",
      description:
        "Base de diagnósticos concluídos pelos clientes com ID único, pontuação geral, notas por pilar, faturamento, cargo e dados para consultoria.",
      href: "/eahub/collections/leads",
      stat: `${diagnosticLeads.totalDocs} diagnóstico(s) (${leads.totalDocs} leads no total)`,
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
    { title: "Campanhas de e-mail", description: "Disparos manuais para um segmento de leads.", href: "/eahub/collections/email-campaigns", stat: `${emailCampaigns.totalDocs} campanha(s)` },
    { title: "Segmentos", description: "Critérios de seleção de leads (origem, pilar, score).", href: "/eahub/collections/email-segments", stat: `${emailSegments.totalDocs} segmento(s)` },
    { title: "Envios", description: "Histórico de e-mails enviados (nutrição, alertas, campanhas).", href: "/eahub/collections/email-logs" },
    { title: "Base de Leads", description: "Base unificada de contatos — origem, diagnóstico, consentimento e resultado comercial.", href: "/eahub/collections/leads", stat: `${leads.totalDocs} lead(s)` },
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

  const hasSecretaria = systemLinks.some((l) => l.name.toLowerCase().includes("assessor") || l.name.toLowerCase().includes("secretaria"));
  if (!hasSecretaria) {
    systemCards.unshift({
      title: "EA Assessor",
      description: "Assessoria executiva e torre de controle — WhatsApp, agenda (Google/Outlook), e-mails, EA Post, EA Flow e Antigravity via Gemini AI.",
      href: "/eahub/secretaria",
    });
  }

  return (
    <div>
      {/* Fundo decorativo — fixed + z-index negativo, de propósito: não dá
          pra saber em código o padding exato ("gutter") que o template
          default do Payload aplica ao redor da view (varia por breakpoint,
          via variável CSS interna --gutter-h), então em vez de tentar
          cancelar esse padding com margem negativa (frágil, quebra em
          telas diferentes), o fundo cobre a viewport inteira por trás de
          tudo e o conteúdo flui normalmente dentro do espaço do Payload. */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: -1,
          background: `
            radial-gradient(900px 500px at 12% 0%, rgba(193,161,96,0.10) 0%, rgba(193,161,96,0) 55%),
            radial-gradient(700px 500px at 92% 15%, rgba(61,92,128,0.22) 0%, rgba(61,92,128,0) 55%),
            linear-gradient(180deg, #1D2B3C 0%, #17212E 420px, #FFFFFF 420px, #FFFFFF 100%)
          `,
        }}
      />
      <style>{`
        .ea-hub-shell {
          max-width: 1380px;
          margin: 0 auto;
          padding: 0 0 3rem;
        }
        .ea-hub-header {
          display: flex;
          align-items: center;
          gap: 1.4rem;
          padding: 1.2rem 0 2.2rem;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          margin-bottom: 2rem;
        }
        .ea-hub-header__copy {
          display: grid;
          gap: 0.35rem;
        }
        .ea-hub-header__eyebrow {
          margin: 0;
          color: rgba(255,255,255,0.72);
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }
        .ea-hub-header__title {
          margin: 0;
          color: #fff;
          font-family: Montserrat, Arial, sans-serif;
          font-size: clamp(1.5rem, 2vw, 2.2rem);
          line-height: 1.2;
          letter-spacing: -0.02em;
        }
        .ea-hub-header__subtitle {
          margin: 0;
          color: rgba(217,220,225,0.9);
          font-size: 0.96rem;
          line-height: 1.55;
          max-width: 760px;
        }
        .ea-hub-card {
          display: block; text-decoration: none; color: inherit;
          background: linear-gradient(180deg, rgba(255,255,255,0.085) 0%, rgba(255,255,255,0.05) 100%);
          border: 1px solid rgba(201,154,62,0.18);
          border-radius: 16px;
          padding: 1.15rem 1.3rem 1rem;
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          box-shadow: 0 16px 32px -18px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08);
          transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
          min-height: 100%;
        }
        .ea-hub-card:hover {
          transform: translateY(-2px);
          border-color: rgba(201,154,62,0.42);
          box-shadow: 0 18px 40px -20px rgba(0,0,0,0.7), 0 0 0 1px rgba(201,154,62,0.12), 0 0 18px rgba(201,154,62,0.08);
        }
        .ea-hub-card--disabled { opacity: 0.62; cursor: default; }
        .ea-hub-card--disabled:hover { transform: none; box-shadow: 0 16px 32px -18px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08); border-color: rgba(201,154,62,0.18); }
        .ea-hub-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1rem; }
        .ea-hub-section-title {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          margin-bottom: 0.9rem;
          gap: 1rem;
        }
        .ea-hub-section-link {
          font-size: 0.8rem;
          color: rgba(255,255,255,0.82);
          text-decoration: none;
          transition: opacity 0.18s ease;
        }
        .ea-hub-section-link:hover { opacity: 0.9; }
        .ea-hub-rule-table {
          overflow-x: auto;
          border-radius: 16px;
          border: 1px solid rgba(201,154,62,0.16);
          background: rgba(255,255,255,0.045);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
        }
      `}</style>

      <div className="ea-hub-shell">
        <header className="ea-hub-header">
          <SystemLogo systemName="Hub" size={84} glow />
          <div className="ea-hub-header__copy">
            <p className="ea-hub-header__eyebrow">Empresarial Academy</p>
            <h1 className="ea-hub-header__title">
              {firstName ? `Olá, ${firstName}.` : "Hub de sistemas da EA"}
            </h1>
            <p className="ea-hub-header__subtitle">
              Hub de sistemas da Empresarial Academy — conteúdo, e-mail marketing, anúncios, diagnósticos e todas as ferramentas num só lugar.
            </p>
          </div>
        </header>

        <div style={{ display: "grid", gap: "2.25rem", paddingBottom: "1.5rem" }}>
        <Section title="Inteligência Artificial">
          <CardGrid cards={[secretariaCard]} />
        </Section>

        <Section title="Anúncios">
          <CardGrid cards={[adsCard]} />
        </Section>

        <Section title="Ativos do site">
          <CardGrid cards={contentCards} />
        </Section>

        <Section title="Landing Pages (Ads)">
          <CardGrid cards={landingPageCards} />
        </Section>

        <Section
          title="Diagnóstico de Maturidade Empresarial"
          action={{ label: "Ver todos os diagnósticos", href: "/eahub/collections/leads" }}
        >
          <CardGrid cards={diagnosticCards} />
        </Section>

        <Section title="Redes sociais">
          <CardGrid cards={socialCards} />
        </Section>

        <Section title="Contratos">
          <CardGrid cards={contractCards} />
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

        <Section title="Infraestrutura">
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
            fontSize: "0.78rem",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: GOLD,
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

function RuleTable({
  title,
  rules,
}: {
  title: string;
  rules: { nome: string; gatilho: string; quando: string; publico: string }[];
}) {
  return (
    <div style={{ marginTop: "1.1rem" }}>
      <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#6B7280", marginBottom: "0.5rem" }}>
        {title}
      </div>
      <div className="ea-hub-rule-table">
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${GOLD}` }}>
              <th style={{ textAlign: "left", padding: "0.7rem 1rem", color: "#6B7280", fontWeight: 600 }}>Regra</th>
              <th style={{ textAlign: "left", padding: "0.7rem 1rem", color: "#6B7280", fontWeight: 600 }}>Gatilho</th>
              <th style={{ textAlign: "left", padding: "0.7rem 1rem", color: "#6B7280", fontWeight: 600 }}>Quando</th>
              <th style={{ textAlign: "left", padding: "0.7rem 1rem", color: "#6B7280", fontWeight: 600 }}>Público</th>
            </tr>
          </thead>
          <tbody>
            {rules.map((r) => (
              <tr key={r.nome} style={{ borderTop: "1px solid rgba(193,161,96,0.12)" }}>
                <td style={{ padding: "0.7rem 1rem", fontWeight: 600 }}>{r.nome}</td>
                <td style={{ padding: "0.7rem 1rem", color: "#6B7280" }}>{r.gatilho}</td>
                <td style={{ padding: "0.7rem 1rem", color: "#6B7280" }}>{r.quando}</td>
                <td style={{ padding: "0.7rem 1rem", color: "#6B7280" }}>{r.publico}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CardGrid({ cards }: { cards: Card[] }) {
  return (
    <div className="ea-hub-grid">
      {cards.map((card) => {
        const className = `ea-hub-card${card.disabled ? " ea-hub-card--disabled" : ""}`;
        const content = (
          <>
            <strong style={{ fontSize: "1rem" }}>{card.title}</strong>
            {card.description ? (
              <p style={{ margin: "0.4rem 0 0.5rem", fontSize: "0.85rem", color: "#6B7280", lineHeight: 1.5 }}>
                {card.description}
              </p>
            ) : null}
            {card.stat ? (
              <span style={{ fontSize: "0.8rem", color: GOLD, fontWeight: 600 }}>{card.stat}</span>
            ) : null}
            {card.disabled ? (
              <span style={{ display: "inline-block", fontSize: "0.75rem", color: "#9AA3AF" }}>
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
