import { NextResponse } from "next/server";
import { getPayloadClient } from "@/lib/payload";
import { sendContractSentEmail } from "@/lib/contract-email";
import { PLANOS } from "@/lib/contract-text";
import type { ContractType } from "@/lib/contract-text";
import { siteConfig } from "@/lib/site-config";

/**
 * Reenvia o link de assinatura de um contrato já enviado (botão "Reenviar
 * link" em ContractSaveButton.tsx). Reaproveita o mesmo signToken já gravado
 * (não gera um novo — o link que o cliente já tem continua válido). Dispara
 * de novo o e-mail (mesmo padrão de sendContractSentEmail em api/contracts)
 * e devolve os dados prontos para o botão montar o link de WhatsApp no
 * cliente (a EA não tem WhatsApp Business API, então esse envio é sempre um
 * clique manual, nunca automático — ver contract-email.ts/ContractGeneratorForm.tsx).
 *
 * Vive em contracts/[token]/resend (mesmo segmento dinâmico de
 * contracts/[token]/sign) porque o Next.js exige o mesmo nome de parâmetro
 * em todas as rotas dentro de um segmento dinâmico compartilhado — apesar do
 * nome, o valor recebido aqui é o ID do documento no Payload (usado pela UI
 * autenticada do admin), não o signToken público usado por /assinar/[token].
 *
 * Acesso restrito a usuários autenticados do admin, mesmo padrão de
 * api/contracts/route.ts.
 */
export async function POST(req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token: id } = await params;
  try {
    const payload = await getPayloadClient();
    const { user } = await payload.auth({ headers: req.headers });
    if (!user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
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
    const tipoPessoa = (doc as { tipoPessoa?: string }).tipoPessoa;
    const clientName =
      tipoPessoa === "PJ" ? String((doc as { pjRazao?: string }).pjRazao || "") : String((doc as { pfNome?: string }).pfNome || "");
    const clientEmail = String((doc as { clienteEmail?: string }).clienteEmail || "");
    const clientPhone = String((doc as { clienteTelefone?: string }).clienteTelefone || "");
    const signUrl = `${siteConfig.url}/assinar/${signToken}`;

    const emailResult = await sendContractSentEmail({
      contractId: id,
      clientName,
      clientEmail,
      planoNome,
      signUrl,
    });

    return NextResponse.json({ ok: true, signUrl, clientName, clientPhone, planoNome, email: emailResult });
  } catch (e) {
    console.error("[api/contracts/resend] exceção:", e);
    return NextResponse.json({ error: "Erro interno ao reenviar o contrato." }, { status: 500 });
  }
}
