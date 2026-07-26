/**
 * Completa o blog e a Central de Materiais em produção:
 *  1) Sobe a imagem de capa que falta nos 22 Posts já importados (rascunho).
 *  2) Cria os 22 Materials (sempre em draft) a partir dos guias de ferramenta.
 *
 * Le as variaveis de ambiente de PRODUCAO de .env.production.pull.local
 * (Postgres/Neon + S3), escreve via Payload Local API. NAO publica nada,
 * NAO sobrescreve capa/Post existente, NAO duplica Material já criado.
 *
 * Uso: node_modules\.bin\tsx scripts\import-covers-and-materials.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import matter from "gray-matter";
import sharp from "sharp";
import { getPayload } from "payload";
import {
  convertMarkdownToLexical,
  defaultEditorConfig,
  sanitizeServerEditorConfig,
} from "@payloadcms/richtext-lexical";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

// ---------------------------------------------------------------------------
// 1) Carrega .env.production.pull.local em process.env ANTES de importar o
//    payload.config (o config le DATABASE_URI/S3_* na hora do buildConfig).
// ---------------------------------------------------------------------------
function loadEnvFile(file) {
  const raw = fs.readFileSync(file, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

// NAO usar .env.production.pull.local: as variaveis estao marcadas como
// "Sensitive" no Vercel, entao `vercel env pull` grava o literal
// "[SENSITIVE]" no lugar do valor. As credenciais reais de producao
// (Neon + S3) vivem em .env.production.local; PAYLOAD_SECRET vem do .env
// (so assina token de login — nao ha campo `encrypted` no schema, entao
// nao afeta os dados escritos aqui).
const envFile = path.join(ROOT, ".env.production.local");
if (!fs.existsSync(envFile)) {
  console.error(`Arquivo nao encontrado: ${envFile}.`);
  process.exit(1);
}
loadEnvFile(envFile);
if (!process.env.PAYLOAD_SECRET && fs.existsSync(path.join(ROOT, ".env"))) {
  const before = process.env.PAYLOAD_SECRET;
  loadEnvFile(path.join(ROOT, ".env"));
  // .env tem DATABASE_URI de DEV (sqlite) — nao pode sobrescrever a de prod.
  loadEnvFile(envFile);
  if (!before && process.env.PAYLOAD_SECRET) console.log("PAYLOAD_SECRET carregado do .env.");
}

if (!process.env.DATABASE_URI || !process.env.DATABASE_URI.startsWith("postgres")) {
  console.error("DATABASE_URI de producao (postgres://...) nao encontrada apos carregar o .env.");
  process.exit(1);
}
console.log(`DATABASE_URI carregada (${process.env.DATABASE_URI.split("@")[1]?.split("/")[0] ?? "?"}).`);
console.log(`S3_BUCKET: ${process.env.S3_BUCKET ?? "(vazio)"}`);

// Import dinâmico DEPOIS de popular process.env.
// Usa o config PRE-COMPILADO (esbuild) em vez do .ts direto: rodar via `tsx`
// faz o transformer recompilar pacotes CJS de node_modules e quebra
// (@next/env -> loadEnvConfig undefined; undici -> "Illegal constructor" no
// Node 24). Com o bundle pronto, roda em `node` puro, sem loader nenhum.
// O bundle e regerado a cada execucao (esbuild leva ~100ms), entao nunca
// fica dessincronizado de src/payload.config.ts nem precisa ir pro git.
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
const { default: config } = await import(pathToFileURL(BUILT_CONFIG).href);

// ---------------------------------------------------------------------------
// 2) Conteudo local: 22 temas em Gestão/Liderança/Vendas/blog/Tema_XX_.../
// ---------------------------------------------------------------------------
const CONTENT_ROOT =
  "C:\\Users\\march\\OneDrive - Empresarial Academy\\Empresarial Academy\\Projeto IA\\Antigravity\\Conteudo_Estrategico_Blog";

const PILARES = [
  { dir: "Gestão", categoryName: "Gestão" },
  { dir: "Liderança", categoryName: "Liderança" },
  { dir: "Vendas", categoryName: "Vendas" },
];

function listThemeFolders() {
  const themes = [];
  for (const pilar of PILARES) {
    const blogDir = path.join(CONTENT_ROOT, pilar.dir, "blog");
    if (!fs.existsSync(blogDir)) continue;
    for (const entry of fs.readdirSync(blogDir, { withFileTypes: true })) {
      if (!entry.isDirectory() || !entry.name.startsWith("Tema_")) continue;
      themes.push({ pilar, themeDir: path.join(blogDir, entry.name), themeName: entry.name });
    }
  }
  return themes.sort((a, b) => a.themeDir.localeCompare(b.themeDir, "pt-BR"));
}

function findFileByPattern(dir, predicate) {
  const files = fs.readdirSync(dir);
  return files.find(predicate);
}

/** Le artigo.md e devolve { title, filePath } (front matter). */
function readArtigoTitle(themeDir) {
  const artigoPath = path.join(themeDir, "artigo.md");
  if (!fs.existsSync(artigoPath)) return null;
  const raw = fs.readFileSync(artigoPath, "utf8");
  const { data } = matter(raw);
  return { title: data.title ? String(data.title).trim() : null, artigoPath };
}

