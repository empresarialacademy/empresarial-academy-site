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
 * Contrato com status "enviado" (ainda não assinado) ganha dois botões ao
 * lado do Salvar: "Reenviar link" (reenvia para o contato já cadastrado,
 * e-mail automático + WhatsApp em clique manual — sem WhatsApp Business
 * API, não existe envio automático) e "Reenviar para outro contato" (abre
 * um popup pedindo nome/e-mail/telefone de um destinatário diferente —
 * ex.: contador ou advogado do cliente — e grava esse reenvio em
 * Contracts.additionalRecipients, que passa a constar no certificado de
 * assinatura em PDF).
 */

const NAVY = "#1D2B3C";
const LINE = "#D8D8D8";

function ResendToOtherModal({
  contractId,
  onClose,
  onSent,
}: {
  contractId: string | number;
  onClose: () => void;
  onSent: (result: { signUrl: string; nome: string; telefone: string; planoNome: string }) => void;
}) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() && !telefone.trim()) {
      setError("Informe um e-mail e/ou telefone.");
      return;
    }
    setSending(true);
    setError("");
    try {
      const res = await fetch(`/api/contracts/${contractId}/resend-to`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, telefone }),
      });
      const json = await res.json();
      if (!res.ok || json.error) {
        setError(json.error || "Não foi possível reenviar.");
        setSending(false);
        return;
      }
      onSent({ signUrl: json.signUrl, nome, telefone, planoNome: json.planoNome });
    } catch (err) {
      setError("Erro de rede ao reenviar.");
      console.error("[ResendToOtherModal] exceção:", err);
      setSending(false);
    }
  }

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        style={{ background: "#fff", borderRadius: 8, padding: "24px 26px", width: "100%", maxWidth: 420, boxSizing: "border-box" }}
      >
        <h3 style={{ margin: "0 0 6px", color: NAVY, fontSize: 16 }}>Reenviar para outro contato</h3>
        <p style={{ margin: "0 0 16px", fontSize: 12, color: "#666", lineHeight: 1.5 }}>
          Envia o mesmo link de assinatura para um contato diferente do cadastrado no contrato (ex.: contador ou
          advogado do cliente). Esse reenvio fica registrado no certificado de assinatura.
        </p>

        <label style={{ display: "block", fontSize: 12, fontWeight: 600, margin: "10px 0 4px" }}>Nome</label>
        <input
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          style={{ width: "100%", boxSizing: "border-box", padding: "9px 10px", border: `1px solid ${LINE}`, borderRadius: 6, fontSize: 14 }}
        />

        <label style={{ display: "block", fontSize: 12, fontWeight: 600, margin: "10px 0 4px" }}>E-mail</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: "100%", boxSizing: "border-box", padding: "9px 10px", border: `1px solid ${LINE}`, borderRadius: 6, fontSize: 14 }}
        />

        <label style={{ display: "block", fontSize: 12, fontWeight: 600, margin: "10px 0 4px" }}>Telefone (WhatsApp)</label>
        <input
          type="text"
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
          placeholder="(11) 90000-0000"
          style={{ width: "100%", boxSizing: "border-box", padding: "9px 10px", border: `1px solid ${LINE}`, borderRadius: 6, fontSize: 14 }}
        />

        {error && <p style={{ fontSize: 12, color: "#A32626", marginTop: 10 }}>{error}</p>}

        <div style={{ display: "flex", gap: 8, marginTop: 18, justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={onClose}
            style={{ padding: "9px 16px", border: `1px solid ${LINE}`, borderRadius: 6, background: "#fff", color: NAVY, fontSize: 13, cursor: "pointer" }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={sending}
            style={{ padding: "9px 16px", border: `1px solid ${NAVY}`, borderRadius: 6, background: NAVY, color: "#fff", fontSize: 13, cursor: sending ? "not-allowed" : "pointer" }}
          >
            {sending ? "Enviando..." : "Enviar"}
          </button>
        </div>
      </form>
    </div>
  );
}

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
  const [showResendToModal, setShowResendToModal] = useState(false);

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
    const id = (data as { id?: string | number })?.id;
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
        <div style={{ display: "flex", gap: 8 }}>
          <FormSubmit buttonId="action-save" buttonStyle="primary" size="medium" type="button" onClick={() => submit()}>
            Salvar
          </FormSubmit>
          <FormSubmit buttonId="action-resend" buttonStyle="secondary" size="medium" type="button" onClick={handleResend} disabled={working}>
            {working ? "Reenviando..." : "Reenviar link"}
          </FormSubmit>
          <FormSubmit
            buttonId="action-resend-to"
            buttonStyle="secondary"
            size="medium"
            type="button"
            onClick={() => setShowResendToModal(true)}
            disabled={working || !id}
          >
            Reenviar para outro contato
          </FormSubmit>
        </div>
        {resendMsg && <span style={{ fontSize: 11, color: "var(--theme-elevation-500)" }}>{resendMsg}</span>}
        {showResendToModal && id && (
          <ResendToOtherModal
            contractId={id}
            onClose={() => setShowResendToModal(false)}
            onSent={({ signUrl, nome, telefone, planoNome }) => {
              setShowResendToModal(false);
              setResendMsg("Reenviado para o contato adicional.");
              if (telefone) {
                window.open(buildWhatsAppSignUrl({ clientPhone: telefone, clientName: nome, planoNome, signUrl }), "_blank");
              }
            }}
          />
        )}
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
