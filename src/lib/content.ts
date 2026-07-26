/**
 * Conteúdo institucional (fonte da verdade: site atual + branding mestre).
 * Centralizado para reuso entre páginas e futura migração para CMS.
 */
import type { IconName } from "@/components/ui/Icon";

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

/** Os 6 pilares da metodologia Gestão 360. */
export const pilares = [
  {
    n: "01",
    icon: "target",
    titulo: "Fluxo de Alta Performance",
    desc: "Organiza a rotina, a liderança e a execução para eliminar o caos operacional e aumentar a produtividade.",
  },
  {
    n: "02",
    icon: "building",
    titulo: "Arquitetura do Crescimento",
    desc: "Estrutura a empresa com propósito, estratégia e um modelo de crescimento sustentável.",
  },
  {
    n: "03",
    icon: "compass",
    titulo: "Objetivos Estratégicos",
    desc: "Transforma a visão em metas, indicadores e processos claros para direcionar resultados.",
  },
  {
    n: "04",
    icon: "trending-up",
    titulo: "Métricas de Sucesso",
    desc: "Garante decisões inteligentes por meio de indicadores, desempenho e controle financeiro.",
  },
  {
    n: "05",
    icon: "tools",
    titulo: "Gestão de Desafios",
    desc: "Prepara o empresário para lidar com pessoas, pressão, conflitos e os desafios do crescimento.",
  },
  {
    n: "06",
    icon: "rocket",
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
    "Com mais de 20 anos de experiência em cargos de liderança estratégica e 15 anos como empresário, Thiago Marchi construiu sua carreira impulsionando o crescimento de empresas por meio da gestão estruturada, foco em vendas e liderança de alta performance.",
    "Especialista em gerar lucro, organizar processos e desenvolver equipes de resultado, atuou diretamente na transformação de operações comerciais, estratégias de marketing e construção de culturas empresariais sólidas — de grandes corporações a pequenas empresas.",
  ],
} as const;

/**
 * Bloco de tecnologia e IA no institucional. Posicionamento definido com o
 * Thiago em 2026-07-26: é DIFERENCIAL de como trabalhamos, não um serviço
 * vendido à parte — por isso vive aqui e dentro dos serviços, sem página
 * própria nem CTA de venda separado.
 */
export const tecnologiaIA = {
  titulo: "Tecnologia e inteligência artificial a serviço do resultado",
  paragrafos: [
    "Thiago Marchi acompanha de perto a evolução da inteligência artificial aplicada aos negócios e traz isso para dentro da gestão: não como novidade de vitrine, mas como ferramenta para resolver problema real de operação.",
    "Na prática, isso significa desenvolver sistemas personalizados para a realidade de cada empresa e automatizar processos que hoje consomem tempo da equipe. O alvo mais frequente é o ruído de comunicação entre departamentos — o retrabalho que nasce quando uma informação se perde entre uma área e outra.",
    "O resultado esperado é direto: tempo operacional devolvido ao time, mais qualidade na entrega, menos falha entre as pontas e clientes mais bem atendidos.",
  ],
} as const;

/**
 * Jornada do Curso Gestão 360. Fica fora de `servicosDetalhe` porque o curso
 * tem página própria (não usa o `ServiceDetail`), mas reaproveita o mesmo
 * `ProcessFlow` das demais páginas de serviço para manter o padrão visual.
 * O curso é um produto ONLINE empacotado — a jornada é de aprendizado e
 * aplicação, não de entrega presencial.
 */
