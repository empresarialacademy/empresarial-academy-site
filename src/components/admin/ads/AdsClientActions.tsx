'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { EA_GOLD } from './adsStyles';

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

export function AIForecastButton({ campaignId, campaignName }: { campaignId: string; campaignName: string }) {
  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleForecast = async () => {
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
      } else {
        alert('Erro na IA: ' + data.error);
      }
    } catch (err: unknown) {
      alert('Falha ao gerar forecast: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

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
          onClick={handleForecast}
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
    </div>
  );
}

const SECTION_HEADING_STYLE: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  fontSize: '1.05rem',
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
        fontSize: '0.92rem',
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
    <p style={{ margin: '0 0 0.75rem', lineHeight: 1.65, fontSize: '0.92rem' }}>{children}</p>
  ),
  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul style={{ margin: '0 0 1rem', paddingLeft: '1.3rem', display: 'grid', gap: '0.35rem' }}>{children}</ul>
  ),
  ol: ({ children }: { children?: React.ReactNode }) => (
    <ol style={{ margin: '0 0 1rem', paddingLeft: '1.3rem', display: 'grid', gap: '0.35rem' }}>{children}</ol>
  ),
  li: ({ children }: { children?: React.ReactNode }) => (
    <li style={{ lineHeight: 1.55, fontSize: '0.92rem' }}>{children}</li>
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
        fontSize: '0.88rem',
      }}
    >
      {children}
    </div>
  ),
  table: ({ children }: { children?: React.ReactNode }) => (
    <div style={{ overflowX: 'auto', margin: '0.75rem 0 1.25rem' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>{children}</table>
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
        fontSize: '0.72rem',
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
