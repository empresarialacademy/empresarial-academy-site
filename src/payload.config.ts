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
import { siteConfig } from "@/lib/site-config";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const databaseUri = process.env.DATABASE_URI || "file:./empresarial-academy.db";

// Dev usa SQLite (file:...); produção usa Postgres (postgres:// ou postgresql://).
const db = databaseUri.startsWith("postgres")
  ? postgresAdapter({ pool: { connectionString: databaseUri }, push: true })
  : sqliteAdapter({ client: { url: databaseUri } });

// Storage S3/R2 para uploads em produção.
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
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: {
      titleSuffix: "— Empresarial Academy Admin",
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
    Media,
    Users,
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || "",
  typescript: { outputFile: path.resolve(dirname, "payload-types.ts") },
  db,
  plugins,
  sharp,
});
