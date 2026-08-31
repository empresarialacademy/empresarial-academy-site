"use client";
import React from "react";

/**
 * Célula custom da coluna Instagram na lista de Leads:
 * Formata o @ do perfil e cria link direto para abrir o perfil no Instagram.
 */
export function InstagramCell({
  cellData,
  rowData,
}: {
  cellData?: unknown;
  rowData?: Record<string, unknown>;
}) {
  const raw = typeof cellData === "string" ? cellData : (typeof rowData?.instagram === "string" ? rowData.instagram : "");
  const trimmed = raw.trim();

  if (!trimmed) {
    return <span style={{ color: "var(--theme-elevation-400)" }}>—</span>;
  }

  const handle = trimmed.replace(/^@+/, "");
  const displayHandle = `@${handle}`;
  const href = `https://instagram.com/${encodeURIComponent(handle)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      style={{
        color: "#C1A160",
        fontWeight: 600,
        fontSize: "0.82rem",
        textDecoration: "none",
        display: "inline-flex",
        alignItems: "center",
        gap: 3,
        whiteSpace: "nowrap",
      }}
      title={`Abrir perfil ${displayHandle} no Instagram`}
    >
      <span>{displayHandle}</span>
      <span style={{ fontSize: "0.7rem", opacity: 0.7 }}>↗</span>
    </a>
  );
}
