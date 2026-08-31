import type { CollectionConfig } from "payload";

/**
 * Inventário de todas as APIs/credenciais externas usadas pelos sistemas da
 * Empresarial Academy — pedido do Thiago (24/08/2026): saber de onde é cada
 * API, qual(is) sistema(s) consome(m), se é compartilhada entre mais de um,
 * o prazo de vencimento e se tem faturamento/saldo atrelado. Complementa (não
 * substitui) a aba "APIs" da planilha de Auditoria de Infraestrutura — aqui é
 * um painel vivo, editável pelo Thiago sem precisar reabrir um .xlsx.
 */
export const ApiInventory: CollectionConfig = {
  slug: "api-inventory",
  labels: { singular: "API cadastrada", plural: "Inventário de APIs" },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "provider", "status", "expiresAt", "hasBilling"],
    group: "Ecossistema & Sistemas",
    description:
      "Toda API/credencial externa usada por algum sistema da EA — provedor, sistema(s) consumidor(es), vencimento e faturamento.",
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    { name: "name", type: "text", required: true, label: "Nome da API" },
    { name: "provider", type: "text", required: true, label: "Provedor (de onde é)" },
    {
      name: "category",
      type: "select",
      label: "Categoria",
      defaultValue: "outro",
      options: [
        { label: "IA", value: "ia" },
        { label: "Redes sociais", value: "redes-sociais" },
        { label: "Marketing / Ads", value: "marketing" },
        { label: "E-mail", value: "email" },
        { label: "Automação de mensagens", value: "mensageria" },
        { label: "Infraestrutura (banco, storage, deploy, código)", value: "infra" },
        { label: "Outro", value: "outro" },
      ],
    },
    {
      name: "systems",
      type: "array",
      label: "Sistema(s) que usam esta API",
      minRows: 1,
      labels: { singular: "Sistema", plural: "Sistemas" },
      admin: {
        description:
          "Uma linha por sistema consumidor. Mais de uma linha = API compartilhada (o painel sinaliza automaticamente).",
      },
      fields: [
        { name: "system", type: "text", required: true, label: "Sistema" },
        { name: "envVar", type: "text", label: "Variável de ambiente" },
        { name: "active", type: "checkbox", label: "Ativo neste sistema", defaultValue: true },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "status",
          type: "select",
          label: "Status",
          defaultValue: "ativo",
          options: [
            { label: "Ativo", value: "ativo" },
            { label: "Bloqueado / aguardando aprovação externa", value: "bloqueado" },
            { label: "Pendente de configuração", value: "pendente" },
            { label: "Dormente (código pronto, sem uso ainda)", value: "dormente" },
            { label: "Candidato a cancelamento", value: "cancelamento" },
          ],
        },
        { name: "expiresAt", type: "date", label: "Vencimento / expira em" },
        { name: "renewalCycle", type: "text", label: "Ciclo de renovação" },
      ],
    },
    {
      type: "collapsible",
      label: "Faturamento",
      fields: [
        { name: "hasBilling", type: "checkbox", label: "Tem faturamento atrelado?", defaultValue: false },
        {
          type: "row",
          fields: [
            {
              name: "billingType",
              type: "select",
              label: "Tipo",
              options: [
                { label: "Gratuito", value: "gratuito" },
                { label: "Pré-pago", value: "pre-pago" },
                { label: "Pós-pago (cobrança por uso)", value: "pos-pago" },
                { label: "Assinatura fixa", value: "assinatura" },
                { label: "A confirmar", value: "a-confirmar" },
              ],
            },
            { name: "balanceOrCost", type: "text", label: "Saldo/custo (ex.: \"R$ 620/mês\", \"sem saldo real via API\")" },
            { name: "balanceCheckedAt", type: "date", label: "Saldo verificado em" },
          ],
        },
        { name: "billingLink", type: "text", label: "Link para ver o saldo/faturamento real" },
      ],
    },
    { name: "credentialLocation", type: "text", label: "Onde fica a credencial" },
    { name: "notes", type: "textarea", label: "Notas" },
    { name: "lastVerified", type: "date", label: "Última verificação", admin: { position: "sidebar" } },
  ],
};
