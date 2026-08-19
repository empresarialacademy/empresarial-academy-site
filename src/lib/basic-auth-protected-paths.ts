/**
 * Rotas protegidas por HTTP Basic Auth (ver middleware.ts). Next.js faz
 * prefetch automático de <Link> internos quando entram na viewport — se o
 * href aponta para uma dessas rotas, o prefetch dispara o desafio 401 em
 * segundo plano e o navegador mostra o diálogo nativo de login sem o usuário
 * clicar em nada. Componentes que renderizam links dinâmicos (cards de
 * "Sistemas EA") devem checar isBasicAuthProtectedPath() e desligar o
 * prefetch (`prefetch={false}`) para esses hrefs.
 */
const PROTECTED_PREFIXES = ["/pos-vendas-souza-ramos", "/playbook-souza-ramos"];

export function isBasicAuthProtectedPath(path: string): boolean {
  const clean = path.split("?")[0].split("#")[0];
  return PROTECTED_PREFIXES.some((prefix) => clean === prefix || clean.startsWith(`${prefix}/`));
}
