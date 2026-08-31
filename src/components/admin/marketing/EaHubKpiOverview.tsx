import Link from "next/link";

type KpiProps = {
  totalLeads: number;
  dmeLeads: number;
  totalEmails: number;
  activeAds: number;
  totalContracts: number;
  signedContracts: number;
};

export function EaHubKpiOverview({
  totalLeads,
  dmeLeads,
  totalEmails,
  activeAds,
  totalContracts,
  signedContracts,
}: KpiProps) {
  const pillars = [
    { name: "Gestão Geral", score: 68, color: "#C99A3E" },
    { name: "Vendas & Comercial", score: 54, color: "#3B82F6" },
    { name: "Marketing & Aquisição", score: 62, color: "#EC4899" },
    { name: "Processos & Produtividade", score: 48, color: "#EAB308" },
    { name: "Finanças & Margem", score: 71, color: "#10B981" },
    { name: "Liderança & Cultura", score: 65, color: "#8B5CF6" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", marginBottom: "2.25rem" }}>
      {/* 4 Cards de Métricas Principais */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
        <KpiTile
          icon="👥"
          label="Base de Leads"
          value={totalLeads}
          subtext={`${dmeLeads} via DME Gestão 360`}
          href="/eahub/collections/leads"
          badge="Tempo Real"
        />
        <KpiTile
          icon="✉️"
          label="Campanhas de E-mail"
          value={totalEmails}
          subtext="Nutrição + Alertas ativos"
          href="/eahub/collections/email-campaigns"
          badge="99.8% Entrega"
          badgeColor="#2E7D5B"
        />
        <KpiTile
          icon="🎯"
          label="Google Ads & Tráfego"
          value={activeAds}
          subtext="Campanhas em monitoramento"
          href="/eahub/ads-performance"
          badge="Forecast Ativo"
        />
        <KpiTile
          icon="📑"
          label="Formalização Jurídica"
          value={totalContracts}
          subtext={`${signedContracts} assinado(s)`}
          href="/eahub/collections/contracts"
          badge="Assinatura Digital"
        />
      </div>

      {/* Mini-Dashboard de Distribuição da Metodologia Gestão 360 */}
      <div
        style={{
          background: "var(--ea-surface-bg, #FFFFFF)",
          border: "1px solid var(--ea-card-border, #E2DCD0)",
          borderRadius: 16,
          padding: "1.25rem 1.5rem",
          boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
          <div>
            <span style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#C99A3E" }}>
              Inteligência de Mercado · Diagnóstico de Maturidade
            </span>
            <h3 style={{ margin: "0.2rem 0 0", fontSize: "1.05rem", fontWeight: 700, color: "var(--ea-text-primary, #1D2B3C)", fontFamily: "'Sora', sans-serif" }}>
              Média de Maturidade dos 6 Pilares (Leads PME)
            </h3>
          </div>
          <Link
            href="/eahub/apresentacao"
            style={{ fontSize: "0.8rem", fontWeight: 700, color: "#C99A3E", textDecoration: "none" }}
          >
            Abrir Apresentador Comercial ↗
          </Link>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
          {pillars.map((p) => (
            <div key={p.name} style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", fontWeight: 600 }}>
                <span style={{ color: "var(--ea-text-secondary, #4A5568)" }}>{p.name}</span>
                <span style={{ color: p.color, fontWeight: 700 }}>{p.score}%</span>
              </div>
              <div style={{ height: 7, borderRadius: 4, background: "rgba(0,0,0,0.06)", overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    width: `${p.score}%`,
                    borderRadius: 4,
                    background: p.color,
                    transition: "width 0.8s ease-in-out",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function KpiTile({
  icon,
  label,
  value,
  subtext,
  href,
  badge,
  badgeColor,
}: {
  icon: string;
  label: string;
  value: number;
  subtext: string;
  href: string;
  badge?: string;
  badgeColor?: string;
}) {
  return (
    <Link
      href={href}
      style={{
        display: "flex",
        flexDirection: "column",
        textDecoration: "none",
        color: "inherit",
        background: "var(--ea-surface-bg, #FFFFFF)",
        border: "1px solid var(--ea-card-border, #E2DCD0)",
        borderRadius: 14,
        padding: "1.15rem 1.25rem",
        boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
        transition: "all 0.2s ease",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
        <span style={{ fontSize: "1.25rem" }}>{icon}</span>
        {badge ? (
          <span
            style={{
              fontSize: "0.68rem",
              fontWeight: 700,
              padding: "0.15rem 0.5rem",
              borderRadius: 12,
              background: badgeColor ? "rgba(46,125,91,0.12)" : "rgba(201,154,62,0.12)",
              color: badgeColor || "#C99A3E",
              border: `1px solid ${badgeColor ? "rgba(46,125,91,0.3)" : "rgba(201,154,62,0.3)"}`,
            }}
          >
            {badge}
          </span>
        ) : null}
      </div>
      <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--ea-text-secondary, #64748B)" }}>
        {label}
      </span>
      <strong style={{ fontSize: "1.65rem", fontWeight: 800, color: "var(--ea-text-primary, #1D2B3C)", fontFamily: "'Sora', sans-serif", margin: "0.2rem 0" }}>
        {value}
      </strong>
      <span style={{ fontSize: "0.76rem", color: "var(--ea-text-secondary, #8A93A0)", marginTop: "auto" }}>
        {subtext}
      </span>
    </Link>
  );
}
