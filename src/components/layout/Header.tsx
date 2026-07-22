"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { mainNav, servicosMenu, siteConfig } from "@/lib/site-config";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2" aria-label={`${siteConfig.name} — início`}>
          <Image
            src="/logo-empresarial-academy.png"
            alt=""
            width={48}
            height={46}
            className="h-11 w-auto"
            priority
          />
        </Link>

        {/* Nav desktop */}
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Menu principal">
          {mainNav.map((item) =>
            item.label === "Serviços" ? (
              <div
                key={item.href}
                className="relative"
                onMouseEnter={() => setMegaOpen(true)}
                onMouseLeave={() => setMegaOpen(false)}
              >
                <Link
                  href={item.href}
                  aria-expanded={megaOpen}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={cn(
                    "rounded-md px-3 py-2 text-base font-medium transition-colors hover:text-gold",
                    isActive(item.href) ? "text-gold" : "text-navy",
                  )}
                >
                  {item.label}
                </Link>
                {megaOpen && (
                  <div className="absolute left-1/2 top-full w-[34rem] -translate-x-1/2 pt-2">
                    <div className="grid grid-cols-2 gap-1 rounded-xl border border-line bg-white p-3 shadow-xl">
                      {servicosMenu.map((s) => (
                        <Link
                          key={s.href}
                          href={s.href}
                          className="flex gap-3 rounded-lg p-3 transition-colors hover:bg-surface"
                        >
                          <span className="text-xl" aria-hidden>
                            {s.icon}
                          </span>
                          <span>
                            <span className="block text-sm font-semibold text-navy">
                              {s.title}
                            </span>
                            <span className="block text-xs text-gray">{s.desc}</span>
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={cn(
                  "rounded-md px-3 py-2 text-base font-medium transition-colors hover:text-gold",
                  isActive(item.href) ? "text-gold" : "text-navy",
                )}
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Link
            href="/busca"
            aria-label="Buscar no site"
            className="flex h-9 w-9 items-center justify-center rounded-md text-navy transition-colors hover:text-gold"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
              <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </Link>
          <Button href="/diagnostico-maturidade-empresarial.html" external variant="primary" size="sm">
            Avaliação Gratuita
          </Button>
        </div>

        {/* Botão mobile */}
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md p-2 text-navy lg:hidden"
          aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((v) => !v)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
            {mobileOpen ? (
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>

      {/* Menu mobile */}
      {mobileOpen && (
        <nav
          className="border-t border-line bg-white lg:hidden"
          aria-label="Menu principal (mobile)"
        >
          <ul className="mx-auto max-w-6xl px-6 py-3">
            {mainNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={cn(
                    "block rounded-md px-2 py-3 text-base font-medium transition-colors hover:bg-surface",
                    isActive(item.href) ? "text-gold" : "text-navy",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/busca"
                onClick={() => setMobileOpen(false)}
                className="block rounded-md px-2 py-3 text-base font-medium text-navy transition-colors hover:bg-surface"
              >
                Buscar
              </Link>
            </li>
            <li className="pt-2">
              <Button href="/diagnostico-maturidade-empresarial.html" external variant="primary" size="md" className="w-full">
                Avaliação Gratuita
              </Button>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
