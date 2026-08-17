import { NextResponse } from "next/server";
import { getPayloadClient } from "@/lib/payload";
import { sendContractSentEmail } from "@/lib/contract-email";
import { PLANOS, validarEmail, validarTelefone } from "@/lib/contract-text";
import type { ContractType } from "@/lib/contract-text";
import { siteConfig } from "@/lib/site-config";

/**
 * Reenvia o link de assinatura para um contato DIFERENTE do cadastrado no
 * contrato (ex.: contador ou advogado do cliente), a pedido do Thiago
 * (17/08/2026) — botão "Reenviar para outro contato" em ContractSaveButton.tsx.
 *
 * Diferença do resend/route.ts (mesmo diretório pai): aquele reenvia para o
 * contato já cadastrado; este pede um contato novo e GRAVA o envio em
 * Contracts.additionalRecipients, que entra no certificado de assinatura em
 * PDF (contract-pdf.tsx) — é evidência de para quem o link circulou, não só
 * de quem assinou.
 */
export async function POST(req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token: id } = await params;
  try {
    const payload = await getPayloadClient();
    const { user } = await payload.auth({ headers: req.headers });
    if (!user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    let body: { nome?: string; email?: string; telefone?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
    }
    const nome = (body.nome || "").trim();
    const email = (body.email || "").trim();
    const telefone = (body.telefone || "").trim();
    if (!email && !telefone) {
      return NextResponse.json({ error: "Informe um e-mail e/ou telefone para reenviar." }, { status: 422 });
    }
    if (email && !validarEmail(email)) {
      return NextResponse.json({ error: "E-mail inválido." }, { status: 422 });
    }
    if (telefone && !validarTelefone(telefone)) {
      return NextResponse.json({ error: "Telefone precisa ter 10 ou 11 números." }, { status: 422 });
    }

    let doc;
    try {
      doc = await payload.findByID({ collection: "contracts", id });
    } catch {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    const status = (doc as { status?: string }).status;
    const signToken = (doc as { signToken?: string }).signToken;
    if (status !== "enviado" || !signToken) {
      return NextResponse.json(
        { error: "Só é possível reenviar um contrato com status \"Enviado para assinatura\"." },
        { status: 422 },
      );
    }

    const contractType = (doc as { contractType?: ContractType }).contractType;
    const planoNome = (contractType && PLANOS[contractType]?.nome) || String(contractType);
    const signUrl = `${siteConfig.url}/assinar/${signToken}`;
    const sentAt = new Date();

    const existing =
      (doc as { additionalRecipients?: { nome?: string; email?: string; telefone?: string; sentAt?: string }[] })
        .additionalRecipients || [];
    await payload.update({
      collection: "contracts",
      id,
      data: {
        additionalRecipients: [...existing, { nome, email, telefone, sentAt: sentAt.toISOString() }],
      },
    });

    let emailResult: { ok: boolean; via: string } | null = null;
    if (email) {
      emailResult = await sendContractSentEmail({ contractId: id, clientName: nome, clientEmail: email, planoNome, signUrl });
    }

    return NextResponse.json({ ok: true, signUrl, nome, telefone, planoNome, email: emailResult });
  } catch (e) {
    console.error("[api/contracts/resend-to] exceção:", e);
    return NextResponse.json({ error: "Erro interno ao reenviar o contrato." }, { status: 500 });
  }
}
