import { NextResponse } from "next/server";
import { getPayloadClient } from "@/lib/payload";
import { seedAdsMockData } from "@/lib/seed-ads-mock";

/**
 * Rota de DEV para popular o painel de Ads com dados de exemplo (ver
 * src/lib/seed-ads-mock.ts). Roda como rota do Next de propósito, não como
 * script standalone: usar a Local API do Payload fora do runtime do Next
 * bate no mesmo problema de Node 24 + tsx (`undici CacheStorage Illegal
 * constructor`) documentado em PROJECT_STATUS.md para geração de tipos —
 * mesma armadilha, mesma solução.
 *
 * Uso: com `npm run dev` rodando, abrir http://localhost:3000/api/dev/seed-ads-mock
 * Bloqueada em produção e sempre que DATABASE_URI apontar para Postgres —
 * nunca deve rodar contra o Neon.
 */
export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Rota de dev — bloqueada em produção." }, { status: 403 });
  }

  const databaseUri = process.env.DATABASE_URI || "file:./empresarial-academy.db";
  if (databaseUri.startsWith("postgres")) {
    return NextResponse.json(
      { error: "Bloqueado: DATABASE_URI aponta para Postgres. Este seed só roda contra o SQLite de dev." },
      { status: 403 },
    );
  }

  const payload = await getPayloadClient();
  const summary = await seedAdsMockData(payload);
  return NextResponse.json({ ok: true, summary });
}
