import type { Payload, Where } from "payload";
import { getPayloadClient } from "@/lib/payload";
import { sendMail } from "@/lib/email";
import { logEmailSend } from "@/lib/email-log";
import { marketingOptOutUrl } from "@/lib/email-marketing";
import { siteConfig } from "@/lib/site-config";

/**
 * Alerta automático por e-mail quando um novo Artigo (Posts) ou Material
 * (Materials) é publicado — dispara sozinho via hook `afterChange` das
 * respectivas coleções, para os assinantes da newsletter (quem se inscreveu
 * pelo rodapé ou pelo pop-up de captura). Nenhuma ação manual necessária.
 */

const NAVY = "#1D2B3C";
const GOLD = "#C1A160";
const INK = "#15191f";
const GRAY = "#5b626e";
const LINE = "#d9dce1";

const FROM = "Empresarial Academy <contato@empresarialacademy.com>";
const REPLY_TO = siteConfig.contact.email;

/** Origens consideradas "assinante de newsletter" (rodapé + pop-up de captura). */
const NEWSLETTER_SOURCES = ["Newsletter", "Pop-up de captura"];

type Subscriber = { id: string | number; email: string };

async function resolveNewsletterSubscribers(payload: Payload): Promise<Subscriber[]> {
  const { docs } = await payload.find({
    collection: "leads",
    where: {
      and: [
        { consent: { equals: true } },
        { marketingOptOut: { not_equals: true } },
        { source: { in: NEWSLETTER_SOURCES } },
      ],
    },
    limit: 2000,
    depth: 0,
  });
  return (docs as Subscriber[]).filter((l) => l.email);
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function wrapAlertHtml(opts: {
  eyebrow: string;
  title: string;
  excerpt: string;
  ctaLabel: string;
  ctaUrl: string;
  unsubscribeUrl: string;
}): string {
  const { eyebrow, title, excerpt, ctaLabel, ctaUrl, unsubscribeUrl } = opts;
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;background:#f6f5f1;font-family:Arial,Helvetica,sans-serif;color:${INK}">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f5f1"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border:1px solid ${LINE};border-radius:14px;overflow:hidden">
  <tr><td style="background:${NAVY};padding:24px 28px">
    <div style="color:${GOLD};font-weight:700;letter-spacing:.5px;font-size:13px">EMPRESARIAL ACADEMY</div>
    <div style="color:#ffffff;font-size:12px;letter-spacing:.5px;text-transform:uppercase;margin-top:6px;opacity:.8">${esc(eyebrow)}</div>
  </td></tr>
  <tr><td style="padding:26px 28px">
    <h1 style="margin:0 0 12px;font-size:20px;line-height:1.35;color:${NAVY}">${esc(title)}</h1>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:${INK}">${esc(excerpt)}</p>
    <table role="presentation" cellpadding="0" cellspacing="0"><tr>
      <td style="border-radius:10px;background:${GOLD}">
        <a href="${ctaUrl}" style="display:inline-block;padding:14px 26px;color:${NAVY};font-weight:700;font-size:15px;text-decoration:none">${esc(ctaLabel)} &rarr;</a>
      </td>
    </tr></table>
  </td></tr>
  <tr><td style="padding:0 28px 26px">
    <div style="border-top:1px solid ${LINE};padding-top:16px">
      <p style="margin:0;font-size:14px;color:${INK}"><strong>Thiago Marchi</strong> · Empresarial Academy</p>
      <p style="margin:4px 0 0;font-size:13px;color:${GRAY}">Método para crescer. Gestão para permanecer.</p>
    </div>
  </td></tr>
</table>
<p style="max-width:560px;margin:14px auto 0;font-size:11px;color:#9aa0a8;text-align:center;line-height:1.5">
  <a href="${siteConfig.url}" style="color:#9aa0a8">empresarialacademy.com</a> ·
  <a href="${unsubscribeUrl}" style="color:#9aa0a8">Sair da lista</a>
</p>
</td></tr></table>
</body></html>`;
}

function stripToText(excerpt: string, ctaLabel: string, ctaUrl: string, unsubscribeUrl: string): string {
  return `${excerpt}\n\n${ctaLabel}: ${ctaUrl}\n\nSair da lista: ${unsubscribeUrl}`;
}

async function sendAlertBatch(opts: {
  type: "post" | "material";
  title: string;
  excerpt: string;
  path: string;
}): Promise<{ sent: number; failed: number }> {
  const payload = await getPayloadClient();
  const subscribers = await resolveNewsletterSubscribers(payload);

  const isPost = opts.type === "post";
  const eyebrow = isPost ? "Novo artigo no blog" : "Novo material gratuito";
  const ctaLabel = isPost ? "Ler o artigo" : "Baixar agora";
  const ctaUrl = `${siteConfig.url}${opts.path}`;
  const subject = isPost ? `Novo no blog: ${opts.title}` : `Novo material gratuito: ${opts.title}`;

  let sent = 0;
  let failed = 0;

  for (const sub of subscribers) {
    const unsubscribeUrl = marketingOptOutUrl(sub.id, sub.email);
    const html = wrapAlertHtml({
      eyebrow,
      title: opts.title,
      excerpt: opts.excerpt,
      ctaLabel,
      ctaUrl,
      unsubscribeUrl,
    });
    const text = stripToText(opts.excerpt, ctaLabel, ctaUrl, unsubscribeUrl);

    const result = await sendMail({
      to: sub.email,
      from: FROM,
      replyTo: REPLY_TO,
      subject,
      html,
      text,
    });

    await logEmailSend({
      type: "content-alert",
      to: sub.email,
      subject,
      ok: result.ok,
      via: result.via,
      leadId: sub.id,
    });

    if (result.ok) sent += 1;
    else failed += 1;
  }

  return { sent, failed };
}

export async function sendNewPostAlert(post: {
  title: string;
  excerpt?: string | null;
  slug: string;
}): Promise<{ sent: number; failed: number }> {
  return sendAlertBatch({
    type: "post",
    title: post.title,
    excerpt: post.excerpt || "Novo conteúdo publicado no blog da Empresarial Academy.",
    path: `/blog/${post.slug}`,
  });
}

export async function sendNewMaterialAlert(material: {
  title: string;
  description?: string | null;
  slug: string;
}): Promise<{ sent: number; failed: number }> {
  return sendAlertBatch({
    type: "material",
    title: material.title,
    excerpt:
      material.description || "Novo material gratuito disponível na Central de Materiais.",
    path: `/materiais/${material.slug}`,
  });
}

/**
 * Envia os alertas PENDENTES de conteúdo agendado: Posts/Materials com
 * status "published", data de publicação já alcançada e `subscriberAlertSent`
 * ainda falso. Complementa os hooks `afterChange` das coleções (que só
 * disparam para publicação imediata — agendados caem aqui). Chamado pelo
 * cron diário de nutrição (/api/cron/nutricao). Nunca lança.
 */
export async function sendPendingContentAlerts(): Promise<
  Array<{ collection: string; id: string | number; title: string; ok: boolean }>
> {
  const results: Array<{ collection: string; id: string | number; title: string; ok: boolean }> = [];
  try {
    const payload = await getPayloadClient();
    const nowIso = new Date().toISOString();
    const where: Where = {
      and: [
        { status: { equals: "published" } },
        { publishedAt: { less_than_equal: nowIso } },
        { subscriberAlertSent: { not_equals: true } },
      ],
    };

    const { docs: posts } = await payload.find({ collection: "posts", where, limit: 20, depth: 0 });
    for (const post of posts) {
      try {
        await sendNewPostAlert({ title: post.title, excerpt: post.excerpt ?? "", slug: post.slug ?? "" });
        await payload.update({ collection: "posts", id: post.id, data: { subscriberAlertSent: true } });
        results.push({ collection: "posts", id: post.id, title: post.title, ok: true });
      } catch (e) {
        payload.logger.error(`[content-alerts] falha no alerta pendente do post ${post.id}: ${e}`);
        results.push({ collection: "posts", id: post.id, title: post.title, ok: false });
      }
    }

    const { docs: materials } = await payload.find({ collection: "materials", where, limit: 20, depth: 0 });
    for (const material of materials) {
      try {
        await sendNewMaterialAlert({
          title: material.title,
          description: material.description ?? "",
          slug: material.slug ?? "",
        });
        await payload.update({
          collection: "materials",
          id: material.id,
          data: { subscriberAlertSent: true },
        });
        results.push({ collection: "materials", id: material.id, title: material.title, ok: true });
      } catch (e) {
        payload.logger.error(`[content-alerts] falha no alerta pendente do material ${material.id}: ${e}`);
        results.push({ collection: "materials", id: material.id, title: material.title, ok: false });
      }
    }
  } catch (e) {
    console.error("[content-alerts] sendPendingContentAlerts falhou:", e);
  }
  return results;
}
