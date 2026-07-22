/**
 * Conteúdo institucional (fonte da verdade: site atual + branding mestre).
 * Centralizado para reuso entre páginas e futura migração para CMS.
 */

export const missao =
  "Transformar empresários e gestores em líderes estratégicos, oferecendo conhecimento prático e aplicável em gestão, vendas e liderança — com ferramentas e metodologias que constroem empresas sólidas, lucrativas e com impacto positivo.";

export const visao =
  "Ser reconhecida até 2030 como a principal referência em desenvolvimento empresarial no Brasil, capacitando no mínimo 10.000 empresários e gestores a atingirem crescimento sustentável, melhor gestão e aumento de faturamento.";

export const valores = [
  {
    titulo: "Mentalidade de Dono",
    desc: "Agimos com responsabilidade, autonomia e compromisso, como se cada desafio fosse nosso próprio negócio.",
  },
  {
    titulo: "Experiência Memorável",
    desc: "Foco total no cliente: encantar e superar expectativas, entregando conhecimento que realmente transforma.",
  },
  {
    titulo: "Fome de Crescimento",
    desc: "Nunca paramos de aprender e evoluir — o sucesso vem da busca constante por desenvolvimento.",
  },
  {
    titulo: "Evolução Contínua",
    desc: "Melhoramos a cada dia, aprimorando processos, estratégias e conteúdo para gerar mais impacto.",
  },
  {
    titulo: "Compromisso e Integridade",
    desc: "Construímos relações sólidas com base na lealdade, transparência e respeito.",
  },
] as const;

export const diferenciais = [
  "Conteúdo prático e direto ao ponto",
  "Ferramentas aplicáveis no dia a dia",
  "Metodologia validada e comprovada",
  "Foco absoluto em geração de resultados",
] as const;

/** Os 6 pilares do Curso Gestão 360. */
export const pilares = [
  {
    n: "01",
    icon: "🎯",
    titulo: "Fluxo de Alta Performance",
    desc: "Organiza a rotina, a liderança e a execução para eliminar o caos operacional e aumentar a produtividade.",
  },
  {
    n: "02",
    icon: "🏗️",
    titulo: "Arquitetura do Crescimento",
    desc: "Estrutura a empresa com propósito, estratégia e um modelo de crescimento sustentável.",
  },
  {
    n: "03",
    icon: "🧭",
    titulo: "Objetivos Estratégicos",
    desc: "Transforma a visão em metas, indicadores e processos claros para direcionar resultados.",
  },
  {
    n: "04",
    icon: "📈",
    titulo: "Métricas de Sucesso",
    desc: "Garante decisões inteligentes por meio de indicadores, desempenho e controle financeiro.",
  },
  {
    n: "05",
    icon: "🛠️",
    titulo: "Gestão de Desafios",
    desc: "Prepara o empresário para lidar com pessoas, pressão, conflitos e os desafios do crescimento.",
  },
  {
    n: "06",
    icon: "🚀",
    titulo: "Evolução Constante",
    desc: "Mantém a empresa competitiva com inovação, marketing, expansão e visão de futuro.",
  },
] as const;

export const fundador = {
  nome: "Thiago Marchi",
  cargo: "Fundador da Empresarial Academy",
  frase:
    "Meu propósito é, por meio da minha experiência, desenvolver e capacitar líderes para o sucesso.",
  bio: [
    "Com mais de 20 anos de experiência em cargos de liderança estratégica e 8 anos como empresário, Thiago Marchi construiu sua carreira impulsionando o crescimento de empresas por meio da gestão estruturada, foco em vendas e liderança de alta performance.",
    "Especialista em gerar lucro, organizar processos e desenvolver equipes de resultado, atuou diretamente na transformação de operações comerciais, estratégias de marketing e construção de culturas empresariais sólidas — de grandes corporações a pequenas empresas.",
  ],
} as const;

/** Conteúdo das páginas de serviço (briefing "Estrutura do site"). */
export type ServicoDetalhe = {
  slug: string;
  metaTitle: string;
  metaDescription: string;
  hero: string;
  subtitle: string;
  intro: string;
  bullets: readonly string[];
  ctaLabel: string;
  faq: readonly { q: string; a: string }[];
  image?: string;
};

