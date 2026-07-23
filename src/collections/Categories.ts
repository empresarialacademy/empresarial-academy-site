import type { CollectionConfig } from "payload";
import { formatSlug } from "@/lib/slug";

export const Categories: CollectionConfig = {
  slug: "categories",
  labels: { singular: "Categoria", plural: "Categorias" },
  admin: { useAsTitle: "name", group: "Blog" },
  access: { read: () => true },
  fields: [
    { name: "name", type: "text", required: true, label: "Nome" },
    {
      name: "slug",
      type: "text",
      unique: true,
      index: true,
      label: "Slug (URL)",
      admin: { position: "sidebar" },
      hooks: { beforeValidate: [formatSlug("name")] },
    },
    { name: "description", type: "textarea", label: "Descrição" },
  ],
};
