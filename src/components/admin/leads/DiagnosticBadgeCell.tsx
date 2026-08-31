"use client";
import React from "react";

/**
 * Célula custom na tabela de Leads do EA HUB:
 * Mostra o ID do Diagnóstico como link direto para abrir a Apresentação Comercial / Avaliação
 * com o raio-x e pontuação do cliente.
 */
export function DiagnosticBadgeCell({
  cellData,
  rowData,
}: {
  cellData?: unknown;
  rowData?: Record<string, unknown>;
}) {
  const rawVal = typeof cellData === "string" ? cellData.trim() : "";
  const rowDiagId = typeof rowData?.diagnosticId === "string" ? rowData.diagnosticId.trim() : "";
  const rowId = rowData?.id !== undefined ? String(rowData.id) : "";

  const source = typeof rowData?.source === "string" ? rowData.source : "";
  const details = (rowData?.details && typeof rowData.details === "object" ? rowData.details : null) as Record<string, unknown> | null;
  const generalScore = typeof details?.["Maturidade Geral"] === "string" ? details["Maturidade Geral"] : undefined;

  const isDiag = Boolean(
    rawVal ||
    rowDiagId ||
    rowData?.hasDiagnostic ||
    source.includes("Diagnóstico") ||
    generalScore
  );

  if (isDiag) {
    const effectiveId = rawVal || rowDiagId || (rowId ? `EA-DIAG-${rowId}` : "DME");
    const presentationUrl = `/eahub/apresentacao?id=${encodeURIComponent(effectiveId)}`;

    return (
      <div style={{ display: "inline-flex", flexDirection: "column", gap: 3, padding: "2px 0" }}>
        <a
          href={presentationUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            padding: "3px 8px",
            borderRadius: 6,
            background: "rgba(193, 161, 96, 0.16)",
            border: "1px solid #C1A160",
            color: "#1D2B3C",
            fontWeight: 700,
            fontSize: "0.76rem",
            letterSpacing: "0.01em",
            whiteSpace: "nowrap",
            textDecoration: "none",
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            transition: "all 0.15s ease",
          }}
          title={`Abrir Apresentação Comercial / Avaliação (${effectiveId})`}
        >
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#C1A160" }} />
          <span>{effectiveId}</span>
          <span style={{ color: "#C1A160", fontWeight: 800, fontSize: "0.75rem" }}>↗</span>
        </a>
        {generalScore && (
          <span style={{ fontSize: "0.68rem", color: "var(--theme-elevation-600)", fontWeight: 600, paddingLeft: 2 }}>
            Score: {generalScore}
          </span>
        )}
      </div>
    );
  }

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "2px 6px",
        borderRadius: 4,
        background: "var(--theme-elevation-100)",
        color: "var(--theme-elevation-500)",
        fontSize: "0.72rem",
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--theme-elevation-400)" }} />
      Lead Geral
    </span>
  );
}

