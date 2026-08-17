"use client";

import { useMemo, useState } from "react";

const NAVY = "#1D2B3C";
const GOLD = "#C1A160";
const WARN_BG = "#FBEEE0";
const WARN_TEXT = "#8A4B12";
const LINE = "#D8D8D8";

/** Compara nomes tolerando maiúsculas/minúsculas e acentos. */
function namesMatch(a: string, b: string): boolean {
  const norm = (s: string) =>
    s
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "");
  return norm(a) === norm(b);
}

/** Compara CPF/CNPJ ignorando pontuação. */
function documentsMatch(a: string, b: string): boolean {
  const digits = (s: string) => s.replace(/\D/g, "");
  return digits(a) === digits(b) && digits(a).length > 0;
}

type Props = {
  token: string;
  /** Nome/documento cadastrados no contrato, para o aviso de divergência. */
  expectedName: string;
  expectedDocument: string;
  documentLabel: "CPF" | "CNPJ";
};

type Status = "idle" | "submitting" | "success" | "error";

export function ContractSignForm({ token, expectedName, expectedDocument, documentLabel }: Props) {
  const [signerName, setSignerName] = useState("");
  const [signerDocument, setSignerDocument] = useState("");
  const [agree, setAgree] = useState(false);
  const [mismatchAcknowledged, setMismatchAcknowledged] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [signedAt, setSignedAt] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const nameMismatch = signerName.trim().length > 2 && !namesMatch(signerName, expectedName);
  const documentMismatch = signerDocument.trim().length > 5 && !documentsMatch(signerDocument, expectedDocument);
  const hasMismatch = nameMismatch || documentMismatch;

  const canSubmit = useMemo(
    () =>
      agree &&
      signerName.trim().length > 2 &&
      signerDocument.trim().length > 5 &&
      (!hasMismatch || mismatchAcknowledged) &&
      status !== "submitting",
    [agree, signerName, signerDocument, hasMismatch, mismatchAcknowledged, status],
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setStatus("submitting");
    setErrorMsg("");
    try {
      const res = await fetch(`/api/contracts/${token}/sign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signerName, signerDocument, agree, mismatchAcknowledged }),
      });
      const json = await res.json();
      if (!res.ok || json.error) {
        setStatus("error");
        setErrorMsg(
          json.error === "integrity_mismatch"
            ? "O texto do contrato não pôde ser confirmado. Entre em contato com a Empresarial Academy antes de assinar."
            : json.error === "mismatch_not_acknowledged"
              ? "Confirme a declaração de representação/autorização antes de assinar."
              : "Não foi possível registrar a assinatura agora. Tente novamente em instantes.",
        );
        return;
      }
      setSignedAt(json.signedAt || null);
      setPdfUrl(json.pdfUrl || null);
      setStatus("success");
    } catch {
      setStatus("error");
      setErrorMsg("Não foi possível registrar a assinatura agora. Tente novamente em instantes.");
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 12px",
    minHeight: 44,
    border: `1px solid ${LINE}`,
    borderRadius: 6,
    fontSize: 16,
  };
  const checkboxStyle: React.CSSProperties = { width: 20, height: 20, minWidth: 20, marginTop: 2, flexShrink: 0 };

  if (status === "success") {
    return (
      <div style={{ background: "#EFF6EE", border: "1px solid #BFDDB8", borderRadius: 8, padding: "clamp(16px, 5vw, 22px)" }}>
        <strong style={{ color: "#2E5C2A", fontSize: "clamp(14px, 4vw, 15px)" }}>Contrato assinado com sucesso.</strong>
        <p style={{ margin: "8px 0 0", color: "#2E5C2A", fontSize: 14, lineHeight: 1.5 }}>
          {signedAt
            ? `Registrado em ${new Date(signedAt).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}.`
            : "Sua assinatura foi registrada."}{" "}
          Você receberá um e-mail de confirmação em instantes.
        </p>
        {pdfUrl && (
          <a
            href={pdfUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              boxSizing: "border-box",
              marginTop: 14,
              padding: "14px 20px",
              minHeight: 44,
              background: NAVY,
              color: "#fff",
              fontWeight: 700,
              fontSize: 14,
              textDecoration: "none",
              borderRadius: 6,
            }}
          >
            Baixar certificado de assinatura (PDF)
          </a>
        )}
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{ border: `1px solid ${LINE}`, borderRadius: 8, padding: "clamp(16px, 5vw, 22px)", background: "#fff", boxSizing: "border-box" }}
    >
      <h3 style={{ margin: "0 0 12px", color: NAVY, fontSize: "clamp(15px, 4.5vw, 16px)" }}>Assinatura eletrônica</h3>

      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#444", margin: "10px 0 6px" }}>
        Nome completo
      </label>
      <input
        type="text"
        inputMode="text"
        autoComplete="name"
        value={signerName}
        onChange={(e) => setSignerName(e.target.value)}
        placeholder="Digite seu nome completo"
        style={inputStyle}
      />
      {nameMismatch && (
        <p style={{ background: WARN_BG, color: WARN_TEXT, border: "1px solid #E6C79C", borderRadius: 6, padding: "8px 10px", fontSize: 12, lineHeight: 1.5, marginTop: 8 }}>
          O nome digitado é diferente do nome registrado neste contrato ({expectedName}). Confira antes de continuar:
          você ainda pode assinar, mas essa divergência fica registrada.
        </p>
      )}

      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#444", margin: "14px 0 6px" }}>
        {documentLabel}
      </label>
      <input
        type="text"
        inputMode="numeric"
        value={signerDocument}
        onChange={(e) => setSignerDocument(e.target.value)}
        placeholder={documentLabel === "CPF" ? "000.000.000-00" : "00.000.000/0000-00"}
        style={inputStyle}
      />
      {documentMismatch && (
        <p style={{ background: WARN_BG, color: WARN_TEXT, border: "1px solid #E6C79C", borderRadius: 6, padding: "8px 10px", fontSize: 12, lineHeight: 1.5, marginTop: 8 }}>
          O {documentLabel} digitado é diferente do registrado neste contrato. Confira antes de continuar:
          você ainda pode assinar, mas essa divergência fica registrada.
        </p>
      )}

      {hasMismatch && (
        <label style={{ display: "flex", alignItems: "flex-start", gap: 10, marginTop: 16, fontSize: 13, lineHeight: 1.5, fontWeight: 600, background: WARN_BG, padding: "12px", borderRadius: 6, border: "1px solid #E6C79C" }}>
          <input
            type="checkbox"
            checked={mismatchAcknowledged}
            onChange={(e) => setMismatchAcknowledged(e.target.checked)}
            style={checkboxStyle}
          />
          <span style={{ color: WARN_TEXT }}>
            Declaro que sou representante legal ou pessoa autorizada a assinar este contrato em nome da
            CONTRATANTE, e que os dados que informei acima estão corretos.
          </span>
        </label>
      )}

      <label style={{ display: "flex", alignItems: "flex-start", gap: 10, marginTop: 18, fontSize: 13, lineHeight: 1.5, fontWeight: 600 }}>
        <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} style={checkboxStyle} />
        <span>Li e concordo com os termos deste contrato, incluindo a Cláusula de Assinatura Eletrônica.</span>
      </label>

      {status === "error" && (
        <p style={{ background: WARN_BG, color: WARN_TEXT, border: "1px solid #E6C79C", borderRadius: 6, padding: "8px 10px", fontSize: 12, lineHeight: 1.5, marginTop: 12 }}>
          {errorMsg}
        </p>
      )}

      <button
        type="submit"
        disabled={!canSubmit}
        style={{
          width: "100%",
          boxSizing: "border-box",
          marginTop: 18,
          fontWeight: 700,
          letterSpacing: ".02em",
          textTransform: "uppercase",
          padding: "14px 22px",
          minHeight: 48,
          border: `1px solid ${NAVY}`,
          borderRadius: 6,
          background: canSubmit ? NAVY : "#9AA3AF",
          borderColor: canSubmit ? NAVY : "#9AA3AF",
          color: "#fff",
          cursor: canSubmit ? "pointer" : "not-allowed",
          fontSize: 14,
        }}
      >
        {status === "submitting" ? "Assinando..." : "Assinar contrato"}
      </button>
      <p style={{ fontSize: 11, color: "#777", marginTop: 10, lineHeight: 1.5 }}>
        Empresarial Academy <span style={{ color: GOLD }}>&middot;</span> assinatura eletrônica nos termos da MP nº 2.200-2/2001
      </p>
    </form>
  );
}
