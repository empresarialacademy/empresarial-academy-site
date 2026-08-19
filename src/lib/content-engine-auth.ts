import type { PayloadRequest } from "payload";

/**
 * Autenticação de serviço para o EA Post (repo separado `ea-social-engine`).
 * Recriado em 19/08/2026 — existia antes só pra leitura do content-calendar
 * (removido na migração do Planejamento pro EA Post); voltou a existir
 * porque o EA Post agora ESCREVE rascunhos de Artigo/Material aqui (Fases
 * B/D do plano de conteúdo semanal). Mesmo bearer token nos dois lados
 * (CONTENT_ENGINE_API_KEY), mesmo padrão do CRON_SECRET já usado nas rotas
 * /api/cron/*.
 *
 * Nunca retorna true se a env var não estiver definida — evita liberar
 * acesso por acidente num ambiente sem a chave configurada.
 */
export function isContentEngineRequest(req: Pick<PayloadRequest, "headers">): boolean {
  const expected = process.env.CONTENT_ENGINE_API_KEY;
  if (!expected) return false;
  const header = req.headers.get("authorization") ?? "";
  return header === `Bearer ${expected}`;
}
