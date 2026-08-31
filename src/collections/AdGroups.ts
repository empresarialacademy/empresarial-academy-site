import type { CollectionConfig, Field } from "payload";

/** Rollup de métricas por janela móvel (ver AdMetricsDaily para o motivo de
 * grupo/palavra-chave não terem série diária própria — dado diário nesse
 * nível seria ruído dado o volume desta conta). */
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

export const AdGroups: CollectionConfig = {
  slug: "ad-groups",
  labels: { singular: "Grupo de anúncios", plural: "Grupos de anúncios" },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "campaign", "status", "rollupCost", "rollupConversions"],
    group: "Tráfego & Ads",
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
      label: "Campanha",
    },
    { name: "name", type: "text", required: true, label: "Nome do grupo" },
    {
      name: "status",
      type: "select",
      label: "Status",
      defaultValue: "ativo",
      admin: { position: "sidebar" },
      options: [
        { label: "Ativo", value: "ativo" },
        { label: "Pausado", value: "pausado" },
      ],
    },
    {
      type: "collapsible",
      label: "Métricas (acumulado)",
      fields: rollupFields,
    },
  ],
};
