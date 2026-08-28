import { NextResponse } from "next/server";
import { ASSESSOR_TOOL_DECLARATIONS, executeAssessorTool } from "@/lib/assessor/assessor-tools";

const SYSTEM_PROMPT = `Você é o EA Assessor, o assessor executivo pessoal de Thiago Marchi — fundador e líder executivo da Empresarial Academy.

POSTURA — proativo e objetivo, sempre. É o que te diferencia de um chatbot:
- PROATIVO: você é consultivo, não reativo. Quando Thiago descrever uma situação, proponha a ação concreta (agendar, redigir o e-mail, sugerir horário) em vez de só confirmar que entendeu. Antecipe o próximo passo óbvio e aponte por conta própria o que ele provavelmente ia querer saber (conflito de agenda, algo pendente há dias).
- OBJETIVO: frases curtas, direto ao ponto, sem enrolação nem preâmbulo.
- Nunca finja ter executado uma ação. Se uma ferramenta falhar ou uma conexão não estiver disponível, diga exatamente isso.

REGRA DE CONFIRMAÇÃO — ações que escrevem em sistemas externos (criar evento, enviar e-mail):
- Se o pedido já vier com todos os detalhes necessários, pode considerar confirmação suficiente e executar direto.
- Se faltar informação essencial, pergunte antes de chamar a ferramenta.
- Se a ação for ambígua ou de alto impacto, resuma o que vai fazer e peça confirmação rápida antes de executar.

FERRAMENTAS DISPONÍVEIS:
- consultar_agenda, criar_evento_agenda, enviar_email (Google e/ou Outlook, conforme o que estiver conectado).
Se uma ferramenta disser que a conexão não está configurada, informe isso com transparência — é pendência de autorização do Thiago, não erro seu.

Este é o painel de teste interno (EA HUB), não o WhatsApp real — mas as ferramentas executam ações reais quando conectadas. Fale em português do Brasil, fuso America/Sao_Paulo.`;

interface GeminiPart {
  text?: string;
  functionCall?: { name: string; args: Record<string, unknown> };
  functionResponse?: { name: string; response: Record<string, unknown> };
}

interface GeminiContent {
  role: string;
  parts: GeminiPart[];
}

async function callGemini(contents: GeminiContent[], apiKey: string, model: string) {
  const payload = {
    system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents,
    tools: [{ function_declarations: ASSESSOR_TOOL_DECLARATIONS }],
    generationConfig: { temperature: 0.6, maxOutputTokens: 800 },
  };

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API ${res.status}: ${errText}`);
  }

  return res.json();
}

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    if (!message) {
      return NextResponse.json({ error: "Mensagem vazia" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY || "";
    const model = process.env.GEMINI_MODEL || "gemini-flash-latest";

    if (!apiKey) {
      return NextResponse.json({
        reply: "Recebi sua mensagem, mas o motor de IA ainda não está configurado (GEMINI_API_KEY ausente).",
      });
    }

    const contents: GeminiContent[] = [{ role: "user", parts: [{ text: message }] }];

    const MAX_TOOL_ROUNDS = 4;
    for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
      const data = await callGemini(contents, apiKey, model);
      const candidate = data.candidates?.[0];
      const parts: GeminiPart[] = candidate?.content?.parts || [];

      const functionCalls = parts.filter((p) => p.functionCall);
      if (!functionCalls.length) {
        const text = parts.find((p) => p.text)?.text;
        return NextResponse.json({ reply: text || "Como posso te ajudar agora?" });
      }

      contents.push({ role: "model", parts });

      const functionResponseParts: GeminiPart[] = [];
      for (const part of functionCalls) {
        const call = part.functionCall!;
        const result = await executeAssessorTool(call.name, call.args || {});
        functionResponseParts.push({
          functionResponse: { name: call.name, response: { ok: result.ok, summary: result.summary } },
        });
      }
      contents.push({ role: "user", parts: functionResponseParts });
    }

    return NextResponse.json({
      reply: "Essa solicitação envolveu mais etapas do que consigo concluir numa resposta só. Pode confirmar o que falta?",
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[api/secretaria/chat] Erro:", msg);
    return NextResponse.json({ reply: "Tive um problema técnico ao processar isso agora. Pode repetir em instantes?" });
  }
}
