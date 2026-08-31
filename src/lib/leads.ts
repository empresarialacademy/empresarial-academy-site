import { getPayloadClient } from "@/lib/payload";

export type LeadInput = {
  name: string;
  email: string;
  company?: string;
  whatsapp?: string;
  instagram?: string;
  source: string;
  details?: Record<string, string>;
  consent?: boolean;
  diagnosticId?: string;
  hasDiagnostic?: boolean;
};

/**
 * Grava o lead na coleção `leads` do CMS (histórico/backup do e-mail).
 * Nunca lança — a captação não pode falhar por causa do banco.
 * Retorna o id do lead criado (para vincular envios ao log), ou null se falhou.
 */
export async function saveLead(lead: LeadInput): Promise<string | number | null> {
  try {
    const payload = await getPayloadClient();
    const consent = lead.consent ?? false;
    const isDiag = Boolean(
      lead.hasDiagnostic ||
      lead.diagnosticId ||
      lead.source === "Diagnóstico de Maturidade Empresarial" ||
      (lead.details && Boolean(lead.details["Maturidade Geral"]))
    );

    const doc = await payload.create({
      collection: "leads",
      data: {
        name: lead.name,
        email: lead.email,
        company: lead.company || undefined,
        whatsapp: lead.whatsapp || undefined,
        instagram: lead.instagram || undefined,
        source: lead.source,
        details: lead.details && Object.keys(lead.details).length > 0 ? lead.details : undefined,
        consent,
        diagnosticId: lead.diagnosticId || undefined,
        hasDiagnostic: isDiag,
        // O checkbox único de consentimento dos formulários públicos cobre
        // newsletter e promoções ao mesmo tempo (decisão do Thiago, 24/07) —
        // não há opt-in granular separado por enquanto.
        wantsNewsletter: consent,
        wantsPromotions: consent,
      } as any,
    });
    return doc.id;
  } catch (e) {
    console.error("[lead] falha ao gravar no CMS:", e);
    return null;
  }
}
