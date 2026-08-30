import Image from "next/image";
import { getPendingStatus } from "@/lib/pending-status";

const NAVY = "#1D2B3C";
const GOLD = "#C1A160";
const GREEN = "#2E7D5B";
const AMBER = "#C7892B";
const RED = "#B23B3B";
const GRAY = "#9AA3AF";

/**
 * Dashboard de pendências pensado para ficar ligado numa TV/tela na parede
 * (rota /eahub/tv) — não é a mesma tela da apresentação a cliente (essa é
 * /tecnologia, pública). Aqui exige login (é dado interno: contratos,
 * credenciais). Fonte grande, sem menu, auto-refresh via meta refresh (sem
 * JS de polling — mais robusto para rodar o dia inteiro sem travar).
 * Puxa só pendências já rastreadas em cada sistema (cron-run-log e tokens
 * do EA Post, contracts/api-inventory do site) — nenhuma métrica nova.
 */
export async function TvDashboardView() {
  const status = await getPendingStatus();

  const totalAlerts =
    (status.eaPost?.pendingApprovalCount ?? 0) +
    (status.eaPost?.tokenAlerts.length ?? 0) +
    (status.eaPost?.cronAlerts.length ?? 0) +
    status.contractsAwaitingSignature.length +
    status.expiringCredentials.length;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F6F5F1",
        color: "#15191F",
        fontFamily: "'Open Sans', Arial, sans-serif",
      }}
    >
      <meta httpEquiv="refresh" content="120" />

      <header
        style={{
          background: NAVY,
          color: "#fff",
          borderBottom: `3px solid ${GOLD}`,
          padding: "1.4rem 2.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
          <Image src="/logo-empresarial-academy.png" alt="" width={192} height={183} style={{ width: 56, height: "auto" }} />
          <div>
            <h1 style={{ margin: 0, fontFamily: "'Montserrat', Arial, sans-serif", fontSize: "1.6rem" }}>
              Torre de Controle
            </h1>
            <p style={{ margin: "0.2rem 0 0", color: GOLD, fontSize: "0.95rem" }}>
              Pendências dos sistemas da Empresarial Academy
            </p>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "2.2rem", fontFamily: "'Montserrat', Arial, sans-serif", fontWeight: 700, color: totalAlerts === 0 ? GREEN : GOLD }}>
            {totalAlerts}
          </div>
          <div style={{ fontSize: "0.8rem", color: "#D9DCE1" }}>pendência(s) no total</div>
        </div>
      </header>

      <div style={{ padding: "2rem 2.5rem", display: "grid", gap: "2rem" }}>
        <Column title="Central de Aprovação · EA Post">
          {status.eaPostError ? (
            <ErrorRow message={status.eaPostError} />
          ) : (
            <BigStat
              value={status.eaPost?.pendingApprovalCount ?? 0}
              label="peça(s) aguardando aprovação"
              tone={
                (status.eaPost?.pendingApprovalCount ?? 0) === 0
                  ? GREEN
                  : (status.eaPost?.pendingApprovalCount ?? 0) > 10
                    ? RED
                    : AMBER
              }
            />
          )}
        </Column>

        <Column title="Credenciais de redes sociais · EA Post">
          {status.eaPostError ? (
            <ErrorRow message={status.eaPostError} />
          ) : status.eaPost && status.eaPost.tokenAlerts.length > 0 ? (
            <Rows>
              {status.eaPost.tokenAlerts.map((t) => (
                <Row
                  key={t.channel}
                  tone={t.expired ? RED : AMBER}
                  primary={t.channel}
                  secondary={t.expired ? "Token expirado — publicação parada" : `Vence em ${t.daysRemaining} dia(s)`}
                />
              ))}
            </Rows>
          ) : (
            <OkRow message="Todos os tokens dentro da validade." />
          )}
        </Column>

        <Column title="Automações · EA Post (últimas falhas)">
          {status.eaPostError ? (
            <ErrorRow message={status.eaPostError} />
          ) : status.eaPost && status.eaPost.cronAlerts.length > 0 ? (
            <Rows>
              {status.eaPost.cronAlerts.map((c, i) => (
                <Row
                  key={`${c.cron}-${i}`}
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
        </Column>

        <Column title="Contratos aguardando assinatura">
          {status.contractsAwaitingSignature.length > 0 ? (
            <Rows>
              {status.contractsAwaitingSignature.map((c) => (
                <Row
                  key={c.id}
                  tone={c.status === "enviado" ? AMBER : GRAY}
                  primary={c.title}
                  secondary={c.status === "enviado" ? "Enviado, aguardando assinatura" : "Ainda em rascunho"}
                  meta={formatDate(c.createdAt)}
                />
              ))}
            </Rows>
          ) : (
            <OkRow message="Nenhum contrato pendente." />
          )}
        </Column>

        <Column title="Credenciais vencendo (30 dias)">
          {status.expiringCredentials.length > 0 ? (
            <Rows>
              {status.expiringCredentials.map((c) => (
                <Row
                  key={c.name}
                  tone={c.daysRemaining <= 0 ? RED : c.daysRemaining <= 7 ? AMBER : GRAY}
                  primary={c.name}
                  secondary={c.provider}
                  meta={c.daysRemaining <= 0 ? "Vencida" : `${c.daysRemaining} dia(s)`}
                />
              ))}
            </Rows>
          ) : (
            <OkRow message="Nenhuma credencial vencendo em 30 dias." />
          )}
        </Column>
      </div>

      <footer
        style={{
          borderTop: "1px solid #D9DCE1",
          padding: "1rem 2.5rem",
          fontSize: "0.8rem",
          color: "#6B7280",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <span>Empresarial Academy — Conhecimento que Impulsiona</span>
        <span>Atualizado {formatDate(new Date().toISOString())} · atualiza a cada 2 min</span>
      </footer>
    </div>
  );
}

function Column({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2
        style={{
          margin: "0 0 0.9rem",
          fontFamily: "'Montserrat', Arial, sans-serif",
          fontSize: "1.15rem",
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

function BigStat({ value, label, tone }: { value: number; label: string; tone: string }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: "1rem" }}>
      <span style={{ fontFamily: "'Montserrat', Arial, sans-serif", fontSize: "3.2rem", fontWeight: 700, color: tone }}>
        {value}
      </span>
      <span style={{ fontSize: "1.05rem", color: "#6B7280" }}>{label}</span>
    </div>
  );
}

function Rows({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}

function Row({ tone, primary, secondary, meta }: { tone: string; primary: string; secondary: string; meta?: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.9rem",
        padding: "0.75rem 0",
        borderBottom: "1px solid #D9DCE1",
      }}
    >
      <span style={{ width: 10, height: 10, background: tone, flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: "1.02rem" }}>{primary}</div>
        <div style={{ fontSize: "0.9rem", color: "#6B7280" }}>{secondary}</div>
      </div>
      {meta ? <span style={{ fontSize: "0.85rem", color: "#9AA3AF" }}>{meta}</span> : null}
    </div>
  );
}

function OkRow({ message }: { message: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.9rem", padding: "0.75rem 0" }}>
      <span style={{ width: 10, height: 10, background: GREEN, flexShrink: 0 }} />
      <span style={{ color: "#6B7280" }}>{message}</span>
    </div>
  );
}

function ErrorRow({ message }: { message: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.9rem", padding: "0.75rem 0" }}>
      <span style={{ width: 10, height: 10, background: GRAY, flexShrink: 0 }} />
      <span style={{ color: "#6B7280" }}>{message}</span>
    </div>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}
