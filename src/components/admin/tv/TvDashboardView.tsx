import Image from "next/image";
import { getPendingStatus } from "@/lib/pending-status";

const NAVY = "#1D2B3C";
const GOLD = "#C99A3E";
const GREEN = "#3F7D58";
const AMBER = "#C7892B";
const RED = "#B23B3B";
const GRAY = "#9AA3AF";
const WHITE = "#FFFFFF";
const PANEL = "#F3EFE8";

/**
 * Dashboard executivo para TV do EA HUB.
 * Mantém o monitoramento contínuo e reestrutura a informação em KPIs visuais,
 * blocos de operação e listas prioritárias, seguindo o mesmo design system da EA.
 */
export async function TvDashboardView() {
  const status = await getPendingStatus();

  const tokenAlerts = status.eaPost?.tokenAlerts ?? [];
  const cronAlerts = status.eaPost?.cronAlerts ?? [];
  const pendingApprovals = status.eaPost?.pendingApprovalCount ?? 0;
  const expiringCredentials = status.expiringCredentials ?? [];
  const contractsPending = status.contractsAwaitingSignature ?? [];

  const totalAlerts =
    pendingApprovals +
    tokenAlerts.length +
    cronAlerts.length +
    contractsPending.length +
    expiringCredentials.length;

  const riskCount =
    tokenAlerts.filter((t) => t.expired || (t.daysRemaining ?? 999) <= 7).length +
    cronAlerts.filter((c) => c.status === "falhou").length +
    expiringCredentials.filter((c) => (c.daysRemaining ?? 999) <= 7).length;

  const cards = [
    {
      label: "Pendências ativas",
      value: totalAlerts,
      detail: totalAlerts === 0 ? "Tudo em ordem" : "alertas em operação",
      tone: totalAlerts === 0 ? GREEN : GOLD,
    },
    {
      label: "Aprovação EA Post",
      value: pendingApprovals,
      detail: pendingApprovals === 0 ? "Sem fila" : "conteúdos aguardando revisão",
      tone: pendingApprovals === 0 ? GREEN : AMBER,
    },
    {
      label: "Contratos pendentes",
      value: contractsPending.length,
      detail: contractsPending.length === 0 ? "Nenhum em aberto" : "assinaturas pendentes",
      tone: contractsPending.length === 0 ? GREEN : GOLD,
    },
    {
      label: "Credenciais em risco",
      value: expiringCredentials.length,
      detail: expiringCredentials.length === 0 ? "Dentro do prazo" : "vence em até 30 dias",
      tone: expiringCredentials.length === 0 ? GREEN : RED,
    },
    {
      label: "Risco operacional",
      value: riskCount,
      detail: riskCount === 0 ? "Sem incidentes" : "itens críticos para atenção",
      tone: riskCount === 0 ? GREEN : RED,
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(1200px 700px at 15% 0%, rgba(201,154,62,0.08) 0%, transparent 60%), #FFFFFF",
        color: NAVY,
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <meta httpEquiv="refresh" content="120" />

      <header
        style={{
          background: NAVY,
          color: "#fff",
          borderBottom: `3px solid ${GOLD}`,
          padding: "1.3rem 2.4rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1.2rem" }}>
          <Image src="/logo-empresarial-academy.png" alt="Logo da Empresarial Academy" width={192} height={183} style={{ width: 54, height: "auto" }} />
          <div>
            <div style={{ fontSize: "0.73rem", letterSpacing: "0.12em", textTransform: "uppercase", color: GOLD, fontWeight: 700 }}>
              EA HUB · Monitoramento executivo
            </div>
            <h1 style={{ margin: "0.25rem 0 0", fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: "2rem", letterSpacing: "-0.04em" }}>
              Torre de Controle
            </h1>
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "2.4rem", fontFamily: "'Sora', sans-serif", fontWeight: 800, color: totalAlerts === 0 ? GREEN : GOLD }}>
            {totalAlerts}
          </div>
          <div style={{ fontSize: "0.76rem", color: "#D9DCE1", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            pendências ativas
          </div>
        </div>
      </header>

      <main style={{ padding: "2rem 2.4rem 2.5rem", display: "grid", gap: "1.5rem" }}>
        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
          {cards.map((card) => (
            <DashboardCard key={card.label} label={card.label} value={card.value} detail={card.detail} tone={card.tone} />
          ))}
        </section>

        <section style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "1.5rem" }}>
          <div style={{ display: "grid", gap: "1.5rem" }}>
            <Panel title="Central de aprovação · EA Post">
              {status.eaPostError ? (
                <ErrorRow message={status.eaPostError} />
              ) : (
                <BigStat value={pendingApprovals} label="conteúdos esperando revisão" tone={pendingApprovals === 0 ? GREEN : AMBER} />
              )}
            </Panel>

            <Panel title="Automações e falhas recentes">
              {status.eaPostError ? (
                <ErrorRow message={status.eaPostError} />
              ) : cronAlerts.length > 0 ? (
                <Rows>
                  {cronAlerts.slice(0, 4).map((c, index) => (
                    <Row
                      key={`${c.cron}-${index}`}
                      tone={c.status === "falhou" ? RED : AMBER}
                      primary={c.cron}
                      secondary={c.summary ?? c.status}
                      meta={formatDate(c.createdAt)}
                    />
                  ))}
                </Rows>
              ) : (
                <OkRow message="Nenhuma falha recente registrada." />
              )}
            </Panel>

            <Panel title="Contratos aguardando assinatura">
              {contractsPending.length > 0 ? (
                <Rows>
                  {contractsPending.slice(0, 4).map((contract) => (
                    <Row
                      key={contract.id}
                      tone={contract.status === "enviado" ? AMBER : GRAY}
                      primary={contract.title}
                      secondary={contract.status === "enviado" ? "Enviado e pendente de assinatura" : "Rascunho ainda não finalizado"}
                      meta={formatDate(contract.createdAt)}
                    />
                  ))}
                </Rows>
              ) : (
                <OkRow message="Nenhum contrato pendente." />
              )}
            </Panel>
          </div>

          <div style={{ display: "grid", gap: "1.5rem" }}>
            <Panel title="Credenciais e acessos">
              {tokenAlerts.length > 0 ? (
                <Rows>
                  {tokenAlerts.slice(0, 4).map((token) => (
                    <Row
                      key={token.channel}
                      tone={token.expired ? RED : AMBER}
                      primary={token.channel}
                      secondary={token.expired ? "Token expirado — publicação interrompida" : `Vence em ${token.daysRemaining ?? 0} dia(s)`}
                    />
                  ))}
                </Rows>
              ) : (
                <OkRow message="Todos os tokens dentro da validade." />
              )}
            </Panel>

            <Panel title="Credenciais vencendo em 30 dias">
              {expiringCredentials.length > 0 ? (
                <Rows>
                  {expiringCredentials.slice(0, 5).map((credential) => (
                    <Row
                      key={credential.name}
                      tone={(credential.daysRemaining ?? 999) <= 0 ? RED : (credential.daysRemaining ?? 999) <= 7 ? AMBER : GRAY}
                      primary={credential.name}
                      secondary={credential.provider}
                      meta={(credential.daysRemaining ?? 999) <= 0 ? "Vencida" : `${credential.daysRemaining ?? 0} dia(s)`}
                    />
                  ))}
                </Rows>
              ) : (
                <OkRow message="Nenhuma credencial vencendo em 30 dias." />
              )}
            </Panel>
          </div>
        </section>
      </main>

      <footer
        style={{
          borderTop: "1px solid #E7E2D8",
          background: PANEL,
          padding: "1rem 2.4rem",
          fontSize: "0.8rem",
          color: "#5B6472",
          display: "flex",
          justifyContent: "space-between",
          gap: "1rem",
        }}
      >
        <span>Empresarial Academy — Conhecimento que Impulsiona</span>
        <span>Atualizado {formatDate(new Date().toISOString())} · atualiza a cada 2 min</span>
      </footer>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section
      style={{
        background: WHITE,
        border: `1px solid #E7E2D8`,
        borderRadius: 18,
        boxShadow: "0 10px 28px rgba(29,43,60,0.04)",
        padding: "1.1rem 1.2rem",
      }}
    >
      <h2
        style={{
          margin: "0 0 0.9rem",
          fontFamily: "'Sora', sans-serif",
          fontSize: "1.05rem",
          fontWeight: 700,
          color: NAVY,
          borderBottom: `2px solid ${GOLD}`,
          paddingBottom: "0.5rem",
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function DashboardCard({ label, value, detail, tone }: { label: string; value: number; detail: string; tone: string }) {
  return (
    <div
      style={{
        background: "linear-gradient(180deg, #FFFFFF 0%, #F9F7F3 100%)",
        border: `1px solid #E7E2D8`,
        borderRadius: 18,
        padding: "1rem 1rem 0.9rem",
        boxShadow: "0 10px 28px rgba(29,43,60,0.04)",
      }}
    >
      <div style={{ fontSize: "0.72rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#5B6472", fontWeight: 700 }}>{label}</div>
      <div style={{ marginTop: "0.7rem", fontFamily: "'Sora', sans-serif", fontSize: "2.2rem", fontWeight: 800, color: tone }}>{value}</div>
      <div style={{ marginTop: "0.25rem", fontSize: "0.82rem", color: "#5B6472" }}>{detail}</div>
    </div>
  );
}

function BigStat({ value, label, tone }: { value: number; label: string; tone: string }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: "1rem", padding: "0.3rem 0 0.4rem" }}>
      <span style={{ fontFamily: "'Sora', sans-serif", fontSize: "3rem", fontWeight: 800, color: tone }}>{value}</span>
      <span style={{ fontSize: "1rem", color: "#5B6472" }}>{label}</span>
    </div>
  );
}

