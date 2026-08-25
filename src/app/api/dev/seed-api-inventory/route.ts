import { NextResponse } from "next/server";
import { getPayloadClient } from "@/lib/payload";

/**
 * Carga inicial do Painel de APIs (collection `api-inventory`) — levantamento
 * feito em 24/08/2026 lendo os .env/.env.example reais de todos os
 * repositórios ativos (empresarial-academy-site, ea-social-engine, ea-flow,
 * cicj/EA Recovery, openbiz-maturity-engine, process_video.py) + a Auditoria
 * de Infraestrutura de 06/08/2026. Idempotente por nome: atualiza se já
 * existe, cria se não existe — pode rodar de novo com dado atualizado.
 * Bloqueada em NODE_ENV=production (mesmo padrão de seed-system-links).
 */

type SeedApi = {
  name: string;
  provider: string;
  category: "ia" | "redes-sociais" | "marketing" | "email" | "mensageria" | "infra" | "outro";
  systems: { system: string; envVar?: string; active?: boolean }[];
  status: "ativo" | "bloqueado" | "pendente" | "dormente" | "cancelamento";
  expiresAt?: string;
  renewalCycle?: string;
  hasBilling?: boolean;
  billingType?: "gratuito" | "pre-pago" | "pos-pago" | "assinatura" | "a-confirmar";
  balanceOrCost?: string;
  billingLink?: string;
  credentialLocation?: string;
  notes?: string;
};

