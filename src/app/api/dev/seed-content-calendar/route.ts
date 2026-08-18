import { NextResponse } from "next/server";
import { getPayloadClient } from "@/lib/payload";

/**
 * Semeia o calendário de conteúdo de redes sociais (coleção
 * `content-calendar`) com o planejamento de 4 semanas entregue em
 * 17/08/2026: preparação (17-23/08), lançamento do site (semana 1) e
 * reaproveitamento de blog/materiais (semanas 2 a 4). Idempotente por
 * `theme` — não duplica se já existir, e depois da carga inicial a coleção é
 * do Thiago, que move o `status` pelo admin. Igual ao seed-system-links, PODE
 * rodar contra o Neon de propósito (dado real de produção).
 */

type Channel =
  | "ig-feed"
  | "ig-reels"
  | "ig-stories"
  | "facebook"
  | "li-post"
  | "li-artigo"
  | "yt-shorts"
  | "yt-video";

type SeedEntry = {
  date: string;
  phase: "prep" | "semana-1" | "semana-2" | "semana-3" | "semana-4";
  pillar: "preparacao" | "lancamento" | "gestao" | "vendas" | "lideranca";
  channels?: Channel[];
  format?: string;
  theme: string;
  sourceLabel?: string;
  copyIdea?: string;
  ctaOrAction?: string;
};