function Rows({ children }: { children: React.ReactNode }) {
  return <div style={{ display: "grid", gap: "0.2rem" }}>{children}</div>;
}

function Row({ tone, primary, secondary, meta }: { tone: string; primary: string; secondary: string; meta?: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.8rem",
        padding: "0.7rem 0",
        borderBottom: "1px solid #E7E2D8",
      }}
    >
      <span style={{ width: 10, height: 10, borderRadius: "50%", background: tone, flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: "0.98rem", color: NAVY }}>{primary}</div>
        <div style={{ fontSize: "0.82rem", color: "#5B6472" }}>{secondary}</div>
      </div>
      {meta ? <span style={{ fontSize: "0.76rem", color: "#6B7280" }}>{meta}</span> : null}
    </div>
  );
}

function OkRow({ message }: { message: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", padding: "0.55rem 0" }}>
      <span style={{ width: 10, height: 10, borderRadius: "50%", background: GREEN, flexShrink: 0 }} />
      <span style={{ color: "#5B6472" }}>{message}</span>
    </div>
  );
}

function ErrorRow({ message }: { message: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", padding: "0.55rem 0" }}>
      <span style={{ width: 10, height: 10, borderRadius: "50%", background: GRAY, flexShrink: 0 }} />
      <span style={{ color: "#5B6472" }}>{message}</span>
    </div>
  );
}

function formatDate(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}
