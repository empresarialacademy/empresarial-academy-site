import type { CollectionConfig } from "payload";

/**
 * Campanha do Google Ads (config + metas). O funil de aquisição paga foi
 * desenhado antes de a conta existir (ver Frente E) — esta coleção guarda a
 * campanha planejada com `status: "rascunho"` até ela ir ao ar de verdade.
 * `googleAdsCampaignId` fica vazio até lá; quando preenchido, passa a ser a
 * chave usada pela sincronização automática (src/lib/google-ads.ts) e pela
 * atribuição de leads (src/lib/ads-attribution.ts).
 */
export const AdCampaigns: CollectionConfig = {
  slug: "ad-campaigns",
  labels: { singular: "Campanha de Ads", plural: "Campanhas de Ads" },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "status", "dailyBudgetTarget", "cpcCeiling"],
    group: "Marketing",
    description:
      "Campanhas do Google Ads (config + metas de orçamento/CPC). Preencher 'ID da campanha no Google Ads' quando a conta existir.",
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    { name: "name", type: "text", required: true, label: "Nome" },
    {
      name: "googleAdsCampaignId",
      type: "text",
      label: "ID da campanha no Google Ads",
      admin: {
        description:
          "Preencher quando a conta existir — usado pela sincronização automática e pela atribuição de leads via utm_campaign.",
      },
    },
    {
      name: "status",
      type: "select",
      label: "Status",
      defaultValue: "rascunho",
      admin: { position: "sidebar" },
      options: [
        { label: "Rascunho (ainda não publicada)", value: "rascunho" },
        { label: "Ativa", value: "ativa" },
        { label: "Pausada", value: "pausada" },
        { label: "Encerrada", value: "encerrada" },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "dailyBudgetTarget",
          type: "number",
          label: "Orçamento diário alvo (R$)",
          defaultValue: 33,
        },
        {
          name: "monthlyBudgetTarget",
          type: "number",
          label: "Orçamento mensal alvo (R$)",
          defaultValue: 1000,
        },
        {
          name: "cpcCeiling",
          type: "number",
          label: "Teto de CPC (R$)",
          defaultValue: 18,
        },
      ],
    },
    { name: "startDate", type: "date", label: "Início", admin: { position: "sidebar" } },
    { name: "notes", type: "textarea", label: "Notas" },
  ],
};
