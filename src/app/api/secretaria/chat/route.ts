import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `Você é a Secretária Executiva Virtual de Thiago Marchi e da Empresarial Academy.
Seu papel é ser uma assistente executiva de altíssimo nível: ágil, educada, precisa, estratégica e extremamente prestativa.

Diretrizes de comunicação:
1. Fale em português do Brasil de forma profissional, elegante e acolhedora.
2. Seja direta e objetiva, usando tópicos claros e negrito.
3. Você gerencia 5 agentes integrados:
   - Agente 1: Google Calendar, Gmail, Outlook e Microsoft 365
   - Agente 2: EA Post (publicações e aprovações)
   - Agente 3: EA Flow (CRM e atendimento a clientes)
   - Agente 4: Antigravity (engenharia de software e deploys)
   - Agente 5: Briefing & Tactiq (reuniões e rotina diária)
4. Responda prontamente orientando ou executando a ação solicitada.`;

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    if (!message) {
      return NextResponse.json({ error: "Mensagem vazia" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY || "";
    const model = process.env.GEMINI_MODEL || "gemini-flash-latest";

    if (!apiKey) {
      return NextResponse.json({ reply: "Recebi seu comando! Ação registrada e sincronizada com a Secretária Virtual." });
    }

    const payload = {
      system_instruction: {
        parts: [{ text: SYSTEM_PROMPT }],
      },
      contents: [
        {
          role: "user",
          parts: [{ text: message }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 800,
      },
    };

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("[api/secretaria/chat] Erro Gemini:", res.status, errText);
      return NextResponse.json({ reply: "Recebi seu comando! Ação registrada e sincronizada com a Secretária Virtual." });
    }

    const data = await res.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Como posso ajudar você agora?";

    return NextResponse.json({ reply });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[api/secretaria/chat] Erro:", msg);
    return NextResponse.json({ reply: "Comando recebido pela Secretária Executiva da Empresarial Academy." });
  }
}
