"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import type { PendingStatus } from "@/lib/pending-status";

const NAVY = "#1D2B3C";
const GOLD = "#C99A3E";
const GREEN = "#3F7D58";
const AMBER = "#C7892B";
const RED = "#B23B3B";

type TvKpis = {
  totalAlerts: number;
  pendingApprovals: number;
  contractsPending: number;
  signedContracts: number;
  totalContracts: number;
  totalLeads: number;
  leadsLast7Days: number;
  avgScore: number;
  topBottleneck: string;
  totalApis: number;
  apisHealthy: number;
  whatsappConnected: boolean;
};

type TvDashboardProps = {
  initialStatus: PendingStatus;
  initialKpis: TvKpis;
  generatedAt: string;
};

export function TvDashboardClient({ initialStatus, initialKpis, generatedAt }: TvDashboardProps) {
  const [status, setStatus] = useState<PendingStatus>(initialStatus);
  const [kpis, setKpis] = useState<TvKpis>(initialKpis);
  const [lastUpdated, setLastUpdated] = useState<string>(generatedAt);
  const [currentTime, setCurrentTime] = useState<string>("");
  const [currentDate, setCurrentDate] = useState<string>("");
  const [secondsUntilRefresh, setSecondsUntilRefresh] = useState(30);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Relógio em tempo real
  useEffect(() => {
    function updateClock() {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
      );
      setCurrentDate(
        now.toLocaleDateString("pt-BR", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      );
    }
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch automático em background a cada 30 segundos
  const fetchData = useCallback(async () => {
    setIsSyncing(true);
    try {
      const res = await fetch("/api/tv/metrics", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.ok) {
          setStatus(data.pendingStatus);
          setKpis(data.kpis);
          setLastUpdated(data.generatedAt);
        }
      }
    } catch (err) {
      console.error("Erro ao sincronizar TV Dashboard:", err);
    } finally {
      setIsSyncing(false);
      setSecondsUntilRefresh(30);
    }
  }, []);

  // Contador de auto-refresh
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsUntilRefresh((prev) => {
        if (prev <= 1) {
          fetchData();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [fetchData]);

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  }

  const tokenAlerts = status.eaPost?.tokenAlerts ?? [];
  const cronAlerts = status.eaPost?.cronAlerts ?? [];
  const pendingApprovals = status.eaPost?.pendingApprovalCount ?? 0;
  const expiringCredentials = status.expiringCredentials ?? [];
  const contractsPending = status.contractsAwaitingSignature ?? [];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(1400px 800px at 20% 0%, rgba(201,154,62,0.06) 0%, transparent 70%), #FFFFFF",
        color: NAVY,
        fontFamily: "'Inter', sans-serif",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      {/* 1. HEADER EXECUTIVO DE ALTO IMPACTO */}
      <header
        style={{
          background: NAVY,
          color: "#fff",
          borderBottom: `3px solid ${GOLD}`,
          padding: "1.1rem 2.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1.5rem",
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
        }}
      >
        {/* Marca & Título */}
        <div style={{ display: "flex", alignItems: "center", gap: "1.2rem" }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              background: "#0F1722",
              border: `2px solid ${GOLD}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              boxShadow: "0 0 12px rgba(201,154,62,0.3)",
            }}
          >
            <Image
              src="/logo-empresarial-academy.png"
              alt="Logo da Empresarial Academy"
              width={192}
              height={183}
              style={{ width: 44, height: "auto" }}
            />
          </div>

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <span
                style={{
                  fontSize: "0.72rem",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: GOLD,
                  fontWeight: 800,
                  fontFamily: "'Sora', sans-serif",
                }}
              >
                EA HUB · WAR ROOM OPERACIONAL
              </span>
              <span
                style={{
                  background: isSyncing ? "rgba(201,154,62,0.2)" : "rgba(63, 125, 88, 0.2)",
                  color: isSyncing ? GOLD : "#4ADE80",
                  fontSize: "0.65rem",
                  fontWeight: 800,
                  padding: "2px 8px",
                  borderRadius: 12,
                  border: `1px solid ${isSyncing ? GOLD : "#4ADE80"}`,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.3rem",
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: isSyncing ? GOLD : "#4ADE80",
                    animation: "pulse 1.5s infinite",
                  }}
                />
                {isSyncing ? "SINCRONIZANDO..." : "LIVE 16:9"}
              </span>
            </div>
            <h1
              style={{
                margin: "0.15rem 0 0",
                fontFamily: "'Sora', sans-serif",
                fontWeight: 800,
                fontSize: "1.85rem",
                letterSpacing: "-0.03em",
                color: "#FFFFFF",
              }}
            >
              Torre de Controle Executiva
            </h1>
          </div>
        </div>

        {/* Relógio Digital Centralizado */}
        <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div
            style={{
              fontFamily: "'Sora', sans-serif",
              fontSize: "2.35rem",
              fontWeight: 800,
              letterSpacing: "0.04em",
              color: "#FFFFFF",
              textShadow: "0 2px 10px rgba(0,0,0,0.3)",
            }}
          >
            {currentTime || "--:--:--"}
          </div>
          <div style={{ fontSize: "0.78rem", color: "#A0AEC0", textTransform: "capitalize", fontWeight: 500 }}>
            {currentDate || "Sincronizando horário..."}
          </div>
        </div>

        {/* Controles de TV & Fullscreen */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "0.7rem", color: "#A0AEC0", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Auto-Refresh em
            </div>
            <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: "1.1rem", color: GOLD }}>
              {secondsUntilRefresh}s
            </div>
          </div>

          <button
            type="button"
            onClick={fetchData}
            title="Atualizar agora"
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.15)",
              color: "#FFFFFF",
              borderRadius: 8,
              padding: "0.55rem 0.85rem",
              cursor: "pointer",
              fontSize: "0.82rem",
              fontWeight: 700,
            }}
          >
            ↻
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            style={{
              background: "linear-gradient(180deg, #E5CA8C 0%, #C99A3E 100%)",
              color: "#0F1722",
              border: "none",
              borderRadius: 8,
              padding: "0.55rem 1.1rem",
              cursor: "pointer",
              fontSize: "0.82rem",
              fontWeight: 800,
              fontFamily: "'Sora', sans-serif",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              boxShadow: "0 2px 10px rgba(201,154,62,0.3)",
            }}
          >
            <span>{isFullscreen ? "🗗 Janela" : "⛶ Tela Cheia"}</span>
          </button>
        </div>
      </header>

      {/* 2. RIBBON DE KPIs SUPERIORES (5 NÚMEROS HERO) */}
      <main style={{ padding: "1.6rem 2.4rem", flex: 1, display: "flex", flexDirection: "column", gap: "1.4rem" }}>
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: "1.1rem",
          }}
        >
          <HeroKpiCard
            tag="Alertas & Risco"
            title="Pendências Ativas"
            value={kpis.totalAlerts}
            detail={kpis.totalAlerts === 0 ? "Operação 100% normal" : `${kpis.totalAlerts} alertas em monitoramento`}
            tone={kpis.totalAlerts === 0 ? GREEN : RED}
            badge={kpis.totalAlerts === 0 ? "OK" : "ATENÇÃO"}
          />
          <HeroKpiCard
            tag="Pipeline Comercial"
            title="Contratos Pendentes"
            value={kpis.contractsPending}
            detail={`${kpis.signedContracts} assinados de ${kpis.totalContracts} totais`}
            tone={kpis.contractsPending === 0 ? GREEN : GOLD}
            badge="RECEITA"
          />
          <HeroKpiCard
            tag="Inteligência de Leads"
            title="Leads DME (7 Dias)"
            value={kpis.leadsLast7Days}
            detail={`${kpis.totalLeads} contatos totais na base`}
            tone={GREEN}
            badge="DME"
          />
          <HeroKpiCard
            tag="Motor de Conteúdo"
            title="Fila EA Post"
            value={kpis.pendingApprovals}
            detail={kpis.pendingApprovals === 0 ? "Fila de revisão zerada" : "conteúdos aguardando revisão"}
            tone={kpis.pendingApprovals === 0 ? GREEN : AMBER}
            badge="SOCIAL"
          />
          <HeroKpiCard
            tag="Infraestrutura 24/7"
            title="Torre WhatsApp & APIs"
            value={kpis.apisHealthy}
            detail={`${kpis.totalApis} serviços integrados`}
            tone={GREEN}
            badge="ASSESSOR"
          />
        </section>

        {/* 3. OS 4 QUADRANTES ESTRATÉGICOS 16:9 */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1.4rem",
            flex: 1,
          }}
        >
          {/* QUADRANTE 1: PIPELINE COMERCIAL & CONTRATOS */}
          <QuadrantPanel title="💼 1. Pipeline Comercial & Minutas de Contrato" badge="RECEITA & FECHAMENTO">
            <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem", height: "100%" }}>
              {contractsPending.length > 0 ? (
                <div style={{ display: "grid", gap: "0.6rem" }}>
                  {contractsPending.slice(0, 4).map((contract) => (
                    <div
                      key={contract.id}
                      style={{
                        background: "#FFFFFF",
                        border: "1px solid #E7E2D8",
                        borderLeft: "4px solid #C99A3E",
                        borderRadius: 10,
                        padding: "0.75rem 1rem",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        boxShadow: "0 2px 8px rgba(29,43,60,0.02)",
                      }}
                    >
                      <div>
                        <strong style={{ fontSize: "0.92rem", color: NAVY, fontFamily: "'Sora', sans-serif" }}>
                          {contract.title}
                        </strong>
                        <div style={{ fontSize: "0.76rem", color: "#5B6472", marginTop: "2px" }}>
                          Status: <span style={{ color: AMBER, fontWeight: 700 }}>Aguardando Assinatura</span>
                        </div>
                      </div>
                      <span style={{ fontSize: "0.74rem", color: "#8A93A0" }}>{formatDate(contract.createdAt)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyOkState title="Sem contratos pendentes de assinatura" subtitle="Todos os contratos gerados estão finalizados ou em atendimento." />
              )}

              <div
                style={{
                  marginTop: "auto",
                  background: "#F8F6F2",
                  borderRadius: 10,
                  padding: "0.8rem 1rem",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: "0.8rem",
                }}
              >
                <span style={{ color: "#5B6472" }}>Assinaturas ativas hoje:</span>
                <strong style={{ color: GREEN, fontFamily: "'Sora', sans-serif", fontSize: "0.95rem" }}>
                  {kpis.signedContracts} Contratos Consolidados
                </strong>
              </div>
            </div>
          </QuadrantPanel>

          {/* QUADRANTE 2: INTELIGÊNCIA DE LEADS & DIAGNÓSTICO DME */}
          <QuadrantPanel title="🎯 2. Tráfego, Leads & Diagnóstico de Maturidade" badge="CRESCIMENTO & DME">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "1rem", height: "100%" }}>
              {/* Score Médio Box */}
              <div
                style={{
                  background: "linear-gradient(180deg, #FFFFFF 0%, #FAF8F5 100%)",
                  border: "1px solid #E7E2D8",
                  borderRadius: 12,
                  padding: "1.2rem",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  textAlign: "center",
                }}
              >
                <span style={{ fontSize: "0.72rem", fontWeight: 800, color: GOLD, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Score Geral DME
                </span>
                <div style={{ fontFamily: "'Sora', sans-serif", fontSize: "3.2rem", fontWeight: 800, color: NAVY, margin: "0.3rem 0" }}>
                  {kpis.avgScore}%
                </div>
                <span style={{ fontSize: "0.76rem", color: "#5B6472", fontWeight: 600 }}>Maturidade Média PME</span>
              </div>

              {/* Gargalo Predominante */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem", justifyContent: "center" }}>
                <div style={{ background: "#F8F6F2", border: "1px solid #E7E2D8", borderRadius: 10, padding: "0.85rem 1rem" }}>
                  <span style={{ fontSize: "0.68rem", fontWeight: 800, color: RED, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    Maior Gargalo Detectado:
                  </span>
                  <div style={{ fontFamily: "'Sora', sans-serif", fontSize: "1rem", fontWeight: 700, color: NAVY, marginTop: "2px" }}>
                    {kpis.topBottleneck}
                  </div>
                  <p style={{ margin: "4px 0 0", fontSize: "0.74rem", color: "#5B6472" }}>
                    Pilar com maior oportunidade de proposta da Consultoria Gestão 360.
                  </p>
                </div>

                <div style={{ background: "#FFFFFF", border: "1px solid #E7E2D8", borderRadius: 10, padding: "0.75rem 1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.78rem", color: "#5B6472" }}>Novos Leads (7 dias):</span>
                  <strong style={{ fontFamily: "'Sora', sans-serif", color: GREEN, fontSize: "1.1rem" }}>+{kpis.leadsLast7Days}</strong>
                </div>
              </div>
            </div>
          </QuadrantPanel>

          {/* QUADRANTE 3: MOTOR DE CONTEÚDO EA POST & SOCIAL */}
          <QuadrantPanel title="📱 3. Central de Publicação · EA Post" badge="CONTEÚDO & SOCIAL">
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", height: "100%" }}>
              {status.eaPostError ? (
                <div style={{ background: "rgba(178,59,59,0.08)", border: "1px solid #B23B3B", borderRadius: 10, padding: "1rem", color: RED, fontSize: "0.85rem" }}>
                  {status.eaPostError}
                </div>
              ) : (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                    <div style={{ background: "#F8F6F2", border: "1px solid #E7E2D8", borderRadius: 10, padding: "0.85rem", textAlign: "center" }}>
                      <span style={{ fontSize: "0.68rem", color: "#5B6472", fontWeight: 700, textTransform: "uppercase" }}>Revisão Pendente</span>
                      <div style={{ fontFamily: "'Sora', sans-serif", fontSize: "1.8rem", fontWeight: 800, color: pendingApprovals === 0 ? GREEN : AMBER }}>
                        {pendingApprovals}
                      </div>
                    </div>
                    <div style={{ background: "#F8F6F2", border: "1px solid #E7E2D8", borderRadius: 10, padding: "0.85rem", textAlign: "center" }}>
                      <span style={{ fontSize: "0.68rem", color: "#5B6472", fontWeight: 700, textTransform: "uppercase" }}>Canais Conectados</span>
                      <div style={{ fontFamily: "'Sora', sans-serif", fontSize: "1.8rem", fontWeight: 800, color: tokenAlerts.length === 0 ? GREEN : RED }}>
                        {tokenAlerts.length === 0 ? "100%" : `${tokenAlerts.length} Alerta`}
                      </div>
                    </div>
                  </div>

                  {cronAlerts.length > 0 ? (
                    <div style={{ display: "grid", gap: "0.4rem" }}>
                      {cronAlerts.slice(0, 2).map((c, i) => (
                        <div key={i} style={{ background: "#FFFFFF", border: "1px solid #E7E2D8", borderRadius: 8, padding: "0.55rem 0.8rem", display: "flex", justifyContent: "space-between", fontSize: "0.76rem" }}>
                          <span style={{ fontWeight: 700, color: c.status === "falhou" ? RED : AMBER }}>{c.cron}</span>
                          <span style={{ color: "#5B6472" }}>{c.summary ?? c.status}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyOkState title="Automações de disparo ativas" subtitle="Nenhuma falha recente registrada nos robôs sociais." />
                  )}
                </>
              )}
            </div>
          </QuadrantPanel>

          {/* QUADRANTE 4: INFRAESTRUTURA, APIS & TORRE WHATSAPP */}
          <QuadrantPanel title="⚡ 4. Torre WhatsApp & Inventário de APIs" badge="INFRAESTRUTURA & IA">
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", height: "100%" }}>
              {/* WhatsApp Status Bar */}
              <div
                style={{
                  background: "rgba(63, 125, 88, 0.08)",
                  border: "1px solid #3F7D58",
                  borderRadius: 10,
                  padding: "0.75rem 1rem",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ADE80" }} />
                  <strong style={{ fontSize: "0.85rem", color: NAVY }}>Torre WhatsApp EA Assessor</strong>
                </div>
                <span style={{ fontSize: "0.74rem", fontWeight: 800, color: GREEN }}>OPERACIONAL 24/7</span>
              </div>

              {/* Lista de Credenciais & APIs */}
              {expiringCredentials.length > 0 ? (
                <div style={{ display: "grid", gap: "0.5rem" }}>
                  {expiringCredentials.slice(0, 3).map((cred) => (
                    <div
                      key={cred.name}
                      style={{
                        background: "#FFFFFF",
                        border: "1px solid #E7E2D8",
                        borderRadius: 8,
                        padding: "0.6rem 0.85rem",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        fontSize: "0.78rem",
                      }}
                    >
                      <span style={{ fontWeight: 700, color: NAVY }}>{cred.name}</span>
                      <span style={{ color: (cred.daysRemaining ?? 999) <= 7 ? RED : AMBER, fontWeight: 700 }}>
                        {(cred.daysRemaining ?? 999) <= 0 ? "Vencida" : `Vence em ${cred.daysRemaining}d`}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyOkState title="Todas as APIs e credenciais válidas" subtitle="OpenAI, Gemini, Evolution, Resend e Supabase operando com conformidade." />
              )}
            </div>
          </QuadrantPanel>
        </section>
      </main>

      {/* 4. FOOTER INSTITUCIONAL DISCRETO */}
      <footer
        style={{
          borderTop: "1px solid #E7E2D8",
          background: "#F8F6F2",
          padding: "0.85rem 2.5rem",
          fontSize: "0.78rem",
          color: "#5B6472",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, color: NAVY }}>
          Empresarial Academy · Conhecimento que Impulsiona
        </span>
        <span>
          Última sincronização do Wallboard: <strong>{formatDate(lastUpdated)}</strong>
        </span>
      </footer>
    </div>
  );
}

function HeroKpiCard({
  tag,
  title,
  value,
  detail,
  tone,
  badge,
}: {
  tag: string;
  title: string;
  value: number;
  detail: string;
  tone: string;
  badge: string;
}) {
  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "1px solid #E7E2D8",
        borderRadius: 14,
        padding: "1.1rem 1.25rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.35rem",
        boxShadow: "0 4px 14px rgba(29,43,60,0.03)",
        position: "relative",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "0.65rem", fontWeight: 800, color: GOLD, letterSpacing: "0.08em", textTransform: "uppercase" }}>
          {tag}
        </span>
        <span style={{ fontSize: "0.65rem", fontWeight: 800, padding: "2px 6px", borderRadius: 4, background: "rgba(29,43,60,0.06)", color: NAVY }}>
          {badge}
        </span>
      </div>

      <div style={{ fontFamily: "'Sora', sans-serif", fontSize: "2.4rem", fontWeight: 800, color: tone, lineHeight: 1.15 }}>
        {value}
      </div>

      <div style={{ fontSize: "0.82rem", fontWeight: 700, color: NAVY, fontFamily: "'Sora', sans-serif" }}>
        {title}
      </div>

      <div style={{ fontSize: "0.72rem", color: "#5B6472" }}>{detail}</div>
    </div>
  );
}

function QuadrantPanel({ title, badge, children }: { title: string; badge: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "1px solid #E7E2D8",
        borderRadius: 16,
        padding: "1.3rem 1.5rem",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        boxShadow: "0 8px 24px rgba(29,43,60,0.03)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #C99A3E", paddingBottom: "0.6rem" }}>
        <h2 style={{ margin: 0, fontFamily: "'Sora', sans-serif", fontSize: "1.05rem", fontWeight: 800, color: NAVY }}>
          {title}
        </h2>
        <span style={{ fontSize: "0.65rem", fontWeight: 800, color: GOLD, letterSpacing: "0.08em", textTransform: "uppercase" }}>
          {badge}
        </span>
      </div>
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
}

function EmptyOkState({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div
      style={{
        background: "#FAF9F6",
        border: "1px dashed #E2DCD0",
        borderRadius: 10,
        padding: "1.2rem",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.3rem",
        height: "100%",
      }}
    >
      <div style={{ width: 8, height: 8, borderRadius: "50%", background: GREEN, marginBottom: "4px" }} />
      <strong style={{ fontSize: "0.85rem", color: NAVY, fontFamily: "'Sora', sans-serif" }}>{title}</strong>
      <span style={{ fontSize: "0.75rem", color: "#5B6472", maxWidth: 320 }}>{subtitle}</span>
    </div>
  );
}

function formatDate(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

