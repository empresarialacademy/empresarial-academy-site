"use client";
import React from "react";

/**
 * Célula custom da coluna WhatsApp na lista de Leads: transforma o número em
 * um link de conversa (wa.me) que abre o WhatsApp Web/app. Normaliza o número
 * (só dígitos) e prefixa 55 (Brasil) quando não houver código de país.
 */
export function WhatsAppCell({ cellData }: { cellData?: unknown }) {
  const raw = typeof cellData === "string" ? cellData : "";
  const digits = raw.replace(/\D/g, "");
  if (!digits) return <span style={{ color: "var(--theme-elevation-400)" }}>—</span>;

  const withCountry = digits.length <= 11 ? `55${digits}` : digits;
  const href = `https://wa.me/${withCountry}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      style={{ color: "var(--theme-success-600)", fontWeight: 600, whiteSpace: "nowrap" }}
      title="Abrir conversa no WhatsApp"
    >
      {raw} ↗
    </a>
  );
}
