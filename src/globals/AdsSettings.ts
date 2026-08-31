import type { GlobalConfig } from 'payload';

export const AdsSettings: GlobalConfig = {
  slug: 'ads-settings',
  label: 'Configurações do EA ADS',
  admin: {
    group: 'Tráfego & Ads',
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'refreshToken',
      type: 'text',
      label: 'Google Ads Refresh Token',
      access: {
        // Nunca expor o valor via admin UI / API pública — só o backend (Local API,
        // que roda com overrideAccess) usa isso para autenticar com o Google Ads.
        read: () => false,
      },
      admin: {
        description: 'Gerado automaticamente ao conectar com o Google no painel. Valor oculto por segurança — reconecte em "Conectar Google Ads" para gerar um novo.',
      },
    },
    {
      name: 'lastSync',
      type: 'date',
      label: 'Última Sincronização Automática',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'budgetStatus',
      type: 'select',
      label: 'Status do orçamento (Google Ads)',
      admin: {
        readOnly: true,
        description:
          'A API do Google Ads só expõe limite de gastos quando ele foi explicitamente configurado — contas pré-pagas self-serve normalmente ficam "sem_limite".',
      },
      options: [
        { label: 'Com limite de gastos configurado', value: 'com_limite' },
        { label: 'Sem limite configurado (pré-pago)', value: 'sem_limite' },
        { label: 'Indisponível', value: 'indisponivel' },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'budgetApprovedLimit', type: 'number', label: 'Limite aprovado (R$)', admin: { readOnly: true } },
        { name: 'budgetSpent', type: 'number', label: 'Consumido do limite (R$)', admin: { readOnly: true } },
        { name: 'budgetRemaining', type: 'number', label: 'Restante do limite (R$)', admin: { readOnly: true } },
      ],
    },
    {
      name: 'budgetSyncedAt',
      type: 'date',
      label: 'Orçamento sincronizado em',
      admin: { readOnly: true },
    },
  ],
};
