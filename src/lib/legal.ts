/**
 * Conteúdo legal (migrado do site atual). Fonte: páginas privacidade.html / termos.html.
 * Estrutura em dados para renderização consistente e fácil manutenção.
 */
export type LegalBlock =
  | { type: "p"; text: string }
  | { type: "list"; items: string[] };

export type LegalSection = { title: string; blocks: LegalBlock[] };

export const legalUpdatedAt = "Janeiro de 2024";

export const privacidadeSections: LegalSection[] = [
  {
    title: "1. Introdução",
    blocks: [
      {
        type: "p",
        text: "A Empresarial Academy está comprometida em proteger a privacidade e os dados pessoais de nossos usuários, clientes e visitantes. Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e protegemos suas informações pessoais em conformidade com a Lei Geral de Proteção de Dados (LGPD) — Lei nº 13.709/2018.",
      },
    ],
  },
  {
    title: "2. Informações que Coletamos",
    blocks: [
      { type: "p", text: "2.1 Dados fornecidos voluntariamente:" },
      {
        type: "list",
        items: [
          "Nome completo",
          "Endereço de e-mail",
          "Número de telefone/WhatsApp",
          "Nome da empresa",
          "Cargo/função",
          "Informações profissionais relevantes",
          "Mensagens e comunicações enviadas através de nossos formulários",
        ],
      },
      { type: "p", text: "2.2 Dados coletados automaticamente:" },
      {
        type: "list",
        items: [
          "Endereço IP",
          "Tipo de navegador e versão",
          "Sistema operacional",
          "Páginas visitadas e tempo de permanência",
          "Referências de sites que o direcionaram para nós",
          "Dados de cookies e tecnologias similares",
        ],
      },
    ],
  },
  {
    title: "3. Como Utilizamos suas Informações",
    blocks: [
      {
        type: "list",
        items: [
          "Fornecer nossos serviços de consultoria, mentoria e treinamento",
          "Responder às suas solicitações e comunicações",
          "Enviar materiais educacionais e informativos",
          "Personalizar sua experiência em nosso site",
          "Melhorar nossos serviços e desenvolver novos produtos",
          "Cumprir obrigações legais e regulamentares",
          "Enviar comunicações de marketing (com seu consentimento)",
        ],
      },
    ],
  },
  {
    title: "4. Base Legal para o Tratamento",
    blocks: [
      {
        type: "list",
        items: [
          "Consentimento: quando você nos fornece consentimento explícito",
          "Execução de contrato: para cumprir obrigações contratuais",
          "Legítimo interesse: para melhorar nossos serviços e comunicação",
          "Cumprimento de obrigação legal: quando exigido por lei",
        ],
      },
    ],
  },
  {
    title: "5. Compartilhamento de Informações",
    blocks: [
      {
        type: "p",
        text: "Não vendemos, alugamos ou compartilhamos suas informações pessoais com terceiros, exceto nas seguintes situações:",
      },
      {
        type: "list",
        items: [
          "Com prestadores de serviços que nos auxiliam na operação do negócio",
          "Quando exigido por lei ou ordem judicial",
          "Para proteger nossos direitos, propriedade ou segurança",
          "Com seu consentimento explícito",
        ],
      },
    ],
  },
  {
    title: "6. Cookies e Tecnologias Similares",
    blocks: [
      {
        type: "p",
        text: "Utilizamos cookies e tecnologias similares para melhorar a funcionalidade do site, analisar o tráfego e uso, personalizar conteúdo e lembrar suas preferências. Você pode controlar o uso de cookies através das configurações do seu navegador.",
      },
    ],
  },
  {
    title: "7. Segurança dos Dados",
    blocks: [
      {
        type: "p",
        text: "Implementamos medidas de segurança técnicas e organizacionais apropriadas para proteger suas informações pessoais contra acesso não autorizado, alteração, divulgação, destruição, perda acidental e tratamento ilícito.",
      },
    ],
  },
  {
    title: "8. Retenção de Dados",
    blocks: [
      {
        type: "p",
        text: "Mantemos suas informações pessoais apenas pelo tempo necessário para cumprir as finalidades descritas nesta política, a menos que um período de retenção mais longo seja exigido ou permitido por lei.",
      },
    ],
  },
  {
    title: "9. Seus Direitos (LGPD)",
    blocks: [
      {
        type: "list",
        items: [
          "Confirmação da existência de tratamento de dados",
          "Acesso aos seus dados pessoais",
          "Correção de dados incompletos, inexatos ou desatualizados",
          "Anonimização, bloqueio ou eliminação de dados desnecessários",
          "Portabilidade dos dados",
          "Informação sobre compartilhamento",
          "Revogação do consentimento",
        ],
      },
    ],
  },
  {
    title: "10. Transferência Internacional",
    blocks: [
      {
        type: "p",
        text: "Seus dados pessoais podem ser transferidos para países fora do Brasil apenas quando necessário para a prestação de nossos serviços e com garantias adequadas de proteção.",
      },
    ],
  },
  {
    title: "11. Menores de Idade",
    blocks: [
      {
        type: "p",
        text: "Nossos serviços são direcionados a adultos. Não coletamos intencionalmente informações pessoais de menores de 18 anos sem o consentimento dos pais ou responsáveis.",
      },
    ],
  },
  {
    title: "12. Alterações nesta Política",
    blocks: [
      {
        type: "p",
        text: "Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos sobre mudanças significativas através de nosso site ou por e-mail.",
      },
    ],
  },
  {
    title: "13. Contato e Encarregado (DPO)",
    blocks: [
      {
        type: "p",
        text: "Para exercer seus direitos ou esclarecer dúvidas, entre em contato pelo e-mail privacidade@empresarialacademy.com ou pelo telefone +55 (11) 93340-0264 (São Paulo - SP, Brasil). Nosso Encarregado de Proteção de Dados (DPO) pode ser contatado em dpo@empresarialacademy.com.",
      },
    ],
  },
];

