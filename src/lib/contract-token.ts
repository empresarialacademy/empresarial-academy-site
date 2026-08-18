import { createHmac, createHash } from "crypto";

/**
 * Token de assinatura por contrato e hash de integridade do texto.
 *
 * Mesmo padrão HMAC de src/lib/nurture-emails.ts (`optOutToken`): HMAC-SHA256
 * do id do contrato com PAYLOAD_SECRET, nunca o id "cru" na URL pública
 * (/assinar/[token]) — assim o token não é adivinhável a partir do id
 * sequencial do registro.
 */
function secret(): string {
  return process.env.PAYLOAD_SECRET || "dev-secret";
}

/** Gera o token de assinatura de um contrato (determinístico a partir do id). */
export function generateSignToken(contractId: string | number): string {
  return createHmac("sha256", secret()).update(String(contractId)).digest("hex");
}

/**
 * Verifica se `token` corresponde ao contrato `contractId`. Sempre recomputar
 * e comparar, nunca confiar no token recebido da URL sem checagem.
 */
export function verifySignToken(contractId: string | number, token: string): boolean {
  if (!token) return false;
  const expected = generateSignToken(contractId);
  if (expected.length !== token.length) return false;
  // Comparação em tempo constante não é crítica aqui (token de 64 hex chars,
  // não é segredo de autenticação de sessão), mas evita vazar timing grosseiro.
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ token.charCodeAt(i);
  }
  return diff === 0;
}

/** Hash SHA-256 do texto exato do contrato (comprovação de integridade). */
export function hashContractText(html: string): string {
  return createHash("sha256").update(html, "utf8").digest("hex");
}
