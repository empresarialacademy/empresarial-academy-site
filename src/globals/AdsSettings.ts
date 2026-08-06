import type { GlobalConfig } from 'payload';

export const AdsSettings: GlobalConfig = {
  slug: 'ads-settings',
  label: 'Configurações do EA ADS',
  admin: {
    group: 'Marketing',
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
  ],
};
