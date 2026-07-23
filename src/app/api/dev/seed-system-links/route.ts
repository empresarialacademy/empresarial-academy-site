import { NextResponse } from "next/server";
import { getPayloadClient } from "@/lib/payload";

/**
 * Semeia os links iniciais da "Central EA" (coleção `system-links`).
 * Idempotente: só cria o que ainda não existe (busca por nome), nunca
 * altera nem apaga — depois da primeira carga, a coleção é do Thiago, que
 * edita pelo admin. Diferente do seed-ads-mock, AQUI PODE rodar contra o
 * Neon de propósito: estes são dados reais de produção, e a carga inicial
 * em produção acontece na mesma sessão local (`next dev` apontando para o
 * Neon) usada para sincronizar o schema novo antes do deploy. Bloqueada
 * apenas em NODE_ENV=production (o runtime da Vercel).
 */

const INITIAL_LINKS = [
  { name: "Site Empresarial Academy", url: "https://empresarialacademy.com", description: "Site institucional no ar.", order: 10 },
  { name: "LP Consultoria PME", url: "https://empresarialacademy.com/consultoria-pme", description: "Landing page de aquisição (destino do Google Ads).", order: 20 },
  { name: "EA Marketing Manager", url: "/admin/marketing-manager", description: "Hub das ferramentas de marketing (Ads, e-mail, leads).", order: 30 },
  { name: "EA ADS", url: "/admin/ads-performance", description: "Desempenho de campanhas do Google Ads, CAC e ROI.", order: 40 },
  { name: "EA Impulsiona", url: "https://ea-impulsiona.web.app", description: "Plataforma EA Impulsiona.", order: 50 },
  { name: "EA Recovery", url: "https://recovery.empresarialacademy.com/", description: "CRM de Cobrança (Souza Ramos).", order: 60 },
  { name: "EA Recovery — Admin", url: "https://recovery.empresarialacademy.com/admin", description: "Painel administrativo do EA Recovery.", order: 70 },
  { name: "Portal de Pós-Vendas", url: "", description: "Hoje local (OneDrive) — link entra quando for publicado.", order: 80 },
  { name: "Playbook de Vendas", url: "", description: "Hoje local (OneDrive) — link entra quando for publicado.", order: 90 },
];

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Rota de carga — bloqueada no runtime de produção." }, { status: 403 });
  }

  const payload = await getPayloadClient();
  const results: Array<{ name: string; action: string }> = [];

  for (const link of INITIAL_LINKS) {
    const existing = await payload.find({
      collection: "system-links",
      where: { name: { equals: link.name } },
      limit: 1,
      depth: 0,
    });
    if (existing.docs[0]) {
      results.push({ name: link.name, action: "already-exists" });
      continue;
    }
    await payload.create({ collection: "system-links", data: link });
    results.push({ name: link.name, action: "created" });
  }

  return NextResponse.json({ ok: true, results });
}
