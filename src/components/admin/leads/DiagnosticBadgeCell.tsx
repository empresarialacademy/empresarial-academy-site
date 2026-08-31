"use client";
import React from "react";

/**
 * Célula custom na tabela de Leads do EA HUB:
 * Mostra com clareza imediata se o contato realizou o Diagnóstico de Maturidade
 * Empresarial, exibindo o ID do Diagnóstico e a pontuação geral.
 */
export function DiagnosticBadgeCell({
  rowData,
  cellData,
}: {
  rowData?: Record<string, unknown>;
  cellData?: unknown;
}) {
  const details = rowData?.details as Record<string, unknown> | undefined;
  const diagId = (rowData?.diagnosticId || cellData) as string | undefined;
  const isDiag = Boolean(
    rowData?.hasDiagnostic ||
    diagId ||
    rowData?.source === "Diagnóstico de Maturidade Empresarial" ||
    (details && Boolean(details["Maturidade Geral"]))
  );

  const generalScore = details?.["Maturidade Geral"] as string | undefined;

  if (isDiag) {
    return (
      <div style={{ display: "inline-flex", flexDirection: "column", gap: 3, padding: "2px 0" }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "3px 8px",
            borderRadius: 6,
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
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#C1A160" }} />
          {diagId || "DIAGNÓSTICO 360"}
        </span>
        {generalScore && (
          <span style={{ fontSize: "0.7rem", color: "var(--theme-elevation-600)", fontWeight: 600, paddingLeft: 4 }}>
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
        padding: "3px 8px",
        borderRadius: 4,
        background: "var(--theme-elevation-100)",
        color: "var(--theme-elevation-500)",
        fontSize: "0.72rem",
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--theme-elevation-400)" }} />
      Lead Geral
    </span>
  );
}