export const termosSections: LegalSection[] = [
  {
    title: "1. Aceitação dos Termos",
    blocks: [
      {
        type: "p",
        text: "Ao acessar e usar o site da Empresarial Academy e nossos serviços, você concorda em cumprir e estar vinculado a estes Termos de Uso. Se você não concordar com qualquer parte destes termos, não deve usar nossos serviços.",
      },
    ],
  },
  {
    title: "2. Descrição dos Serviços",
    blocks: [
      {
        type: "list",
        items: [
          "Cursos de desenvolvimento empresarial",
          "Serviços de mentoria e consultoria",
          "Palestras e workshops",
          "Materiais educacionais e informativos",
          "Conteúdo de blog e recursos gratuitos",
          "Livros e publicações especializadas",
        ],
      },
    ],
  },
  {
    title: "3. Elegibilidade",
    blocks: [
      {
        type: "list",
        items: [
          "Pessoas físicas maiores de 18 anos",
          "Empresas e organizações legalmente constituídas",
          "Profissionais e empresários que buscam desenvolvimento",
        ],
      },
    ],
  },
  {
    title: "4. Registro e Conta de Usuário",
    blocks: [
      { type: "p", text: "Ao criar uma conta ou fornecer informações, você se compromete a:" },
      {
        type: "list",
        items: [
          "Fornecer informações verdadeiras, precisas e atualizadas",
          "Manter a confidencialidade de suas credenciais de acesso",
          "Notificar-nos imediatamente sobre uso não autorizado",
          "Ser responsável por todas as atividades em sua conta",
        ],
      },
    ],
  },
  {
    title: "5. Uso Aceitável",
    blocks: [
      { type: "p", text: "5.1 Condutas permitidas — você pode usar nossos serviços para acessar conteúdo educacional, participar de cursos, solicitar consultoria/mentoria e baixar materiais gratuitos." },
      { type: "p", text: "5.2 É expressamente proibido:" },
      {
        type: "list",
        items: [
          "Usar nossos serviços para atividades ilegais",
          "Reproduzir, distribuir ou vender nosso conteúdo sem autorização",
          "Tentar acessar sistemas ou dados não autorizados",
          "Interferir no funcionamento do site ou serviços",
          "Enviar spam, vírus ou código malicioso",
          "Violar direitos de propriedade intelectual",
        ],
      },
    ],
  },
  {
    title: "6. Propriedade Intelectual",
    blocks: [
      {
        type: "p",
        text: "Todo o conteúdo do site — textos, imagens, vídeos, logotipos, metodologias e materiais educacionais — é de propriedade da Empresarial Academy e está protegido por leis de direitos autorais. Concedemos uma licença limitada, não exclusiva e revogável para acessar e usar o conteúdo conforme permitido.",
      },
    ],
  },
  {
    title: "7. Pagamentos e Reembolsos",
    blocks: [
      {
        type: "p",
        text: "Os preços de nossos serviços são informados no momento da contratação. Oferecemos garantia de satisfação conforme especificado em cada serviço; reembolsos podem ser solicitados dentro do prazo estabelecido e estão sujeitos à análise.",
      },
    ],
  },
  {
    title: "8. Privacidade e Proteção de Dados",
    blocks: [
      {
        type: "p",
        text: "O tratamento de seus dados pessoais é regido por nossa Política de Privacidade, que faz parte integrante destes Termos de Uso.",
      },
    ],
  },
  {
    title: "9. Limitação de Responsabilidade",
    blocks: [
      {
        type: "p",
        text: "Nossos serviços são fornecidos no estado em que se encontram. Não garantimos resultados específicos, que dependem da aplicação prática por parte do usuário. Na máxima extensão permitida por lei, não nos responsabilizamos por danos indiretos decorrentes do uso dos serviços.",
      },
    ],
  },
  {
    title: "10. Alterações dos Termos",
    blocks: [
      {
        type: "p",
        text: "Podemos atualizar estes Termos periodicamente. O uso contínuo dos serviços após alterações implica concordância com os novos termos.",
      },
    ],
  },
  {
    title: "11. Lei Aplicável e Foro",
    blocks: [
      {
        type: "p",
        text: "Estes Termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o foro da comarca de São Paulo - SP para dirimir eventuais controvérsias.",
      },
    ],
  },
  {
    title: "12. Contato",
    blocks: [
      {
        type: "p",
        text: "Dúvidas sobre estes Termos podem ser enviadas para contato@empresarialacademy.com ou pelo telefone +55 (11) 93340-0264.",
      },
    ],
  },
];
