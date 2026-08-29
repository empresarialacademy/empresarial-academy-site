/**
 * Configuração central da marca e do site.
 * Fonte da verdade: "Branding Empresarial Academy v2 (2026).md" (posicionamento
 * aprovado em 03/07/2026: consultoria/mentoria à frente, Gestão 360 como
 * metodologia proprietária).
 */
export const siteConfig = {
  name: "Empresarial Academy",
  shortName: "Empresarial Academy",
  slogan: "Conhecimento que Impulsiona",
  tagline: "Método para crescer. Gestão para permanecer.",
  description:
    "Consultoria, mentoria e formação em gestão para pequenas e médias empresas. Metodologia proprietária Gestão 360: método para crescer, gestão para permanecer.",
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
  /** Exposto no rodapé (item 15 do checklist da LP, 04/08/2026) — existência
   * formal é diferencial gratuito contra concorrentes sem identificação. */
  cnpj: "52.281.916/0001-60",
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

/** Itens do mega menu de Serviços (ordem = hierarquia oficial do branding v2 §2). */
export const servicosMenu = [
  {
    icon: "chart",
    title: "Consultoria Empresarial",
    desc: "Diagnóstico, plano de ação e implementação com foco em indicadores.",
    href: "/servicos/consultoria",
  },
  {
    icon: "users",
    title: "Mentorias Estratégicas",
    desc: "Direcionamento personalizado para crescer com consistência.",
    href: "/servicos/mentorias",
  },
  {
    icon: "mic",
    title: "Palestras Inspiradoras",
    desc: "Conteúdo de alto impacto para equipes e eventos.",
    href: "/servicos/palestras",
  },
  {
    icon: "target",
    title: "Curso Gestão 360",
    desc: "A metodologia completa, em formato de curso, para aplicar com autonomia.",
    href: "/servicos/curso-gestao-360",
  },
  {
    icon: "book",
    title: "Livro Gestão 360",
    desc: "A metodologia em profundidade, para consulta permanente.",
    href: "/livro-gestao-360",
  },
] as const;

/** Links legais (rodapé). */
export const legalNav = [
  { label: "Política de Privacidade", href: "/privacidade" },
  { label: "Termos de Uso", href: "/termos" },
  { label: "Exclusão de Dados", href: "/exclusao-de-dados" },
] as const;
