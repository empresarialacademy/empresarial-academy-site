/**
 * Gerador de identificador único de diagnóstico e cliente (ex.: EA-DIAG-2026-K7M9P).
 * Usado para referenciar o diagnóstico entre o site, e-mails, WhatsApp,
 * painel EA HUB e a consultoria executiva.
 */

const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateDiagnosticId(year?: number): string {
  const currentYear = year || new Date().getFullYear();
  let code = "";
  for (let i = 0; i < 5; i++) {
    code += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
  }
  return `EA-DIAG-${currentYear}-${code}`;
}

