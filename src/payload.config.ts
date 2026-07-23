import path from "path";
import { fileURLToPath } from "url";
import { buildConfig, type Plugin } from "payload";
import { sqliteAdapter } from "@payloadcms/db-sqlite";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { s3Storage } from "@payloadcms/storage-s3";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import sharp from "sharp";

import { Users } from "@/collections/Users";
import { Media } from "@/collections/Media";
import { Categories } from "@/collections/Categories";
import { Posts } from "@/collections/Posts";
import { Materials } from "@/collections/Materials";
import { MaterialCategories } from "@/collections/MaterialCategories";
import { MaterialFiles } from "@/collections/MaterialFiles";
import { Testimonials } from "@/collections/Testimonials";
import { Leads } from "@/collections/Leads";
import { resendEmailAdapter } from "@/lib/payload-email-adapter";
import { EmailLogs } from "@/collections/EmailLogs";
import { EmailSegments } from "@/collections/EmailSegments";
import { EmailCampaigns } from "@/collections/EmailCampaigns";
import { AdCampaigns } from "@/collections/AdCampaigns";
import { AdGroups } from "@/collections/AdGroups";
import { AdKeywords } from "@/collections/AdKeywords";
import { AdMetricsDaily } from "@/collections/AdMetricsDaily";
import { AdCompetitors } from "@/collections/AdCompetitors";
import { SystemLinks } from "@/collections/SystemLinks";
import { AdsSettings } from "@/globals/AdsSettings";
import { siteConfig } from "@/lib/site-config";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const databaseUri = process.env.DATABASE_URI || "file:./empresarial-academy.db";

// Dev usa SQLite (file:...); produção usa Postgres (postgres:// ou postgresql://).
const db = databaseUri.startsWith("postgres")
  ? postgresAdapter({ pool: { connectionString: databaseUri }, push: true })
  : sqliteAdapter({ client: { url: databaseUri } });

// Storage S3/R2 para uploads em produção (serverless tem filesystem efêmero).
// Ativa apenas quando as variáveis estiverem definidas; em dev continua no disco.
const plugins: Plugin[] = [];
if (process.env.S3_BUCKET && process.env.S3_ACCESS_KEY_ID) {
  plugins.push(
    s3Storage({
      collections: {
        media: true,
        "material-files": true,
      },
      bucket: process.env.S3_BUCKET,
      config: {
        endpoint: process.env.S3_ENDPOINT || undefined,
        region: process.env.S3_REGION || "auto",
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID,
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
        },
      },
    }),
  );
}

export default buildConfig({
  serverURL: databaseUri.startsWith("postgres") ? siteConfig.url : undefined,
  email: resendEmailAdapter,
  routes: {
    // Painel renomeado para "EA HUB" e servido em /eahub (a pasta
    // src/app/(payload)/eahub casa com esta rota; ver resolveImportMapFilePath).
    admin: "/eahub",
  },
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: {
      titleSuffix: "— EA HUB",
      // Favicon da aba do navegador no EA HUB = logo oficial da Empresarial
      // Academy (substitui o ícone padrão do Payload).
      icons: [
        { rel: "icon", type: "image/png", url: "/logo-empresarial-academy.png" },
        { rel: "shortcut icon", type: "image/png", url: "/logo-empresarial-academy.png" },
        { rel: "apple-touch-icon", type: "image/png", url: "/logo-empresarial-academy.png" },
      ],
    },
    components: {
      afterNavLinks: [
        "@/components/admin/marketing/EaMarketingManagerNavLink#EaMarketingManagerNavLink",
      ],
      graphics: {
        Logo: "@/components/admin/brand/EaLogo#EaLogo",
        Icon: "@/components/admin/brand/EaIcon#EaIcon",
      },
      views: {
        // Home do /eahub: dashboard branded (substitui a tela padrão do Payload).
        dashboard: {
          Component: "@/components/admin/hub/EaHubDashboard#EaHubDashboard",
        },
        // "Central EA" foi absorvida pelo hub (definição do Thiago, 23/07):
        // o EA Marketing Manager é a entrada única; a rota antiga redireciona.
        marketingManager: {
          Component: "@/components/admin/marketing/EaMarketingManagerView#EaMarketingManagerView",
          path: "/marketing-manager",
          meta: { title: "EA Marketing Manager" },
        },
        centralEaRedirect: {
          Component: "@/components/admin/central/CentralEaRedirect#CentralEaRedirect",
          path: "/central-ea",
          meta: { title: "EA Marketing Manager" },
        },
        adsPerformance: {
          Component: "@/components/admin/ads/AdsPerformanceView#AdsPerformanceView",
          path: "/ads-performance",
          meta: { title: "EA ADS Manager" },
        },
      },
    },
  },
  collections: [
    Posts,
    Categories,
    Materials,
    MaterialCategories,
    MaterialFiles,
    Testimonials,
    Leads,
    EmailSegments,
    EmailCampaigns,
    EmailLogs,
    AdCampaigns,
    AdGroups,
    AdKeywords,
    AdMetricsDaily,
    AdCompetitors,
    SystemLinks,
    Media,
    Users,
  ],
  globals: [
    AdsSettings,
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || "",
  typescript: { outputFile: path.resolve(dirname, "payload-types.ts") },
  db,
  plugins,
  sharp,
});
