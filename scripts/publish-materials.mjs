/**
 * Publica os Materiais que estao em rascunho, preenchendo o SEO que falta.
 *
 * Por que existe: `scripts/import-covers-and-materials.mjs` cria os materiais
 * em `draft` de proposito (publicar e decisao humana). Este script faz a
 * segunda etapa, quando a decisao for tomada.
 *
 * Dois detalhes que este script resolve:
 *  1. `seo.metaTitle` e `seo.metaDescription` sao `requiredToPublish` — sem
 *     eles a transicao para "published" e barrada pela validacao.
 *  2. O hook `afterChange` de Materials dispara e-mail para TODOS os
 *     assinantes da newsletter a cada material publicado. Com `--sem-email`
 *     (padrao) marcamos `subscriberAlertSent: true` na mesma operacao, o que
 *     faz `justPublished` virar false e nenhum e-mail sair. Use `--com-email`
 *     para o comportamento normal de notificar os assinantes.
 *
 * Uso: node scripts/publish-materials.mjs [--com-email]
 */
import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const COM_EMAIL = process.argv.includes("--com-email");

// Credenciais de producao: ver nota no import-covers-and-materials.mjs — o
// `vercel env pull` NAO serve aqui (variaveis "Sensitive" viram "[SENSITIVE]").
function loadEnvFile(file, onlyKey) {
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq === -1) continue;
    const key = t.slice(0, eq).trim();
    if (onlyKey && key !== onlyKey) continue;
    process.env[key] = t.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
  }
}
loadEnvFile(path.join(ROOT, ".env.production.local"));
loadEnvFile(path.join(ROOT, ".env"), "PAYLOAD_SECRET");

if (!process.env.DATABASE_URI?.startsWith("postgres")) {
  console.error("DATABASE_URI de producao nao carregada.");
  process.exit(1);
}
console.log(`DATABASE_URI carregada (${process.env.DATABASE_URI.split("@")[1]?.split("/")[0]}).`);
console.log(COM_EMAIL ? "MODO: notificando assinantes." : "MODO: sem disparar e-mail aos assinantes.");

// Config pre-compilado (rodar via `tsx` quebra no Node 24 — ver comentario no
// import-covers-and-materials.mjs).
const BUILT_CONFIG = path.join(__dirname, ".payload-config.built.mjs");
const esbuild = await import("esbuild");
await esbuild.build({
  entryPoints: [path.join(ROOT, "src", "payload.config.ts")],
  bundle: true,
  platform: "node",
  format: "esm",
  packages: "external",
  tsconfig: path.join(ROOT, "tsconfig.json"),
  outfile: BUILT_CONFIG,
  logLevel: "warning",
});
const { getPayload } = await import("payload");
const { default: config } = await import(pathToFileURL(BUILT_CONFIG).href);

/** Meta description: <=160 chars, cortada em fronteira de palavra. */
function metaDescriptionFrom(description, fallbackTitle) {
  const base = (description || fallbackTitle || "").replace(/\s+/g, " ").trim();
  if (base.length <= 160) return base;
  const cut = base.slice(0, 160);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > 100 ? cut.slice(0, lastSpace) : cut).replace(/[,;:\-–—]$/, "") + "…";
}

/**
 * Meta title = o titulo puro. NAO acrescentar "| Empresarial Academy" aqui:
 * o layout raiz ja aplica `template: "%s | ${siteConfig.name}"`, entao um
 * sufixo manual sai duplicado no <title> ("X | Empresarial Academy |
 * Empresarial Academy").
 */
function metaTitleFrom(title) {
  return title.replace(/\s*\|\s*Empresarial Academy\s*$/i, "").trim();
}

const payload = await getPayload({ config });

const drafts = await payload.find({
  collection: "materials",
  where: { status: { equals: "draft" } },
  limit: 200,
  depth: 0,
});
console.log(`\nMateriais em rascunho: ${drafts.docs.length}\n`);

const report = [];
for (const m of drafts.docs) {
  try {
    const data = {
      status: "published",
      seo: {
        metaTitle: m.seo?.metaTitle || metaTitleFrom(m.title),
        metaDescription: m.seo?.metaDescription || metaDescriptionFrom(m.description, m.title),
      },
    };
    // Suprime o alerta por e-mail marcando o campo ANTES do afterChange rodar.
    if (!COM_EMAIL) data.subscriberAlertSent = true;

    const updated = await payload.update({ collection: "materials", id: m.id, data });
    report.push({ title: updated.title, slug: updated.slug, status: "publicado" });
    console.log(`- [OK] "${updated.title}" -> /materiais/${updated.slug}`);
  } catch (err) {
    const detail = String(err?.message ?? err);
    report.push({ title: m.title, status: "erro", detail });
    console.log(`- [ERRO] "${m.title}": ${detail}`);
  }
}

// Verificacao final
const pub = await payload.find({ collection: "materials", where: { status: { equals: "published" } }, limit: 200, depth: 0 });
const stillDraft = await payload.find({ collection: "materials", where: { status: { equals: "draft" } }, limit: 200, depth: 0 });
console.log(`\n=== VERIFICACAO FINAL ===`);
console.log(`Materiais publicados: ${pub.totalDocs}`);
console.log(`Materiais ainda em rascunho: ${stillDraft.totalDocs}`);
const erros = report.filter((r) => r.status === "erro");
if (erros.length) {
  console.log(`\nERROS (${erros.length}):`);
  for (const e of erros) console.log(`  - "${e.title}": ${e.detail}`);
}

// Os alertas do afterChange rodam em background (void async). Mesmo com o
// e-mail suprimido, damos um respiro para qualquer trabalho pendente terminar.
await new Promise((r) => setTimeout(r, COM_EMAIL ? 20000 : 2000));
process.exit(erros.length ? 1 : 0);
