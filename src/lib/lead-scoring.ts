/**
 * Leitura dos scores do Diagnóstico de Maturidade a partir do campo
 * `details`/`extra` do lead (ex.: { "Comercial": "38% (Em Desenvolvimento)" }).
 * Compartilhado entre a nutrição (nurture-emails.ts) e a segmentação de
 * campanhas (email-marketing.ts) — fonte única do parsing.
 */

export const PILLAR_NAMES = [
  "Comercial",
  "Operações",
  "Gestão de Indicadores",
  "Liderança",
  "Financeiro",
] as const;

export type PillarName = (typeof PILLAR_NAMES)[number];
export type PillarScore = { name: PillarName; pct: number };

export function parsePct(v: string | undefined | null): number | null {
  const m = /(\d+)\s*%/.exec(v || "");
  return m ? Number(m[1]) : null;
}

export function getPillarScores(
  details: Record<string, unknown> | null | undefined,
): PillarScore[] {
  if (!details) return [];
  const scores: PillarScore[] = [];
  for (const name of PILLAR_NAMES) {
    const raw = typeof details[name] === "string" ? (details[name] as string) : "";
    const pct = parsePct(raw);
    if (pct !== null) scores.push({ name, pct });
  }
  return scores;
}

export function getWeakestPillar(
  details: Record<string, unknown> | null | undefined,
): PillarScore | null {
  const scores = getPillarScores(details);
  if (scores.length === 0) return null;
  return scores.reduce((min, p) => (p.pct < min.pct ? p : min), scores[0]);
}

export function getOverallScore(
  details: Record<string, unknown> | null | undefined,
): number | null {
  if (!details) return null;
  const raw = typeof details["Maturidade Geral"] === "string" ? (details["Maturidade Geral"] as string) : "";
  return parsePct(raw);
}
