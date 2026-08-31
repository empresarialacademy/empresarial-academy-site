import type { CollectionConfig } from "payload";

export const Users: CollectionConfig = {
  slug: "users",
  auth: true,
  admin: { useAsTitle: "email", group: "Ecossistema & Sistemas" },
  labels: { singular: "Usuário", plural: "Usuários" },
  fields: [{ name: "name", type: "text", label: "Nome" }],
};