export const cursoJornada: MetodoServico = {
  titulo: "Como funciona a sua jornada no curso",
  subtitulo:
    "Um pacote completo, feito para ser assistido no seu ritmo e aplicado na sua empresa enquanto você avança. Cada módulo termina com algo implantado, não com uma prova.",
  ligacaoGestao360:
    "A trilha percorre os 6 pilares na ordem em que eles se sustentam: primeiro organizar a operação e a estrutura, depois definir objetivos e métricas, e só então lidar com os desafios do crescimento e a evolução constante. Pular etapa é o erro que faz a maioria das empresas travar.",
  trilhas: [
    {
      etapas: [
        {
          n: "01",
          titulo: "Diagnóstico de maturidade",
          desc: "Antes do primeiro módulo você descobre em que estágio a sua empresa está e quais pilares merecem atenção primeiro — para não gastar energia no lugar errado.",
          icon: "compass",
        },
        {
          n: "02",
          titulo: "Trilha pelos 6 pilares",
          desc: "O conteúdo segue a sequência lógica do método, disponível online para assistir quando e quantas vezes quiser, sem depender de agenda.",
          icon: "book",
        },
        {
          n: "03",
          titulo: "Ferramentas prontas para usar",
          desc: "Cada pilar vem com planilhas, checklists e modelos preenchíveis. Você não sai com anotações: sai com o instrumento montado.",
          icon: "tools",
        },
        {
          n: "04",
          titulo: "Aplicação no seu negócio",
          desc: "Ao fim de cada módulo há uma implantação prevista na sua empresa. O aprendizado acontece fazendo, sobre a sua realidade.",
          icon: "briefcase",
        },
        {
          n: "05",
          titulo: "Indicadores e evolução",
          desc: "Você define os indicadores que mostram o que mudou de fato e passa a acompanhar a empresa por dado, não por percepção.",
          icon: "trending-up",
        },
      ],
    },
  ],
};

/** Uma etapa do método de trabalho, exibida no fluxograma do serviço. */
export type EtapaMetodo = {
  n: string;
  titulo: string;
  desc: string;
  icon: IconName;
};

/**
 * Uma trilha do método. Um serviço com uma única trilha vira um fluxo linear;
 * com duas ou mais, o `ProcessFlow` desenha a bifurcação (caso de Palestras:
 * "do escopo" vs. "personalizada").
 */
export type TrilhaMetodo = {
  rotulo?: string;
  descricao?: string;
  etapas: readonly EtapaMetodo[];
};

export type MetodoServico = {
  titulo: string;
  subtitulo?: string;
  trilhas: readonly TrilhaMetodo[];
  /** Como este serviço aplica os 6 pilares do Gestão 360. */
  ligacaoGestao360?: string;
};

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
  /** Vídeo do banner (autoplay mudo em loop, dentro do card do PageHero). */
  video?: string;
  /** Método de trabalho + fluxograma. Sem isso, a seção não é renderizada. */
  metodo?: MetodoServico;
  /** Temas disponíveis (usado em Palestras). */
  temas?: readonly { titulo: string; desc: string }[];
  /**
   * Bloco de tecnologia/IA como diferencial transversal — aparece nos serviços
   * em que ela muda a entrega (consultoria, mentoria), não como serviço à parte.
   */
  diferencialIA?: { titulo: string; desc: string };
};