const ENTRIES: SeedEntry[] = [
  // Preparação
  { date: "2026-08-17", phase: "prep", pillar: "preparacao", theme: "Igualar subtítulo das 3 LPs de Ads", copyIdea: "Usar em todas a linha 'as empresas não quebram por falta de vendas, quebram por falta de gestão', hoje só em /consultoria-pme." },
  { date: "2026-08-18", phase: "prep", pillar: "preparacao", theme: "Publicar e-book do pilar Financeiro em /materiais", copyIdea: "PDF já pronto ('Por que sua empresa fatura mais e sobra menos'), está em rascunho; falta capa própria." },
  { date: "2026-08-19", phase: "prep", pillar: "preparacao", theme: "Reunir prints do site novo para o carrossel de lançamento", copyIdea: "Home, um post de blog, tela do diagnóstico." },
  { date: "2026-08-20", phase: "prep", pillar: "preparacao", theme: "Regravar o vídeo do hero das LPs com o roteiro revisado", copyIdea: "Não bloqueia o início das redes, mas está na mesma janela de produção." },
  { date: "2026-08-21", phase: "prep", pillar: "preparacao", theme: "Separar fotos do Thiago para os posts institucionais da semana 1", copyIdea: "Pasta Marketing/Midias/Fotos/Fotos Thiago." },

  // Semana 1 — Lançamento do site
  { date: "2026-08-24", phase: "semana-1", pillar: "lancamento", channels: ["ig-feed", "facebook", "li-post"], format: "Carrossel (4-5 lâminas)", theme: "O novo site da Empresarial Academy está no ar", sourceLabel: "Prints: home, blog, diagnóstico", copyIdea: "Anúncio direto: o que mudou, por que mudou, o que dá pra fazer lá agora", ctaOrAction: "Link na bio → site" },
  { date: "2026-08-26", phase: "semana-1", pillar: "lancamento", channels: ["ig-reels", "yt-shorts", "ig-stories"], format: "Vertical, 20-30s", theme: "Bastidor: por dentro do Diagnóstico de Maturidade gratuito", sourceLabel: "Gravação de tela do diagnóstico", copyIdea: "Mostra as perguntas e o resultado em radar, sem enrolação", ctaOrAction: "Fazer o diagnóstico grátis" },
  { date: "2026-08-27", phase: "semana-1", pillar: "lancamento", channels: ["li-artigo"], format: "Artigo LinkedIn", theme: "Por que reconstruímos o site do zero", sourceLabel: "Adaptação do posicionamento: consultoria + educação à frente", copyIdea: "Narrativa fundador: de 'escola de negócios' pra consultoria com nome no centro", ctaOrAction: "Conhecer a consultoria" },
  { date: "2026-08-28", phase: "semana-1", pillar: "lancamento", channels: ["ig-feed", "facebook", "li-post"], format: "Carrossel (3 lâminas)", theme: "3 coisas novas que você pode fazer no site", sourceLabel: "Blog, materiais gratuitos, diagnóstico", copyIdea: "Formato lista prática, cada lâmina = 1 coisa + como chegar lá", ctaOrAction: "Explorar o blog" },

  // Semana 2
  { date: "2026-08-31", phase: "semana-2", pillar: "gestao", channels: ["ig-feed", "facebook", "li-post"], format: "Carrossel (3 passos do artigo)", theme: "Painel de Indicadores: como montar um KPI que sua empresa realmente usa", sourceLabel: "Blog + material \"Painel de Indicadores\" (planilha)", copyIdea: "Os 3 passos do artigo, 1 por lâmina, fechando na planilha pronta", ctaOrAction: "Baixar a planilha grátis" },
  { date: "2026-09-02", phase: "semana-2", pillar: "vendas", channels: ["ig-reels", "yt-shorts", "ig-stories"], format: "Vertical, 20-30s", theme: "Objeção de preço: por que sua empresa perde negócio por causa disso", sourceLabel: "Blog", copyIdea: "1 objeção comum + a resposta certa em 2 frases", ctaOrAction: "Ler o artigo completo" },
  { date: "2026-09-03", phase: "semana-2", pillar: "gestao", channels: ["li-artigo"], format: "Artigo LinkedIn", theme: "Sua empresa fatura mais, mas o lucro não acompanha: entenda por quê", sourceLabel: "Adaptação de blog post", copyIdea: "Tema financeiro denso, formato mais longo cabe melhor no LinkedIn", ctaOrAction: "Ler o artigo completo" },
  { date: "2026-09-04", phase: "semana-2", pillar: "lideranca", channels: ["ig-feed", "facebook", "li-post"], format: "Carrossel", theme: "Como sair do operacional: o caminho prático para o dono deixar de ser o gargalo", sourceLabel: "Blog + material \"Mapa de Saída do Operacional\"", copyIdea: "O sintoma (dono no centro de tudo) antes da solução", ctaOrAction: "Baixar o mapa" },
  { date: "2026-09-05", phase: "semana-2", pillar: "gestao", channels: ["yt-video"], format: "Vídeo longo (4-6 min)", theme: "Como fazer o Diagnóstico de Maturidade Empresarial gratuito, tutorial completo", sourceLabel: "Gravação de tela + fala do Thiago", copyIdea: "Passo a passo do início ao resultado, sem cortes de venda no meio", ctaOrAction: "Fazer o diagnóstico grátis" },

  // Semana 3
  { date: "2026-09-07", phase: "semana-3", pillar: "gestao", channels: ["ig-feed", "facebook", "li-post"], format: "Carrossel", theme: "Fluxo de caixa: como projetar 90 dias à frente e nunca mais ser pego de surpresa", sourceLabel: "Blog + material \"Projeção de Fluxo de Caixa em 90 Dias\"", copyIdea: "O medo real (surpresa no caixa) antes do método", ctaOrAction: "Baixar a planilha grátis" },
  { date: "2026-09-09", phase: "semana-3", pillar: "vendas", channels: ["ig-reels", "yt-shorts", "ig-stories"], format: "Vertical, 20-30s", theme: "Como calcular e reduzir o Custo de Aquisição de Cliente (CAC) na prática", sourceLabel: "Blog + material \"Calculadora de CAC e LTV\"", copyIdea: "A conta que a maioria dos donos nunca fez, em 3 números", ctaOrAction: "Baixar a calculadora" },
  { date: "2026-09-10", phase: "semana-3", pillar: "lideranca", channels: ["li-artigo"], format: "Artigo LinkedIn", theme: "Cultura organizacional na PME: como formalizar sem virar manual que ninguém lê", sourceLabel: "Adaptação de blog post", copyIdea: "Contraponto direto ao \"manual engavetado\", tom de mentor", ctaOrAction: "Ler o artigo completo" },
  { date: "2026-09-11", phase: "semana-3", pillar: "lideranca", channels: ["ig-feed", "facebook", "li-post"], format: "Carrossel", theme: "Delegar sem perder qualidade: o método para transferir tarefas com segurança", sourceLabel: "Blog", copyIdea: "O medo de delegar nomeado, depois o método em 3 passos", ctaOrAction: "Ler o artigo completo" },

  // Semana 4
  { date: "2026-09-14", phase: "semana-4", pillar: "gestao", channels: ["ig-feed", "facebook", "li-post"], format: "Carrossel", theme: "ERP vale a pena para a minha PME? Guia de decisão por maturidade", sourceLabel: "Blog", copyIdea: "Pergunta que todo dono já se fez, resposta é \"depende do estágio\", não \"sim/não\"", ctaOrAction: "Ler o artigo completo" },
  { date: "2026-09-16", phase: "semana-4", pillar: "vendas", channels: ["ig-reels", "yt-shorts", "ig-stories"], format: "Vertical, 20-30s", theme: "Playbook de vendas: como criar um script que a equipe realmente usa", sourceLabel: "Blog + material correspondente", copyIdea: "O erro mais comum de playbook engessado, em tom direto", ctaOrAction: "Baixar o material grátis" },
  { date: "2026-09-17", phase: "semana-4", pillar: "lideranca", channels: ["li-artigo"], format: "Artigo LinkedIn", theme: "Como liderar em momentos de crise financeira sem gerar pânico na equipe", sourceLabel: "Adaptação de blog post", copyIdea: "Tom de mentor, experiência real do Thiago como pano de fundo", ctaOrAction: "Ler o artigo completo" },
  { date: "2026-09-18", phase: "semana-4", pillar: "lideranca", channels: ["ig-feed", "facebook", "li-post"], format: "Carrossel", theme: "Como formar um braço direito (ou sucessor) sem perder o controle da empresa", sourceLabel: "Blog", copyIdea: "Fecha o ciclo do mês: do \"faço tudo sozinho\" ao \"tenho time\"", ctaOrAction: "Ler o artigo completo" },
  { date: "2026-09-19", phase: "semana-4", pillar: "lancamento", channels: ["yt-video"], format: "Vídeo longo (3-5 min)", theme: "O que dizem os clientes sobre o método Gestão 360", sourceLabel: "Compilação dos 3 depoimentos em vídeo já existentes", copyIdea: "Corta os 3 depoimentos existentes num único vídeo, sem produção nova", ctaOrAction: "Conhecer o método" },
];

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Rota de carga — bloqueada no runtime de produção." }, { status: 403 });
  }

  const payload = await getPayloadClient();
  const results: Array<{ theme: string; action: string }> = [];

  for (const entry of ENTRIES) {
    const existing = await payload.find({
      collection: "content-calendar",
      where: { theme: { equals: entry.theme } },
      limit: 1,
      depth: 0,
    });
    if (existing.docs[0]) {
      results.push({ theme: entry.theme, action: "already-exists" });
      continue;
    }
    await payload.create({ collection: "content-calendar", data: { ...entry, status: "planejado" } });
    results.push({ theme: entry.theme, action: "created" });
  }

  return NextResponse.json({ ok: true, count: ENTRIES.length, results });
}
