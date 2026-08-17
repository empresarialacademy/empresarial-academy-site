import { card, EA_GOLD, money } from './adsStyles';

export type AdsBudgetInfo = {
  status: 'com_limite' | 'sem_limite' | 'indisponivel' | null;
  approvedLimit?: number | null;
  spent?: number | null;
  remaining?: number | null;
  syncedAt?: string | null;
};

/**
 * "Quanto tem de crédito no Google Ads": a API não devolve o saldo real de
 * contas pré-pagas self-serve (só de contas com limite de gastos configurado
 * explicitamente, o que normalmente não é o caso aqui) — ver nota em
 * `fetchAccountBudgetSummary` (src/lib/google-ads.ts). Por isso o card sempre
 * mostra o que dá pra calcular com dados já sincronizados (orçamento diário
 * somado + gasto do mês) e linka pro Faturamento real do Google para o
 * número exato.
 */
export function AdsBudgetCard({
  budget,
  totalDailyBudget,
  monthSpend,
}: {
  budget: AdsBudgetInfo;
  totalDailyBudget: number;
  monthSpend: number;
}) {
  const hasLimit = budget.status === 'com_limite' && typeof budget.remaining === 'number';

  return (
    <div style={{ ...card, marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.05rem' }}>💳 Crédito / Orçamento no Google Ads</h3>
        <a
          href="https://ads.google.com/aw/billing/summary"
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: '0.82rem', color: EA_GOLD, fontWeight: 600, textDecoration: 'none' }}
        >
          Abrir Faturamento no Google Ads ↗
        </a>
      </div>

      {hasLimit ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem', marginTop: '0.9rem' }}>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--theme-elevation-500)', textTransform: 'uppercase' }}>Limite aprovado</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 700 }}>{money(budget.approvedLimit ?? 0)}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--theme-elevation-500)', textTransform: 'uppercase' }}>Consumido</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 700 }}>{money(budget.spent ?? 0)}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--theme-elevation-500)', textTransform: 'uppercase' }}>Restante</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--theme-success-500)' }}>{money(budget.remaining ?? 0)}</div>
          </div>
        </div>
      ) : (
        <p style={{ margin: '0.7rem 0 0', fontSize: '0.92rem', color: 'var(--theme-elevation-600)' }}>
          {budget.status === 'sem_limite'
            ? 'Esta conta é pré-paga e não tem um limite de gastos configurado no Google Ads — a API não expõe o saldo real nesse caso. Confira o valor exato clicando em "Abrir Faturamento" acima.'
            : 'Ainda não foi possível ler o orçamento direto do Google Ads (rode "Sincronizar" ou confira o valor exato no link acima).'}
        </p>
      )}

      <div
        style={{
          display: 'flex',
          gap: '1.5rem',
          flexWrap: 'wrap',
          marginTop: '0.9rem',
          paddingTop: '0.75rem',
          borderTop: '1px solid var(--theme-elevation-150)',
          fontSize: '0.88rem',
          color: 'var(--theme-elevation-700)',
        }}
      >
        <span>Orçamento diário somado (campanhas ativas): <strong>{money(totalDailyBudget)}</strong></span>
        <span>Gasto no mês atual (sincronizado): <strong>{money(monthSpend)}</strong></span>
      </div>

      {budget.syncedAt && (
        <div style={{ marginTop: '0.5rem', fontSize: '0.78rem', color: 'var(--theme-elevation-400)' }}>
          Atualizado em {new Date(budget.syncedAt).toLocaleString('pt-BR')}
        </div>
      )}
    </div>
  );
}
