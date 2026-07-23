import type { CollectionConfig, Field } from "payload";

const rollupFields: Field[] = [
  { name: "rollupWindowDays", type: "number", label: "Janela (dias)", defaultValue: 30 },
  { name: "rollupImpressions", type: "number", label: "Impressões", defaultValue: 0 },
  { name: "rollupClicks", type: "number", label: "Cliques", defaultValue: 0 },
  { name: "rollupCost", type: "number", label: "Custo (R$)", defaultValue: 0 },
  { name: "rollupConversions", type: "number", label: "Conversões", defaultValue: 0 },
  {
    name: "rollupUpdatedAt",
    type: "date",
    label: "Atualizado em",
    admin: { readOnly: true },
  },
];

/**
 * Palavra-chave dentro de um grupo de anúncios. `status` é decidido pelo
 * Thiago (nunca escrito automaticamente) — o motor de recomendação
 * (src/lib/ads-insights.ts) só sugere, ex. "candidata a negativa".
 */
export const AdKeywords: CollectionConfig = {
  slug: "ad-keywords",
  labels: { singular: "Palavra-chave de Ads", plural: "Palavras-chave de Ads" },
  admin: {
    useAsTitle: "text",
    defaultColumns: ["text", "matchType", "adGroup", "status", "rollupCost"],
    group: "Marketing",
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: "adGroup",
      type: "relationship",
      relationTo: "ad-groups",
      required: true,
      label: "Grupo de anúncios",
    },
    { name: "text", type: "text", required: true, label: "Palavra-chave" },
    {
      name: "matchType",
      type: "select",
      label: "Correspondência",
      required: true,
      defaultValue: "frase",
      options: [
        { label: "Frase", value: "frase" },
        { label: "Exata", value: "exata" },
      ],
    },
    {
      name: "status",
      type: "select",
      label: "Status",
      defaultValue: "ativa",
      admin: { position: "sidebar" },
      options: [
        { label: "Ativa", value: "ativa" },
        { label: "Pausada", value: "pausada" },
        { label: "Candidata a negativa", value: "candidata-negativa" },
      ],
    },
    {
      type: "collapsible",
      label: "Métricas (acumulado)",
      fields: rollupFields,
    },
  ],
};