const SEED: SeedApi[] = [
  {
    name: "Anthropic (Claude)",
    provider: "Anthropic",
    category: "ia",
    systems: [{ system: "ea-social-engine", envVar: "ANTHROPIC_API_KEY" }],
    status: "ativo",
    renewalCycle: "não expira (chave de conta) — só falha se o crédito zerar",
    hasBilling: true,
    billingType: "pos-pago",
    balanceOrCost: "cobrança por uso, sem saldo pré-pago — ver console.anthropic.com",
    billingLink: "https://console.anthropic.com",
    credentialLocation: "ea-social-engine/.env (produção: Vercel)",
    notes: "Fallback automático pro Gemini se falhar (achado 18/08: crédito zerou 1x, geração seguiu via Gemini).",
  },
  {
    name: "OpenAI",
    provider: "OpenAI",
    category: "ia",
    systems: [],
    status: "cancelamento",
    hasBilling: true,
    billingType: "a-confirmar",
    credentialLocation: "Projeto IA/.secrets/openai_api_key.txt (16/04/2025)",
    notes: "Sem nenhuma referência de uso nos 5 repositórios verificados na Auditoria de 06/08 — todo uso de IA de texto/vídeo hoje passa por Gemini/Claude. Maior alavanca de economia encontrada até agora.",
  },
  {
    name: "Google Gemini (Generative Language API)",
    provider: "Google",
    category: "ia",
    systems: [
      { system: "ea-social-engine", envVar: "GEMINI_API_KEY" },
      { system: "process_video.py", envVar: "GEMINI_API_KEY" },
      { system: "openbiz-maturity-engine", envVar: "GEMINI_API_KEY" },
    ],
    status: "ativo",
    renewalCycle: "não expira",
    hasBilling: true,
    billingType: "pos-pago",
    balanceOrCost: "3 chaves DIFERENTES (não é a mesma credencial compartilhada) — candidato a consolidação num projeto GCP só",
    credentialLocation: "cada repo tem sua própria chave no .env",
    notes: "ea-social-engine tem custo real rastreado via BigQuery Billing Export (real-billing.ts) — as outras 2 chaves não têm esse rastreamento.",
  },
  {
    name: "Google Cloud Billing Export (BigQuery)",
    provider: "Google Cloud",
    category: "infra",
    systems: [{ system: "ea-social-engine", envVar: "GCP_BILLING_SA_KEY_JSON" }],
    status: "ativo",
    hasBilling: false,
    credentialLocation: "ea-social-engine/.env",
    notes: "Service account só lê o custo do projeto GCP do Gemini (ea-social-engine). NÃO cobre Anthropic — Claude é faturado fora do GCP inteiramente.",
  },
  {
    name: "Google Ads API",
    provider: "Google Ads",
    category: "marketing",
    systems: [{ system: "empresarial-academy-site (EA ADS Manager)", envVar: "GOOGLE_ADS_CLIENT_ID / GOOGLE_DEVELOPER_TOKEN" }],
    status: "ativo",
    renewalCycle: "refresh token OAuth, sem expiração fixa (só se revogado)",
    hasBilling: true,
    billingType: "pre-pago",
    balanceOrCost: "API não expõe saldo pré-pago real (confirmado 17/08) — orçamento diário somado das campanhas + gasto sincronizado, saldo exato só no Faturamento do Google",
    billingLink: "https://ads.google.com",
    credentialLocation: "site/.env (Vercel produção)",
    notes: "cpcCeiling do painel NÃO é sincronizado do Google Ads (achado crítico 12/08) — pode estar desatualizado, confirmar direto na conta antes de confiar.",
  },
  {
    name: "YouTube Data API v3",
    provider: "Google Cloud",
    category: "redes-sociais",
    systems: [{ system: "ea-social-engine", envVar: "YOUTUBE_CLIENT_ID / YOUTUBE_REFRESH_TOKEN" }],
    status: "ativo",
    expiresAt: undefined,
    renewalCycle: "refresh token expira a cada 7 dias enquanto o app estiver em modo Teste no Google Auth Platform",
    hasBilling: false,
    billingType: "gratuito",
    credentialLocation: "ea-social-engine/.env",
    notes: "Cron check-youtube-token avisa por e-mail quando perto de expirar. Mudar o app para 'Em produção' elimina o ciclo de 7 dias.",
  },
  {
    name: "Meta Graph API (Facebook Página)",
    provider: "Meta",
    category: "redes-sociais",
    systems: [{ system: "ea-social-engine", envVar: "META_PAGE_ACCESS_TOKEN" }],
    status: "ativo",
    expiresAt: "2026-10-17",
    renewalCycle: "token de longa duração, ~60 dias — regerado em 18/08/2026",
    hasBilling: false,
    credentialLocation: "ea-social-engine/.env",
    notes: "Passo a passo de renovação em docs/setup-meta.md. Botão 'Renovar autorização' em /admin/credenciais (24/08).",
  },
  {
    name: "Instagram Graph API (login do Instagram)",
    provider: "Meta",
    category: "redes-sociais",
    systems: [
      { system: "ea-social-engine", envVar: "INSTAGRAM_ACCESS_TOKEN" },
      { system: "ea-flow", envVar: "INSTAGRAM_ACCESS_TOKEN", active: false },
    ],
    status: "ativo",
    expiresAt: "2026-10-17",
    renewalCycle: "token de longa duração, ~60 dias — gerado em 18/08/2026",
    hasBilling: false,
    credentialLocation: "cada repo tem seu próprio .env — MESMO token, não sincronizado entre eles",
    notes: "Limitação registrada 24/08: renovar em /admin/credenciais do ea-social-engine não atualiza o ea-flow automaticamente (.env separado). No ea-flow o token está vazio hoje.",
  },
  {
    name: "LinkedIn API (Community Management)",
    provider: "LinkedIn",
    category: "redes-sociais",
    systems: [{ system: "ea-social-engine", envVar: "LINKEDIN_ACCESS_TOKEN" }],
    status: "bloqueado",
    hasBilling: false,
    credentialLocation: "ea-social-engine/.env (client id/secret já configurados, token ainda vazio)",
    notes: "Aguardando aprovação do formulário de acesso enviado em 18/08/2026 — pode levar dias. App versiona 1x/mês (atenção a versão vencida).",
  },
  {
    name: "TikTok Content Posting API",
    provider: "TikTok",
    category: "redes-sociais",
    systems: [{ system: "ea-social-engine", envVar: "TIKTOK_ACCESS_TOKEN" }],
    status: "pendente",
    hasBilling: false,
    credentialLocation: "ea-social-engine/.env",
    notes: "Token já configurado, mas app ainda não auditado pela TikTok (TIKTOK_AUDITED=false) — todo post sai privado (SELF_ONLY) até a auditoria.",
  },
  {
    name: "WhatsApp Cloud API",
    provider: "Meta",
    category: "mensageria",
    systems: [{ system: "ea-flow", envVar: "WHATSAPP_ACCESS_TOKEN", active: false }],
    status: "dormente",
    hasBilling: false,
    credentialLocation: "ea-flow/.env (vazio hoje)",
    notes: "Fase 4 do EA Flow — depende de decisão do número. Instagram é o canal ativo em produção hoje.",
  },
  {
    name: "Resend (e-mail transacional)",
    provider: "Resend",
    category: "email",
    systems: [
      { system: "empresarial-academy-site" },
      { system: "ea-social-engine" },
      { system: "EA Recovery (cicj)" },
      { system: "ea-flow", active: false },
    ],
    status: "ativo",
    hasBilling: true,
    billingType: "a-confirmar",
    balanceOrCost: "plano/valor não localizado por evidência técnica — a confirmar com o Thiago",
    billingLink: "https://resend.com",
    credentialLocation: "RESEND_API_KEY em cada repo (mesma conta Resend)",
    notes: "Compartilhada por 3 sistemas ativos (site, ea-social-engine, EA Recovery); ea-flow tem a variável mas ainda vazia.",
  },
  {
    name: "RD Station Marketing",
    provider: "RD Station",
    category: "marketing",
    systems: [],
    status: "pendente",
    hasBilling: true,
    billingType: "a-confirmar",
    credentialLocation: "site/.env.example (RD_STATION_TOKEN) — não configurado em nenhum ambiente real",
    notes: "Opcional, no-op sem a variável. Não confirmado se a assinatura do RD Station está ativa fora do código.",
  },
  {
    name: "Featurable (avaliações do Google)",
    provider: "Featurable",
    category: "marketing",
    systems: [{ system: "empresarial-academy-site", envVar: "FEATURABLE_API_KEY" }],
    status: "ativo",
    hasBilling: true,
    billingType: "a-confirmar",
    billingLink: "https://featurable.com",
    credentialLocation: "site/.env.local",
    notes: "Alimenta as seções 'O que nossos clientes dizem' na Home e /depoimentos.",
  },
  {
    name: "Behold (feed do Instagram embutido)",
    provider: "Behold",
    category: "marketing",
    systems: [{ system: "empresarial-academy-site", envVar: "BEHOLD_FEED_URL" }],
    status: "ativo",
    hasBilling: true,
    billingType: "a-confirmar",
    credentialLocation: "site/.env.local",
    notes: "Só embute o feed público do Instagram no site — não publica, é o inverso do publicador do ea-social-engine.",
  },
  {
    name: "Hugging Face (modelos de diarização — pyannote)",
    provider: "Hugging Face",
    category: "ia",
    systems: [{ system: "process_video.py", envVar: "HUGGINGFACE_TOKEN", active: false }],
    status: "bloqueado",
    hasBilling: false,
    credentialLocation: "Projeto IA/.env local",
    notes: "Repos gated (precisam aceite manual) + torchcodec sem DLL no Windows — diarização de fala nunca ficou funcional nesta máquina.",
  },
  {
    name: "Cloudflare R2 (storage de mídia)",
    provider: "Cloudflare",
    category: "infra",
    systems: [
      { system: "empresarial-academy-site" },
      { system: "ea-social-engine" },
    ],
    status: "ativo",
    hasBilling: true,
    billingType: "a-confirmar",
    balanceOrCost: "mesma conta Cloudflare, buckets separados por sistema",
    billingLink: "https://dash.cloudflare.com",
    credentialLocation: "S3_* em cada repo",
    notes: "Compatível com S3 — usado pelo Payload de cada app para uploads (filesystem é efêmero na Vercel).",
  },
  {
    name: "Neon (Postgres)",
    provider: "Neon",
    category: "infra",
    systems: [
      { system: "empresarial-academy-site" },
      { system: "ea-social-engine" },
      { system: "ea-flow" },
    ],
    status: "ativo",
    hasBilling: true,
    billingType: "a-confirmar",
    balanceOrCost: "1 projeto Neon PRÓPRIO por sistema (não compartilham banco), região sa-east-1",
    billingLink: "https://console.neon.tech",
    credentialLocation: "DATABASE_URI em cada repo (Vercel produção)",
  },
  {
    name: "Vercel",
    provider: "Vercel",
    category: "infra",
    systems: [
      { system: "empresarial-academy-site" },
      { system: "ea-social-engine" },
      { system: "ea-flow" },
      { system: "EA Recovery (cicj)" },
    ],
    status: "ativo",
    hasBilling: true,
    billingType: "a-confirmar",
    billingLink: "https://vercel.com/dashboard",
    credentialLocation: "conta marchi-thiago1",
    notes: "VERCEL_TOKEN de escopo de CONTA (não de projeto) encontrado exposto em .env.production.local do site — marcado para rotação na Auditoria de 06/08, resolvido parcialmente em 18/08.",
  },
  {
    name: "GitHub",
    provider: "GitHub",
    category: "infra",
    systems: [
      { system: "empresarial-academy-site" },
      { system: "ea-social-engine" },
      { system: "ea-flow" },
      { system: "cicj" },
      { system: "openbiz-maturity-engine" },
    ],
    status: "ativo",
    hasBilling: false,
    notes: "Duas contas distintas em uso: marchi-thiago (pessoal, conectada à Vercel) e empresarialacademy (institucional, dona da maioria dos repos) — causa fricção real no deploy automático (ver PROJECT_STATUS de cada repo).",
  },
];

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Rota de carga — bloqueada no runtime de produção." }, { status: 403 });
  }

  const payload = await getPayloadClient();
  const results: Array<{ name: string; action: string }> = [];

  for (const api of SEED) {
    const existing = await payload.find({
      collection: "api-inventory",
      where: { name: { equals: api.name } },
      limit: 1,
      depth: 0,
    });
    if (existing.docs[0]) {
      await payload.update({ collection: "api-inventory", id: existing.docs[0].id, data: api });
      results.push({ name: api.name, action: "updated" });
      continue;
    }
    await payload.create({ collection: "api-inventory", data: api });
    results.push({ name: api.name, action: "created" });
  }

  return NextResponse.json({ ok: true, count: SEED.length, results });
}
