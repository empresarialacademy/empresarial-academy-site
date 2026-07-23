'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';

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

  return (
    <div style={{ marginTop: '1rem', marginBottom: '1.5rem' }}>
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

      {insight && (
        <div
          style={{
            marginTop: '16px',
            padding: '20px',
            backgroundColor: '#fafafa',
            borderLeft: '4px solid #9333ea',
            borderRadius: '0 8px 8px 0',
            color: '#333',
            lineHeight: '1.6',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          <h3 style={{ marginTop: 0, color: '#9333ea' }}>Análise e Forecast: {campaignName}</h3>
          <div style={{ fontSize: '0.95rem' }}>
            <ReactMarkdown>{insight}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}
