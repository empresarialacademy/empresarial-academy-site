import { legalNav, siteConfig } from "@/lib/site-config";

const year = new Date().getFullYear();

/**
 * Rodapé enxuto para landing pages de tráfego pago: só o mínimo legal
 * (LGPD exige política de privacidade acessível), sem navegação para o
 * resto do site. Links legais abrem em nova aba para a LP continuar aberta.
 */
export function LPFooter() {
  return (
    <footer className="border-t border-white/10 bg-navy text-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-6 text-center text-xs text-white/60 sm:flex-row">
        <p>
          © {year} {siteConfig.name} — CNPJ {siteConfig.cnpj}. Todos os
          direitos reservados.
        </p>
        <ul className="flex gap-4">
          {legalNav.map((i) => (
            <li key={i.href}>
              <a
                href={i.href}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-gold"
              >
                {i.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
