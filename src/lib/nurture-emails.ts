import { createHmac } from "crypto";
import { sendMail } from "@/lib/email";
import { siteConfig } from "@/lib/site-config";
import { getWeakestPillar, type PillarName } from "@/lib/lead-scoring";

/**
 * Sequência de nutrição pós-diagnóstico (meio de funil).
 *
 * O lead que conclui o Diagnóstico de Maturidade recebe, além do e-mail de
 * resultado imediato (diagnostic-email.ts), 3 toques automáticos personalizados
 * pelo pilar mais fraco:
 *   E1 (D+2) — o que o pilar fraco está custando + 3 ações práticas;
 *   E2 (D+5) — como o Gestão 360 trabalha esse pilar (ponte dor→método);
 *   E3 (D+7) — convite direto para a Chamada de Diagnóstico Estratégico.
 *
 * Disparo: rota de cron /api/cron/nutricao (Vercel Cron, diário).
 * LGPD: somente leads com consentimento; todo e-mail traz link de descadastro
 * (/api/nutricao/sair) que marca `nurtureOptOut` no lead.
 */

// Manter em sincronia com src/components/CalendlyEmbed.tsx.
export const CALENDLY_URL =
  "https://calendly.com/thiago-empresarialacademy/new-meeting";

const FROM = "Empresarial Academy <contato@empresarialacademy.com>";
const REPLY_TO = siteConfig.contact.email;

const NAVY = "#1D2B3C";
const GOLD = "#C1A160";
const INK = "#15191f";
const GRAY = "#5b626e";
const LINE = "#d9dce1";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Token de descadastro (HMAC do id+e-mail com o PAYLOAD_SECRET). */
export function optOutToken(leadId: string | number, email: string): string {
  const secret = process.env.PAYLOAD_SECRET || "dev-secret";
  return createHmac("sha256", secret)
    .update(`${leadId}:${(email || "").toLowerCase()}`)
    .digest("hex")
    .slice(0, 32);
}

export function optOutUrl(leadId: string | number, email: string): string {
  return `${siteConfig.url}/api/nutricao/sair?l=${encodeURIComponent(String(leadId))}&t=${optOutToken(leadId, email)}`;
}


type PillarCopy = {
  /** E1 — o custo prático de o pilar estar fraco. */
  custo: string[];
  /** E1 — por onde começar nesta semana. */
  acoes: string[];
  /** E2 — como a consultoria trabalha o pilar. */
  metodo: string;
};

const PILLAR_COPY: Record<PillarName, PillarCopy> = {
  Comercial: {
    custo: [
      "Vendas que oscilam mês a mês, sem previsibilidade para planejar.",
      "Oportunidades que se perdem por falta de acompanhamento — cada venda depende de esforço, não de processo.",
      "Crescimento limitado ao que passa pela sua mão.",
    ],
    acoes: [
      "Desenhe as etapas do seu funil de vendas, do primeiro contato ao fechamento.",
      "Defina uma meta semanal de propostas (não só de vendas) e acompanhe.",
      "Registre todas as oportunidades em um único lugar — planilha ou CRM simples.",
    ],
    metodo:
      "No pilar Comercial, a consultoria estrutura o funil de vendas com etapas e responsáveis, define metas desdobradas por período e implanta a rotina de acompanhamento. O objetivo é previsibilidade: saber quantas propostas geram quantas vendas — e o que fazer quando o número não vem.",
  },
  Operações: {
    custo: [
      "Retrabalho e qualidade oscilando conforme quem executa.",
      "Tudo passa por você — a operação trava quando você não está.",
      "Dificuldade de crescer sem aumentar o caos junto.",
    ],
    acoes: [
      "Escolha o processo que mais gera problema hoje e mapeie as etapas em uma folha.",
      "Transforme esse processo em um checklist simples, com um responsável definido.",
      "Combine com a equipe: o padrão é o checklist — desvios viram conversa, não incêndio.",
    ],
    metodo:
      "No pilar de Operações, a consultoria mapeia e padroniza os processos críticos da sua entrega, define responsáveis e implanta rotina de gestão. O objetivo é uma operação que roda com qualidade constante — sem depender de heroísmo nem da sua presença o tempo todo.",
  },
  "Gestão de Indicadores": {
    custo: [
      "Decisões tomadas no achismo, sem números para confirmar.",
      "Problemas descobertos tarde — quando já viraram prejuízo.",
      "Dificuldade de saber se a empresa está melhorando ou só se movimentando.",
    ],
    acoes: [
      "Escolha de 3 a 5 indicadores que realmente mostram a saúde do negócio (venda, caixa, entrega).",
      "Monte um painel simples — uma planilha basta para começar.",
      "Marque uma reunião mensal de resultados com hora fixa. O ritual importa mais que a ferramenta.",
    ],
    metodo:
      "No pilar de Indicadores, a consultoria define com você o painel de KPIs do negócio, implanta a gestão à vista e conduz a rotina mensal de análise. O objetivo é decidir com base em número: ver o problema no indicador antes de ele aparecer no caixa.",
  },
  Liderança: {
    custo: [
      "A equipe espera você decidir — e o seu dia afunda no operacional.",
      "Pessoas boas sem clareza de responsabilidade rendem abaixo do que podem.",
      "A empresa cresce até o limite da sua agenda, e para.",
    ],
    acoes: [
      "Escreva quem é responsável pelo quê nas 5 rotinas mais importantes da empresa.",
      "Delegue uma rotina completa esta semana — com padrão de qualidade combinado, não só a tarefa.",
      "Implante conversas individuais quinzenais de 30 minutos com cada pessoa-chave.",
    ],
    metodo:
      "No pilar de Liderança, a consultoria trabalha a estrutura de responsabilidades, a delegação com padrão e os rituais de gestão (reuniões, acompanhamento, feedback). O objetivo é uma equipe que decide e executa dentro de combinados claros — e um dono que volta a ter tempo para pensar o crescimento.",
  },
};

