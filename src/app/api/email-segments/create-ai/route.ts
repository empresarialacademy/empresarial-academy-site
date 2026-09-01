import { NextResponse } from "next/server";
import { getPayloadClient } from "@/lib/payload";

export async function POST(req: Request) {
  try {
    const payload = await getPayloadClient();
    const { user } = await payload.auth({ headers: req.headers });

    if (!user) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      description,
      source = "any",
      pillar = "any",
      scoreMin = 0,
      scoreMax = 100,
      createdFrom,
      createdTo,
    } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Nome do segmento é obrigatório." }, { status: 400 });
    }

    const doc = await payload.create({
      collection: "email-segments",
      data: {
        name,
        description: description || "Segmento inteligente criado com IA",
        source,
        pillar,
        scoreMin: typeof scoreMin === "number" ? scoreMin : 0,
        scoreMax: typeof scoreMax === "number" ? scoreMax : 100,
        createdFrom: createdFrom || null,
        createdTo: createdTo || null,
      },
    });

    return NextResponse.json({ ok: true, doc });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro ao criar segmento.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

