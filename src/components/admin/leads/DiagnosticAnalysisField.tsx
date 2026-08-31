"use client";
import React, { useState } from "react";
import { useFormFields } from "@payloadcms/ui";

const PILLARS_CONFIG = [
  {
    key: "Fluxo de Alta Performance",
    name: "Fluxo de Alta Performance",
    desc: "Mapeamento de processos, rotinas, alçadas e melhoria contínua.",
    tip: "Mapeie o processo que mais gera dor hoje e defina alçadas de decisão claras. Operação que depende só do dono não escala.",
  },
  {
    key: "Arquitetura do Crescimento",
    name: "Arquitetura do Crescimento",
    desc: "Organograma, recrutamento, rituais 1:1, feedback e avaliação.",
    tip: "Desenhe um organograma funcional simples e implante 1:1 regulares com a equipe. Estrutura clara sustenta o crescimento.",
  },
  {
    key: "Objetivos Estratégicos",
    name: "Objetivos Estratégicos",
    desc: "Análise estratégica, metas (OKRs), desdobramento e foco.",
    tip: "Escreva os 3 objetivos mais importantes dos próximos 90 dias e desdobre em metas por área. Time sem foco comum trabalha duro e anda pouco.",
  },
  {
    key: "Métricas de Sucesso",
    name: "Métricas de Sucesso",
    desc: "Métricas de sanidade (margem/caixa), DRE, Pareto e gestão à vista.",
    tip: "Troque métrica de vaidade por métrica de sanidade (margem líquida, fluxo de caixa, retenção) e separe resultado contábil de saldo de banco.",
  },
  {
    key: "Gestão de Desafios",
    name: "Gestão de Desafios",
    desc: "Mapeamento de riscos, reserva de emergência e gestão de crise.",
    tip: "Mapeie os principais riscos do negócio e comece uma reserva financeira de emergência. Empresa sem plano de crise decide no desespero.",
  },
  {
    key: "Evolução Constante",
    name: "Evolução Constante",
    desc: "Inovação, capacitação contínua, revisão de modelo e tendências.",
    tip: "Reserve tempo na agenda para pensar no futuro do negócio. Quem não questiona o próprio modelo é questionado pelo mercado primeiro.",
  },
];

function parseScore(val: unknown): { pct: number; label: string } | null {
  if (typeof val !== "string") return null;
  const match = /(\d+)\s*%/.exec(val);
  const labelMatch = /\(([^)]+)\)/.exec(val);
  if (!match) return null;
  return {
    pct: Number(match[1]),
    label: labelMatch ? labelMatch[1].trim() : "",
  };
}

function getLevelColor(pct: number): string {
  if (pct <= 20) return "#B23B3B";
  if (pct <= 40) return "#C7892B";
  if (pct <= 60) return "#C1A160";
  if (pct <= 80) return "#2E7D5B";
  return "#1D2B3C";
}

