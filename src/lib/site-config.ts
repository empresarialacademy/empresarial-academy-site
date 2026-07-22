/**
 * Configuração central da marca e do site.
 * Fonte da verdade: "Branding Empresarial Academy.md" + conteúdo real do site atual.
 * Valores confirmados pelo cliente (Thiago Marchi) em 26/06/2026.
 */
export const siteConfig = {
  name: "Empresarial Academy",
  shortName: "Empresarial Academy",
  slogan: "Conhecimento que Impulsiona",
  description:
    "Educação corporativa, consultoria e mentoria de negócios. Transformamos empresários e gestores em líderes de alto desempenho — com método, ferramentas e foco em resultado.",
  // Ajustar quando o domínio oficial for definido (Fase 2, item 1).
  url: "https://empresarialacademy.com",
  locale: "pt-BR",
  founder: "Thiago Marchi",
  contact: {
    email: "contato@empresarialacademy.com",
    phone: "+55 (11) 93340-0264",
    phoneRaw: "5511933400264",
    address: "São Paulo - SP, Brasil",
    whatsappMessage: "Olá! Vim pelo site e gostaria de saber mais sobre a Empresarial Academy.",
  },
  social: {
    instagram: "https://www.instagram.com/empresarial.academy",
    linkedin: "https://www.linkedin.com/company/empresarial-academy",
    facebook: "https://web.facebook.com/profile.php?id=61575032293629",
    youtube: "https://www.youtube.com/@EmpresarialAcademy",
    linktree: "https://linktr.ee/empresarialacademy",
  },
  youtubeChannelId: "UCMwl07dy4cRIkPM6EB53FOg",
} as const;

export const mainNav = [
  { label: "Início", href: "/" },
  { label: "Institucional", href: "/institucional" },
  { label: "Serviços", href: "/servicos" },
  { label: "Materiais Gratuitos", href: "/materiais" },
  { label: "Blog", href: "/blog" },
  { label: "Contato", href: "/contato" },
] as const;

/** Itens do mega menu de Serviços. */
export const servicosMenu = [
  {
    icon: "🎯",
    title: "Curso Gestão 360",
    desc: "6 pilares para transformar sua empresa em uma máquina de resultados.",
    href: "/servicos/curso-gestao-360",
  },
  {
    icon: "👥",
    title: "Mentorias Estratégicas",
    desc: "Direcionamento personalizado para crescer com consistência.",
    href: "/servicos/mentorias",
  },
  {
    icon: "🎤",
    title: "Palestras Inspiradoras",
    desc: "Conteúdo de alto impacto para equipes e eventos.",
    href: "/servicos/palestras",
  },
  {
    icon: "📊",
    title: "Consultoria",
    desc: "Diagnóstico e plano de ação com foco em indicadores.",
    href: "/servicos/consultoria",
  },
  {
    icon: "📘",
    title: "Livro Gestão 360",
    desc: "Conhecimento em prática e planejamento em resultado.",
    href: "/livro-gestao-360",
  },
] as const;

/** Links legais (rodapé). */
export const legalNav = [
  { label: "Política de Privacidade", href: "/privacidade" },
  { label: "Termos de Uso", href: "/termos" },
] as const;