export const servicosDetalhe: Record<string, ServicoDetalhe> = {
  mentorias: {
    slug: "mentorias",
    metaTitle: "Mentorias Estratégicas",
    metaDescription:
      "Mentoria empresarial individual com Thiago Marchi: diagnóstico, plano de ação e acompanhamento direto em vendas, liderança, processos, cultura e finanças.",
    hero: "Mentoria empresarial com Thiago Marchi",
    subtitle: "Direção estratégica e personalizada para o seu momento.",
    image: "/images/banner-mentorias.jpg",
    intro:
      "Uma jornada individual com Thiago Marchi, para empresários e gestores que querem tomar decisões com mais clareza, segurança e planejamento estratégico — destravando o crescimento do negócio.",
    bullets: [
      "Diagnóstico do seu negócio",
      "Acompanhamento direto, com orientações práticas",
      "Planos de ação personalizados para a sua realidade",
      "Foco em resultado: gestão, cultura, vendas e liderança",
    ],
    ctaLabel: "Agendar sessão estratégica",
    faq: [
      {
        q: "Como funciona a mentoria?",
        a: "É uma jornada individual com encontros estratégicos: diagnóstico do negócio, plano de ação personalizado e acompanhamento direto para implementar as melhorias.",
      },
      {
        q: "A mentoria é online ou presencial?",
        a: "Pode ser nas duas modalidades, conforme a sua necessidade e localização.",
      },
      {
        q: "Para quem é indicada?",
        a: "Para empresários e gestores de pequenas e médias empresas que querem resolver problemas reais e alcançar metas mais rápido.",
      },
    ],
  },
  palestras: {
    slug: "palestras",
    metaTitle: "Palestras Inspiradoras",
    metaDescription:
      "Palestras de alto impacto sobre liderança, vendas, gestão estratégica, cultura organizacional e crescimento — presenciais ou online, com Thiago Marchi.",
    hero: "Palestras que transformam e inspiram",
    subtitle: "Conhecimento de alto nível com linguagem prática e inspiradora.",
    image: "/images/banner-palestras.jpg",
    intro:
      "Leve para o seu evento ou empresa uma palestra impactante sobre liderança, vendas, gestão estratégica, cultura organizacional e crescimento empresarial — com insights valiosos e aplicáveis.",
    bullets: [
      "Palestras presenciais ou online",
      "Conteúdo personalizado de acordo com o público",
      "Experiência envolvente, com insights aplicáveis",
      "Foco em motivar equipes e fortalecer a cultura",
    ],
    ctaLabel: "Levar essa palestra para meu time",
    faq: [
      {
        q: "Quais temas são abordados?",
        a: "Liderança, vendas, gestão estratégica, cultura organizacional, performance e crescimento empresarial — adaptados ao seu público.",
      },
      {
        q: "As palestras são presenciais ou online?",
        a: "Ambas. O formato é definido conforme o evento e o objetivo da sua equipe.",
      },
    ],
  },
  consultoria: {
    slug: "consultoria",
    metaTitle: "Consultoria",
    metaDescription:
      "Consultoria empresarial com foco em resultado: diagnóstico, reestruturação de processos e estratégias comerciais, com geração de indicadores (KPIs).",
    hero: "Consultoria com a mão na massa e foco em resultado",
    subtitle: "Análise, proposta e implementação de soluções reais no seu negócio.",
    intro:
      "Para empresas que desejam uma atuação próxima e intensiva. Analisamos, propomos e implementamos soluções reais que geram lucro, eficiência e estrutura — com indicadores e cultura de performance.",
    bullets: [
      "Diagnóstico completo do negócio",
      "Estratégias práticas sob medida",
      "Reestruturação de processos e estratégias comerciais",
      "Geração de indicadores (KPIs) e acompanhamento próximo",
      "Resultados mensuráveis",
    ],
    ctaLabel: "Falar sobre uma consultoria",
    faq: [
      {
        q: "Como começa a consultoria?",
        a: "Começa por um diagnóstico do negócio, que orienta um plano de ação com priorização por impacto e indicadores claros.",
      },
      {
        q: "A consultoria é presencial?",
        a: "Atuamos de forma próxima, presencial ou remota, com alinhamento direto com líderes e times.",
      },
    ],
  },
};

/** Os 5 banners do carrossel da Home (briefing "Estrutura do site"). */
export const heroSlides = [
  {
    eyebrow: "Conhecimento que Impulsiona",
    title: "Impulsione seu negócio com conhecimento de quem faz na prática",
    subtitle:
      "Soluções completas de desenvolvimento empresarial: Curso Gestão 360, mentorias personalizadas, palestras inspiradoras e o livro que vai mudar sua forma de liderar.",
    ctaLabel: "Descubra como transformar sua empresa",
    ctaHref: "/servicos",
  },
  {
    eyebrow: "Curso Gestão 360",
    title: "Transforme seu negócio em uma máquina de resultados",
    subtitle:
      "A metodologia prática para organizar processos, multiplicar lucros e liderar com mais clareza. Ideal para otimizar a gestão, engajar equipes e crescer com inteligência.",
    ctaLabel: "Conhecer o curso",
    ctaHref: "/servicos/curso-gestao-360",
  },
  {
    eyebrow: "Mentorias Estratégicas",
    title: "Mentoria empresarial com Thiago Marchi",
    subtitle:
      "Orientação personalizada para empresários e gestores que querem resolver problemas reais e alcançar metas mais rápido — foco em vendas, liderança, processos, cultura e finanças.",
    ctaLabel: "Agendar sessão estratégica",
    ctaHref: "/servicos/mentorias",
  },
  {
    eyebrow: "Palestras Inspiradoras",
    title: "Leve inspiração, estratégia e ação para seus eventos",
    subtitle:
      "Conteúdo de impacto para motivar equipes, fortalecer a cultura organizacional e gerar insights poderosos sobre performance e gestão.",
    ctaLabel: "Levar essa palestra para meu time",
    ctaHref: "/servicos/palestras",
  },
  {
    eyebrow: "Livro Gestão 360",
    title: "O livro que transforma a mentalidade dos empresários",
    subtitle:
      "Aprendizados reais de quem viveu os desafios da liderança e construiu negócios lucrativos com propósito. Leitura leve, prática e provocativa, com aplicação imediata.",
    ctaLabel: "Saber mais sobre o livro",
    ctaHref: "/livro-gestao-360",
  },
] as const;

