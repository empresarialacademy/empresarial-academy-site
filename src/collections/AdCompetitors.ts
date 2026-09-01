import type { CollectionConfig } from "payload";

/**
 * Concorrentes observados no Google para as palavras-chave da campanha —
 * quem aparece nos anúncios (e no orgânico relevante) quando se busca cada
 * termo. Coletado por observação real de SERP (ver seed-ads-recon) ou
 * lançado à mão; quando a campanha estiver ativa, o Auction Insights do
 * Google Ads passa a ser a fonte principal. Exibido na seção
 * "Concorrentes no Google" do EA ADS Manager.
 */
export const AdCompetitors: CollectionConfig = {
  slug: "ad-competitors",
  labels: { singular: "Concorrente de Ads", plural: "Concorrentes de Ads" },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "keywordText", "type", "appearances", "seenAt"],
        group: "Tráfego & Ads",
    description:
      "Quem o Google mostra (anúncios e orgânico) nas buscas pelas palavras-chave da campanha.",
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    { name: "name", type: "text", required: true, label: "Concorrente" },
    { name: "domain", type: "text", label: "Domínio" },
    {
      name: "keywordText",
      type: "text",
      required: true,
      label: "Palavra-chave pesquisada",
      admin: { description: "O termo buscado no Google em que este concorrente apareceu." },
    },
    {
      name: "type",
      type: "select",
      label: "Onde apareceu",
      defaultValue: "patrocinado",
      options: [
        { label: "Anúncio (patrocinado)", value: "patrocinado" },
        { label: "Orgânico", value: "organico" },
        { label: "Resultado local (mapa)", value: "local" },
      ],
    },
    { name: "adTitle", type: "text", label: "Título do anúncio" },
    { name: "adSnippet", type: "textarea", label: "Texto/oferta do anúncio" },
    {
      name: "appearances",
      type: "number",
      label: "Aparições (nº de buscas em que surgiu)",
      defaultValue: 1,
      admin: { position: "sidebar" },
    },
    { name: "seenAt", type: "date", label: "Observado em", admin: { position: "sidebar" } },
    { name: "notes", type: "textarea", label: "Notas" },
  ],
};
