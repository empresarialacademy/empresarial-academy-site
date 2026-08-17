import type { CollectionConfig } from "payload";

/**
 * Armazena o PDF do Certificado de Assinatura Eletrônica + contrato integral,
 * gerado pelo servidor no momento da assinatura (src/lib/contract-pdf.tsx) e
 * anexado ao registro em Contracts (campo `signedPdf`). Fora do menu do EA
 * HUB (mesmo padrão de Media) — acessível a partir do próprio contrato.
 */
export const ContractDocuments: CollectionConfig = {
  slug: "contract-documents",
  labels: { singular: "Documento de Contrato", plural: "Documentos de Contrato" },
  admin: { hidden: true },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: () => false,
    delete: ({ req }) => Boolean(req.user),
  },
  upload: {
    staticDir: "public/uploads-contracts",
    mimeTypes: ["application/pdf"],
  },
  fields: [
    {
      name: "alt",
      type: "text",
      label: "Descrição",
      defaultValue: "Certificado de Assinatura Eletrônica",
    },
  ],
};
