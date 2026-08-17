"use client";
import React, { useState } from "react";
import { FormSubmit, useForm } from "@payloadcms/ui";
import { useRouter } from "next/navigation";
import { buildWhatsAppSignUrl } from "@/lib/contract-text";

/**
 * Substitui o "Salvar" nativo na coleção Contracts (mesmo padrão de
 * PublishButton.tsx para Posts, admin.components.edit.SaveButton).
 *
 * Contrato com status "assinado" não pode mais ser editado (bloqueado
 * também no servidor, em Contracts.ts beforeChange — este botão é só a
 * camada de UI). Em vez de Salvar, oferece "Duplicar contrato": cria um
 * novo rascunho com os mesmos dados (cliente, plano, valores, bônus etc.),
 * sem nenhum campo de assinatura/evidência, e leva para a edição dele.
 *
 * Contrato com status "enviado" (ainda não assinado) ganha um botão
 * "Reenviar link" ao lado do Salvar: reenvia o e-mail automaticamente e
 * abre o WhatsApp com a mensagem pronta (clique manual — sem WhatsApp
 * Business API, não existe envio automático).
 */

const FIELDS_TO_STRIP = new Set([
  "id",
  "status",
  "title",
  "contractHtml",
  "contractHash",
  "signToken",
  "signedAt",
  "signerIp",
  "signerNameConfirmed",
  "signerDocumentConfirmed",
  "signatureHashAtSigning",
  "signerMismatchAcknowledged",
  "signedPdf",
  "createdAt",
  "updatedAt",
]);

export function ContractSaveButton() {
  const { getData, submit } = useForm();
  const router = useRouter();
  const [working, setWorking] = useState(false);
  const [resendMsg, setResendMsg] = useState("");

  const data = getData();
  const isSigned = data?.status === "assinado";
  const isSent = data?.status === "enviado";

  async function handleResend() {
    const id = (data as { id?: string | number })?.id;
    if (!id) return;
    setWorking(true);
    setResendMsg("Reenviando...");
    try {
      const res = await fetch(`/api/contracts/${id}/resend`, { method: "POST" });
      const json = await res.json();
      if (!res.ok || json.error) {
        setResendMsg(json.error || "Não foi possível reenviar.");
        setWorking(false);
        return;
      }
      setResendMsg(json.email?.ok ? "E-mail reenviado." : "Contrato ok, mas o e-mail pode não ter saído.");
      const clientPhone = String((data as { clienteTelefone?: string })?.clienteTelefone || "");
      if (clientPhone) {
        const waUrl = buildWhatsAppSignUrl({
          clientPhone,
          clientName: json.clientName,
          planoNome: json.planoNome,
          signUrl: json.signUrl,
        });
        window.open(waUrl, "_blank");
      }
    } catch (e) {
      setResendMsg("Erro de rede ao reenviar.");
      console.error("[ContractSaveButton] exceção ao reenviar:", e);
    }
    setWorking(false);
  }

  if (isSent) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
        <div style={{ display: "flex", gap: 8 }}>
          <FormSubmit buttonId="action-save" buttonStyle="primary" size="medium" type="button" onClick={() => submit()}>
            Salvar
          </FormSubmit>
          <FormSubmit buttonId="action-resend" buttonStyle="secondary" size="medium" type="button" onClick={handleResend} disabled={working}>
            {working ? "Reenviando..." : "Reenviar link"}
          </FormSubmit>
        </div>
        {resendMsg && <span style={{ fontSize: 11, color: "var(--theme-elevation-500)" }}>{resendMsg}</span>}
      </div>
    );
  }

  if (!isSigned) {
    return (
      <FormSubmit buttonId="action-save" buttonStyle="primary" size="medium" type="button" onClick={() => submit()}>
        Salvar
      </FormSubmit>
    );
  }

  async function handleDuplicate() {
    setWorking(true);
    const current = getData() || {};
    const body: Record<string, unknown> = { action: "draft" };
    for (const [key, value] of Object.entries(current)) {
      if (!FIELDS_TO_STRIP.has(key)) body[key] = value;
    }
    try {
      const res = await fetch("/api/contracts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (res.ok && json.id) {
        router.push(`/eahub/collections/contracts/${json.id}`);
      } else {
        setWorking(false);
        window.alert("Não foi possível duplicar o contrato. Confira o console para detalhes.");
        console.error("[ContractSaveButton] duplicar falhou:", json);
      }
    } catch (e) {
      setWorking(false);
      window.alert("Erro de rede ao duplicar o contrato.");
      console.error("[ContractSaveButton] exceção ao duplicar:", e);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
      <FormSubmit buttonId="action-duplicate" buttonStyle="secondary" size="medium" type="button" onClick={handleDuplicate}>
        {working ? "Duplicando..." : "Duplicar contrato"}
      </FormSubmit>
      <span style={{ fontSize: 11, color: "var(--theme-elevation-500)" }}>Contrato assinado, não é editável.</span>
    </div>
  );
}
