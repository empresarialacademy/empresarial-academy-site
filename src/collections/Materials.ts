import type { CollectionConfig } from "payload";
import { formatSlug } from "@/lib/slug";
import { sendNewMaterialAlert } from "@/lib/content-alerts";

export const Materials: CollectionConfig = {
  slug: "materials",
  labels: { singular: "Material", plural: "Materiais" },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "category", "downloads", "status"],
    group: "Materiais",
  },
  access: {
    read: ({ req }) => {
      if (req.user) return true;
      return { status: { equals: "published" } };
    },
  },
  fields: [
    {
      name: "importMarkdown",
      type: "ui",
      admin: {
        components: {
          Field: "@/components/admin/ImportMarkdownButton#ImportMarkdownButton",
        },
      },
    },
    { name: "title", type: "text", required: true, label: "Título" },
    {
      name: "slug",
      type: "text",
      unique: true,
      index: true,
      label: "Slug (URL)",
      admin: { position: "sidebar" },
      hooks: { beforeValidate: [formatSlug("title")] },
    },
    {
      name: "description",
      type: "textarea",
      label: "Descrição",
      admin: { description: "Resumo exibido na listagem e na página do material." },
    },
    {
      name: "coverImage",
      type: "upload",
      relationTo: "media",
      label: "Imagem de capa",
    },
    {
      name: "file",
      type: "upload",
      relationTo: "material-files",
      required: true,
      label: "Arquivo para download",
    },
    {
      name: "kind",
      type: "select",
      label: "Tipo de material",
      defaultValue: "ebook",
      admin: { position: "sidebar" },
      options: [
        { label: "E-book", value: "ebook" },
        { label: "Planilha", value: "planilha" },
        { label: "Template", value: "template" },
        { label: "Checklist", value: "checklist" },
        { label: "Guia", value: "guia" },
        { label: "Apresentação", value: "apresentacao" },
        { label: "Vídeo", value: "video" },
      ],
    },
    {
      name: "category",
      type: "relationship",
      relationTo: "material-categories",
      label: "Categoria",
      admin: { position: "sidebar" },
    },
    {
      name: "version",
      type: "text",
      label: "Versão",
      admin: { position: "sidebar", description: "Ex.: v1.0, 2026" },
    },
    {
      name: "downloads",
      type: "number",
      label: "Downloads",
      defaultValue: 0,
      admin: { position: "sidebar", readOnly: true },
    },
    {
      name: "featured",
      type: "checkbox",
      label: "Destaque",
      admin: { position: "sidebar" },
    },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "draft",
      label: "Status",
      admin: { position: "sidebar" },
      options: [
        { label: "Rascunho", value: "draft" },
        { label: "Publicado", value: "published" },
      ],
    },
    {
      name: "publishedAt",
      type: "date",
      label: "Publicar em",
      admin: { position: "sidebar", date: { pickerAppearance: "dayAndTime" } },
    },
    {
      name: "seo",
      type: "group",
      label: "SEO",
      fields: [
        { name: "metaTitle", type: "text", label: "Meta title" },
        { name: "metaDescription", type: "textarea", label: "Meta description" },
      ],
    },
    {
      name: "subscriberAlertSent",
      type: "checkbox",
      label: "Alerta de novo material enviado",
      defaultValue: false,
      admin: {
        position: "sidebar",
        readOnly: true,
        description:
          "Marcado automaticamente quando o e-mail de novo conteúdo é disparado aos assinantes da newsletter, ao publicar.",
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (data?.status === "published" && !data?.publishedAt) {
          data.publishedAt = new Date().toISOString();
        }
        return data;
      },
    ],
    afterChange: [
      async ({ doc, previousDoc, req }) => {
        const justPublished =
          doc.status === "published" &&
          previousDoc?.status !== "published" &&
          !doc.subscriberAlertSent;
        if (!justPublished) return doc;
        try {
          await sendNewMaterialAlert({
            title: doc.title,
            description: doc.description,
            slug: doc.slug,
          });
          await req.payload.update({
            collection: "materials",
            id: doc.id,
            data: { subscriberAlertSent: true },
          });
        } catch (e) {
          req.payload.logger.error(`[materials] falha ao enviar alerta de novo material: ${e}`);
        }
        return doc;
      },
    ],
  },
};
