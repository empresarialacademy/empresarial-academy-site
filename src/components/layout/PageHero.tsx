import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

type Crumb = { label: string; href?: string };

export function PageHero({
  title,
  subtitle,
  crumbs = [],
  image,
  imageAlt = "",
}: {
  title: string;
  subtitle?: string;
  crumbs?: Crumb[];
  image?: string;
  imageAlt?: string;
}) {
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Início",
        item: siteConfig.url,
      },
      ...crumbs.map((c, i) => ({
        "@type": "ListItem",
        position: i + 2,
        name: c.label,
        ...(c.href ? { item: `${siteConfig.url}${c.href}` } : {}),
      })),
    ],
  };

  return (
    <section className="relative isolate flex min-h-[320px] flex-col justify-center overflow-hidden bg-navy text-white sm:min-h-[360px] md:min-h-[420px]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {image && (
        <Image
          src={image}
          alt={imageAlt}
          fill
          priority
          sizes="100vw"
          className="absolute inset-0 -z-20 object-cover"
        />
      )}
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 -z-10 ${
          image
            ? "bg-navy/80 bg-[linear-gradient(100deg,#1d2b3c_15%,rgba(29,43,60,0.55)_75%)]"
            : "bg-[radial-gradient(60%_60%_at_70%_0%,#2e4358_0%,transparent_70%)]"
        }`}
      />
      <div className="relative mx-auto w-full max-w-6xl px-6 py-12 md:py-16">
        <nav aria-label="Trilha de navegação" className="mb-5 text-xs text-white/60">
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
        {subtitle && (
          <p className="mt-4 max-w-2xl text-white/80">{subtitle}</p>
        )}
      </div>
    </section>
  );
}
