import type { CollectionConfig } from "payload";

/**
 * Links para os sistemas da Empresarial Academy (site, LP, EA ADS, EA
 * Impulsiona, EA Recovery, portal de pós-vendas, playbook de vendas...),
 * exibidos na tela "Central EA" (/admin/central-ea). Pensada para o Thiago
 * gerenciar sozinho — criar/editar/apagar linhas aqui é o jeito de manter a
 * central atualizada, sem precisar mexer em código. `url` em branco = card
 * "em breve" (ainda sem link).
 */
export const SystemLinks: CollectionConfig = {
  slug: "system-links",
  labels: { singular: "Link de sistema", plural: "Links de sistemas" },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "url", "order"],
        group: "Ecossistema & Sistemas",
    description:
      'Portfólio de sistemas da EA (cartão de visita). Deixe "URL" em branco para um card "em breve".',
    components: {
      views: {
        // Galeria de cartões (portfólio) no lugar da tabela padrão.
        list: {
          Component: "@/components/admin/systemlinks/SystemLinksListView#SystemLinksListView",
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
  fields: [
    { name: "name", type: "text", required: true, label: "Nome" },
    {
      name: "url",
      type: "text",
      label: "URL",
      admin: { description: "Endereço completo (https://...) ou rota interna (/eahub/...). Em branco = card “em breve”." },
    },
    { name: "description", type: "text", label: "Descrição curta" },
    {
      name: "order",
      type: "number",
      label: "Ordem",
      defaultValue: 0,
      admin: { position: "sidebar", description: "Menor aparece primeiro." },
    },
  ],
};
