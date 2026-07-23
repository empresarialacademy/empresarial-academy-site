/**
 * Envio de conversão para o RD Station Marketing.
 *
 * Usa o **token público de API** do RD (Configurações → Integrações → Token
 * público) via variável `RD_STATION_TOKEN`. Sem o token, é no-op — não quebra o
 * fluxo de captação nem exige RD configurado (mesmo padrão de `email.ts`).
 *
 * Nunca lança: a captação do lead (e-mail + CMS) não pode falhar por causa do RD.
 *
 * ⚠️ Ao ativar: confirmar no painel do RD que o `conversion_identifier` (a
 * "origem" do lead, ex.: "Diagnóstico de Maturidade Empresarial") aparece como
 * conversão. Campos personalizados (scores por pilar) não são enviados por
 * padrão porque exigem cadastro prévio de campos `cf_*` na conta.
 */
type RdConversion = {
  /** Identificador da conversão no RD (usamos a "origem" do lead). */
  conversionIdentifier: string;
  email: string;
  name?: string;
  whatsapp?: string;
  company?: string;
};

const RD_ENDPOINT = "https://api.rd.services/platform/conversions";

export async function sendRdConversion(
  c: RdConversion,
): Promise<{ ok: boolean; via: string }> {
  const token = process.env.RD_STATION_TOKEN;
  if (!token || !c.email) return { ok: false, via: "disabled" };

  const payload: Record<string, string> = {
    conversion_identifier: c.conversionIdentifier,
    email: c.email,
  };
  if (c.name) payload.name = c.name;
  if (c.whatsapp) payload.mobile_phone = c.whatsapp;
  if (c.company) payload.company_name = c.company;

  try {
    const res = await fetch(`${RD_ENDPOINT}?api_key=${encodeURIComponent(token)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event_type: "CONVERSION",
        event_family: "CDP",
        payload,
      }),
    });
    if (res.ok) return { ok: true, via: "rdstation" };
    console.error("[rdstation] resposta não-ok:", res.status);
    return { ok: false, via: "error" };
  } catch (e) {
    console.error("[rdstation] exceção:", e);
    return { ok: false, via: "exception" };
  }
}