// ---------------------------------------------------------------------------
// Helpers de conversao markdown -> lexical (mesma logica do endpoint
// /api/parse-markdown).
// ---------------------------------------------------------------------------
async function mdToLexical(sanitizedEditorConfig, markdown) {
  return convertMarkdownToLexical({ editorConfig: sanitizedEditorConfig, markdown });
}

// ---------------------------------------------------------------------------
// Otimizacao de capa: os PNGs de origem tem 2816x1536 e ~5MB. O site consome
// no maximo 1280px (imageSizes.feature) e a capa tambem vira imagem de
// compartilhamento (OG) — por isso JPEG (universal em preview de link, ao
// contrario de webp) a 1600px de largura: ~80KB, sem perda visivel.
const TMP_DIR = path.join(ROOT, ".tmp-capas-otimizadas");
async function optimizedImage(srcPath) {
  fs.mkdirSync(TMP_DIR, { recursive: true });
  const out = path.join(TMP_DIR, path.basename(srcPath, path.extname(srcPath)) + ".jpg");
  // Le para Buffer em vez de passar o caminho: o conteudo vive sob
  // "OneDrive - Empresarial Academy\...\Tema_06_Cultura_Organizacional_Sem_
  // Virar_Manual_Que_Ninguem_Le\<arquivo>.png", que estoura os 260 chars do
  // MAX_PATH do Windows. O fs do Node contorna (usa o prefixo \\?\), mas a
  // libvips nativa do sharp nao — daria "Input file is missing".
  await sharp(fs.readFileSync(srcPath))
    .resize({ width: 1600, withoutEnlargement: true })
    .jpeg({ quality: 92, mozjpeg: true })
    .toFile(out);
  const kb = (fs.statSync(out).size / 1024).toFixed(0);
  const origMb = (fs.statSync(srcPath).size / 1048576).toFixed(2);
  console.log(`    (otimizada: ${origMb}MB -> ${kb}KB)`);
  return out;
}

function kindFromGuide({ ext, guideText, fileBaseName }) {
  if (ext === ".xlsx") return "planilha";
  const t = (guideText + " " + fileBaseName).toLowerCase();
  if (t.includes("questionário") || t.includes("questionario") || t.includes("checklist") || t.includes("diagnóstico") || t.includes("diagnostico")) {
    return "checklist";
  }
  if (t.includes("template") || t.includes("roteiro") || t.includes("plano de comunicação") || t.includes("script") || t.includes("playbook") || t.includes("matriz")) {
    return "template";
  }
  return "guia";
}

