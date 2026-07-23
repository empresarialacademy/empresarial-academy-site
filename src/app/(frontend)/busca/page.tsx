import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/layout/PageHero";
import { getPayloadClient } from "@/lib/payload";

export const metadata: Metadata = {
  title: "Busca",
  description: "Busque artigos e materiais da Empresarial Academy.",
  alternates: { canonical: "/busca" },
  robots: { index: false, follow: true },
};

export const dynamic = "force-dynamic";

type Result = {
  type: "Artigo" | "Material";
  title: string;
  href: string;
  excerpt?: string | null;
};

async function search(q: string): Promise<Result[]> {
  if (!q || q.trim().length < 2) return [];
  const payload = await getPayloadClient();
  const term = q.trim();

  const [posts, materials] = await Promise.all([
    payload.find({
      collection: "posts",
      where: {
        and: [
          { status: { equals: "published" } },
          {
            or: [
              { title: { like: term } },
              { excerpt: { like: term } },
            ],
          },
        ],
      },
      limit: 20,
      depth: 0,
    }),
    payload.find({
      collection: "materials",
      where: {
        and: [
          { status: { equals: "published" } },
          {
            or: [
              { title: { like: term } },
              { description: { like: term } },
            ],
          },
        ],
      },
      limit: 20,
      depth: 0,
    }),
  ]);

  return [
    ...posts.docs.map((p) => ({
      type: "Artigo" as const,
      title: p.title,
      href: `/blog/${p.slug}`,
      excerpt: p.excerpt,
    })),
    ...materials.docs.map((m) => ({
      type: "Material" as const,
      title: m.title,
      href: `/materiais/${m.slug}`,
      excerpt: m.description,
    })),
  ];
}

export default async function BuscaPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const results = await search(q);
  const hasQuery = q.trim().length >= 2;

  return (
    <main>
      <PageHero
        title="Busca"
        subtitle="Encontre artigos e materiais da Empresarial Academy."
        crumbs={[{ label: "Busca" }]}
      />

      <section className="mx-auto max-w-3xl px-6 py-16">
        <form action="/busca" method="get" role="search" className="flex gap-3">
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="O que você procura?"
            aria-label="Buscar no site"
            className="w-full rounded-lg border border-line bg-white px-4 py-3 text-sm outline-none focus:border-gold"
          />
          <button
            type="submit"
            className="rounded-lg bg-gold px-6 py-3 font-[var(--font-heading)] font-semibold text-navy transition-colors hover:bg-gold-light"
          >
            Buscar
          </button>
        </form>

        <div className="mt-10">
          {!hasQuery ? (
            <p className="text-gray">Digite ao menos 2 caracteres para buscar.</p>
          ) : results.length === 0 ? (
            <p className="text-gray">
              Nenhum resultado para <strong className="text-navy">{q}</strong>.
            </p>
          ) : (
            <>
              <p className="mb-6 text-sm text-gray">
                {results.length} resultado(s) para{" "}
                <strong className="text-navy">{q}</strong>
              </p>
              <ul className="space-y-4">
                {results.map((r) => (
                  <li
                    key={`${r.type}-${r.href}`}
                    className="rounded-xl border border-line bg-white p-6"
                  >
                    <span className="text-xs font-semibold uppercase tracking-wide text-gold-ink">
                      {r.type}
                    </span>
                    <h2 className="mt-1 text-lg font-semibold text-navy">
                      <Link href={r.href} className="hover:text-gold">
                        {r.title}
                      </Link>
                    </h2>
                    {r.excerpt && (
                      <p className="mt-1 text-sm text-gray">{r.excerpt}</p>
                    )}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