export const servicosDetalhe: Record<string, ServicoDetalhe> = {
  mentorias: {
    slug: "mentorias",
    metaTitle: "Mentorias Estratégicas",
    metaDescription:
      "Mentoria empresarial individual com Thiago Marchi: diagnóstico, plano de ação e acompanhamento direto em vendas, liderança, processos, cultura e finanças.",
    hero: "Mentoria empresarial com Thiago Marchi",
    subtitle: "Direção estratégica e personalizada para o seu momento.",
    image: "/images/mentoria-executiva.jpg",
    intro:
      "Uma jornada individual com Thiago Marchi, para empresários e gestores que querem tomar decisões com mais clareza, segurança e planejamento estratégico — destravando o crescimento do negócio.",
    bullets: [
      "Diagnóstico do seu negócio",
      "Acompanhamento direto, com orientações práticas",
      "Planos de ação personalizados para a sua realidade",
      "Foco em resultado: gestão, cultura, vendas e liderança",
    ],
    ctaLabel: "Agendar sessão estratégica",
    metodo: {
      titulo: "Como conduzimos a mentoria",
      subtitulo:
        "Trabalho personalizado: parte do seu momento como empresário e do momento da empresa. Não existe programa de prateleira, porque a trava de cada negócio é diferente.",
      ligacaoGestao360:
        "Os 6 pilares do Gestão 360 servem de mapa para escolher onde focar. O diagnóstico mostra em quais pilares está o gargalo hoje, e o plano de desenvolvimento ataca esses pilares na ordem que faz diferença para o seu resultado.",
      trilhas: [
        {
          etapas: [
            {
              n: "01",
              titulo: "Momento profissional e da empresa",
              desc: "Entendemos onde você está como gestor e onde a empresa está — dois estágios que nem sempre andam juntos e que precisam ser tratados em conjunto.",
              icon: "compass",
            },
            {
              n: "02",
              titulo: "Diagnóstico da necessidade real",
              desc: "Separamos o problema declarado do problema de fato. Aqui ficam claros os objetivos e as dificuldades que travam o crescimento hoje.",
              icon: "target",
            },
            {
              n: "03",
              titulo: "Plano de desenvolvimento",
              desc: "Definimos os temas a trabalhar, combinando competências técnicas (indicadores, finanças, processos, vendas) e comportamentais (liderança, delegação, comunicação, decisão sob pressão).",
              icon: "book",
            },
            {
              n: "04",
              titulo: "Encontros de trabalho",
              desc: "Cada encontro trata de decisões reais em curso na sua empresa. Você sai com o que aplicar antes do próximo, não com teoria para arquivar.",
              icon: "users",
            },
            {
              n: "05",
              titulo: "Indicadores de evolução",
              desc: "Definimos o que vai medir o avanço nas duas frentes: os indicadores da empresa e os sinais concretos da sua evolução como líder.",
              icon: "chart",
            },
            {
              n: "06",
              titulo: "Revisão e ajuste do plano",
              desc: "O plano é revisto conforme o resultado aparece. O que já está resolvido sai, o que o crescimento trouxe de novo entra.",
              icon: "rocket",
            },
          ],
        },
      ],
    },
    diferencialIA: {
      titulo: "Inteligência artificial aplicada ao seu negócio",
      desc: "Boa parte dos empresários hoje sabe que precisa usar IA, mas não sabe por onde começar sem desperdiçar dinheiro. Quando faz sentido para o seu momento, esse vira um dos temas do plano: onde a IA e a automação realmente geram ganho na sua operação, o que priorizar primeiro e o que ainda não vale o investimento.",
    },
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
    image: "/images/palestras.jpg",
    intro:
      "Leve para o seu evento ou empresa uma palestra impactante sobre liderança, vendas, gestão estratégica, cultura organizacional e crescimento empresarial — com insights valiosos e aplicáveis.",
    bullets: [
      "Palestras presenciais ou online",
      "Conteúdo personalizado de acordo com o público",
      "Experiência envolvente, com insights aplicáveis",
      "Foco em motivar equipes e fortalecer a cultura",
    ],
    ctaLabel: "Levar essa palestra para meu time",
    metodo: {
      titulo: "Dois caminhos, conforme o seu objetivo",
      subtitulo:
        "Você pode escolher um tema já estruturado do nosso escopo ou uma palestra construída sob medida, a partir do que está acontecendo dentro da sua empresa.",
      ligacaoGestao360:
        "Todos os temas nascem dos 6 pilares do Gestão 360 e do conteúdo que publicamos. A palestra não é um evento isolado: ela abre a conversa que continua em diagnóstico, mentoria ou consultoria, se fizer sentido para a empresa.",
      trilhas: [
        {
          rotulo: "Palestra do nosso escopo",
          descricao: "Tema já estruturado, adaptado ao seu público.",
          etapas: [
            {
              n: "01",
              titulo: "Escolha do tema e alinhamento",
              desc: "Definimos o tema a partir do objetivo do evento e do perfil de quem vai assistir — dono, liderança ou equipe operacional.",
              icon: "target",
            },
            {
              n: "02",
              titulo: "Adaptação ao seu contexto",
              desc: "Os exemplos e casos são ajustados ao setor e ao porte da empresa, para que a plateia se reconheça no que está sendo dito.",
              icon: "tools",
            },
            {
              n: "03",
              titulo: "Entrega",
              desc: "Apresentação presencial ou online, com linguagem direta e conteúdo que a equipe consegue aplicar na semana seguinte.",
              icon: "mic",
            },
          ],
        },
        {
          rotulo: "Palestra personalizada",
          descricao: "Construída a partir do que a sua empresa está vivendo.",
          etapas: [
            {
              n: "01",
              titulo: "Briefing com a liderança",
              desc: "Conversa inicial para entender o objetivo real: o que a empresa quer que mude no comportamento das pessoas depois da palestra.",
              icon: "briefcase",
            },
            {
              n: "02",
              titulo: "Entrevistas com líderes e equipe",
              desc: "Ouvimos quem vive o problema por dentro. É o que separa uma palestra genérica de uma que fala exatamente da dor daquele time.",
              icon: "users",
            },
            {
              n: "03",
              titulo: "Construção sob medida",
              desc: "O conteúdo é montado com a linguagem, os exemplos e os desafios levantados nas entrevistas — inclusive temas específicos que a empresa solicitar.",
              icon: "bulb",
            },
            {
              n: "04",
              titulo: "Entrega",
              desc: "Apresentação presencial ou online, calibrada para o público que participou do levantamento.",
              icon: "mic",
            },
            {
              n: "05",
              titulo: "Devolutiva ao gestor",
              desc: "Depois do evento, você recebe a leitura do que apareceu: percepções, pontos de atenção e o que merece atenção da gestão daqui para frente.",
              icon: "chart",
            },
          ],
        },
      ],
    },
    temas: [
      {
        titulo: "Como sair do operacional",
        desc: "O caminho prático para o dono deixar de ser o gargalo da própria empresa.",
      },
      {
        titulo: "Sua empresa ainda cabe na sua cabeça?",
        desc: "Quando a informalidade para de funcionar e a estrutura precisa existir no papel.",
      },
      {
        titulo: "Fatura mais, lucra menos",
        desc: "Onde a margem vaza enquanto o faturamento cresce — e como enxergar isso a tempo.",
      },
      {
        titulo: "Delegar sem perder qualidade",
        desc: "Como transferir tarefas com segurança, sem virar refém do retrabalho.",
      },
      {
        titulo: "Decidir por indicador, não por achismo",
        desc: "Como montar um painel que a empresa realmente usa na rotina de decisão.",
      },
      {
        titulo: "Cultura que não vira manual de gaveta",
        desc: "Como formalizar a cultura de um jeito que a equipe vive, e não apenas lê.",
      },
      {
        titulo: "IA aplicada à PME: por onde começar",
        desc: "O que a inteligência artificial já resolve em uma empresa pequena e média, o que ainda não vale o investimento e como priorizar sem desperdiçar dinheiro.",
      },
    ],
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
    video: "/videos/consultoria.mp4",
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
    metodo: {
      titulo: "Como trabalhamos na consultoria",
      subtitulo:
        "Um caminho definido, do primeiro diagnóstico até o time operando sozinho. Cada etapa entrega algo concreto — nada de relatório que termina na gaveta.",
      ligacaoGestao360:
        "Cada etapa aplica os pilares do Gestão 360 ao seu caso: o mapeamento organiza o Fluxo de Alta Performance, os gaps expõem onde a Arquitetura do Crescimento não sustenta a operação, e o acompanhamento instala as Métricas de Sucesso que mantêm a decisão baseada em dado, não em achismo.",
      trilhas: [
        {
          etapas: [
            {
              n: "01",
              titulo: "Diagnóstico e imersão",
              desc: "Entramos na operação para entender os números, a rotina e o que de fato acontece no dia a dia — não apenas o que se diz na reunião.",
              icon: "compass",
            },
            {
              n: "02",
              titulo: "Mapeamento dos processos",
              desc: "Registramos como o trabalho acontece hoje, ponta a ponta, incluindo os desvios que viraram hábito e ninguém mais enxerga.",
              icon: "tools",
            },
            {
              n: "03",
              titulo: "Identificação dos gaps",
              desc: "Apontamos onde a empresa perde tempo, margem e qualidade — priorizado por impacto no resultado, para atacar primeiro o que mais pesa.",
              icon: "target",
            },
            {
              n: "04",
              titulo: "Solução desenhada e apresentada",
              desc: "Você recebe um plano com responsáveis, prazos e os indicadores que vão medir cada mudança, definidos antes de começar a executar.",
              icon: "bulb",
            },
            {
              n: "05",
              titulo: "Implantação e treinamento",
              desc: "Executamos junto com o time e capacitamos quem vai tocar o processo, para que o novo padrão sobreviva sem depender de nós.",
              icon: "users",
            },
            {
              n: "06",
              titulo: "Acompanhamento operacional",
              desc: "Acompanhamos os indicadores até a mudança virar rotina. A saída é planejada: o objetivo é a sua equipe autônoma, não um contrato eterno.",
              icon: "trending-up",
            },
          ],
        },
      ],
    },
    diferencialIA: {
      titulo: "Tecnologia e automação como parte da solução",
      desc: "Quando o gargalo é operacional, processo redesenhado no papel não resolve sozinho. Nas etapas de solução e implantação avaliamos onde a tecnologia elimina trabalho manual: sistemas sob medida para a sua operação e automações que removem o ruído de comunicação entre departamentos — aquele retrabalho que nasce de informação que se perde entre uma área e outra. O ganho é tempo operacional devolvido à equipe, com mais qualidade na entrega e menos falha entre as pontas.",
    },
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
      "Consultoria, mentoria e formação em gestão para PMEs — com a metodologia Gestão 360: método para crescer, gestão para permanecer.",
    ctaLabel: "Descubra como transformar sua empresa",
    ctaHref: "/servicos",
    image: "/images/banner-sobre.jpg",
  },
  {
    eyebrow: "Curso Gestão 360",
    title: "Transforme seu negócio em uma máquina de resultados",
    subtitle:
      "A metodologia prática para organizar processos, multiplicar lucros e liderar com mais clareza. Ideal para otimizar a gestão, engajar equipes e crescer com inteligência.",
    ctaLabel: "Conhecer o curso",
    ctaHref: "/servicos/curso-gestao-360",
    image: "/images/curso-gestao-360.jpg",
  },
  {
    eyebrow: "Mentorias Estratégicas",
    title: "Mentoria empresarial com Thiago Marchi",
    subtitle:
      "Orientação personalizada para empresários e gestores que querem resolver problemas reais e alcançar metas mais rápido — foco em vendas, liderança, processos, cultura e finanças.",
    ctaLabel: "Agendar sessão estratégica",
    ctaHref: "/servicos/mentorias",
    image: "/images/mentoria-executiva.jpg",
  },
  {
    eyebrow: "Palestras Inspiradoras",
    title: "Leve inspiração, estratégia e ação para seus eventos",
    subtitle:
      "Conteúdo de impacto para motivar equipes, fortalecer a cultura organizacional e gerar insights poderosos sobre performance e gestão.",
    ctaLabel: "Levar essa palestra para meu time",
    ctaHref: "/servicos/palestras",
    image: "/images/palestras.jpg",
  },
  {
    eyebrow: "Livro Gestão 360",
    title: "O livro que transforma a mentalidade dos empresários",
    subtitle:
      "Aprendizados reais de quem viveu os desafios da liderança e construiu negócios lucrativos com propósito. Leitura leve, prática e provocativa, com aplicação imediata.",
    ctaLabel: "Saber mais sobre o livro",
    ctaHref: "/livro-gestao-360",
    image: "/images/livro-gestao-360.jpg",
    video: "/videos/banner-livro-gestao.mp4",
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
/** Formação acadêmica e certificações do fundador (informadas por ele). */
export const fundadorFormacao = [
  {
    titulo: "MBA em Gerenciamento de Projetos",
    instituicao: "Fundação Getulio Vargas (FGV)",
  },
  {
    titulo: "Graduação em Recursos Humanos",
    instituicao: "Universidade Nove de Julho",
  },
  {
    titulo: "Dupla certificação internacional em Customer Experience",
    instituicao: "Customer Experience Scientist",
  },
  {
    titulo: "Green Belt em Lean Six Sigma",
    instituicao: "Certificação em melhoria de processos e redução de desperdício",
  },
] as const;

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
    icon: "briefcase",
    titulo: "Experiência real de quem já esteve na prática",
    desc: "Fundada por Thiago Marchi, com mais de 20 anos em liderança e 15 como empresário, atuando no desenvolvimento de empresas de diferentes segmentos.",
  },
  {
    icon: "trending-up",
    titulo: "Métodos testados e aplicáveis",
    desc: "Tudo o que ensinamos é baseado em experiências reais, com estratégias que funcionam no dia a dia e geram resultado.",
  },
  {
    icon: "tools",
    titulo: "Conteúdo prático, direto ao ponto",
    desc: "Nada de teorias distantes da prática — ferramentas, materiais e treinamentos que você aplica hoje mesmo no seu negócio.",
  },
  {
    icon: "target",
    titulo: "Foco em resultado, lucro e autonomia",
    desc: "Nosso compromisso é dar a você mais domínio sobre a empresa, com estrutura, clareza e crescimento sustentável.",
  },
  {
    icon: "bulb",
    titulo: "Formação de líderes de verdade",
    desc: "Mais do que técnicas, entregamos conhecimento que transforma a mentalidade e a postura do empresário.",
  },
] as const;

