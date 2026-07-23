import type { CollectionConfig } from "payload";
import { formatSlug } from "@/lib/slug";
import { sendNewPostAlert } from "@/lib/content-alerts";
import { eaEditor } from "@/lib/editor";
import { buildPreviewUrl } from "@/lib/preview";

export const Posts: CollectionConfig = {
  slug: "posts",
  labels: { singular: "Artigo", plural: "Artigos" },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "category", "status", "publishedAt"],
    group: "Blog",
    // Botão "Visualizar": abre o artigo no layout REAL do blog (mesmo em
    // rascunho), via rota /preview autenticada por segredo.
    preview: (doc) =>
      doc?.slug ? buildPreviewUrl("posts", String(doc.slug)) : null,
  },
  access: {
    // Público lê apenas artigos publicados; usuários autenticados veem tudo.
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
      name: "excerpt",
      type: "textarea",
      label: "Resumo",
      maxLength: 300,
      admin: { description: "Texto curto exibido na listagem e no SEO." },
    },
    {
      name: "coverImage",
      type: "upload",
      relationTo: "media",
      label: "Imagem destacada",
    },
    { name: "content", type: "richText", label: "Conteúdo", editor: eaEditor },
    {
      name: "category",
      type: "relationship",
      relationTo: "categories",
      label: "Categoria",
      admin: { position: "sidebar" },
    },
    {
      name: "tags",
      type: "array",
      label: "Tags",
      admin: { position: "sidebar" },
      fields: [{ name: "tag", type: "text" }],
    },
    {
      name: "author",
      type: "relationship",
      relationTo: "users",
      label: "Autor",
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
      admin: {
        position: "sidebar",
        date: { pickerAppearance: "dayAndTime" },
        description: "Datas futuras agendam a publicação.",
      },
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
      label: "Alerta de novo artigo enviado",
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
        // Define publishedAt automaticamente ao publicar sem data informada.
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
        // Post AGENDADO (data futura): não avisar agora — o cron diário
        // (sendPendingContentAlerts) envia quando a data chegar, para o
        // assinante não receber link de artigo ainda invisível.
        const isScheduledForFuture =
          doc.publishedAt && new Date(doc.publishedAt).getTime() > Date.now();
        if (!justPublished || isScheduledForFuture) return doc;
        try {
          await sendNewPostAlert({ title: doc.title, excerpt: doc.excerpt, slug: doc.slug });
          await req.payload.update({
            collection: "posts",
            id: doc.id,
            data: { subscriberAlertSent: true },
          });
        } catch (e) {
          req.payload.logger.error(`[posts] falha ao enviar alerta de novo artigo: ${e}`);
        }
        return doc;
      },
    ],
  },
};
