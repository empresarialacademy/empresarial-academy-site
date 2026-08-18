import type { CollectionConfig } from "payload";

/**
 * Calendário de conteúdo de redes sociais (Instagram, Facebook, YouTube,
 * LinkedIn). Criada em 17/08/2026 a partir do planejamento de lançamento do
 * site + reaproveitamento do blog e dos materiais gratuitos já publicados.
 * Cada linha é um post (ou uma tarefa de preparação, no `phase: "prep"`) —
 * o Thiago move o `status` conforme produz/publica, sem precisar de código.
 */
export const ContentCalendarEntries: CollectionConfig = {
  slug: "content-calendar",
  labels: { singular: "Item do Calendário", plural: "Calendário de Conteúdo" },
  admin: {
    useAsTitle: "theme",
    defaultColumns: ["date", "phase", "pillar", "status", "theme"],
    group: "Marketing",
    description: "Calendário de posts para Instagram, Facebook, YouTube e LinkedIn.",
    components: {
      views: {
        list: {
          Component: "@/components/admin/calendar/ContentCalendarListView#ContentCalendarListView",
        },
      },
    },
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  defaultSort: "date",
  fields: [
    { name: "date", type: "date", required: true, label: "Data", admin: { date: { pickerAppearance: "dayOnly" } } },
    {
      name: "phase",
      type: "select",
      required: true,
      label: "Semana",
      admin: { position: "sidebar" },
      options: [
        { label: "Preparação (17 a 23/08)", value: "prep" },
        { label: "Semana 1 · Lançamento (24 a 30/08)", value: "semana-1" },
        { label: "Semana 2 (31/08 a 06/09)", value: "semana-2" },
        { label: "Semana 3 (07 a 13/09)", value: "semana-3" },
        { label: "Semana 4 (14 a 20/09)", value: "semana-4" },
      ],
    },
    {
      name: "pillar",
      type: "select",
      required: true,
      label: "Pilar",
      admin: { position: "sidebar" },
      options: [
        { label: "Preparação", value: "preparacao" },
        { label: "Lançamento", value: "lancamento" },
        { label: "Gestão", value: "gestao" },
        { label: "Vendas", value: "vendas" },
        { label: "Liderança", value: "lideranca" },
      ],
    },
    {
      name: "channels",
      type: "select",
      hasMany: true,
      label: "Canais",
      options: [
        { label: "Instagram Feed", value: "ig-feed" },
        { label: "Instagram Reels", value: "ig-reels" },
        { label: "Instagram Stories", value: "ig-stories" },
        { label: "Facebook", value: "facebook" },
        { label: "LinkedIn Post", value: "li-post" },
        { label: "LinkedIn Artigo", value: "li-artigo" },
        { label: "YouTube Shorts", value: "yt-shorts" },
        { label: "YouTube Vídeo", value: "yt-video" },
      ],
    },
    { name: "format", type: "text", label: "Formato", admin: { description: "Ex.: Carrossel (4 lâminas), Vertical 20-30s" } },
    { name: "theme", type: "text", required: true, label: "Tema / tarefa" },
    { name: "sourceLabel", type: "text", label: "Fonte", admin: { description: "Blog/material de origem, quando houver." } },
    { name: "copyIdea", type: "textarea", label: "Ideia de copy" },
    { name: "ctaOrAction", type: "text", label: "CTA / ação" },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "planejado",
      label: "Status",
      admin: { position: "sidebar" },
      options: [
        { label: "Planejado", value: "planejado" },
        { label: "Em produção", value: "em-producao" },
        { label: "Concluído", value: "concluido" },
      ],
    },
    { name: "notes", type: "textarea", label: "Notas" },
  ],
};
