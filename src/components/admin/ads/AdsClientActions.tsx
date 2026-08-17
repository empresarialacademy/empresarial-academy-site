'use client';

import React, { useCallback, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { EA_GOLD } from './adsStyles';

/**
 * Popup de resumo do pipeline automático (conectar → sincronizar → coletar
 * dados → gerar forecast), pedido pelo Thiago para saber exatamente o que
 * rodou sozinho e quando. `AdsAutoSync` guarda o resultado do sync no
 * sessionStorage antes de recarregar a página (o reload é necessário pra
 * pegar dado fresco do server); `AIForecastButton` (no modo `autoGenerate`,
 * já rodando na página recarregada) consome esse resumo e junta com o
 * resultado do forecast num popup só, com data/hora de conclusão.
 */
const PIPELINE_SYNC_SUMMARY_KEY = 'ea-ads-pipeline-sync-summary';

type PipelineSyncSummary = { added: number; updated: number };

function stashPipelineSyncSummary(summary: PipelineSyncSummary) {
  sessionStorage.setItem(PIPELINE_SYNC_SUMMARY_KEY, JSON.stringify(summary));
}

function consumePipelineSyncSummary(): PipelineSyncSummary | null {
  const raw = sessionStorage.getItem(PIPELINE_SYNC_SUMMARY_KEY);
  if (!raw) return null;
  sessionStorage.removeItem(PIPELINE_SYNC_SUMMARY_KEY);
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'medium' });
}

function PipelineSummaryModal({ at, lines, onClose }: { at: string; lines: string[]; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 15000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.45)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--theme-elevation-0, #fff)',
          borderRadius: 8,
          padding: '1.5rem 1.75rem',
          maxWidth: 440,
          width: '100%',
          borderTop: `3px solid ${EA_GOLD}`,
          boxShadow: '0 10px 40px rgba(0,0,0,0.35)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '1.3rem' }}>✅</span>
          <h3 style={{ margin: 0, fontSize: '1.05rem' }}>Atualização automática do EA ADS concluída</h3>
        </div>
        <ul style={{ margin: '0 0 1rem', paddingLeft: '1.2rem', display: 'grid', gap: '0.4rem', fontSize: '0.92rem', color: 'var(--theme-elevation-800)' }}>
          {lines.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
        <p style={{ margin: '0 0 1.1rem', fontSize: '0.82rem', color: 'var(--theme-elevation-500)' }}>
          Concluído em {formatDateTime(at)}
        </p>
        <button
          onClick={onClose}
          style={{
            padding: '7px 16px',
            background: EA_GOLD,
            color: '#1D2B3C',
            border: 'none',
            borderRadius: 4,
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: '0.85rem',
          }}
        >
          Fechar
        </button>
      </div>
    </div>
  );
}

/**
 * Convenience pedida pelo Thiago: ao abrir o painel, se os dados estiverem
 * desatualizados (ver `ADS_AUTO_SYNC_STALE_MINUTES`), sincroniza sozinho e
 * recarrega — sem precisar clicar em "Sincronizar". `isStale` é calculado no
 * server (AdsPerformanceView) a partir do `lastSync` gravado no Payload.
 * O guard de `sessionStorage` evita 2 chamadas simultâneas (StrictMode/dev)
 * e é limpo antes de recarregar, para não travar uma sincronização futura.
 */
export function AdsAutoSync({ isStale, isConnected }: { isStale: boolean; isConnected: boolean }) {
  const [status, setStatus] = useState<'idle' | 'syncing' | 'error'>('idle');

  useEffect(() => {
    if (!isConnected || !isStale) return;

    const key = 'ea-ads-auto-sync-inflight';
    if (sessionStorage.getItem(key) === 'true') return;
    sessionStorage.setItem(key, 'true');

    setStatus('syncing');
    fetch('/api/ads/sync-all', { method: 'POST' })
      .then((res) => res.json())
      .then((data) => {
        sessionStorage.removeItem(key);
        if (data.success) {
          stashPipelineSyncSummary({ added: data.added ?? 0, updated: data.updated ?? 0 });
          window.location.reload();
        } else {
          setStatus('error');
        }
      })
      .catch(() => {
        sessionStorage.removeItem(key);
        setStatus('error');
      });
  }, [isStale, isConnected]);

  if (status === 'syncing') {
    return (
      <div
        style={{
          padding: '8px 14px',
          background: 'var(--theme-elevation-100)',
          borderRadius: 4,
          fontSize: '0.85rem',
          marginBottom: '1rem',
          display: 'inline-block',
        }}
      >
        🔄 Sincronizando dados do Google Ads automaticamente…
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div
        style={{
          padding: '8px 14px',
          background: 'var(--theme-warning-100, #fef7e0)',
          color: 'var(--theme-warning-800, #b06000)',
          borderRadius: 4,
          fontSize: '0.85rem',
          marginBottom: '1rem',
          display: 'inline-block',
        }}
      >
        ⚠️ Sincronização automática falhou — use o botão &quot;Sincronizar&quot; abaixo.
      </div>
    );
  }

  return null;
}

