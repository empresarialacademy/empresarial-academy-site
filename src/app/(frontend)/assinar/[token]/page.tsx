import type { Metadata } from "next";
import { getPayloadClient } from "@/lib/payload";
import { verifySignToken } from "@/lib/contract-token";
import { ContractSignForm } from "@/components/contracts/ContractSignForm";

export const metadata: Metadata = {
  title: "Assinatura de contrato",
  robots: { index: false, follow: false },
};

const NAVY = "#1D2B3C";
const LINE = "#D8D8D8";
const PAPER_BG = "#F1F0EC";

function ErrorScreen({ title, message }: { title: string; message: string }) {
  return (
    <main style={{ background: PAPER_BG, minHeight: "60vh", padding: "clamp(24px, 8vw, 48px) clamp(12px, 4vw, 20px)" }}>
      <div style={{ maxWidth: 560, margin: "0 auto", background: "#fff", border: `1px solid ${LINE}`, borderRadius: 8, padding: "clamp(20px, 5vw, 32px) clamp(16px, 5vw, 28px)" }}>
        <h1 style={{ color: NAVY, fontSize: "clamp(18px, 5vw, 20px)", margin: "0 0 12px" }}>{title}</h1>
        <p style={{ color: "#444", fontSize: 14, lineHeight: 1.6 }}>{message}</p>
      </div>
    </main>
  );
}

function DownloadPdfButton({ url }: { url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        boxSizing: "border-box",
        marginTop: 16,
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
  );
}

type Props = { params: Promise<{ token: string }> };

export default async function AssinarPage({ params }: Props) {
  const { token } = await params;
  const payload = await getPayloadClient();

  const { docs } = await payload.find({
    collection: "contracts",
    where: { signToken: { equals: token } },
    limit: 1,
  });
  const doc = docs[0] as unknown as Record<string, unknown> | undefined;

  if (!doc || !verifySignToken(doc.id as string | number, token)) {
    return (
      <ErrorScreen
        title="Link inválido"
        message="Este link de assinatura não é válido ou expirou. Entre em contato com a Empresarial Academy para receber um novo link."
      />
    );
  }

  if (doc.status === "cancelado") {
    return (
      <ErrorScreen
        title="Contrato cancelado"
        message="Este contrato foi cancelado e não está mais disponível para assinatura. Entre em contato com a Empresarial Academy em caso de dúvida."
      />
    );
  }

  const planoTitulo = String(doc.title || "Contrato de Prestação de Serviços");

  if (doc.status === "assinado") {
    const signedAtLabel = doc.signedAt
      ? new Date(String(doc.signedAt)).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })
      : null;
    const pdfUrl = (doc.signedPdf as { url?: string } | number | null | undefined);
    const pdfHref = pdfUrl && typeof pdfUrl === "object" ? pdfUrl.url : undefined;
    return (
      <main style={{ background: PAPER_BG, minHeight: "60vh", padding: "clamp(24px, 8vw, 48px) clamp(12px, 4vw, 20px)" }}>
        <div style={{ maxWidth: 560, margin: "0 auto", background: "#fff", border: `1px solid ${LINE}`, borderRadius: 8, padding: "clamp(20px, 5vw, 32px) clamp(16px, 5vw, 28px)" }}>
          <h1 style={{ color: NAVY, fontSize: "clamp(18px, 5vw, 20px)", margin: "0 0 12px" }}>Contrato já assinado</h1>
          <p style={{ color: "#444", fontSize: 14, lineHeight: 1.6 }}>
            {planoTitulo} já foi assinado eletronicamente{signedAtLabel ? ` em ${signedAtLabel}` : ""}. Não é
            necessário assinar novamente. Uma cópia da confirmação foi enviada por e-mail.
          </p>
          {pdfHref && <DownloadPdfButton url={pdfHref} />}
        </div>
      </main>
    );
  }

  if (doc.status !== "enviado") {
    return (
      <ErrorScreen
        title="Contrato ainda não disponível"
        message="Este contrato ainda não foi enviado para assinatura. Entre em contato com a Empresarial Academy em caso de dúvida."
      />
    );
  }

  // Quem assina é sempre uma pessoa física (o próprio cliente PF ou o
  // representante legal da PJ) com nome e CPF, conforme a própria Cláusula
  // de Assinatura Eletrônica do contrato (confirmação de nome + CPF, ou
  // CNPJ e dados do representante, quando pessoa jurídica).
  const isPJ = doc.tipoPessoa === "PJ";
  const expectedName = String((isPJ ? doc.pjRepNome : doc.pfNome) || "");
  const expectedDocument = String((isPJ ? doc.pjRepCpf : doc.pfCpf) || "");

  return (
    <main style={{ background: PAPER_BG, padding: "clamp(20px, 6vw, 40px) clamp(12px, 4vw, 16px) 64px" }}>
      <div style={{ maxWidth: 780, margin: "0 auto" }}>
        <h1 style={{ color: NAVY, fontSize: "clamp(18px, 5vw, 20px)", margin: "0 0 4px" }}>Assinatura de contrato</h1>
        <p style={{ color: "#666", fontSize: 13, margin: "0 0 20px" }}>
          Leia o contrato abaixo com atenção antes de assinar. O texto exibido é exatamente o que foi enviado pela
          Empresarial Academy.
        </p>

        <div
          style={{
            background: "#fff",
            border: `1px solid ${LINE}`,
            borderRadius: 8,
            padding: "clamp(18px, 6vw, 40px) clamp(16px, 6vw, 44px)",
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: "clamp(13px, 3.6vw, 14px)",
            lineHeight: 1.6,
            color: "#111",
            marginBottom: 20,
            overflowWrap: "break-word",
          }}
          // Texto gerado no servidor no momento do envio, armazenado imutável
          // (Contracts.contractHtml) — exibido exatamente como foi enviado,
          // nunca regenerado ao vivo, para bater com o contractHash.
          dangerouslySetInnerHTML={{ __html: String(doc.contractHtml || "") }}
        />

        <ContractSignForm
          token={token}
          expectedName={expectedName}
          expectedDocument={expectedDocument}
          documentLabel={isPJ ? "CNPJ" : "CPF"}
        />
      </div>
    </main>
  );
}
