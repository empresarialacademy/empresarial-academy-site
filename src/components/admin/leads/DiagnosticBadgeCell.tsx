"use client";
import React from "react";

/**
 * Célula custom na tabela de Leads do EA HUB:
 * Mostra com clareza imediata se o contato realizou o Diagnóstico de Maturidade
 * Empresarial, exibindo o ID do Diagnóstico e a pontuação geral.
 */
export function DiagnosticBadgeCell({
  cellData,
  rowData,
}: {
  cellData?: unknown;
  rowData?: Record<string, unknown>;
}) {
  const rawVal = typeof cellData === "string" ? cellData : "";
  const rowDiagId = typeof rowData?.diagnosticId === "string" ? rowData.diagnosticId : "";
  const diagId = rawVal || rowDiagId;

  const source = typeof rowData?.source === "string" ? rowData.source : "";
  const hasDiag = Boolean(rowData?.hasDiagnostic || diagId || source.includes("Diagnóstico"));

  const details = (rowData?.details && typeof rowData.details === "object" ? rowData.details : null) as Record<string, unknown> | null;
  const generalScore = typeof details?.["Maturidade Geral"] === "string" ? details["Maturidade Geral"] : undefined;

  if (hasDiag || diagId) {
    return (
      <div style={{ display: "inline-flex", flexDirection: "column", gap: 2, padding: "2px 0" }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            padding: "2px 7px",
            borderRadius: 5,
            background: "rgba(193, 161, 96, 0.14)",
            border: "1px solid rgba(193, 161, 96, 0.35)",
            color: "#C1A160",
            fontWeight: 700,
            fontSize: "0.75rem",
            letterSpacing: "0.02em",
            whiteSpace: "nowrap",
            width: "fit-content",
          }}
          title={generalScore ? `Maturidade Geral: ${generalScore}` : "Diagnóstico concluído"}
        >
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#C1A160" }} />
          {diagId || "DIAGNÓSTICO 360"}
        </span>
        {generalScore && (
          <span style={{ fontSize: "0.68rem", color: "var(--theme-elevation-600)", fontWeight: 600, paddingLeft: 2 }}>
            {generalScore}
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
