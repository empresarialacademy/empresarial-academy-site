import type { CollectionConfig } from "payload";

export const Media: CollectionConfig = {
  slug: "media",
  labels: { singular: "Mídia", plural: "Mídia" },
  access: { read: () => true },
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
