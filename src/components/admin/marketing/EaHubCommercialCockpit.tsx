import Link from "next/link";
import {
  IconContracts,
  IconPresentation,
  IconAds,
  IconWhatsApp,
  IconDiagnostic,
  IconContent,
  IconSystems,
  IconArrowRight,
  IconExternal,
} from "./EaHubIcons";

type SystemLinkItem = {
  id: string | number;
  name: string;
  url?: string | null;
  description?: string | null;
};

export function EaHubCommercialCockpit({
  leadsCount = 0,
  dmeLeadsCount = 0,
  emailsCount = 0,
  adsCount = 0,
  contractsCount = 0,
  signedContractsCount = 0,
  systemLinks = [],
}: {
  leadsCount: number;
  dmeLeadsCount: number;
  emailsCount: number;
  adsCount: number;
  contractsCount: number;
  signedContractsCount: number;
  systemLinks: SystemLinkItem[];
}) {
  // Limpeza de duplicados em systemLinks
  const filteredSystemLinks = systemLinks.filter(
    (l) => !l.name.toLowerCase().includes("assessor") && !l.name.toLowerCase().includes("secretaria")
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2.25rem" }}>
      {/* 1. BARRA DE AÇÕES RÁPIDAS DE VENDAS (FAST ACTIONS COM GLASSMORPHISM) */}
      <div
        className="ea-glass-panel"
        style={{
          padding: "1.1rem 1.4rem",
          display: "flex",
          alignItems: "center",
          gap: "0.85rem",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", marginRight: "0.5rem" }}>
          <span className="ea-pulse-dot" />
          <span
            style={{
              fontSize: "0.74rem",
              fontWeight: 800,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#C99A3E",
              fontFamily: "'Sora', sans-serif",
            }}
          >
            Comando Comercial:
          </span>
        </div>

        <Link href="/eahub/contratos/novo" className="ea-btn-gold">
          <IconContracts size={17} color="#0F1722" />
          <span>+ Novo Contrato</span>
        </Link>

        <Link href="/eahub/apresentacao" className="ea-btn-glass">
          <IconPresentation size={16} color="#C99A3E" />
          <span>Apresentador Comercial 16:9</span>
        </Link>

        <Link href="/eahub/ads-performance" className="ea-btn-glass">
          <IconAds size={16} color="#C99A3E" />
          <span>EA ADS Performance</span>
        </Link>

        <Link href="/eahub/secretaria" className="ea-btn-glass">
          <IconWhatsApp size={16} color="#2E7D5B" />
          <span>WhatsApp Comercial (24/7)</span>
        </Link>

        <a
          href="https://ea-social-engine.vercel.app/admin"
          target="_blank"
          rel="noopener noreferrer"
          className="ea-btn-glass"
          style={{ marginLeft: "auto" }}
        >
          <IconContent size={16} color="#C99A3E" />
          <span>EA Post (Central de Conteúdo) ↗</span>
        </a>
      </div>

      {/* 2. MESA EXECUTIVA DE INDICADORES (PIPELINE VISUAL INTERLIGADO EM 4 ESTÁGIOS) */}
      <div
        className="ea-glass-panel"
        style={{
          padding: "1.5rem 1.75rem",
          display: "flex",
          flexDirection: "column",
          gap: "1.25rem",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
          <div>
            <span style={{ fontSize: "0.7rem", fontWeight: 800, color: "#C99A3E", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Visão Geral de Performance
            </span>
            <h2
              style={{
                margin: "0.2rem 0 0",
                fontSize: "1.25rem",
                fontWeight: 800,
                color: "var(--ea-text-primary, #1D2B3C)",
                fontFamily: "'Sora', sans-serif",
                letterSpacing: "-0.01em",
              }}
            >
              Mesa de Indicadores & Pipeline de Receita
            </h2>
          </div>
          <span
            style={{
              fontSize: "0.76rem",
              fontWeight: 700,
              padding: "0.35rem 0.85rem",
              borderRadius: 20,
              background: "rgba(201,154,62,0.12)",
              border: "1px solid rgba(201,154,62,0.3)",
              color: "#C99A3E",
            }}
          >
            ● Atualização em Tempo Real
          </span>
        </div>

        {/* Linha de Indicadores Interligados com Setas de Conversão */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "1rem",
            alignItems: "stretch",
          }}
        >
          <MetricTile
            stage="01"
            label="Tráfego & Atração"
            value={`${adsCount}`}
            unit="Campanhas Google Ads"
            detail="Páginas de alta conversão ativas"
            icon={<IconAds size={20} color="#C99A3E" />}
          />

          <MetricTile
            stage="02"
            label="Qualificação DME"
            value={`${dmeLeadsCount}`}
            unit={`de ${leadsCount} leads totais`}
            detail={`${emailsCount} réguas de e-mail ativas`}
            icon={<IconDiagnostic size={20} color="#C99A3E" />}
          />

          <MetricTile
            stage="03"
            label="Reuniões & Fechamento"
            value="16:9"
            unit="Deck Comercial Ativo"
            detail="Radar do cliente + WhatsApp 24/7"
            icon={<IconPresentation size={20} color="#C99A3E" />}
          />

          <MetricTile
            stage="04"
            label="Contratos & Receita"
            value={`${signedContractsCount}`}
            unit={`de ${contractsCount} gerados`}
            detail="Com certificação digital PDF"
            icon={<IconContracts size={20} color="#C99A3E" />}
            highlight
          />
        </div>
      </div>

      {/* 3. OS 5 GRUPOS ESTRATÉGICOS INTERLIGADOS (COM DESCRIÇÃO E INTEGRAÇÃO) */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
        {/* GRUPO A: ATRAÇÃO E TRÁFEGO PAGO */}
        <StrategicGroup
          groupId="01"
          badge="Aquisição & Tráfego"
          title="Atração e Tráfego Pago de Alta Intenção"
          icon={<IconAds size={22} color="#C99A3E" />}
          description="Captação ativa de empresários e donos de empresas que buscam consultoria empresarial no Google, através de palavras-chave qualificadas e campanhas segmentadas."
          interconnection="Direciona o tráfego de empresários qualificados para as Landing Pages temáticas e para a ferramenta pública de Diagnóstico de Maturidade Empresarial (DME)."
          modules={[
            {
              title: "EA ADS Performance & Forecast",
              description: "Painel de controle do Google Ads com projeção de CAC, ROI, concorrência e metas.",
              href: "/eahub/ads-performance",
              actionLabel: "Abrir ADS Manager ↗",
              primary: true,
            },
            {
              title: "LP · Consultoria PME",
              description: "Página canônica de consultoria para pequenas e médias empresas.",
              href: "/consultoria-pme",
              actionLabel: "Ver Landing Page ↗",
              external: true,
            },
            {
              title: "LP · Consultoria de Gestão",
              description: "Página focada em busca por consultoria de gestão empresarial e estruturação.",
              href: "/consultoria-de-gestao-empresarial",
              actionLabel: "Ver Landing Page ↗",
              external: true,
            },
            {
              title: "Motor de Conteúdo EA Post",
              description: "Planejamento e publicação unificada para Blog, Materiais Gratuitos e Redes Sociais.",
              href: "https://ea-social-engine.vercel.app/admin",
              actionLabel: "Acessar EA Post ↗",
              external: true,
            },
          ]}
        />

        {/* GRUPO B: QUALIFICAÇÃO & INTELIGÊNCIA DME */}
        <StrategicGroup
          groupId="02"
          badge="Qualificação & Dados"
          title="Qualificação de Oportunidades & Inteligência de Leads"
          icon={<IconDiagnostic size={22} color="#C99A3E" />}
          description="Mapeamento das vulnerabilidades e oportunidades da empresa em 6 pilares estratégicos (Vendas, Marketing, Liderança, Processos, Finanças e Cultura) via metodologia Gestão 360."
          interconnection="O empresário realiza o diagnóstico, recebe seu plano na hora, e as informações alimentam automaticamente a Base de Leads, as réguas de nutrição e o deck de fechamento."
          modules={[
            {
              title: "Diagnóstico DME Online",
              description: "Ferramenta pública com 36 perguntas, gráfico radar e plano de ação imediato.",
              href: "/diagnostico-maturidade-empresarial.html",
              actionLabel: "Abrir Ferramenta Pública ↗",
              external: true,
              primary: true,
            },
            {
              title: "Base Unificada de Leads",
              description: "Listagem de todos os empresários captados com score, pilar mais fraco e canal.",
              href: "/eahub/collections/leads",
              actionLabel: "Ver Base de Leads ↗",
            },
            {
              title: "Campanhas de E-mail & Nutrição",
              description: "Disparos automáticos e réguas de relacionamento baseadas no pilar deficitário.",
              href: "/eahub/collections/email-campaigns",
              actionLabel: "Gerenciar Campanhas ↗",
            },
            {
              title: "Segmentos de Leads",
              description: "Critérios de segmentação por maturidade, origem e volume de faturamento.",
              href: "/eahub/collections/email-segments",
              actionLabel: "Ver Segmentos ↗",
            },
          ]}
        />

        {/* GRUPO C: NEGOCIAÇÃO & APRESENTAÇÃO */}
        <StrategicGroup
          groupId="03"
          badge="Fechamento Comercial"
          title="Negociação, Apresentação Comercial & Atendimento Executivo"
          icon={<IconPresentation size={22} color="#C99A3E" />}
          description="Ambiente de reunião consultiva de alto impacto para apresentação da proposta comercial, projeção do radar do cliente e suporte executivo multicanal."
          interconnection="O consultor digita o ID do diagnóstico na Apresentação 16:9 para personalizar a reunião na hora e utiliza o WhatsApp integrado para follow-up imediato de fechamento."
          modules={[
            {
              title: "Apresentação Comercial Gestão 360",
              description: "Deck 16:9 com carregamento automático dos dados do cliente a partir do ID do DME.",
              href: "/eahub/apresentacao",
              actionLabel: "Iniciar Apresentação 16:9 ↗",
              primary: true,
            },
            {
              title: "EA Assessor (Torre WhatsApp)",
              description: "Assessoria executiva 24/7 conectada ao WhatsApp, Google Agenda, Outlook e e-mails.",
              href: "/eahub/secretaria",
              actionLabel: "Abrir WhatsApp Executivo ↗",
            },
            {
              title: "Depoimentos & Prova Social",
              description: "Casos de sucesso de empresários mentorados para ancoragem de autoridade.",
              href: "/eahub/collections/testimonials",
              actionLabel: "Gerenciar Prova Social ↗",
            },
          ]}
        />

        {/* GRUPO D: FORMALIZAÇÃO JURÍDICA & RECEITA */}
        <StrategicGroup
          groupId="04"
          badge="Formalização & Receita"
          title="Formalização Jurídica, Certificação & Receita"
          icon={<IconContracts size={22} color="#C99A3E" />}
          description="Geração instantânea de minutas contratuais personalizadas para Mentoria, Consultoria, Conselho ou Projetos, com colheita de assinatura eletrônica válida."
          interconnection="Transforma a negociação aprovada em contrato com link seguro (/assinar/[token]), emitindo o Certificado Digital de Assinatura em PDF anexado ao registro."
          modules={[
            {
              title: "Gerador de Minutas Contratuais",
              description: "Preenchimento guiado com cláusulas jurídicas padrão EA e envio direto para assinatura.",
              href: "/eahub/contratos/novo",
              actionLabel: "+ Criar Novo Contrato",
              primary: true,
            },
            {
              title: "Gestão de Contratos & Assinaturas",
              description: "Acompanhamento em tempo real de minutas enviadas, assinadas e arquivadas.",
              href: "/eahub/collections/contracts",
              actionLabel: "Ver Todos os Contratos ↗",
            },
          ]}
        />

        {/* GRUPO E: ECOSSISTEMA & GOVERNANÇA */}
        <StrategicGroup
          groupId="05"
          badge="Infraestrutura & Governança"
          title="Ecossistema Integrado, Governança & Sistemas"
          icon={<IconSystems size={22} color="#C99A3E" />}
          description="Torre de monitoramento técnico, inventário de APIs externas, credenciais com faturamento e portfólio de aplicações do ecossistema Empresarial Academy."
          interconnection="Garante que todas as integrações (Google Cloud, Gemini AI, Resend, Vercel e bancos de dados) operem com alta disponibilidade e segurança criptografada."
          modules={[
            {
              title: "Painel de APIs & Credenciais",
              description: "Inventário de credenciais externas, sistemas consumidores, expiração e status de billing.",
              href: "/eahub/apis",
              actionLabel: "Ver Painel de APIs ↗",
            },
            {
              title: "Dashboard de Operações TV",
              description: "Visão consolidada para telão: pendências de aprovação, tokens e alertas de automação.",
              href: "/eahub/tv",
              actionLabel: "Abrir Modo TV ↗",
            },
            {
              title: "Gerenciador de Links do Ecossistema",
              description: "Cadastro e ordenação dos sistemas no portfólio executivo da marca.",
              href: "/eahub/collections/system-links",
              actionLabel: "Gerenciar Links ⚙",
            },
          ]}
          extraLinks={filteredSystemLinks}
        />
      </div>
    </div>
  );
}

function MetricTile({
  stage,
  label,
  value,
  unit,
  detail,
  icon,
  highlight = false,
}: {
  stage: string;
  label: string;
  value: string;
  unit: string;
  detail: string;
  icon: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div
      style={{
        background: highlight
          ? "linear-gradient(180deg, rgba(201,154,62,0.15) 0%, rgba(201,154,62,0.05) 100%)"
          : "var(--ea-surface-subtle, rgba(0,0,0,0.025))",
        border: `1px solid ${highlight ? "#C99A3E" : "var(--ea-card-border, #E2DCD0)"}`,
        borderRadius: 14,
        padding: "1.15rem 1.25rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
        position: "relative",
        boxShadow: highlight ? "0 4px 16px rgba(201,154,62,0.15)" : undefined,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "0.68rem", fontWeight: 800, color: "#C99A3E", letterSpacing: "0.08em", textTransform: "uppercase" }}>
          Etapa {stage}
        </span>
        <div style={{ opacity: 0.85 }}>{icon}</div>
      </div>

      <div>
        <p style={{ margin: 0, fontSize: "0.78rem", fontWeight: 600, color: "var(--ea-text-secondary, #5B6472)" }}>
          {label}
        </p>
        <div style={{ display: "flex", alignItems: "baseline", gap: "0.4rem", margin: "0.15rem 0" }}>
          <strong style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--ea-text-primary, #1D2B3C)", fontFamily: "'Sora', sans-serif" }}>
            {value}
          </strong>
          <span style={{ fontSize: "0.76rem", fontWeight: 600, color: "var(--ea-text-secondary, #5B6472)" }}>
            {unit}
          </span>
        </div>
        <p style={{ margin: 0, fontSize: "0.72rem", color: "var(--ea-text-secondary, #8A93A0)" }}>
          {detail}
        </p>
      </div>
    </div>
  );
}

function StrategicGroup({
  groupId,
  badge,
  title,
  icon,
  description,
  interconnection,
  modules,
  extraLinks = [],
}: {
  groupId: string;
  badge: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  interconnection: string;
  modules: {
    title: string;
    description: string;
    href: string;
    actionLabel: string;
    primary?: boolean;
    external?: boolean;
  }[];
  extraLinks?: SystemLinkItem[];
}) {
  return (
    <div
      className="ea-glass-panel"
      style={{
        padding: "1.6rem 1.85rem",
        display: "flex",
        flexDirection: "column",
        gap: "1.35rem",
      }}
    >
      {/* Cabeçalho do Grupo */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.75rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              background: "rgba(201,154,62,0.12)",
              border: "1px solid rgba(201,154,62,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {icon}
          </div>
          <div>
            <span style={{ fontSize: "0.68rem", fontWeight: 800, color: "#C99A3E", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Grupo {groupId} · {badge}
            </span>
            <h3
              style={{
                margin: "0.15rem 0 0",
                fontSize: "1.18rem",
                fontWeight: 800,
                color: "var(--ea-text-primary, #1D2B3C)",
                fontFamily: "'Sora', sans-serif",
                letterSpacing: "-0.01em",
              }}
            >
              {title}
            </h3>
          </div>
        </div>
      </div>

      {/* Caixa Explicativa: Função & Interligação */}
      <div
        style={{
          background: "var(--ea-surface-subtle, rgba(0,0,0,0.025))",
          border: "1px solid var(--ea-card-border, #E2DCD0)",
          borderRadius: 12,
          padding: "1rem 1.25rem",
          display: "grid",
          gap: "0.5rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
          <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#C99A3E", textTransform: "uppercase", letterSpacing: "0.05em", flexShrink: 0 }}>
            📌 Função:
          </span>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--ea-text-secondary, #5B6472)", lineHeight: 1.45 }}>
            {description}
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
          <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#2E7D5B", textTransform: "uppercase", letterSpacing: "0.05em", flexShrink: 0 }}>
            🔗 Interligação:
          </span>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--ea-text-primary, #1D2B3C)", fontWeight: 500, lineHeight: 1.45 }}>
            {interconnection}
          </p>
        </div>
      </div>

      {/* Módulos do Grupo (Cards com Glassmorphism) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "1rem",
        }}
      >
        {modules.map((mod) => {
          const Component = mod.external ? "a" : Link;
          return (
            <Component
              key={mod.title}
              href={mod.href}
              target={mod.external ? "_blank" : undefined}
              rel={mod.external ? "noopener noreferrer" : undefined}
              className="ea-glass-card"
              style={{
                border: mod.primary ? "1px solid rgba(201,154,62,0.4)" : undefined,
                background: mod.primary ? "rgba(201,154,62,0.06)" : undefined,
              }}
            >
              <strong style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--ea-text-primary, #1D2B3C)", fontFamily: "'Sora', sans-serif" }}>
                {mod.title}
              </strong>
              <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--ea-text-secondary, #5B6472)", lineHeight: 1.45, flexGrow: 1 }}>
                {mod.description}
              </p>
              <div style={{ marginTop: "0.4rem", display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.78rem", fontWeight: 700, color: "#C99A3E" }}>
                <span>{mod.actionLabel}</span>
                {mod.external ? <IconExternal size={12} color="#C99A3E" /> : <IconArrowRight size={12} color="#C99A3E" />}
              </div>
            </Component>
          );
        })}
      </div>

      {/* Links Extras de Sistemas (quando houver) */}
      {extraLinks.length > 0 ? (
        <div style={{ paddingTop: "0.5rem", display: "flex", flexWrap: "wrap", gap: "0.65rem" }}>
          {extraLinks.map((item) => {
            const isExt = /^https?:\/\//.test(item.url ?? "");
            const Component = isExt ? "a" : Link;
            return (
              <Component
                key={String(item.id)}
                href={item.url || "#"}
                target={isExt ? "_blank" : undefined}
                rel={isExt ? "noopener noreferrer" : undefined}
                className="ea-btn-glass"
                style={{ fontSize: "0.78rem", padding: "0.45rem 0.8rem" }}
              >
                <span>{item.name}</span>
                {isExt ? <IconExternal size={12} color="#C99A3E" /> : <IconArrowRight size={12} color="#C99A3E" />}
              </Component>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
