import type { GlobalConfig } from 'payload';

export const AdsSettings: GlobalConfig = {
  slug: 'ads-settings',
  label: 'Configurações do EA ADS',
  admin: {
    group: 'EA MKT HUB',
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
      admin: {
        description: 'Gerado automaticamente ao conectar com o Google no painel. Não edite manualmente a não ser que saiba o que está fazendo.',
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
