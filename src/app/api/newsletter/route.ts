import { NextResponse } from "next/server";
import { sendLeadEmail } from "@/lib/email";

type Payload = {
  nome?: string;
  empresa?: string;
  email?: string;
  whatsapp?: string;
  instagram?: string;
  consentimento?: boolean;
  origem?: string;
  website?: string; // honeypot
  extra?: Record<string, string>;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const sanitize = (v: unknown, max = 200) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";

export async function POST(request: Request) {
  let body: Payload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }

  if (sanitize(body.website)) return NextResponse.json({ ok: true });

  const nome = sanitize(body.nome, 120);
  const empresa = sanitize(body.empresa, 120);
  const email = sanitize(body.email, 160);
  const whatsapp = sanitize(body.whatsapp, 40);
  const instagram = sanitize(body.instagram, 80);
  const origem = sanitize(body.origem, 60) || "Newsletter";

  const errors: Record<string, string> = {};
  if (nome.length < 2) errors.nome = "Informe seu nome.";
  if (!EMAIL_RE.test(email)) errors.email = "Informe um e-mail válido.";
  if (body.consentimento !== true)
    errors.consentimento = "É necessário aceitar receber os contatos.";

  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ errors }, { status: 422 });
  }

  const extra: Record<string, string> = {};
  if (body.extra && typeof body.extra === "object") {
    for (const [k, v] of Object.entries(body.extra)) {
      const key = sanitize(k, 60);
      const val = sanitize(v, 200);
      if (key && val) extra[key] = val;
    }
  }

  await sendLeadEmail({
    subject: `Nova captação — ${origem}`,
    replyTo: email,
    fields: {
      Origem: origem,
      Nome: nome,
      Empresa: empresa,
      "E-mail": email,
      WhatsApp: whatsapp,
      Instagram: instagram,
      ...extra,
    },
  });

  return NextResponse.json({ ok: true }, { status: 200 });
}
