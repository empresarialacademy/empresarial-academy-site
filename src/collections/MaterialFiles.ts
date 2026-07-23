import type { CollectionConfig } from "payload";

/** Coleção de upload dedicada aos arquivos dos materiais (documentos, planilhas, vídeos, etc.). */
export const MaterialFiles: CollectionConfig = {
  slug: "material-files",
  labels: { singular: "Arquivo", plural: "Arquivos" },
  admin: { group: "Materiais", useAsTitle: "filename" },
  access: { read: () => true },
  upload: {
    staticDir: "public/uploads/materiais",
    mimeTypes: [
      "application/pdf",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "application/zip",
      "application/x-zip-compressed",
      "text/csv",
      "text/plain",
      "application/octet-stream",
      "video/mp4",
      "image/*",
    ],
  },
  fields: [],
};
