import type { CollectionConfig } from "payload";

export const Users: CollectionConfig = {
  slug: "users",
  auth: true,
  admin: { useAsTitle: "email", group: "Administração" },
  labels: { singular: "Usuário", plural: "Usuários" },
  fields: [{ name: "name", type: "text", label: "Nome" }],
};