/** Depoimentos em vídeo (prova social), reaproveitados na LP `/consultoria-pme`
 * e em seções "O impacto do nosso método" pelo site. Consentimento por
 * escrito confirmado pelo Thiago em 2026-07-19 — ver Termo de Consentimento
 * na pasta do funil. */
export const depoimentosVideo = {
  fabio: {
    video: "/videos/depoimento-fabio-ramos.mp4",
    poster: "/images/depoimento-fabio-ramos.jpg",
    name: "Dr. Fábio Ramos",
    role: "CEO",
    chamada: "Veja o que o CEO da Souza Ramos Advogados diz sobre os resultados obtidos",
    texto:
      "Fábio Ramos, CEO da Souza Ramos Advogados, conta como a consultoria ajudou a organizar a gestão do escritório e destravar resultados que dependiam só dele. Assista para ver o relato na íntegra.",
  },
  daniella: {
    video: "/videos/depoimento-daniella-higa.mp4",
    poster: "/images/depoimento-daniella-higa.jpg",
    name: "Daniella Higa",
    role: "Coordenadora Comercial",
    chamada: "O que a responsável pela área comercial diz sobre a equipe e os resultados",
    texto:
      "Daniella Higa, Coordenadora Comercial, fala sobre o impacto do método no dia a dia do time de vendas — mais organização na rotina comercial e resultados que se sustentam mês a mês.",
  },
  erik: {
    video: "/videos/depoimento-erik-dantas.mp4",
    poster: "/images/depoimento-erik-dantas.jpg",
    name: "Erik Dantas",
    role: "Estagiário Financeiro",
    chamada: "Economia de tempo, recuperação de inadimplentes e resultados mais claros",
    texto:
      "Erik Dantas, do time financeiro, conta como a rotina mudou depois da consultoria: menos tempo perdido em tarefas manuais, mais inadimplentes recuperados e relatórios de resultado mais claros para a gestão.",
  },
} as const;

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
    a: "O Curso e o Livro Gestão 360 estão em fase de lançamento. O curso será um pacote online completo, para você assistir no seu ritmo e aplicar na empresa enquanto avança. Entre em contato para entrar na lista de prioridade.",
  },
  {
    q: "Qual a diferença entre mentoria e consultoria?",
    a: "Na mentoria o trabalho é com você: desenvolvemos sua capacidade de decidir e conduzir o negócio, com um plano que combina competências técnicas e comportamentais. Na consultoria o trabalho é na empresa: entramos na operação, mapeamos processos, apontamos os gaps e implantamos as soluções junto com o time. Quem precisa de direção escolhe mentoria; quem precisa de execução escolhe consultoria. Em muitos casos, uma leva à outra.",
  },
  {
    q: "Vocês desenvolvem sistemas e automações?",
    a: "Sim, quando isso faz parte da solução. Não vendemos tecnologia como serviço isolado: avaliamos, durante a consultoria, onde um sistema sob medida ou uma automação elimina trabalho manual e remove o ruído de comunicação entre departamentos. O objetivo é devolver tempo operacional à equipe, com mais qualidade e menos falha entre as áreas.",
  },
  {
    q: "A palestra pode ser sobre um tema específico da minha empresa?",
    a: "Pode. Você escolhe um tema já estruturado do nosso escopo ou uma palestra personalizada, construída a partir de um briefing com a liderança e de entrevistas com líderes e equipe. Na versão personalizada, o conteúdo trata do que a sua empresa está vivendo de verdade e você recebe uma devolutiva depois do evento.",
  },
  {
    q: "Quanto tempo dura cada trabalho?",
    a: "Depende do tamanho do desafio e do ritmo da empresa. Preferimos definir o formato depois do diagnóstico, quando já se sabe o que precisa ser feito, em vez de vender um pacote fechado que pode ficar curto ou longo demais. O diagnóstico inicial é gratuito e é o que orienta essa definição.",
  },
] as const;
