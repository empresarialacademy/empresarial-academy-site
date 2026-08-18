import type { PayloadRequest } from "payload";

/**
 * Autenticação de serviço para o motor de conteúdo social (repo separado
 * `ea-social-engine`), que lê o content-calendar por aqui pela REST API do
 * Payload. Mesmo bearer token nos dois lados (CONTENT_ENGINE_API_KEY),
 * mesmo padrão do CRON_SECRET já usado nas rotas /api/cron/*.
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
