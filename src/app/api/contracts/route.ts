import { NextResponse } from "next/server";
import { getPayloadClient } from "@/lib/payload";
import {
  buildContractHtml,
  validarCPF,
  validarCNPJ,
  validarEmail,
  type ContractInput,
  type ContractType,
} from "@/lib/contract-text";
import { generateSignToken, hashContractText } from "@/lib/contract-token";
import { sendContractSentEmail } from "@/lib/contract-email";
import { siteConfig } from "@/lib/site-config";

/**
 * Cria (ou atualiza um rascunho de) contrato a partir do formulário do
 * Gerador de Contratos no EA HUB (view custom registrada em payload.config.ts).
 *
 * action "draft" grava sem enviar. action "send" grava com status "enviado",
 * gera o link de assinatura e dispara o e-mail ao cliente
 * (src/lib/contract-email.ts → sendContractSentEmail).
 *
 * Acesso restrito a usuários autenticados do admin, igual ao padrão de
 * src/app/api/parse-markdown/route.ts (payload.auth via headers).
 */

const CONTRACT_TYPES: ContractType[] = ["mentoria", "consultoria", "conselho", "diagnostico", "projeto"];

type Body = ContractInput & { id?: string | number; action?: "draft" | "send" };

export async function POST(req: Request) {
  try {
    const payload = await getPayloadClient();
    const { user } = await payload.auth({ headers: req.headers });
    if (!user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    let body: Body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
    }

    const errors: Record<string, string> = {};
    if (!body.contractType || !CONTRACT_TYPES.includes(body.contractType)) {
      errors.contractType = "Selecione o tipo de contrato.";
    }
    if (body.tipoPessoa !== "PF" && body.tipoPessoa !== "PJ") {
      errors.tipoPessoa = "Selecione pessoa física ou jurídica.";
    }
    if (!body.clienteEmail || !validarEmail(body.clienteEmail)) {
      errors.clienteEmail = "E-mail do cliente inválido.";
    }
    if (body.tipoPessoa === "PF" && body.pfCpf && !validarCPF(body.pfCpf)) {
      errors.pfCpf = "CPF do cliente inválido.";
    }
    if (body.tipoPessoa === "PJ" && body.pjCnpj && !validarCNPJ(body.pjCnpj)) {
      errors.pjCnpj = "CNPJ do cliente inválido.";
    }
    if (body.tipoPessoa === "PJ" && body.pjRepCpf && !validarCPF(body.pjRepCpf)) {
      errors.pjRepCpf = "CPF do representante inválido.";
    }
    const action = body.action === "send" ? "send" : "draft";
    if (action === "send") {
      // Enviar exige os dados mínimos de identificação do signatário.
      if (body.tipoPessoa === "PF" && !(body.pfCpf && validarCPF(body.pfCpf))) {
        errors.pfCpf = "CPF do cliente é obrigatório e precisa ser válido para enviar.";
      }
      if (body.tipoPessoa === "PJ" && !(body.pjCnpj && validarCNPJ(body.pjCnpj))) {
        errors.pjCnpj = "CNPJ do cliente é obrigatório e precisa ser válido para enviar.";
      }
    }
    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ errors }, { status: 422 });
    }

    const input: ContractInput = { ...body, assinaturaEletronica: true };
    const { html, planoNome, nomeContratante } = buildContractHtml(input);
    const hash = hashContractText(html);

    const data: Record<string, unknown> = {
      ...input,
      status: action === "send" ? "enviado" : "rascunho",
      contractHtml: html,
      contractHash: hash,
    };
    // Campos de controle não fazem parte do ContractInput e não devem ser
    // gravados a partir do corpo recebido do cliente.
    delete (data as Record<string, unknown>).id;
    delete (data as Record<string, unknown>).action;

    let doc;
    if (body.id) {
      doc = await payload.update({ collection: "contracts", id: body.id, data: data as never });
    } else {
      doc = await payload.create({ collection: "contracts", data: data as never });
    }

    let emailResult: { ok: boolean; via: string } | null = null;
    let signUrl: string | null = null;
    if (action === "send") {
      const signToken = (doc as { signToken?: string }).signToken || generateSignToken(doc.id);
      signUrl = `${siteConfig.url}/assinar/${signToken}`;
      emailResult = await sendContractSentEmail({
        contractId: doc.id,
        clientName: nomeContratante,
        clientEmail: input.clienteEmail || "",
        planoNome,
        signUrl,
      });
    }

    return NextResponse.json({
      ok: true,
      id: doc.id,
      status: (doc as { status?: string }).status,
      signUrl,
      email: emailResult,
    });
  } catch (e) {
    console.error("[api/contracts] exceção:", e);
    return NextResponse.json({ error: "Erro interno ao salvar o contrato." }, { status: 500 });
  }
}
