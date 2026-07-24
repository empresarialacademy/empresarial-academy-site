import type { CollectionConfig } from "payload";
import { sanitizeUploadFilename } from "@/lib/slug";

export const Media: CollectionConfig = {
  slug: "media",
  labels: { singular: "Mídia", plural: "Mídia" },
  // Fora do menu: as imagens são enviadas junto do artigo/material (campo de
  // upload inline), não como uma coleção avulsa (decisão do Thiago, 2026-07-23).
  // A coleção continua existindo como destino dos uploads e das relações.
  admin: { hidden: true },
  access: { read: () => true },
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
    staticDir: "public/uploads",
    mimeTypes: ["image/*"],
    imageSizes: [
      { name: "thumbnail", width: 400 },
      { name: "card", width: 800 },
      { name: "feature", width: 1280 },
    ],
  },
  fields: [
    {
      name: "alt",
      type: "text",
      required: true,
      label: "Texto alternativo (acessibilidade/SEO)",
    },
  ],
};
