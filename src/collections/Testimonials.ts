import type { CollectionConfig } from "payload";

export const Testimonials: CollectionConfig = {
  slug: "testimonials",
  labels: { singular: "Depoimento", plural: "Depoimentos" },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "role", "featured", "status"],
    group: "Conteúdo do Site",
  },
  access: {
    read: ({ req }) => {
      if (req.user) return true;
      return { status: { equals: "published" } };
    },
  },
  fields: [
    { name: "name", type: "text", required: true, label: "Nome" },
    { name: "role", type: "text", label: "Cargo / Empresa" },
    { name: "quote", type: "textarea", required: true, label: "Depoimento" },
    { name: "photo", type: "upload", relationTo: "media", label: "Foto" },
    {
      name: "rating",
      type: "number",
      label: "Nota (1 a 5)",
      min: 1,
      max: 5,
      admin: { position: "sidebar" },
    },
    {
      name: "featured",
      type: "checkbox",
      label: "Destaque (exibir na Home)",
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
  ],
};
