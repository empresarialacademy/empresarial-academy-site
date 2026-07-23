"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Botão de remover um sistema da coleção `system-links` direto do card
 * (galeria custom). Chama a API REST do Payload e atualiza a lista.
 */
export function DeleteLinkButton({ id, name }: { id: string | number; name: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const onDelete = async () => {
    if (!window.confirm(`Remover "${name}" do portfólio de sistemas?`)) return;
    try {
      setBusy(true);
      const res = await fetch(`/api/system-links/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      router.refresh();
    } catch (e) {
      window.alert(`Não foi possível remover: ${(e as Error).message}`);
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={onDelete}
      disabled={busy}
      style={{
        cursor: busy ? "wait" : "pointer",
        background: "transparent",
        border: "1px solid var(--theme-error-500)",
        color: "var(--theme-error-600)",
        borderRadius: 4,
        padding: "4px 10px",
        fontSize: "0.8rem",
      }}
    >
      {busy ? "Removendo…" : "Remover"}
    </button>
  );
}
