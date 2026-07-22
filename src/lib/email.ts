import { Resend } from "resend";
import nodemailer from "nodemailer";
import { siteConfig } from "@/lib/site-config";

type LeadEmail = {
  subject: string;
  /** Campos do lead (rótulo → valor). */
  fields: Record<string, string | undefined>;
  /** E-mail do lead, usado como Reply-To. */
  replyTo?: string;
};

function rows(fields: Record<string, string | undefined>) {
  return Object.entries(fields)
    .filter(([, v]) => v && v.trim() !== "")
    .map(([k, v]) => ({ k, v: v as string }));
}

function buildHtml(subject: string, fields: Record<string, string | undefined>) {
  const trs = rows(fields)
    .map(
      (r) =>
        `<tr><td style="padding:6px 12px;color:#6b7280;font-weight:600">${r.k}</td><td style="padding:6px 12px;color:#15191f">${r.v}</td></tr>`,
    )
    .join("");
  return `<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto">
    <div style="background:#1D2B3C;color:#fff;padding:20px 24px;border-radius:12px 12px 0 0">
      <strong style="color:#C1A160">Empresarial Academy</strong>
      <div style="font-size:18px;margin-top:4px">${subject}</div>
    </div>
    <table style="width:100%;border-collapse:collapse;background:#fff;border:1px solid #d9dce1;border-top:0">${trs}</table>
  </div>`;
}

function buildText(subject: string, fields: Record<string, string | undefined>) {
  return (
    `${subject}\n\n` + rows(fields).map((r) => `${r.k}: ${r.v}`).join("\n")
  );
}

/**
 * Envia o lead por e-mail. Usa Resend (se RESEND_API_KEY) ou SMTP (se SMTP_HOST).
 * Se nada estiver configurado, apenas registra no log (dev) e retorna ok=false.
 * Nunca lança — o fluxo do formulário não deve quebrar por causa do e-mail.
 */
export async function sendLeadEmail({
  subject,
  fields,
  replyTo,
}: LeadEmail): Promise<{ ok: boolean; via: string }> {
  const to = process.env.LEADS_TO_EMAIL || siteConfig.contact.email;
  const html = buildHtml(subject, fields);
  const text = buildText(subject, fields);

  // 1) Resend
  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const from =
        process.env.LEADS_FROM_EMAIL ||
        "Empresarial Academy <onboarding@resend.dev>";
      const { error } = await resend.emails.send({
        from,
        to,
        subject,
        html,
        text,
        replyTo,
      });
      if (!error) return { ok: true, via: "resend" };
      console.error("[email] Resend:", error);
    } catch (e) {
      console.error("[email] Resend exception:", e);
    }
  }

  // 2) SMTP (ex.: e-mail da Hostinger)
  if (process.env.SMTP_HOST) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 465),
        secure: process.env.SMTP_SECURE !== "false",
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      });
      const from = process.env.LEADS_FROM_EMAIL || process.env.SMTP_USER || to;
      await transporter.sendMail({ from, to, subject, html, text, replyTo });
      return { ok: true, via: "smtp" };
    } catch (e) {
      console.error("[email] SMTP exception:", e);
    }
  }

  // 3) Fallback — não perder o lead em dev/sem configuração
  console.info("[lead] (e-mail não configurado)", { subject, fields });
  return { ok: false, via: "console" };
}
