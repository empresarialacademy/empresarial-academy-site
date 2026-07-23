import { redirect } from "next/navigation";

/**
 * A "Central EA" foi absorvida pelo EA Marketing Manager (hub único —
 * definição do Thiago, 2026-07-23). Esta rota existe só para não quebrar
 * favoritos/links antigos para /admin/central-ea.
 */
export function CentralEaRedirect() {
  redirect("/admin/marketing-manager");
}
