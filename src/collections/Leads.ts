import type { CollectionConfig } from "payload";

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
  ],
};
