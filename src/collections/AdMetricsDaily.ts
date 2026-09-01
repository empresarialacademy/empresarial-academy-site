import type { CollectionConfig } from "payload";

/**
 * Uma linha por campanha por dia — só neste nível (não por grupo/palavra) a
 * série diária rende um gráfico de tendência útil, dado o volume desta conta
 * (~R$33/dia). Fica visível no admin de propósito: serve de tela de
 * lançamento manual (copiando do Google Ads) até `src/lib/google-ads.ts` +
 * o cron `ads-sync` existirem de verdade (`source: "api"` nesse caso).
 */
export const AdMetricsDaily: CollectionConfig = {
  slug: "ad-metrics-daily",
  labels: { singular: "Métrica diária de Ads", plural: "Métricas diárias de Ads" },
  admin: {
    useAsTitle: "date",
    defaultColumns: ["campaign", "date", "cost", "clicks", "conversions", "source"],
        group: "Tráfego & Ads",
    description:
      "Uma linha por campanha por dia. Pode ser lançada manualmente (copiando do Google Ads) até a sincronização automática existir.",
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: "campaign",
      type: "relationship",
      relationTo: "ad-campaigns",
      required: true,
      index: true,
      label: "Campanha",
    },
    {
      name: "date",
      type: "date",
      required: true,
      index: true,
      label: "Data",
      admin: { date: { pickerAppearance: "dayOnly" } },
    },
    {
      type: "row",
      fields: [
        { name: "impressions", type: "number", label: "Impressões", defaultValue: 0 },
        { name: "clicks", type: "number", label: "Cliques", defaultValue: 0 },
        { name: "cost", type: "number", label: "Custo (R$)", defaultValue: 0 },
        { name: "conversions", type: "number", label: "Conversões", defaultValue: 0 },
      ],
    },
    {
      name: "source",
      type: "select",
      label: "Origem do dado",
      defaultValue: "manual",
      admin: { position: "sidebar" },
      options: [
        { label: "Lançamento manual", value: "manual" },
        { label: "API do Google Ads", value: "api" },
      ],
    },
  ],
};
