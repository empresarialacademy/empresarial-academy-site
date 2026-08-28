import { NextResponse } from "next/server";

/**
 * Proxy para o status real das instâncias WhatsApp no EA Flow — a
 * EVOLUTION_API_KEY nunca sai do backend do ea-flow, esta rota só repassa
 * a autenticação de serviço (EA_FLOW_ADMIN_API_KEY).
 */
export async function GET() {
  const baseUrl = process.env.EA_FLOW_URL;
  const apiKey = process.env.EA_FLOW_ADMIN_API_KEY;
  if (!baseUrl || !apiKey) {
    return NextResponse.json({ ok: false, error: "EA_FLOW_URL/EA_FLOW_ADMIN_API_KEY não configuradas" }, { status: 500 });
  }

  try {
    const res = await fetch(`${baseUrl.replace(/\/$/, "")}/api/whatsapp/status`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(12000),
      cache: "no-store",
    });
    const json = await res.json();
    return NextResponse.json(json, { status: res.status });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 502 }
    );
  }
}
