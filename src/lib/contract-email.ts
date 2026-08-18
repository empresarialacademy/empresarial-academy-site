import { sendMail } from "@/lib/email";
import { siteConfig } from "@/lib/site-config";
import { logEmailSend } from "@/lib/email-log";

/**
 * E-mails do fluxo de contrato + assinatura eletrônica (EA HUB).
 *
 * Mesmo padrão de src/lib/diagnostic-email.ts / nurture-emails.ts: HTML
 * inline-styled, paleta navy/gold da marca, envio via sendMail() e log de
 * todo envio em EmailLogs (src/lib/email-log.ts).
 *
 * Remetente fixo: contato@empresarialacademy.com.
 * Nunca lança: falha de e-mail não pode derrubar o fluxo de assinatura.
 */

const FROM = "Empresarial Academy <contato@empresarialacademy.com>";
const REPLY_TO = siteConfig.contact.email;
const THIAGO_EMAIL = "thiago@empresarialacademy.com";

const NAVY = "#1D2B3C";
const GOLD = "#C1A160";
const INK = "#15191f";
const GRAY = "#5b626e";
const LINE = "#d9dce1";

const esc = (s: string) =>
  (s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function shell(title: string, bodyHtml: string, ctaHtml = ""): string {
  return `<div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;background:#fff">
    <div style="background:${NAVY};color:#fff;padding:24px 28px;border-radius:12px 12px 0 0">
      <strong style="color:${GOLD};font-size:13px;letter-spacing:.04em;text-transform:uppercase">Empresarial Academy</strong>
      <div style="font-size:19px;margin-top:6px;font-weight:600">${esc(title)}</div>
    </div>
    <div style="border:1px solid ${LINE};border-top:0;border-radius:0 0 12px 12px;padding:26px 28px;color:${INK};font-size:14px;line-height:1.6">
      ${bodyHtml}
      ${ctaHtml}
    </div>
    <div style="text-align:center;color:${GRAY};font-size:11px;margin-top:16px">
      Empresarial Academy &middot; ${esc(siteConfig.contact.email)}
    </div>
  </div>`;
}

function ctaButton(url: string, label: string): string {
  return `<div style="text-align:center;margin:26px 0 10px">
    <a href="${url}" style="display:inline-block;background:${GOLD};color:${NAVY};font-weight:700;text-decoration:none;padding:13px 28px;border-radius:8px;font-size:14px">${esc(label)}</a>
  </div>`;
}

// ───────────────────── E-mail 1 · enviado para assinatura ─────────────────────

export async function sendContractSentEmail(input: {
  contractId: string | number;
  clientName: string;
  clientEmail: string;
  planoNome: string;
  signUrl: string;
}): Promise<{ ok: boolean; via: string }> {
  try {
    if (!input.clientEmail) return { ok: false, via: "no-email" };
    const subject = `Contrato para assinatura · ${input.planoNome} · Empresarial Academy`;
    const bodyHtml = `<p>Olá, ${esc(input.clientName || "tudo bem")}!</p>
      <p>Segue o contrato de <strong>${esc(input.planoNome)}</strong> da Empresarial Academy para sua leitura e assinatura eletrônica.</p>
      <p>O link abaixo é pessoal e leva direto ao texto completo do contrato, sem necessidade de senha ou cadastro.</p>`;
    const cta = ctaButton(input.signUrl, "Ler e assinar o contrato");
    const html = shell("Contrato pronto para assinatura", bodyHtml, cta);
    const text = `Olá, ${input.clientName || "tudo bem"}!\n\nSegue o contrato de ${input.planoNome} da Empresarial Academy para sua leitura e assinatura eletrônica.\n\nAcesse: ${input.signUrl}\n\nEmpresarial Academy · ${siteConfig.contact.email}`;

    const result = await sendMail({ to: input.clientEmail, from: FROM, replyTo: REPLY_TO, subject, html, text });
    await logEmailSend({
      type: "contract-sent",
      to: input.clientEmail,
      subject,
      ok: result.ok,
      via: result.via,
    });
    return result;
  } catch (e) {
    console.error("[contract-email] exceção ao enviar contrato:", e);
    return { ok: false, via: "exception" };
  }
}

// ─────────────────── E-mail 2 · assinatura confirmada (cliente + Thiago) ───────────────────

function signedBodyHtml(opts: { clientName: string; planoNome: string; signedAtLabel: string; forThiago: boolean }): string {
  const { clientName, planoNome, signedAtLabel, forThiago } = opts;
  const intro = forThiago
    ? `<p>O contrato de <strong>${esc(planoNome)}</strong> com <strong>${esc(clientName)}</strong> foi assinado eletronicamente.</p>`
    : `<p>Olá, ${esc(clientName || "tudo bem")}!</p><p>Confirmamos a assinatura eletrônica do seu contrato de <strong>${esc(planoNome)}</strong> com a Empresarial Academy.</p>`;
  return `${intro}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;border-collapse:collapse">
      <tr><td style="padding:6px 0;color:${GRAY};font-weight:600;width:140px">Assinado em</td><td style="padding:6px 0">${esc(signedAtLabel)}</td></tr>
    </table>
    <p style="color:${GRAY}">O registro assinado, com data, IP e código de verificação (hash) de integridade, fica arquivado no EA HUB.</p>`;
}

export async function sendContractSignedEmails(input: {
  contractId: string | number;
  clientName: string;
  clientEmail: string;
  planoNome: string;
  signedAtLabel: string;
  /** PDF do Certificado de Assinatura Eletrônica + contrato integral (src/lib/contract-pdf.tsx). Anexado quando presente. */
  pdfBuffer?: Buffer;
}): Promise<{ client: { ok: boolean; via: string }; thiago: { ok: boolean; via: string } }> {
  const subject = `Assinatura confirmada · ${input.planoNome} · Empresarial Academy`;
  const attachments = input.pdfBuffer
    ? [{ filename: "certificado-assinatura-eletronica.pdf", content: input.pdfBuffer }]
    : undefined;
  const attachNote = input.pdfBuffer
    ? '<p style="color:#5b626e;font-size:12px">O certificado de assinatura eletrônica e o contrato integral seguem em anexo, em PDF.</p>'
    : "";

  let client: { ok: boolean; via: string } = { ok: false, via: "no-email" };
  try {
    if (input.clientEmail) {
      const html = shell("Assinatura confirmada", signedBodyHtml({ ...input, forThiago: false }) + attachNote);
      const text = `Confirmamos a assinatura eletrônica do seu contrato de ${input.planoNome} com a Empresarial Academy.\nAssinado em: ${input.signedAtLabel}\n\nEmpresarial Academy · ${siteConfig.contact.email}`;
      client = await sendMail({ to: input.clientEmail, from: FROM, replyTo: REPLY_TO, subject, html, text, attachments });
      await logEmailSend({ type: "contract-signed", to: input.clientEmail, subject, ok: client.ok, via: client.via });
    }
  } catch (e) {
    console.error("[contract-email] exceção ao notificar cliente:", e);
  }

  let thiago: { ok: boolean; via: string } = { ok: false, via: "no-email" };
  try {
    const html = shell("Contrato assinado", signedBodyHtml({ ...input, forThiago: true }) + attachNote);
    const text = `O contrato de ${input.planoNome} com ${input.clientName} foi assinado eletronicamente em ${input.signedAtLabel}. Registro completo no EA HUB.`;
    thiago = await sendMail({ to: THIAGO_EMAIL, from: FROM, subject: `[Assinado] ${subject}`, html, text, attachments });
    await logEmailSend({ type: "contract-signed", to: THIAGO_EMAIL, subject: `[Assinado] ${subject}`, ok: thiago.ok, via: thiago.via });
  } catch (e) {
    console.error("[contract-email] exceção ao notificar Thiago:", e);
  }

  return { client, thiago };
}