/** Extrai um titulo de material a partir do H1 do guia (ex.: "# Guia da ferramenta: X" ou "# X — guia de uso"). */
function materialTitleFromGuide(guideBody, fallback) {
  const h1Match = guideBody.match(/^#\s+(.+)$/m);
  if (!h1Match) return fallback;
  let t = h1Match[1].trim();
  t = t.replace(/^guia da ferramenta:\s*/i, "");
  t = t.replace(/\s*[—-]\s*guia de uso\s*$/i, "");
  return t.trim() || fallback;
}

/** Descricao curta: primeira frase substancial do corpo do guia (secao "O que é..."). */
function descriptionFromGuide(guideBody) {
  const section = guideBody.match(/##\s*O que [ée].*?\n([\s\S]*?)(\n##|\n$)/i);
  const text = section ? section[1] : guideBody;
  const clean = text.replace(/[#*_`]/g, "").replace(/\s+/g, " ").trim();
  const sentences = clean.split(/(?<=[.!?])\s+/).filter(Boolean);
  let desc = "";
  for (const s of sentences) {
    if ((desc + " " + s).trim().length > 280) break;
    desc = (desc + " " + s).trim();
    if (desc.length > 120) break;
  }
  return desc || clean.slice(0, 280);
}

// ---------------------------------------------------------------------------
// 3) Execucao
// ---------------------------------------------------------------------------
async function main() {
  const payload = await getPayload({ config });
  console.log("\n=== Payload Local API conectado (producao) ===\n");

  // --- Leitura: Posts, Categories, MaterialCategories, Users -------------
  const [postsRes, catsRes, matCatsRes, usersRes] = await Promise.all([
    payload.find({ collection: "posts", limit: 100, depth: 0 }),
    payload.find({ collection: "categories", limit: 100 }),
    payload.find({ collection: "material-categories", limit: 100 }),
    payload.find({ collection: "users", limit: 100 }),
  ]);

  console.log(`Posts existentes: ${postsRes.docs.length}`);
  for (const p of postsRes.docs) {
    console.log(`  - [${p.id}] "${p.title}" (slug=${p.slug}) coverImage=${p.coverImage ?? "—"}`);
  }
  console.log(`\nCategories (posts): ${catsRes.docs.length}`);
  for (const c of catsRes.docs) console.log(`  - [${c.id}] ${c.name}`);
  console.log(`\nMaterial Categories: ${matCatsRes.docs.length}`);
  for (const c of matCatsRes.docs) console.log(`  - [${c.id}] ${c.name}`);
  console.log(`\nUsers: ${usersRes.docs.length}`);
  for (const u of usersRes.docs) console.log(`  - [${u.id}] ${u.name ?? u.email}`);

  // --- Garante as 3 Material Categories (Gestão/Liderança/Vendas) --------
  const materialCategoryIdByName = {};
  for (const c of matCatsRes.docs) materialCategoryIdByName[c.name] = c.id;
  for (const pilar of PILARES) {
    if (materialCategoryIdByName[pilar.categoryName]) continue;
    const created = await payload.create({
      collection: "material-categories",
      data: { name: pilar.categoryName },
    });
    materialCategoryIdByName[pilar.categoryName] = created.id;
    console.log(`\n[material-categories] criada: ${pilar.categoryName} (id=${created.id})`);
  }

  // --- Cruza pastas locais com Posts por titulo ---------------------------
  const themes = listThemeFolders();
  console.log(`\nTemas locais encontrados: ${themes.length}`);

  const postByTitle = new Map(postsRes.docs.map((p) => [normalizeTitle(p.title), p]));

  const matched = [];
  const unmatched = [];
  for (const theme of themes) {
    const artigo = readArtigoTitle(theme.themeDir);
    if (!artigo || !artigo.title) {
      unmatched.push({ theme, reason: "artigo.md sem front matter 'title'" });
      continue;
    }
    const post = postByTitle.get(normalizeTitle(artigo.title));
    if (!post) {
      unmatched.push({ theme, reason: `titulo "${artigo.title}" nao bateu com nenhum Post` });
      continue;
    }
    matched.push({ theme, artigoTitle: artigo.title, post });
  }

  console.log(`\nMatches tema<->post: ${matched.length}/${themes.length}`);
  if (unmatched.length) {
    console.log("SEM MATCH (nao vou inventar, pulando):");
    for (const u of unmatched) console.log(`  - ${u.theme.themeName} (${u.theme.pilar.dir}): ${u.reason}`);
  }

  // --- Sanitiza editor config uma vez -------------------------------------
  const sanitizedEditorConfig = await sanitizeServerEditorConfig(defaultEditorConfig, payload.config);

  // --- PASSO A: capa dos Posts --------------------------------------------
  console.log("\n=== PASSO A: capas de Posts ===\n");
  const coverReport = [];
  for (const { theme, post } of matched) {
    try {
      if (post.coverImage) {
        coverReport.push({ post, status: "ja-tinha-capa" });
        console.log(`- [pulado] "${post.title}" ja tinha capa (media id=${post.coverImage}).`);
        continue;
      }
      const artigoImgName = findFileByPattern(
        theme.themeDir,
        (f) => /-artigo-.*\.png$/i.test(f),
      );
      if (!artigoImgName) {
        coverReport.push({ post, status: "erro", detail: "imagem de capa do artigo nao encontrada na pasta" });
        console.log(`- [ERRO] "${post.title}": imagem -artigo-*.png nao encontrada em ${theme.themeDir}`);
        continue;
      }
      const imgPath = await optimizedImage(path.join(theme.themeDir, artigoImgName));
      const media = await payload.create({
        collection: "media",
        data: { alt: post.title },
        filePath: imgPath,
      });
      await payload.update({
        collection: "posts",
        id: post.id,
        data: { coverImage: media.id },
      });
      coverReport.push({ post, status: "capa-adicionada", mediaId: media.id, file: artigoImgName });
      console.log(`- [OK] "${post.title}" -> capa = media id ${media.id} (${artigoImgName})`);
    } catch (err) {
      coverReport.push({ post, status: "erro", detail: String(err?.message ?? err) });
      console.log(`- [ERRO] "${post.title}": ${err?.message ?? err}`);
    }
  }

  // --- PASSO B: criar os 22 Materials -------------------------------------
  console.log("\n=== PASSO B: Materials ===\n");
  // Slugs ja existentes para evitar duplicar em reruns.
  const existingMaterials = await payload.find({ collection: "materials", limit: 200, depth: 0 });
  const existingSlugs = new Set(existingMaterials.docs.map((m) => m.slug));
  const existingTitles = new Set(existingMaterials.docs.map((m) => normalizeTitle(m.title)));

  const materialReport = [];
  for (const { theme } of matched) {
    const dir = theme.themeDir;
    try {
      const guideFileName = findFileByPattern(dir, (f) => /_guia\.md$/i.test(f));
      if (!guideFileName) {
        materialReport.push({ theme, status: "erro", detail: "arquivo _guia.md nao encontrado" });
        console.log(`- [ERRO] ${theme.themeName}: _guia.md nao encontrado.`);
        continue;
      }
      const guideRaw = fs.readFileSync(path.join(dir, guideFileName), "utf8");
      const { data: guideFrontmatter, content: guideBody } = matter(guideRaw);

      const fallbackTitle = guideFileName
        .replace(/_guia\.md$/i, "")
        .replace(/^ferramenta_/i, "")
        .replace(/[_-]+/g, " ")
        .trim();
      const materialTitle =
        (guideFrontmatter.title && String(guideFrontmatter.title).trim()) ||
        materialTitleFromGuide(guideBody, fallbackTitle);

      if (existingTitles.has(normalizeTitle(materialTitle))) {
        materialReport.push({ theme, status: "ja-existia", title: materialTitle });
        console.log(`- [pulado] "${materialTitle}" (${theme.themeName}) ja existe como Material.`);
        continue;
      }

      const description = descriptionFromGuide(guideBody);

      // arquivo de download: ferramenta_*.xlsx ou .pdf (nao o _guia.md)
      const toolFileName = findFileByPattern(
        dir,
        (f) => /^ferramenta_.*\.(xlsx|pdf)$/i.test(f),
      );
      if (!toolFileName) {
        materialReport.push({ theme, status: "erro", detail: "arquivo ferramenta_*.xlsx/.pdf nao encontrado" });
        console.log(`- [ERRO] ${theme.themeName}: arquivo ferramenta_*.xlsx/.pdf nao encontrado.`);
        continue;
      }
      const ext = path.extname(toolFileName).toLowerCase();

      // capa do material: <pilar>-temaXX-material-*.png
      const coverFileName = findFileByPattern(dir, (f) => /-material-.*\.png$/i.test(f));
      if (!coverFileName) {
        materialReport.push({ theme, status: "erro", detail: "capa -material-*.png nao encontrada" });
        console.log(`- [ERRO] ${theme.themeName}: capa -material-*.png nao encontrada (rode o Passo 0).`);
        continue;
      }

      const kind = kindFromGuide({ ext, guideText: guideBody, fileBaseName: toolFileName });
      const content = await mdToLexical(sanitizedEditorConfig, guideBody);
      const categoryId = materialCategoryIdByName[theme.pilar.categoryName];

      const coverMedia = await payload.create({
        collection: "media",
        data: { alt: materialTitle },
        filePath: await optimizedImage(path.join(dir, coverFileName)),
      });
      const fileDoc = await payload.create({
        collection: "material-files",
        data: {},
        filePath: path.join(dir, toolFileName),
      });

      const created = await payload.create({
        collection: "materials",
        data: {
          title: materialTitle,
          description,
          content,
          coverImage: coverMedia.id,
          file: fileDoc.id,
          kind,
          category: categoryId,
          version: "2026",
          featured: false,
          status: "draft",
        },
      });

      existingSlugs.add(created.slug);
      existingTitles.add(normalizeTitle(materialTitle));
      materialReport.push({
        theme,
        status: "criado",
        title: materialTitle,
        slug: created.slug,
        kind,
        category: theme.pilar.categoryName,
        file: toolFileName,
        cover: coverFileName,
      });
      console.log(`- [OK] "${materialTitle}" (${theme.pilar.categoryName} / ${kind}) -> slug=${created.slug}, arquivo=${toolFileName}`);
    } catch (err) {
      materialReport.push({ theme, status: "erro", detail: String(err?.message ?? err) });
      console.log(`- [ERRO] ${theme.themeName}: ${err?.message ?? err}`);
    }
  }

  // --- Verificacao final ---------------------------------------------------
  console.log("\n=== VERIFICACAO FINAL ===\n");
  const finalPosts = await payload.find({ collection: "posts", limit: 100, depth: 0 });
  const postsWithCover = finalPosts.docs.filter((p) => p.coverImage);
  console.log(`Posts com coverImage: ${postsWithCover.length}/${finalPosts.docs.length}`);
  for (const p of finalPosts.docs) {
    console.log(`  - [${p.coverImage ? "OK" : "SEM CAPA"}] "${p.title}" (slug=${p.slug})`);
  }

  const finalMaterials = await payload.find({ collection: "materials", where: { status: { equals: "draft" } }, limit: 200, depth: 0 });
  console.log(`\nMaterials em draft: ${finalMaterials.docs.length}`);
  for (const m of finalMaterials.docs) {
    console.log(`  - [${m.id}] "${m.title}" (slug=${m.slug}, kind=${m.kind}, category=${m.category})`);
  }

  // --- Resumo final em JSON (facil de ler no relatorio) --------------------
  console.log("\n=== RESUMO (JSON) ===");
  console.log(
    JSON.stringify(
      {
        temasLocais: themes.length,
        matches: matched.length,
        semMatch: unmatched.map((u) => ({ tema: u.theme.themeName, pilar: u.theme.pilar.dir, motivo: u.reason })),
        capas: coverReport.map((r) => ({
          post: r.post.title,
          status: r.status,
          detail: r.detail,
          mediaId: r.mediaId,
        })),
        materiais: materialReport.map((r) => ({
          tema: r.theme.themeName,
          status: r.status,
          title: r.title,
          slug: r.slug,
          kind: r.kind,
          category: r.category,
          detail: r.detail,
        })),
      },
      null,
      2,
    ),
  );

  process.exit(0);
}

function normalizeTitle(t) {
  return String(t ?? "")
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

main().catch((err) => {
  console.error("Falha fatal:", err);
  process.exit(1);
});
