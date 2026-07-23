import type { CollectionConfig } from "payload";
import { attributeLeadToAds } from "@/lib/ads-attribution";

/**
 * Leads captados pelo site (newsletter, pop-up, download de materiais,
 * diagnóstico). Gravados além do e-mail enviado ao time — servem de
 * histórico/backup e permitem exportar a base pelo admin.
 */
export const Leads: CollectionConfig = {
  slug: "leads",
  labels: { singular: "Lead", plural: "Leads" },
  admin: {
    useAsTitle: "email",
    defaultColumns: ["name", "email", "source", "createdAt"],
    group: "Captação",
  },
  access: {
    // Somente usuários do admin podem ler/gerenciar; criação é feita
    // exclusivamente pelo servidor (Local API), nunca pela REST pública.
    read: ({ req }) => Boolean(req.user),
    create: () => false,
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    { name: "name", type: "text", required: true, label: "Nome" },
    { name: "email", type: "email", required: true, label: "E-mail" },
    { name: "company", type: "text", label: "Empresa" },
    { name: "whatsapp", type: "text", label: "WhatsApp" },
    { name: "instagram", type: "text", label: "Instagram" },
    {
      name: "source",
      type: "text",
      required: true,
      label: "Origem",
      admin: { position: "sidebar" },
    },
    {
      name: "details",
      type: "json",
      label: "Dados extras (ex.: resultado do diagnóstico)",
    },
    {
      name: "consent",
      type: "checkbox",
      label: "Consentimento LGPD",
      admin: { position: "sidebar" },
    },
    // ——— Nutrição pós-diagnóstico (sequência automática de e-mails) ———
    {
      name: "nurtureStage",
      type: "number",
      label: "Nutrição — etapa enviada",
      defaultValue: 0,
      admin: {
        position: "sidebar",
        description:
          "0 = só o e-mail de resultado · 1–3 = e-mails da sequência já enviados (D+2, D+5, D+7).",
      },
    },
    {
      name: "nurtureOptOut",
      type: "checkbox",
      label: "Nutrição — NÃO enviar follow-ups",
      defaultValue: false,
      admin: {
        position: "sidebar",
        description:
          "Marque quando o lead agendar a call, virar cliente ou pedir para não receber. O link de descadastro dos e-mails também marca isto.",
      },
    },
    {
      name: "nurtureLastAt",
      type: "date",
      label: "Nutrição — último envio",
      admin: { position: "sidebar" },
    },
    // ——— Campanhas manuais (newsletter/mailmarketing) ———
    {
      name: "marketingOptOut",
      type: "checkbox",
      label: "Marketing — NÃO enviar campanhas",
      defaultValue: false,
      admin: {
        position: "sidebar",
        description:
          "Descadastro do link 'Sair da lista' das campanhas manuais. Independente da nutrição pós-diagnóstico (nurtureOptOut).",
      },
    },
    // ——— Atribuição de campanha (Google Ads) ———
    {
      type: "collapsible",
      label: "Atribuição de campanha (Ads)",
      admin: { position: "sidebar" },
      fields: [
        {
          name: "adCampaign",
          type: "relationship",
          relationTo: "ad-campaigns",
          label: "Campanha",
          admin: {
            description: "Preenchido automaticamente por gclid/utm_campaign — pode ser corrigido à mão.",
          },
        },
        { name: "adGroup", type: "relationship", relationTo: "ad-groups", label: "Grupo de anúncios" },
        { name: "adKeyword", type: "relationship", relationTo: "ad-keywords", label: "Palavra-chave" },
        {
          name: "adGclid",
          type: "text",
          label: "gclid (bruto)",
          admin: { readOnly: true },
        },
      ],
    },
    // ——— Resultado comercial (CRM manual — RD Station CRM) ———
    {
      type: "collapsible",
      label: "Resultado comercial (CRM)",
      admin: { position: "sidebar" },
      fields: [
        {
          name: "dealStatus",
          type: "select",
          label: "Status do negócio",
          defaultValue: "em_andamento",
          options: [
            { label: "Em andamento", value: "em_andamento" },
            { label: "Ganho", value: "ganho" },
            { label: "Perdido", value: "perdido" },
          ],
        },
        {
          name: "dealPackage",
          type: "select",
          label: "Pacote",
          defaultValue: "nenhum",
          options: [
            { label: "Nenhum", value: "nenhum" },
            { label: "Essencial (recorrente)", value: "essencial" },
            { label: "Implementação (projeto)", value: "implementacao" },
            { label: "Outro", value: "outro" },
          ],
        },
        {
          name: "dealValue",
          type: "number",
          label: "Valor fechado (R$, opcional)",
          admin: { description: "Sobrepõe o valor padrão do pacote quando preenchido." },
        },
        {
          name: "dealMonths",
          type: "number",
          label: "Meses de contrato (Essencial)",
          defaultValue: 3,
        },
        { name: "dealClosedAt", type: "date", label: "Fechado em" },
        { name: "dealNotes", type: "textarea", label: "Notas comerciais" },
      ],
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, operation, req }) => {
        if (operation !== "create") return data;
        try {
          const attribution = await attributeLeadToAds(data.details, req.payload);
          if (attribution.adCampaign) data.adCampaign = attribution.adCampaign;
          if (attribution.adGroup) data.adGroup = attribution.adGroup;
          if (attribution.adKeyword) data.adKeyword = attribution.adKeyword;
          if (attribution.adGclid) data.adGclid = attribution.adGclid;
        } catch (e) {
          req.payload.logger.error(`[leads] falha na atribuição de Ads: ${e}`);
        }
        return data;
      },
    ],
  },
};
