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
  // Limpeza de duplicados: se systemLinks tiver EA Assessor ou Secretaria, filtramos para não duplicar.
  const filteredSystemLinks = systemLinks.filter(
    (l) => !l.name.toLowerCase().includes("assessor") && !l.name.toLowerCase().includes("secretaria")
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2.25rem" }}>
      {/* 1. BARRA DE AÇÕES RÁPIDAS DE VENDAS (FAST ACTIONS) */}
      <div
        style={{
          background: "var(--ea-surface-bg, #FFFFFF)",
          border: "1px solid var(--ea-card-border, #E2DCD0)",
          borderRadius: 16,
          padding: "1rem 1.25rem",
          boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
          display: "flex",
          alignItems: "center",
          gap: "0.85rem",
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            fontSize: "0.72rem",
            fontWeight: 800,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#C99A3E",
            fontFamily: "'Sora', sans-serif",
            marginRight: "0.25rem",
          }}
        >
          Ações Comerciais:
        </span>

        <Link
          href="/eahub/contratos/novo"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.45rem",
            background: "linear-gradient(180deg, #E5CA8C 0%, #C99A3E 100%)",
            color: "#0F1722",
            fontWeight: 700,
            fontSize: "0.82rem",
            padding: "0.55rem 1rem",
            borderRadius: 10,
            textDecoration: "none",
            boxShadow: "0 2px 6px rgba(201,154,62,0.3)",
            transition: "all 0.2s ease",
          }}
        >
          <IconContracts size={16} color="#0F1722" />
          <span>+ Novo Contrato</span>
        </Link>

        <Link
          href="/eahub/apresentacao"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.45rem",
            background: "var(--ea-surface-bg, #FFFFFF)",
            border: "1px solid var(--ea-card-border, #E2DCD0)",
            color: "var(--ea-text-primary, #1D2B3C)",
            fontWeight: 600,
            fontSize: "0.82rem",
            padding: "0.55rem 0.95rem",
            borderRadius: 10,
            textDecoration: "none",
            transition: "all 0.2s ease",
          }}
        >
          <IconPresentation size={16} color="#C99A3E" />
          <span>Apresentação 16:9</span>
        </Link>

        <Link
          href="/eahub/ads-performance"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.45rem",
            background: "var(--ea-surface-bg, #FFFFFF)",
            border: "1px solid var(--ea-card-border, #E2DCD0)",
            color: "var(--ea-text-primary, #1D2B3C)",
            fontWeight: 600,
            fontSize: "0.82rem",
            padding: "0.55rem 0.95rem",
            borderRadius: 10,
            textDecoration: "none",
            transition: "all 0.2s ease",
          }}
        >
          <IconAds size={16} color="#C99A3E" />
          <span>EA ADS Performance</span>
        </Link>

        <Link
          href="/eahub/secretaria"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.45rem",
            background: "var(--ea-surface-bg, #FFFFFF)",
            border: "1px solid var(--ea-card-border, #E2DCD0)",
            color: "var(--ea-text-primary, #1D2B3C)",
            fontWeight: 600,
            fontSize: "0.82rem",
            padding: "0.55rem 0.95rem",
            borderRadius: 10,
            textDecoration: "none",
            transition: "all 0.2s ease",
          }}
        >
          <IconWhatsApp size={16} color="#2E7D5B" />
          <span>WhatsApp Comercial (Online 24/7)</span>
        </Link>

        <a
          href="https://ea-social-engine.vercel.app/admin"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.45rem",
            background: "var(--ea-surface-bg, #FFFFFF)",
            border: "1px solid var(--ea-card-border, #E2DCD0)",
            color: "var(--ea-text-primary, #1D2B3C)",
            fontWeight: 600,
            fontSize: "0.82rem",
            padding: "0.55rem 0.95rem",
            borderRadius: 10,
            textDecoration: "none",
            marginLeft: "auto",
            transition: "all 0.2s ease",
          }}
        >
          <IconContent size={16} color="#C99A3E" />
          <span>EA Post (Central de Conteúdo) ↗</span>
        </a>
      </div>

      {/* 2. ESTEIRA COMERCIAL DE VENDAS EM 4 FASES */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: "1.15rem",
                fontWeight: 800,
                color: "var(--ea-text-primary, #1D2B3C)",
                fontFamily: "'Sora', sans-serif",
                letterSpacing: "-0.01em",
              }}
            >
              Esteira de Vendas & Operação Comercial
            </h2>
            <p style={{ margin: "0.2rem 0 0", fontSize: "0.84rem", color: "var(--ea-text-secondary, #5B6472)" }}>
              Fluxo integrado de atração, diagnóstico, fechamento e formalização jurídica da Empresarial Academy.
            </p>
          </div>
        </div>

        {/* FASE 01: AQUISIÇÃO & TRÁFEGO */}
        <PipelineStage
          stageNumber="01"
          stageBadge="Atração & Tráfego"
          title="Aquisição e Tráfego Pago"
          description="Atração de empresários e donos de empresas via campanhas de pesquisa e páginas de alta conversão."
          metricLabel={`${adsCount} campanhas ativas no Google Ads`}
          icon={<IconAds size={20} color="#C99A3E" />}
          items={[
            { label: "EA ADS Manager (Forecast & Métricas)", href: "/eahub/ads-performance", type: "primary" },
            { label: "LP Consultoria PME", href: "/consultoria-pme", external: true },
            { label: "LP Gestão Empresarial", href: "/consultoria-de-gestao-empresarial", external: true },
            { label: "LP Pequenas Empresas", href: "/consultoria-empresarial-para-pequenas-empresas", external: true },
            { label: "Motor de Conteúdo EA Post", href: "https://ea-social-engine.vercel.app/admin", external: true },
          ]}
        />

        {/* FASE 02: QUALIFICAÇÃO & DIAGNÓSTICO */}
        <PipelineStage
          stageNumber="02"
          stageBadge="Qualificação & Dados"
          title="Diagnóstico de Maturidade & Base de Leads"
          description="Autoavaliação nos 6 pilares da metodologia Gestão 360 e nutrição automática de oportunidades."
          metricLabel={`${leadsCount} leads · ${dmeLeadsCount} diagnósticos DME · ${emailsCount} campanhas`}
          icon={<IconDiagnostic size={20} color="#C99A3E" />}
          items={[
            { label: "Diagnóstico DME Online (Ferramenta Pública)", href: "/diagnostico-maturidade-empresarial.html", external: true, type: "primary" },
            { label: "Base Unificada de Leads", href: "/eahub/collections/leads" },
            { label: "Campanhas de E-mail & Nutrição", href: "/eahub/collections/email-campaigns" },
            { label: "Segmentos de Leads", href: "/eahub/collections/email-segments" },
          ]}
        />

        {/* FASE 03: APRESENTAÇÃO & NEGOCIAÇÃO */}
        <PipelineStage
          stageNumber="03"
          stageBadge="Comercial & Fechamento"
          title="Apresentação Comercial & Atendimento"
          description="Reuniões de fechamento 16:9 com o radar do cliente e assessoria executiva conectada via WhatsApp."
          metricLabel="Apresentador 16:9 e WhatsApp Ativo 24/7"
          icon={<IconPresentation size={20} color="#C99A3E" />}
          items={[
            { label: "Apresentação Comercial Gestão 360 (Deck 16:9)", href: "/eahub/apresentacao", type: "primary" },
            { label: "EA Assessor (Torre WhatsApp)", href: "/eahub/secretaria" },
            { label: "Prova Social & Depoimentos", href: "/eahub/collections/testimonials" },
          ]}
        />

        {/* FASE 04: FORMALIZAÇÃO & RECEITA */}
        <PipelineStage
          stageNumber="04"
          stageBadge="Formalização & Receita"
          title="Contratos & Assinatura Eletrônica"
          description="Geração instantânea de minutas e acompanhamento de assinaturas com certificado digital."
          metricLabel={`${contractsCount} contratos gerados · ${signedContractsCount} assinado(s)`}
          icon={<IconContracts size={20} color="#C99A3E" />}
          items={[
            { label: "+ Gerar Novo Contrato", href: "/eahub/contratos/novo", type: "primary" },
            { label: "Todos os Contratos & Assinaturas", href: "/eahub/collections/contracts" },
          ]}
        />
      </div>

      {/* 3. SISTEMAS INTEGRADOS & GOVERNANÇA (PAINEL COMPACTO SEM DUPLICAÇÕES) */}
      <div
        style={{
          background: "var(--ea-surface-bg, #FFFFFF)",
          border: "1px solid var(--ea-card-border, #E2DCD0)",
          borderRadius: 16,
          padding: "1.35rem 1.5rem",
          boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <IconSystems size={20} color="#C99A3E" />
            <h3 style={{ margin: 0, fontSize: "0.98rem", fontWeight: 800, color: "var(--ea-text-primary, #1D2B3C)", fontFamily: "'Sora', sans-serif" }}>
              Ecossistema Integrado & Governança de Sistemas
            </h3>
          </div>
          <div style={{ display: "flex", gap: "1rem", fontSize: "0.78rem" }}>
            <Link href="/eahub/apis" style={{ color: "#C99A3E", fontWeight: 700, textDecoration: "none" }}>
              Painel de APIs ↗
            </Link>
            <Link href="/eahub/tv" style={{ color: "var(--ea-text-secondary, #5B6472)", fontWeight: 600, textDecoration: "none" }}>
              Dashboard TV ↗
            </Link>
            <Link href="/eahub/collections/system-links" style={{ color: "var(--ea-text-secondary, #5B6472)", fontWeight: 600, textDecoration: "none" }}>
              Gerenciar Links ⚙
            </Link>
          </div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
          {filteredSystemLinks.map((item) => {
            const isExt = /^https?:\/\//.test(item.url ?? "");
            const Component = isExt ? "a" : Link;
            return (
              <Component
                key={String(item.id)}
                href={item.url || "#"}
                target={isExt ? "_blank" : undefined}
                rel={isExt ? "noopener noreferrer" : undefined}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  padding: "0.45rem 0.85rem",
                  borderRadius: 10,
                  background: "rgba(0,0,0,0.03)",
                  border: "1px solid var(--ea-card-border, #E2DCD0)",
                  color: "var(--ea-text-primary, #1D2B3C)",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  textDecoration: "none",
                  transition: "all 0.18s ease",
                }}
              >
                <span>{item.name}</span>
                {isExt ? <IconExternal size={13} color="#C99A3E" /> : <IconArrowRight size={13} color="#C99A3E" />}
              </Component>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function PipelineStage({
  stageNumber,
  stageBadge,
  title,
  description,
  metricLabel,
  icon,
  items,
}: {
  stageNumber: string;
  stageBadge: string;
  title: string;
  description: string;
  metricLabel: string;
  icon: React.ReactNode;
  items: { label: string; href: string; external?: boolean; type?: "primary" | "default" }[];
}) {
  return (
    <div
      style={{
        background: "var(--ea-surface-bg, #FFFFFF)",
        border: "1px solid var(--ea-card-border, #E2DCD0)",
        borderRadius: 16,
        padding: "1.35rem 1.6rem",
        boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        transition: "all 0.2s ease",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.75rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
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
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontSize: "0.68rem", fontWeight: 800, color: "#C99A3E", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Fase {stageNumber} · {stageBadge}
              </span>
            </div>
            <h3 style={{ margin: "0.15rem 0 0", fontSize: "1.05rem", fontWeight: 700, color: "var(--ea-text-primary, #1D2B3C)", fontFamily: "'Sora', sans-serif" }}>
              {title}
            </h3>
          </div>
        </div>

        <span
          style={{
            fontSize: "0.74rem",
            fontWeight: 700,
            padding: "0.3rem 0.75rem",
            borderRadius: 20,
            background: "rgba(201,154,62,0.1)",
            border: "1px solid rgba(201,154,62,0.3)",
            color: "#C99A3E",
          }}
        >
          {metricLabel}
        </span>
      </div>

      <p style={{ margin: 0, fontSize: "0.86rem", color: "var(--ea-text-secondary, #5B6472)", lineHeight: 1.5 }}>
        {description}
      </p>

      {/* Botões Acionáveis da Fase */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.65rem", paddingTop: "0.35rem" }}>
        {items.map((item) => {
          const isPrimary = item.type === "primary";
          const Component = item.external ? "a" : Link;
          return (
            <Component
              key={item.label}
              href={item.href}
              target={item.external ? "_blank" : undefined}
              rel={item.external ? "noopener noreferrer" : undefined}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.45rem",
                padding: isPrimary ? "0.55rem 0.95rem" : "0.5rem 0.85rem",
                borderRadius: 10,
                background: isPrimary ? "rgba(201,154,62,0.14)" : "rgba(0,0,0,0.03)",
                border: `1px solid ${isPrimary ? "#C99A3E" : "var(--ea-card-border, #E2DCD0)"}`,
                color: isPrimary ? "#C99A3E" : "var(--ea-text-primary, #1D2B3C)",
                fontSize: "0.82rem",
                fontWeight: isPrimary ? 700 : 600,
                textDecoration: "none",
                transition: "all 0.18s ease",
              }}
            >
              <span>{item.label}</span>
              {item.external ? <IconExternal size={13} color="currentColor" /> : <IconArrowRight size={13} color="currentColor" />}
            </Component>
          );
        })}
      </div>
    </div>
  );
}
