import { NextResponse } from "next/server";
import { getPayloadClient } from "@/lib/payload";
import { verifySignToken, hashContractText } from "@/lib/contract-token";
import { sendContractSignedEmails } from "@/lib/contract-email";
import { renderContractCertificatePdf } from "@/lib/contract-pdf";
import { PLANOS, namesMatch, documentsMatch } from "@/lib/contract-text";
import type { ContractType } from "@/lib/contract-text";
import { siteConfig } from "@/lib/site-config";

/**
 * Rota de assinatura eletrônica pública (chamada pela página /assinar/[token]).
 *
 * Fluxo (ver plano do Thiago, seção 5):
 *  1. Reverifica o token (HMAC recomputado a partir do id, nunca confia no
 *     token só porque bateu no find pelo campo signToken).
 *  2. Reconfirma status "enviado" (idempotente: "assinado" não reassina;
 *     "cancelado"/inexistente é erro).
 *  3. Recalcula o hash do texto ARMAZENADO e compara com contractHash — se
 *     divergir, algo alterou o contrato entre o envio e a assinatura: recusa
 *     e loga, não assina.
 *  4. Captura IP (x-forwarded-for/x-real-ip) e timestamp no servidor (nunca
 *     confia em hora enviada pelo cliente).
 *  5. Grava evidência de assinatura (via Local API, que ignora os
 *     field-level `access.update: () => false` da coleção Contracts —
 *     só este caminho de servidor escreve esses campos).
 *  6. Dispara os dois e-mails de confirmação (cliente + Thiago).
 */

function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "desconhecido";
}

export async function POST(req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  try {
    const payload = await getPayloadClient();

    let body: { signerName?: string; signerDocument?: string; agree?: boolean; mismatchAcknowledged?: boolean };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
    }
    if (body.agree !== true) {
      return NextResponse.json({ error: "É necessário aceitar os termos do contrato." }, { status: 422 });
    }
    const signerName = (body.signerName || "").trim();
    const signerDocument = (body.signerDocument || "").trim();
    if (signerName.length < 3 || !signerDocument) {
      return NextResponse.json({ error: "Informe nome completo e CPF/CNPJ para assinar." }, { status: 422 });
    }

    const { docs } = await payload.find({
      collection: "contracts",
      where: { signToken: { equals: token } },
      limit: 1,
    });
    const doc = docs[0] as unknown as Record<string, unknown> | undefined;

    if (!doc || !verifySignToken(doc.id as string | number, token)) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    if (doc.status === "assinado") {
      return NextResponse.json({
        ok: true,
        alreadySigned: true,
        signedAt: doc.signedAt,
      });
    }
    if (doc.status === "cancelado") {
      return NextResponse.json({ error: "cancelled" }, { status: 410 });
    }
    if (doc.status !== "enviado") {
      return NextResponse.json({ error: "not_ready" }, { status: 409 });
    }

    const storedHtml = String(doc.contractHtml || "");
    const recomputedHash = hashContractText(storedHtml);
    if (recomputedHash !== doc.contractHash) {
      console.error("[contracts/sign] divergência de hash no contrato", doc.id, {
        contractHash: doc.contractHash,
        recomputedHash,
      });
      return NextResponse.json({ error: "integrity_mismatch" }, { status: 409 });
    }

    // Signatário esperado: para PJ é o representante legal (é ele quem assina de fato),
    // não a empresa pelo CNPJ — critério confirmado com o Thiago.
    const expectedName = doc.tipoPessoa === "PJ" ? String(doc.pjRepNome || "") : String(doc.pfNome || "");
    const expectedDocument = doc.tipoPessoa === "PJ" ? String(doc.pjRepCpf || "") : String(doc.pfCpf || "");
    const hasMismatch =
      (expectedName && !namesMatch(signerName, expectedName)) ||
      (expectedDocument && !documentsMatch(signerDocument, expectedDocument));
    if (hasMismatch && body.mismatchAcknowledged !== true) {
      return NextResponse.json({ error: "mismatch_not_acknowledged" }, { status: 422 });
    }

    const signedAt = new Date();
    const ip = clientIp(req);
    const mismatchAcknowledged = Boolean(hasMismatch && body.mismatchAcknowledged);

    const planoNome = PLANOS[doc.contractType as ContractType]?.nome || String(doc.contractType);
    const clientName = doc.tipoPessoa === "PJ" ? String(doc.pjRazao || "") : String(doc.pfNome || "");
    const signedAtLabel = signedAt.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
    const documentLabel: "CPF" | "CNPJ" = doc.tipoPessoa === "PJ" ? "CNPJ" : "CPF";
    const clientDocumentOnFile = doc.tipoPessoa === "PJ" ? String(doc.pjCnpj || "") : String(doc.pfCpf || "");
    const eaHubUrl = `${siteConfig.url}/eahub/collections/contracts/${doc.id}`;

    // Certificado em PDF (certificado + contrato integral) — gerado ANTES de
    // gravar a assinatura, para que a transição "enviado" → "assinado" seja
    // um único payload.update com tudo junto (signedPdf incluído). Isso
    // importa: a coleção Contracts bloqueia qualquer update posterior a um
    // documento já "assinado" (ver Contracts.ts beforeChange) — duas
    // escritas separadas fariam a segunda (anexar o PDF) se autobloquear.
    let pdfBuffer: Buffer | undefined;
    let pdfUrl: string | undefined;
    let pdfDocId: number | undefined;
    try {
      pdfBuffer = await renderContractCertificatePdf(
        {
          contractId: doc.id as string | number,
          planoNome,
          clientName,
          clientDocumentLabel: documentLabel,
          clientDocumentOnFile,
          signerName,
          signerDocument,
          signerIp: ip,
          signedAtLabel,
          contractHash: recomputedHash,
          mismatchAcknowledged,
          eaHubUrl,
        },
        storedHtml,
      );
      const pdfDoc = await payload.create({
        collection: "contract-documents",
        data: { alt: `Certificado de Assinatura Eletrônica · ${planoNome} · ${clientName}` },
        file: {
          data: pdfBuffer,
          mimetype: "application/pdf",
          name: `certificado-contrato-${doc.id}.pdf`,
          size: pdfBuffer.length,
        },
      });
      pdfUrl = (pdfDoc as { url?: string }).url;
      pdfDocId = pdfDoc.id;
    } catch (e) {
      console.error("[contracts/sign] falha ao gerar/anexar o certificado em PDF:", e);
    }

    await payload.update({
      collection: "contracts",
      id: doc.id as string | number,
      data: {
        status: "assinado",
        signedAt: signedAt.toISOString(),
        signerIp: ip,
        signerNameConfirmed: signerName,
        signerDocumentConfirmed: signerDocument,
        signatureHashAtSigning: recomputedHash,
        signerMismatchAcknowledged: mismatchAcknowledged,
        ...(pdfDocId ? { signedPdf: pdfDocId } : {}),
      },
    });

    sendContractSignedEmails({
      contractId: doc.id as string | number,
      clientName,
      clientEmail: String(doc.clienteEmail || ""),
      planoNome,
      signedAtLabel,
      pdfBuffer,
    }).catch((e) => console.error("[contracts/sign] falha ao enviar e-mails de confirmação:", e));

    return NextResponse.json({ ok: true, signedAt: signedAt.toISOString(), pdfUrl });
  } catch (e) {
    console.error("[contracts/sign] exceção:", e);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
