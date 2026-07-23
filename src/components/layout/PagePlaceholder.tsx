import Link from "next/link";
import { Button } from "@/components/ui/Button";

type Crumb = { label: string; href?: string };

export function PagePlaceholder({
  title,
  subtitle,
  crumbs = [],
  sprint,
}: {
  title: string;
  subtitle: string;
  crumbs?: Crumb[];
  sprint?: string;
}) {
  return (
    <main>
      <section className="relative overflow-hidden bg-navy text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_70%_0%,#2e4358_0%,transparent_70%)]"
        />
        <div className="relative mx-auto max-w-6xl px-6 py-20 md:py-24">
          <nav aria-label="Você está em" className="mb-5 text-xs text-white/60">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link href="/" className="hover:text-gold">
                  Início
                </Link>
              </li>
              {crumbs.map((c) => (
                <li key={c.label} className="flex items-center gap-2">
                  <span aria-hidden>/</span>
                  {c.href ? (
                    <Link href={c.href} className="hover:text-gold">
                      {c.label}
                    </Link>
                  ) : (
                    <span className="text-white/80">{c.label}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
          <h1 className="max-w-3xl text-3xl font-bold leading-tight md:text-5xl">
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-white/80">{subtitle}</p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-20 text-center">
        <span aria-hidden className="mx-auto block h-px w-24 bg-gold" />
        <p className="mt-8 text-gray">
          Esta página está em desenvolvimento{sprint ? ` (${sprint})` : ""}. O
          conteúdo completo será publicado em breve, no padrão premium da marca.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Button href="/contato" variant="primary" size="md">
            Fale conosco
          </Button>
          <Button href="/" variant="outline" size="md">
            Voltar à Home
          </Button>
        </div>
      </section>
    </main>
  );
}
