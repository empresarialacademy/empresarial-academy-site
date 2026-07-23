import { redirect } from "next/navigation";

/**
 * A "Central EA" e o antigo /marketing-manager foram absorvidos pela home do
 * EA HUB (que agora É o EA Marketing Manager — unificação de 2026-07-23(b)).
 * Esta rota existe só para não quebrar favoritos/links antigos
 * (/central-ea, /marketing-manager) → redireciona para a home /eahub.
 */
export function CentralEaRedirect() {
  redirect("/eahub");
}
