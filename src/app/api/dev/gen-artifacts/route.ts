import path from "path";
import { pathToFileURL } from "url";
import { NextResponse } from "next/server";
import { getPayloadClient } from "@/lib/payload";

/**
 * Regenera `src/payload-types.ts` e `src/app/(payload)/admin/importMap.js`
 * de dentro do runtime do Next — rota dev-only PERMANENTE que substitui as
 * rotas temporárias recriadas a cada sessão. Motivo: o CLI do Payload
 * (`payload generate:types|importmap`) quebra no Node 24 deste ambiente
 * (`undici CacheStorage Illegal constructor`, via tsx) — gotcha documentado
 * no PROJECT_STATUS.md.
 *
 * ⚠️ Rodar SEMPRE com as env vars S3_* carregadas (ex.: inline no comando
 * `next dev`), senão a entrada S3ClientUploadHandler some do importMap e o
 * /admin de produção quebra (incidente de 19/07).
 *
 * Uso: com `next dev` rodando, abrir /api/dev/gen-artifacts
 */
export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Rota de dev — bloqueada em produção." }, { status: 403 });
  }

  const payload = await getPayloadClient();
  const s3Loaded = Boolean(process.env.S3_BUCKET && process.env.S3_ACCESS_KEY_ID);

  const typesUrl = pathToFileURL(
    path.resolve(process.cwd(), "node_modules/payload/dist/bin/generateTypes.js"),
  ).href;
  const importMapUrl = pathToFileURL(
    path.resolve(process.cwd(), "node_modules/payload/dist/bin/generateImportMap/index.js"),
  ).href;

  const typesMod = await import(/* webpackIgnore: true */ typesUrl);
  await typesMod.generateTypes(payload.config);

  const importMapMod = await import(/* webpackIgnore: true */ importMapUrl);
  await importMapMod.generateImportMap(payload.config);

  return NextResponse.json({
    ok: true,
    s3Loaded,
    warning: s3Loaded
      ? undefined
      : "S3_* NÃO carregadas — o importMap gerado está SEM o S3ClientUploadHandler e vai quebrar o /admin em produção. Rode o next dev com as S3_* e gere de novo.",
  });
}