function DiagnosticAnalysisInner() {
  const [copied, setCopied] = useState(false);

  const rawDetails = useFormFields(([fields]) => (fields?.details?.value as Record<string, unknown> | undefined));
  const diagnosticId = useFormFields(([fields]) => (fields?.diagnosticId?.value as string | undefined));
  const hasDiagnostic = useFormFields(([fields]) => (fields?.hasDiagnostic?.value as boolean | undefined));
  const name = useFormFields(([fields]) => (fields?.name?.value as string | undefined));
  const company = useFormFields(([fields]) => (fields?.company?.value as string | undefined));
  const whatsapp = useFormFields(([fields]) => (fields?.whatsapp?.value as string | undefined));
  const source = useFormFields(([fields]) => (fields?.source?.value as string | undefined));

  const isDiag = Boolean(
    hasDiagnostic ||
    diagnosticId ||
    (typeof source === "string" && source.includes("Diagnóstico")) ||
    (rawDetails && typeof rawDetails === "object" && Boolean(rawDetails["Maturidade Geral"]))
  );

  if (!isDiag || !rawDetails || typeof rawDetails !== "object") {
    return (
      <div
        style={{
          border: "1px dashed var(--theme-elevation-200)",
          borderRadius: 8,
          padding: "16px 20px",
          background: "var(--theme-elevation-50)",
          color: "var(--theme-elevation-500)",
          fontSize: "0.85rem",
          margin: "16px 0",
        }}
      >
        <strong>Lead Geral:</strong> Este contato não possui respostas do Diagnóstico de Maturidade Empresarial registradas.
      </div>
    );
  }

  const overall = parseScore(rawDetails["Maturidade Geral"]) || { pct: 0, label: "Não calculado" };
  const cargo = rawDetails["Cargo"] as string | undefined;
  const faturamento = rawDetails["Faturamento anual"] as string | undefined;

  const pillarsData = PILLARS_CONFIG.map((cfg) => {
    const score = parseScore(rawDetails[cfg.key]);
    return {
      ...cfg,
      pct: score ? score.pct : 0,
      label: score ? score.label : "—",
      hasScore: score !== null,
    };
  });

  const scoredPillars = pillarsData.filter((p) => p.hasScore);
  const weakestPillar = scoredPillars.length > 0
    ? scoredPillars.reduce((min, p) => (p.pct < min.pct ? p : min), scoredPillars[0])
    : null;

  const handleCopyId = () => {
    if (!diagnosticId) return;
    navigator.clipboard.writeText(diagnosticId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const digits = (whatsapp || "").replace(/\D/g, "");
  const withCountry = digits.length <= 11 ? `55${digits}` : digits;
  const diagRef = diagnosticId ? ` (ID: ${diagnosticId})` : "";
  const waConsultiveText = encodeURIComponent(
    `Olá ${name || ""}! Aqui é Thiago Marchi da Empresarial Academy. Analisei seu Diagnóstico de Maturidade Empresarial${diagRef} e notei pontos importantes para conversarmos, especialmente no pilar de ${weakestPillar?.name || "gestão"}. Podemos agendar nossa conversa estratégica?`
  );
  const waLink = digits ? `https://wa.me/${withCountry}?text=${waConsultiveText}` : null;

  return (
    <div
      style={{
        border: "1px solid rgba(193, 161, 96, 0.35)",
        borderRadius: 12,
        background: "var(--theme-elevation-50)",
        padding: "22px 24px",
        margin: "20px 0",
        boxShadow: "0 4px 18px rgba(0,0,0,0.04)",
      }}
    >
      {/* Topo / Header do Diagnóstico */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          borderBottom: "1px solid var(--theme-elevation-150)",
          paddingBottom: 16,
          marginBottom: 18,
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                background: "rgba(193, 161, 96, 0.15)",
                border: "1px solid #C1A160",
                color: "#C1A160",
                fontSize: "0.78rem",
                fontWeight: 700,
                padding: "3px 10px",
                borderRadius: 20,
                letterSpacing: "0.04em",
              }}
            >
              ★ DIAGNÓSTICO GESTÃO 360
            </span>
            {diagnosticId && (
              <span
                style={{
                  fontFamily: "monospace",
                  fontWeight: 700,
                  fontSize: "0.92rem",
                  color: "var(--theme-elevation-800)",
                  background: "var(--theme-elevation-100)",
                  padding: "3px 8px",
                  borderRadius: 6,
                  border: "1px solid var(--theme-elevation-200)",
                }}
              >
                {diagnosticId}
              </span>
            )}
            {diagnosticId && (
              <button
                type="button"
                onClick={handleCopyId}
                style={{
                  background: "none",
                  border: "none",
                  color: copied ? "var(--theme-success-600)" : "var(--theme-elevation-500)",
                  fontSize: "0.76rem",
                  cursor: "pointer",
                  fontWeight: 600,
                  textDecoration: "underline",
                }}
              >
                {copied ? "✓ Copiado!" : "Copiar ID"}
              </button>
            )}
          </div>
          <h3
            style={{
              margin: "8px 0 2px",
              fontFamily: "Montserrat, Arial, sans-serif",
              fontSize: "1.15rem",
              fontWeight: 700,
              color: "var(--theme-elevation-900)",
            }}
          >
            Raio-X de Maturidade: {name || "Cliente"} {company ? `(${company})` : ""}
          </h3>
          <div style={{ fontSize: "0.82rem", color: "var(--theme-elevation-500)", display: "flex", gap: 14 }}>
            {cargo && <span>Cargo: <strong>{cargo}</strong></span>}
            {faturamento && <span>Faturamento: <strong>{faturamento}</strong></span>}
          </div>
        </div>

        {waLink && (
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "#2E7D5B",
              color: "#fff",
              textDecoration: "none",
              padding: "8px 14px",
              borderRadius: 8,
              fontSize: "0.82rem",
              fontWeight: 700,
              boxShadow: "0 2px 8px rgba(46, 125, 91, 0.25)",
            }}
          >
            Abrir WhatsApp com o Diagnóstico ↗
          </a>
        )}
      </div>

      {/* Score Geral */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "auto 1fr",
          alignItems: "center",
          gap: 20,
          background: "var(--theme-elevation-100)",
          border: "1px solid var(--theme-elevation-200)",
          borderRadius: 10,
          padding: "16px 20px",
          marginBottom: 20,
        }}
      >
        <div style={{ textAlign: "center", minWidth: 90 }}>
          <div style={{ fontSize: "2.1rem", fontWeight: 800, color: "#C1A160", lineHeight: 1 }}>
            {overall.pct}%
          </div>
          <div
            style={{
              fontSize: "0.72rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "var(--theme-elevation-600)",
              marginTop: 4,
            }}
          >
            {overall.label || "Maturidade"}
          </div>
        </div>

        <div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", fontWeight: 600, marginBottom: 6 }}>
            <span>Nível Geral de Gestão</span>
            <span style={{ color: getLevelColor(overall.pct) }}>{overall.label} ({overall.pct}%)</span>
          </div>
          <div style={{ height: 10, borderRadius: 999, background: "var(--theme-elevation-200)", overflow: "hidden" }}>
            <div
              style={{
                height: "100%",
                width: `${Math.max(3, Math.min(100, overall.pct))}%`,
                background: "linear-gradient(90deg, #1D2B3C 0%, #C1A160 100%)",
                borderRadius: 999,
                transition: "width 0.4s ease",
              }}
            />
          </div>
        </div>
      </div>

      {/* Grid dos 6 Pilares */}
      <h4
        style={{
          fontSize: "0.8rem",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          color: "var(--theme-elevation-600)",
          margin: "0 0 12px",
        }}
      >
        Pontuação por Pilar do Método Gestão 360
      </h4>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 10, marginBottom: 20 }}>
        {pillarsData.map((pilar) => {
          const color = getLevelColor(pilar.pct);
          const isWeakest = weakestPillar && weakestPillar.name === pilar.name;

          return (
            <div
              key={pilar.key}
              style={{
                background: "var(--theme-elevation-0)",
                border: isWeakest ? "1px solid #B23B3B" : "1px solid var(--theme-elevation-150)",
                borderRadius: 8,
                padding: "12px 14px",
                position: "relative",
              }}
            >
              {isWeakest && (
                <span
                  style={{
                    position: "absolute",
                    top: -8,
                    right: 10,
                    background: "#B23B3B",
                    color: "#fff",
                    fontSize: "0.62rem",
                    fontWeight: 800,
                    padding: "1px 6px",
                    borderRadius: 4,
                    textTransform: "uppercase",
                    letterSpacing: "0.03em",
                  }}
                >
                  Ponto Mais Crítico
                </span>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--theme-elevation-900)" }}>
                  {pilar.name}
                </span>
                <span style={{ fontSize: "0.82rem", fontWeight: 700, color }}>
                  {pilar.hasScore ? `${pilar.pct}%` : "—"}
                </span>
              </div>
              <div style={{ height: 6, borderRadius: 999, background: "var(--theme-elevation-100)", overflow: "hidden", marginBottom: 6 }}>
                <div
                  style={{
                    height: "100%",
                    width: `${Math.max(2, Math.min(100, pilar.pct))}%`,
                    background: color,
                    borderRadius: 999,
                  }}
                />
              </div>
              <div style={{ fontSize: "0.7rem", color: "var(--theme-elevation-500)" }}>
                Classificação: <strong>{pilar.label}</strong>
              </div>
            </div>
          );
        })}
      </div>

      {/* Diagnóstico Clínico / Ponto Crítico */}
      {weakestPillar && (
        <div
          style={{
            background: "rgba(178, 59, 59, 0.05)",
            border: "1px solid rgba(178, 59, 59, 0.3)",
            borderRadius: 8,
            padding: "14px 16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#B23B3B", fontWeight: 700, fontSize: "0.82rem", marginBottom: 4 }}>
            <span>⚠️</span>
            <span>Gargalo Principal Identificado: {weakestPillar.name} ({weakestPillar.pct}% — {weakestPillar.label})</span>
          </div>
          <p style={{ margin: "4px 0 0", fontSize: "0.8rem", lineHeight: 1.5, color: "var(--theme-elevation-700)" }}>
            <strong>Prescrição recomendada:</strong> {weakestPillar.tip}
          </p>
        </div>
      )}
    </div>
  );
}

export function DiagnosticAnalysisField() {
  return (
    <React.Suspense fallback={null}>
      <DiagnosticAnalysisInner />
    </React.Suspense>
  );
}
