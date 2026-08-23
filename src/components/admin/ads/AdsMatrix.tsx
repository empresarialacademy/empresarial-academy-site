'use client';

import { useState } from 'react';
import type { CampaignScorecard } from "@/lib/ads-insights";
import { card, badge, statusColor, statusLabel, statusIcon, EA_GOLD, money, pct } from "./adsStyles";

export type CampaignControlMeta = {
  googleAdsCampaignId: string | null;
  googleStatus: string;
};

/**
 * Visão "matriz" — um card por campanha, pensado para leitura rápida (é o
 * pedido original: "ver tudo de forma rápida, mas poder aprofundar"). Cada
 * card linka para o detalhe via `?campaign=<id>`. Campanhas com ID do Google
 * Ads vinculado ganham um checkbox para selecionar e iniciar/pausar em lote
 * direto no Google Ads.
 */
export function AdsMatrix({
  scorecards,
  dailyBudgets,
  selectedId,
  controlMeta,
}: {
  scorecards: CampaignScorecard[];
  dailyBudgets: Map<string, number>;
  selectedId?: string;
  controlMeta: Map<string, CampaignControlMeta>;
}) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);

  const hasControllable = scorecards.some((s) => controlMeta.get(String(s.campaignId))?.googleAdsCampaignId);

  function toggle(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function runAction(action: 'enable' | 'pause') {
    if (selectedIds.size === 0) return;
    const verb = action === 'enable' ? 'iniciar' : 'pausar';
    if (!confirm(`Confirma ${verb} ${selectedIds.size} campanha(s) direto no Google Ads?`)) return;

    setBusy(true);
    try {
      const res = await fetch('/api/ads/campaigns/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignIds: Array.from(selectedIds), action }),
      });
      const data = await res.json();
      if (data.success) {
        window.location.reload();
      } else {
        alert('Erro: ' + data.error);
      }
    } catch (err: unknown) {
      alert('Falha ao alterar campanhas: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      {hasControllable && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '0.75rem',
            flexWrap: 'wrap',
          }}
        >
          <span style={{ fontSize: '0.85rem', color: 'var(--theme-elevation-600)' }}>
            {selectedIds.size > 0
              ? `${selectedIds.size} selecionada(s)`
              : 'Marque campanhas abaixo para iniciar ou pausar em lote'}
          </span>
          <button
            onClick={() => runAction('enable')}
            disabled={busy || selectedIds.size === 0}
            style={{
              padding: '6px 12px',
              background: 'var(--theme-success-500)',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: busy || selectedIds.size === 0 ? 'not-allowed' : 'pointer',
              opacity: busy || selectedIds.size === 0 ? 0.55 : 1,
            }}
          >
            ▶ Iniciar selecionadas
          </button>
          <button
            onClick={() => runAction('pause')}
            disabled={busy || selectedIds.size === 0}
            style={{
              padding: '6px 12px',
              background: 'var(--theme-warning-500)',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: busy || selectedIds.size === 0 ? 'not-allowed' : 'pointer',
              opacity: busy || selectedIds.size === 0 ? 0.55 : 1,
            }}
          >
            ⏸ Pausar selecionadas
          </button>
          {selectedIds.size > 0 && (
            <button
              onClick={() => setSelectedIds(new Set())}
              disabled={busy}
              style={{
                padding: '6px 10px',
                background: 'transparent',
                border: '1px solid var(--theme-elevation-150)',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: '0.8rem',
                color: 'var(--theme-elevation-600)',
              }}
            >
              Limpar seleção
            </button>
          )}
        </div>
      )}

      <div className="ea-card-grid">
        {scorecards.map((s) => {
          const budget = dailyBudgets.get(String(s.campaignId)) || 1;
          const spendPct = Math.min(s.spendRatio, 1.5);
          const isSelected = selectedId === String(s.campaignId);
          const meta = controlMeta.get(String(s.campaignId));
          const canControl = Boolean(meta?.googleAdsCampaignId);
          const isChecked = selectedIds.has(String(s.campaignId));

          return (
            <div key={s.campaignId} style={{ position: 'relative' }}>
              {canControl && (
                <label
                  onClick={(e) => e.stopPropagation()}
                  title={meta?.googleStatus === 'ativa' ? 'Ativa no Google Ads' : 'Pausada no Google Ads'}
                  style={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    zIndex: 1,
                    display: 'inline-flex',
                    background: 'var(--theme-elevation-0, #fff)',
                    border: '1px solid var(--theme-elevation-150)',
                    borderRadius: 4,
                    padding: 3,
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggle(String(s.campaignId))}
                    style={{ margin: 0, cursor: 'pointer' }}
                  />
                </label>
              )}
              <a
                href={`?campaign=${s.campaignId}`}
                style={{
                  ...card,
                  display: "block",
                  textDecoration: "none",
                  color: "inherit",
                  borderColor: isSelected ? EA_GOLD : "var(--theme-elevation-150)",
                  borderWidth: isSelected ? 2 : 1,
                  boxShadow: isSelected ? `0 0 0 1px ${EA_GOLD}` : "none",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <strong>{s.campaignName}</strong>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      fontSize: "0.83rem",
                      fontWeight: 600,
                      padding: "0.2rem 0.55rem",
                      borderRadius: 999,
                      background: "var(--theme-elevation-100)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <span style={badge(statusColor[s.status])} />
                    {statusIcon[s.status]} {statusLabel[s.status]}
                  </span>
                </div>

                <div style={{ margin: "0.6rem 0", height: 6, background: "var(--theme-elevation-150)", borderRadius: 3 }}>
                  <div
                    style={{
                      width: `${Math.min(spendPct, 1) * 100}%`,
                      height: "100%",
                      borderRadius: 3,
                      background: spendPct > 1.15 ? "var(--theme-warning-500)" : "var(--theme-success-400)",
                    }}
                    title={`Gasto médio: ${pct(s.spendRatio)} do orçamento diário (${money(budget)})`}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.4rem 0.8rem", fontSize: "0.95rem" }}>
                  <span>CTR: {pct(s.ctr)}</span>
                  <span>CPC: {money(s.avgCpc)}</span>
                  <span>CAC: {s.cac !== null ? money(s.cac) : "—"}</span>
                  <span>ROI: {s.roiMultiple !== null ? `${s.roiMultiple.toFixed(1)}x` : "—"}</span>
                </div>

                <p style={{ marginTop: "0.6rem", marginBottom: 0, fontSize: "0.95rem", color: "var(--theme-elevation-700)" }}>
                  {s.recommendation}
                </p>
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}
