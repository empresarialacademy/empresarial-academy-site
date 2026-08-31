import type { CollectionConfig } from "payload";
import { formatSlug } from "@/lib/slug";

export const MaterialCategories: CollectionConfig = {
  slug: "material-categories",
  labels: { singular: "Categoria de material", plural: "Categorias de materiais" },
  admin: { useAsTitle: "name", group: "Conteúdo do Site" },
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
  ],
};
