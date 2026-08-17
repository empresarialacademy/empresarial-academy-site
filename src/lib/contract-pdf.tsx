import React from "react";
import { Document, Page, Text, View, StyleSheet, renderToBuffer } from "@react-pdf/renderer";
import { stripHtmlToText } from "@/lib/contract-text";

/**
 * Gera o PDF entregue às duas partes após a assinatura: uma página de
 * Certificado de Assinatura Eletrônica (evidências) seguida do contrato
 * integral (mesmo texto de contractHtml, reformatado como parágrafos).
 *
 * Não depende de Chromium/Puppeteer (@react-pdf/renderer é JS puro), o que
 * evita o problema de tamanho de função serverless na Vercel.
 */

const NAVY = "#1D2B3C";
const GOLD = "#C1A160";
const INK = "#1A1A1A";

const styles = StyleSheet.create({
  page: { padding: 48, fontSize: 10.5, fontFamily: "Helvetica", color: INK, lineHeight: 1.5 },
  certHeader: { backgroundColor: NAVY, padding: 18, marginBottom: 20 },
  certBrand: { color: GOLD, fontSize: 11, fontFamily: "Helvetica-Bold" },
  certTitle: { color: "#fff", fontSize: 16, fontFamily: "Helvetica-Bold", marginTop: 4 },
  sectionTitle: { fontSize: 11, fontFamily: "Helvetica-Bold", color: NAVY, marginTop: 16, marginBottom: 6 },
  row: { flexDirection: "row", marginBottom: 4 },
  label: { width: 170, fontFamily: "Helvetica-Bold", color: "#444" },
  value: { flex: 1 },
  note: { marginTop: 18, fontSize: 9, color: "#555", lineHeight: 1.5 },
  divider: { borderBottomWidth: 1, borderBottomColor: "#D8D8D8", marginVertical: 14 },
  warnBox: { backgroundColor: "#FBEEE0", borderWidth: 1, borderColor: "#E6C79C", padding: 10, marginTop: 10, fontSize: 9.5, color: "#8A4B12" },
  clauseTitle: { fontFamily: "Helvetica-Bold", marginTop: 12, marginBottom: 4, fontSize: 10.5 },
  paragraph: { marginBottom: 8, textAlign: "justify" },
  footer: { position: "absolute", bottom: 24, left: 48, right: 48, fontSize: 8, color: "#999", textAlign: "center" },
});

export type CertificateData = {
  contractId: string | number;
  planoNome: string;
  clientName: string;
  clientDocumentLabel: "CPF" | "CNPJ";
  clientDocumentOnFile: string;
  signerName: string;
  signerDocument: string;
  signerIp: string;
  signedAtLabel: string;
  contractHash: string;
  mismatchAcknowledged: boolean;
  eaHubUrl: string;
};

function Field({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

function ContractBody({ contractHtml }: { contractHtml: string }) {
  const text = stripHtmlToText(contractHtml);
  const blocks = text.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
  return (
    <>
      {blocks.map((block, i) => {
        const isTitle = /^CLÁUSULA\s/.test(block) || block === "CONTRATO DE PRESTAÇÃO DE SERVIÇOS";
        return (
          <Text key={i} style={isTitle ? styles.clauseTitle : styles.paragraph}>
            {block}
          </Text>
        );
      })}
    </>
  );
}

function ContractCertificatePdf({ data, contractHtml }: { data: CertificateData; contractHtml: string }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.certHeader}>
          <Text style={styles.certBrand}>EMPRESARIAL ACADEMY</Text>
          <Text style={styles.certTitle}>Certificado de Assinatura Eletrônica</Text>
        </View>

        <Text style={styles.sectionTitle}>Identificação do contrato</Text>
        <Field label="Contrato" value={data.planoNome} />
        <Field label="Contratante" value={data.clientName} />
        <Field label={data.clientDocumentLabel + " cadastrado"} value={data.clientDocumentOnFile} />

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Evidências da assinatura eletrônica</Text>
        <Field label="Assinado por" value={data.signerName} />
        <Field label="Documento informado" value={data.signerDocument} />
        <Field label="Data e hora (Brasília)" value={data.signedAtLabel} />
        <Field label="Endereço IP" value={data.signerIp} />
        <Field label="Hash SHA-256 do contrato" value={data.contractHash} />

        {data.mismatchAcknowledged && (
          <View style={styles.warnBox}>
            <Text>
              O nome e/ou documento informados no momento da assinatura divergiam dos dados cadastrados no
              contrato. O signatário declarou expressamente ser representante legal ou pessoa autorizada a
              assinar em nome da CONTRATANTE, e essa declaração ficou registrada junto a esta evidência.
            </Text>
          </View>
        )}

        <Text style={styles.note}>
          Este certificado comprova a assinatura eletrônica do contrato abaixo, nos termos do art. 10, § 2º, da
          Medida Provisória nº 2.200-2/2001. O hash acima permite conferir que o texto assinado é idêntico ao
          texto reproduzido nas páginas seguintes deste documento. O registro completo desta assinatura fica
          arquivado pela Empresarial Academy e disponível para consulta em {data.eaHubUrl}.
        </Text>

        <Text style={styles.footer} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} fixed />
      </Page>

      <Page size="A4" style={styles.page}>
        <ContractBody contractHtml={contractHtml} />
        <Text style={styles.footer} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} fixed />
      </Page>
    </Document>
  );
}

/** Gera o PDF completo (certificado + contrato) como Buffer, para upload e anexo de e-mail. */
export async function renderContractCertificatePdf(data: CertificateData, contractHtml: string): Promise<Buffer> {
  const buffer = await renderToBuffer(<ContractCertificatePdf data={data} contractHtml={contractHtml} />);
  return Buffer.from(buffer);
}
