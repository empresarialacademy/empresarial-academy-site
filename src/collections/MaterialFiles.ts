import type { CollectionConfig } from "payload";
import { sanitizeUploadFilename } from "@/lib/slug";
import { isContentEngineRequest } from "@/lib/content-engine-auth";

/** Coleção de upload dedicada aos arquivos dos materiais (documentos, planilhas, vídeos, etc.). */
export const MaterialFiles: CollectionConfig = {
  slug: "material-files",
  labels: { singular: "Arquivo", plural: "Arquivos" },
  admin: { group: "Conteúdo do Site", useAsTitle: "filename" },
  access: {
    read: () => true,
    // EA Post sobe o arquivo gerado (PDF do material) — Fase D do plano.
    create: ({ req }) => Boolean(req.user) || isContentEngineRequest(req),
  },
  hooks: {
    beforeOperation: [
      ({ req, operation }) => {
        if ((operation === "create" || operation === "update") && req.file) {
          req.file.name = sanitizeUploadFilename(req.file.name);
        }
      },
    ],
  },
  upload: {
    staticDir: "public/uploads/materiais",
    // Aceita praticamente qualquer arquivo que o Thiago queira disponibilizar
    // para download (PDF, Excel, Word, PowerPoint, .md, ODF, ZIP, CSV, vídeo,
    // imagem…). `application/octet-stream` cobre tipos que o navegador não
    // identifica.
    mimeTypes: [
      "application/pdf",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "application/vnd.oasis.opendocument.text",
      "application/vnd.oasis.opendocument.spreadsheet",
      "application/vnd.oasis.opendocument.presentation",
      "application/rtf",
      "application/json",
      "application/zip",
      "application/x-zip-compressed",
      "text/markdown",
      "text/csv",
      "text/plain",
      "application/octet-stream",
      "video/mp4",
      "image/*",
    ],
  },
  fields: [],
};