const GENERIC_ACOES = [
  "Escolha o pilar que mais dói hoje e concentre a energia nele por 90 dias.",
  "Defina 3 indicadores simples para acompanhar o avanço.",
  "Implante uma reunião mensal de resultados com hora fixa.",
];

export type NurtureInput = {
  leadId: string | number;
  name: string;
  email: string;
  company?: string;
  /** Campo `details` do lead (scores do diagnóstico). */
  details?: Record<string, unknown> | null;
};

type Parsed = { weakest: { name: PillarName; pct: number } | null; firstName: string };

function parseLead(input: NurtureInput): Parsed {
  const firstName =
    (input.name || "").trim().split(/\s+/)[0] || "empreendedor(a)";
  return { weakest: getWeakestPillar(input.details), firstName };
}

function shell(opts: {
  preheader: string;
  bodyHtml: string;
  unsubscribe: string;
}): string {
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;background:#f6f5f1;font-family:Arial,Helvetica,sans-serif;color:${INK}">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(opts.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f5f1"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border:1px solid ${LINE};border-radius:14px;overflow:hidden">
  <tr><td style="background:${NAVY};padding:20px 28px">
    <div style="color:${GOLD};font-weight:700;letter-spacing:.5px;font-size:13px">EMPRESARIAL ACADEMY</div>
  </td></tr>
  <tr><td style="padding:26px 28px">${opts.bodyHtml}</td></tr>
  <tr><td style="padding:0 28px 26px">
    <div style="border-top:1px solid ${LINE};padding-top:16px">
      <p style="margin:0;font-size:14px;color:${INK}"><strong>Thiago Marchi</strong> · Empresarial Academy</p>
      <p style="margin:4px 0 0;font-size:13px;color:${GRAY}">Método para crescer. Gestão para permanecer.</p>
    </div>
  </td></tr>
</table>
<p style="max-width:560px;margin:14px auto 0;font-size:11px;color:#9aa0a8;text-align:center;line-height:1.5">
  Você recebe estes acompanhamentos porque concluiu o Diagnóstico de Maturidade em
  <a href="${siteConfig.url}" style="color:#9aa0a8">empresarialacademy.com</a>.<br>
  Não quer mais receber? <a href="${opts.unsubscribe}" style="color:#9aa0a8">Sair da lista</a>.
</p>
</td></tr></table>
</body></html>`;
}

const goldButton = (href: string, label: string) =>
  `<table role="presentation" cellpadding="0" cellspacing="0"><tr>
    <td style="border-radius:10px;background:${GOLD}">
      <a href="${href}" style="display:inline-block;padding:14px 26px;color:${NAVY};font-weight:700;font-size:15px;text-decoration:none">${esc(label)} &rarr;</a>
    </td>
  </tr></table>`;

const bullets = (items: string[]) =>
  `<ul style="margin:0 0 18px;padding-left:20px">${items
    .map(
      (i) =>
        `<li style="margin:0 0 8px;font-size:15px;line-height:1.6;color:${INK}">${esc(i)}</li>`,
    )
    .join("")}</ul>`;

function waUrl(text: string): string {
  return `https://wa.me/${siteConfig.contact.phoneRaw}?text=${encodeURIComponent(text)}`;
}

