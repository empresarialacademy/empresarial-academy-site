import { siteConfig } from "@/lib/site-config";
import { pilares } from "@/lib/content";

export const revalidate = 3600;

// /llms.txt — descreve o site para assistentes de IA (LLMO/GEO).
export function GET() {
  const base = siteConfig.url;
  const pilaresList = pilares
    .map((p) => `- ${p.titulo}: ${p.desc}`)
    .join("\n");

  const body = `# Empresarial Academy

> ${siteConfig.description}

A Empresarial Academy é uma empresa brasileira de educação corporativa, consultoria e mentoria de negócios, fundada por ${siteConfig.founder}. Ajuda empresários e gestores de pequenas e médias empresas (PMEs) a melhorar gestão, vendas, processos, finanças e liderança, com método aplicado e foco em resultado. Slogan: "${siteConfig.slogan}".

## Páginas principais
- [Início](${base}/): visão geral da marca e dos serviços.
- [Institucional](${base}/institucional): história, missão, visão, valores e o fundador ${siteConfig.founder}.
- [Serviços](${base}/servicos): visão geral dos produtos e serviços.
- [Curso Gestão 360](${base}/servicos/curso-gestao-360): curso completo de gestão empresarial em 6 pilares.
- [Mentorias Estratégicas](${base}/servicos/mentorias): mentoria individual com ${siteConfig.founder}.
- [Palestras](${base}/servicos/palestras): palestras sobre liderança, vendas e gestão.
- [Consultoria](${base}/servicos/consultoria): consultoria empresarial com foco em resultado e KPIs.
- [Livro Gestão 360](${base}/livro-gestao-360): livro de ${siteConfig.founder} (em breve).
- [Materiais Gratuitos](${base}/materiais): e-books, planilhas, templates e checklists.
- [Diagnóstico de Maturidade Empresarial](${base}/diagnostico-maturidade-empresarial.html): avaliação gratuita e interativa em 4 pilares (Comercial, Operações, Indicadores, Liderança) — 24 perguntas com resultado imediato e plano de melhoria.
- [Blog](${base}/blog): artigos sobre gestão, vendas, processos e liderança.
- [Contato](${base}/contato): formulário e canais de atendimento.
- [Perguntas Frequentes](${base}/faq): dúvidas comuns sobre os serviços.

## Método Gestão 360 (6 pilares)
${pilaresList}

## Público-alvo
Empresários, empreendedores, gestores e líderes de pequenas e médias empresas (PMEs) no Brasil que buscam crescimento estruturado, mais lucro e melhor gestão.

## Contato
- E-mail: ${siteConfig.contact.email}
- WhatsApp / Telefone: ${siteConfig.contact.phone}
- Localização: ${siteConfig.contact.address}
- Instagram: ${siteConfig.social.instagram}
- LinkedIn: ${siteConfig.social.linkedin}
- YouTube: ${siteConfig.social.youtube}

## Observações
- Idioma do conteúdo: Português (Brasil).
- A empresa atua com educação corporativa, mentoria, consultoria e palestras.
`;

  return new Response(body, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