export function SyncAdsButton() {
  const [loading, setLoading] = useState(false);

  const handleSync = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ads/sync-all', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        alert('Sincronização concluída! Recarregue a página.');
        window.location.reload();
      } else {
        alert('Erro: ' + data.error);
      }
    } catch (err: unknown) {
      alert('Falha ao sincronizar: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSync}
      disabled={loading}
      style={{
        padding: '8px 16px',
        backgroundColor: '#1a73e8',
        color: '#fff',
        border: 'none',
        borderRadius: 4,
        cursor: loading ? 'wait' : 'pointer',
        fontWeight: 'bold',
      }}
    >
      {loading ? 'Sincronizando...' : '🔄 Sincronizar Google Ads Agora'}
    </button>
  );
}

export function AIForecastButton({
  campaignId,
  campaignName,
  autoGenerate = false,
}: {
  campaignId: string;
  campaignName: string;
  /** Gera sozinho ao montar (1x por campanha/aba, via sessionStorage) — usado quando os dados já estão sincronizados. */
  autoGenerate?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [pipelineSummary, setPipelineSummary] = useState<{ at: string; lines: string[] } | null>(null);

  const handleForecast = useCallback(
    async (silent = false) => {
      setLoading(true);
      setInsight(null);
      try {
        const res = await fetch('/api/ads/forecast', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ campaignId, analysisType: 'forecast' }),
        });
        const data = await res.json();
        if (data.success) {
          setInsight(data.insight);
          sessionStorage.setItem(`ea-ads-forecast-${campaignId}`, 'done');
          if (silent) {
            const syncSummary = consumePipelineSyncSummary();
            const lines: string[] = [];
            if (syncSummary) {
              lines.push(
                `Sincronizado com o Google Ads: ${syncSummary.added} campanha(s) nova(s), ${syncSummary.updated} atualizada(s).`,
              );
            }
            lines.push(`Dados de desempenho coletados e forecast de IA gerado para "${campaignName}".`);
            setPipelineSummary({ at: new Date().toISOString(), lines });
          }
        } else if (!silent) {
          alert('Erro na IA: ' + data.error);
        }
      } catch (err: unknown) {
        if (!silent) alert('Falha ao gerar forecast: ' + (err instanceof Error ? err.message : String(err)));
      } finally {
        setLoading(false);
      }
    },
    [campaignId, campaignName],
  );

  useEffect(() => {
    if (!autoGenerate) return;
    if (sessionStorage.getItem(`ea-ads-forecast-${campaignId}`) === 'done') return;
    handleForecast(true);
  }, [autoGenerate, campaignId, handleForecast]);

  const handleCopy = async () => {
    if (!insight) return;
    try {
      await navigator.clipboard.writeText(`Análise e Forecast: ${campaignName}\n\n${insight}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err: unknown) {
      alert('Falha ao copiar: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  return (
    <div style={{ marginTop: '1rem', marginBottom: '1.5rem' }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
        <button
          onClick={() => handleForecast(false)}
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: '#9333ea', // Roxo IA
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            cursor: loading ? 'wait' : 'pointer',
            fontWeight: 'bold',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 6px -1px rgba(147, 51, 234, 0.4)',
          }}
        >
          {loading ? '🪄 A IA está analisando...' : '🪄 Gerar Forecast com IA'}
        </button>

        <button
          onClick={handleCopy}
          disabled={!insight}
          title={insight ? 'Copiar dados da análise' : 'Gere um forecast primeiro'}
          style={{
            padding: '10px 16px',
            backgroundColor: '#fff',
            color: insight ? '#9333ea' : '#aaa',
            border: `1px solid ${insight ? '#9333ea' : '#ddd'}`,
            borderRadius: 6,
            cursor: insight ? 'pointer' : 'not-allowed',
            fontWeight: 'bold',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          {copied ? '✅ Copiado!' : '📋 Copiar dados da análise'}
        </button>
      </div>

      {insight && (
        <div
          className="ea-ai-insight"
          style={{
            marginTop: '16px',
            padding: '1.5rem 1.75rem',
            backgroundColor: 'var(--theme-elevation-0, #fff)',
            border: '1px solid var(--theme-elevation-150)',
            borderTop: '3px solid #9333ea',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <span style={{ fontSize: '1.3rem' }}>🪄</span>
            <h3 style={{ margin: 0, color: '#9333ea' }}>Análise e Forecast: {campaignName}</h3>
          </div>
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={MARKDOWN_COMPONENTS}>
            {insight}
          </ReactMarkdown>
          <style>{MARKDOWN_CSS}</style>
        </div>
      )}

      {pipelineSummary && (
        <PipelineSummaryModal
          at={pipelineSummary.at}
          lines={pipelineSummary.lines}
          onClose={() => setPipelineSummary(null)}
        />
      )}
    </div>
  );
}

const SECTION_HEADING_STYLE: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  fontSize: '1.2rem',
  fontWeight: 700,
  margin: '1.75rem 0 0.85rem',
  paddingBottom: '0.4rem',
  borderBottom: `2px solid ${EA_GOLD}`,
};

const SECTION_ICONS: Record<string, string> = {
  'diagnóstico rápido': '🔎',
  'plano de ação': '🛠️',
  'plano de redução de cac': '🛠️',
  'plano de redução de cac / otimização': '🛠️',
  'forecast de roi': '📈',
};

function headingIcon(text: string): string {
  const key = text.toLowerCase().replace(/^\d+[.):]\s*/, '').trim();
  const match = Object.keys(SECTION_ICONS).find((k) => key.startsWith(k));
  return match ? SECTION_ICONS[match] : '▸';
}

/** Custom renderers para o Markdown que a IA devolve — sem isso, o texto sai como um bloco cru
 * (títulos e tabelas sem nenhuma diferenciação visual, é o que motivou o redesenho). */
const MARKDOWN_COMPONENTS = {
  h1: ({ children }: { children?: React.ReactNode }) => (
    <div style={SECTION_HEADING_STYLE}>
      <span>{headingIcon(String(children))}</span>
      {children}
    </div>
  ),
  h2: ({ children }: { children?: React.ReactNode }) => (
    <div style={SECTION_HEADING_STYLE}>
      <span>{headingIcon(String(children))}</span>
      {children}
    </div>
  ),
  h3: ({ children }: { children?: React.ReactNode }) => (
    <h4
      style={{
        fontSize: '1.05rem',
        fontWeight: 700,
        margin: '1.1rem 0 0.4rem',
        paddingLeft: '0.6rem',
        borderLeft: `3px solid ${EA_GOLD}`,
      }}
    >
      {children}
    </h4>
  ),
  p: ({ children }: { children?: React.ReactNode }) => (
    <p style={{ margin: '0 0 0.75rem', lineHeight: 1.65, fontSize: '1rem' }}>{children}</p>
  ),
  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul style={{ margin: '0 0 1rem', paddingLeft: '1.3rem', display: 'grid', gap: '0.35rem' }}>{children}</ul>
  ),
  ol: ({ children }: { children?: React.ReactNode }) => (
    <ol style={{ margin: '0 0 1rem', paddingLeft: '1.3rem', display: 'grid', gap: '0.35rem' }}>{children}</ol>
  ),
  li: ({ children }: { children?: React.ReactNode }) => (
    <li style={{ lineHeight: 1.55, fontSize: '1rem' }}>{children}</li>
  ),
  strong: ({ children }: { children?: React.ReactNode }) => <strong style={{ fontWeight: 700 }}>{children}</strong>,
  hr: () => <hr style={{ border: 'none', borderTop: '1px solid var(--theme-elevation-150)', margin: '1.5rem 0' }} />,
  blockquote: ({ children }: { children?: React.ReactNode }) => (
    <div
      style={{
        background: 'var(--theme-elevation-50)',
        borderLeft: `3px solid ${EA_GOLD}`,
        borderRadius: '0 6px 6px 0',
        padding: '0.65rem 1rem',
        margin: '0 0 1rem',
        fontSize: '0.98rem',
      }}
    >
      {children}
    </div>
  ),
  table: ({ children }: { children?: React.ReactNode }) => (
    <div style={{ overflowX: 'auto', margin: '0.75rem 0 1.25rem' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>{children}</table>
    </div>
  ),
  th: ({ children }: { children?: React.ReactNode }) => (
    <th
      style={{
        textAlign: 'left',
        padding: '0.55rem 0.7rem',
        borderBottom: '2px solid var(--theme-elevation-150)',
        background: 'var(--theme-elevation-100)',
        fontWeight: 600,
        fontSize: '0.8rem',
        textTransform: 'uppercase',
        letterSpacing: '0.03em',
      }}
    >
      {children}
    </th>
  ),
  td: ({ children }: { children?: React.ReactNode }) => (
    <td style={{ padding: '0.55rem 0.7rem', borderBottom: '1px solid var(--theme-elevation-100)', verticalAlign: 'top' }}>
      {children}
    </td>
  ),
};

/** Só o que não dá para fazer com style inline (zebra por :nth-child, marcador de lista). */
const MARKDOWN_CSS = `
  .ea-ai-insight ul li::marker { color: ${EA_GOLD}; font-weight: 700; }
  .ea-ai-insight tbody tr:nth-child(even) { background: var(--theme-elevation-50); }
  .ea-ai-insight tbody tr:hover { background: var(--theme-elevation-100); }
`;