/** Módulos do Curso Gestão 360 (fonte: briefing "Estrutura do site"). */
export const cursoModulos = [
  "Planejamento Estratégico e OKRs",
  "Estruturação Comercial e Funil de Vendas",
  "Gestão de Pessoas e Liderança de Equipes",
  "Marketing Estratégico e Posicionamento Digital",
  "Experiência do Cliente e Fidelização",
  "Processos, Eficiência Operacional e Qualidade",
  "Finanças para Empresários (Controle, Custo, Preço e Lucro)",
  "Indicadores de Desempenho e Gestão à Vista",
  "Cultura Organizacional e Comunicação Interna",
  "Estratégias de Expansão e Escalabilidade",
] as const;

/** Técnicas e ferramentas do Curso Gestão 360. */
export const cursoFerramentas = [
  "Canvas Estratégico do Negócio",
  "Análise SWOT aplicada à sua empresa",
  "Fluxo de Trabalho e Matriz de Responsabilidade",
  "Jornada do Cliente e Mapas de Experiência",
  "Matriz BCG para produtos e serviços",
  "Liderança Situacional e Comunicação Assertiva",
  "Construção de KPIs com painéis de gestão",
  "Melhoria Contínua (PDCA, 5W2H)",
  "Precificação e análise de lucratividade",
  "Modelos de Expansão e Escalabilidade",
] as const;

export const cursoBeneficios = [
  "Aplicação imediata dos conceitos",
  "Metodologia validada no mercado",
  "Aulas dinâmicas e práticas",
  "Acompanhamento estratégico e ferramentas exclusivas",
  "100% online, com acesso flexível e certificação",
] as const;

/** Conquistas do fundador (briefing "Estrutura do site"). */
export const fundadorConquistas = [
  "Desenvolveu e escalou operações comerciais com foco em lucratividade",
  "Implementou estratégias de marketing inbound e outbound orientadas à conversão",
  "Estruturou processos de gestão e vendas com base em indicadores (KPIs)",
  "Capacitou líderes e gestores para assumir o controle dos seus resultados",
  "Criou e consolidou culturas empresariais voltadas para performance e propósito",
] as const;

/** Por que confiar na Empresarial Academy (briefing). */
export const porqueConfiar = [
  {
    icon: "💼",
    titulo: "Experiência real de quem já esteve na prática",
    desc: "Fundada por Thiago Marchi, com mais de 20 anos em liderança e 8 como empresário, atuando no desenvolvimento de empresas de diferentes segmentos.",
  },
  {
    icon: "📈",
    titulo: "Métodos testados e aplicáveis",
    desc: "Tudo o que ensinamos é baseado em experiências reais, com estratégias que funcionam no dia a dia e geram resultado.",
  },
  {
    icon: "🛠️",
    titulo: "Conteúdo prático, direto ao ponto",
    desc: "Nada de teorias inalcançáveis — ferramentas, materiais e treinamentos que você aplica hoje mesmo no seu negócio.",
  },
  {
    icon: "🎯",
    titulo: "Foco em resultado, lucro e autonomia",
    desc: "Nosso compromisso é dar a você mais domínio sobre a empresa, com estrutura, clareza e crescimento sustentável.",
  },
  {
    icon: "🧠",
    titulo: "Formação de líderes de verdade",
    desc: "Mais do que técnicas, entregamos conhecimento que transforma a mentalidade e a postura do empresário.",
  },
] as const;

export const faq = [
  {
    q: "Para quem é a Empresarial Academy?",
    a: "Para empresários, gestores e líderes de pequenas e médias empresas que querem organizar a gestão, aumentar lucros e crescer com método.",
  },
  {
    q: "Como funciona a avaliação gratuita?",
    a: "Você responde online o Diagnóstico de Maturidade Empresarial: 24 perguntas sobre Comercial, Operações, Indicadores e Liderança. O resultado sai na hora, com pontuação por pilar e um plano de melhoria com ações, indicadores e prazos sugeridos — sem custo e sem compromisso.",
  },
  {
    q: "Vocês atendem presencialmente ou online?",
    a: "Atendemos nas duas modalidades. Mentorias e consultorias podem ser online ou presenciais, conforme a necessidade do seu negócio.",
  },
  {
    q: "O Curso Gestão 360 já está disponível?",
    a: "O Curso e o Livro Gestão 360 estão em fase de lançamento. Entre em contato para entrar na lista de prioridade.",
  },
] as const;