/**
 * Monta o e-mail da etapa (1..3). Puro/testável — não envia.
 */
export function renderNurtureEmail(
  step: 1 | 2 | 3,
  input: NurtureInput,
): { subject: string; html: string; text: string } {
  const { weakest, firstName } = parseLead(input);
  const unsubscribe = optOutUrl(input.leadId, input.email);
  const pilar = weakest?.name ?? null;
  const copy = pilar ? PILLAR_COPY[pilar] : null;
  const pilarTxt = pilar ? `${pilar}${weakest ? ` (${weakest.pct}%)` : ""}` : "";

  if (step === 1) {
    const subject = pilar
      ? `Sobre o seu pilar de ${pilar} — por onde começar`
      : "Por onde começar depois do seu diagnóstico";
    const intro = pilar
      ? `No seu diagnóstico, o pilar que mais pediu atenção foi <strong>${esc(pilarTxt)}</strong>. Na prática, é isso que ele costuma custar para uma empresa do seu porte:`
      : `Depois do diagnóstico, o passo mais importante é transformar o resultado em ação. Na prática:`;
    const custo = copy ? bullets(copy.custo) : "";
    const acoes = copy ? copy.acoes : GENERIC_ACOES;
    const bodyHtml = `
      <p style="margin:0 0 12px;font-size:16px">Olá, ${esc(firstName)},</p>
      <p style="margin:0 0 14px;font-size:15px;line-height:1.6">${intro}</p>
      ${custo}
      <p style="margin:0 0 10px;font-size:15px;line-height:1.6"><strong>Três ações para começar ainda esta semana:</strong></p>
      ${bullets(acoes)}
      <p style="margin:0 0 16px;font-size:15px;line-height:1.6">
        Se quiser, me conte por WhatsApp qual dessas ações faz mais sentido no seu momento — respondo pessoalmente.
      </p>
      ${goldButton(waUrl(`Olá! Recebi o e-mail sobre o pilar de ${pilar || "gestão"} e quero conversar sobre por onde começar.`), "Falar no WhatsApp")}`;
    const text = [
      `Olá, ${firstName},`,
      ``,
      pilar
        ? `No seu diagnóstico, o pilar que mais pediu atenção foi ${pilarTxt}.`
        : `Depois do diagnóstico, o passo mais importante é transformar o resultado em ação.`,
      ``,
      `Três ações para começar esta semana:`,
      ...acoes.map((a) => `- ${a}`),
      ``,
      `Quer conversar sobre por onde começar? ${waUrl("Olá! Quero conversar sobre o meu diagnóstico.")}`,
    ].join("\n");
    return { subject, html: shell({ preheader: "Três ações práticas para o pilar que mais pediu atenção no seu diagnóstico.", bodyHtml, unsubscribe }), text };
  }

  if (step === 2) {
    const subject = pilar
      ? `Como destravamos ${pilar} na prática`
      : "Como funciona a consultoria Gestão 360";
    const metodo = copy
      ? copy.metodo
      : "A consultoria aplica a metodologia Gestão 360 dentro da sua empresa: diagnóstico aprofundado, plano de ação trimestral priorizado por impacto, painel de indicadores e acompanhamento mensal.";
    const bodyHtml = `
      <p style="margin:0 0 12px;font-size:16px">Olá, ${esc(firstName)},</p>
      <p style="margin:0 0 14px;font-size:15px;line-height:1.6">
        Muita gente conclui o diagnóstico, concorda com o resultado — e a rotina engole o plano.
        É exatamente esse o problema que a consultoria resolve.
      </p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${GOLD};border-radius:12px;background:#faf7ef;margin:0 0 18px">
        <tr><td style="padding:18px 20px">
          <div style="color:${GRAY};font-size:12px;letter-spacing:.5px;text-transform:uppercase">Metodologia Gestão 360</div>
          <p style="margin:8px 0 0;font-size:14px;line-height:1.6;color:${INK}">${esc(metodo)}</p>
        </td></tr>
      </table>
      <p style="margin:0 0 14px;font-size:15px;line-height:1.6">
        O trabalho é conduzido por mim, Thiago Marchi — foram mais de 20 anos em liderança e 8 como
        empresário. Sem teoria distante: plano, indicadores e acompanhamento, dentro da sua realidade.
      </p>
      ${goldButton(`${siteConfig.url}/servicos/consultoria`, "Conhecer a consultoria")}
      <p style="margin:14px 0 0;font-size:13px;color:${GRAY}">
        Prefere conversar direto? <a href="${waUrl("Olá! Quero entender como a consultoria funcionaria na minha empresa.")}" style="color:#8a6a1f;font-weight:600">Me chame no WhatsApp</a>.
      </p>`;
    const text = [
      `Olá, ${firstName},`,
      ``,
      `Muita gente conclui o diagnóstico, concorda com o resultado — e a rotina engole o plano. É esse o problema que a consultoria resolve.`,
      ``,
      metodo,
      ``,
      `Conheça a consultoria: ${siteConfig.url}/servicos/consultoria`,
      `Ou me chame no WhatsApp: ${waUrl("Olá! Quero entender como a consultoria funcionaria na minha empresa.")}`,
    ].join("\n");
    return { subject, html: shell({ preheader: "Do diagnóstico ao plano em execução — como a metodologia Gestão 360 trabalha o seu pilar.", bodyHtml, unsubscribe }), text };
  }

  // step === 3
  const subject = "Vamos olhar o seu diagnóstico juntos? (30 min, sem custo)";
  const bodyHtml = `
    <p style="margin:0 0 12px;font-size:16px">Olá, ${esc(firstName)},</p>
    <p style="margin:0 0 14px;font-size:15px;line-height:1.6">
      Quero te fazer um convite direto: uma <strong>Chamada de Diagnóstico Estratégico</strong> —
      30 a 40 minutos, online, sem custo e sem compromisso.
    </p>
    <p style="margin:0 0 10px;font-size:15px;line-height:1.6">Nessa conversa, você sai com:</p>
    ${bullets([
      "A leitura do seu resultado, pilar a pilar, com o que priorizar primeiro;",
      "O caminho mais curto para o próximo nível de maturidade da sua empresa;",
      "Clareza sobre se (e como) a consultoria faz sentido para o seu momento.",
    ])}
    ${goldButton(CALENDLY_URL, "Escolher um horário")}
    <p style="margin:14px 0 0;font-size:13px;color:${GRAY}">
      Se preferir, <a href="${waUrl("Olá! Fiz o Diagnóstico de Maturidade e quero agendar a conversa estratégica.")}" style="color:#8a6a1f;font-weight:600">me chame no WhatsApp</a> que combinamos por lá.
    </p>`;
  const text = [
    `Olá, ${firstName},`,
    ``,
    `Convite direto: uma Chamada de Diagnóstico Estratégico — 30 a 40 minutos, online, sem custo e sem compromisso.`,
    ``,
    `Você sai com a leitura do seu resultado pilar a pilar, o que priorizar primeiro e clareza sobre se a consultoria faz sentido para o seu momento.`,
    ``,
    `Escolha um horário: ${CALENDLY_URL}`,
    `Ou me chame no WhatsApp: ${waUrl("Olá! Quero agendar a conversa estratégica.")}`,
  ].join("\n");
  return { subject, html: shell({ preheader: "30 minutos para transformar o seu diagnóstico em um plano — sem custo.", bodyHtml, unsubscribe }), text };
}

export async function sendNurtureEmail(
  step: 1 | 2 | 3,
  input: NurtureInput,
): Promise<{ ok: boolean; via: string }> {
  try {
    if (!input.email) return { ok: false, via: "no-email" };
    const mail = renderNurtureEmail(step, input);
    const result = await sendMail({
      to: input.email,
      from: FROM,
      replyTo: REPLY_TO,
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
    });
    const { logEmailSend } = await import("@/lib/email-log");
    await logEmailSend({
      type: `nurture-${step}` as const,
      to: input.email,
      subject: mail.subject,
      ok: result.ok,
      via: result.via,
      leadId: input.leadId,
    });
    return result;
  } catch (e) {
    console.error("[nurture-email] exceção:", e);
    return { ok: false, via: "exception" };
  }
}
