import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/layout/PageHero";
import { PostCard } from "@/components/blog/PostCard";
import { getPublishedPosts, getBlogCategories } from "@/lib/payload";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Artigos práticos sobre gestão, vendas, processos e liderança para empresários e gestores de PMEs.",
  alternates: {
    canonical: "/blog",
    types: { "application/rss+xml": "/blog/rss.xml" },
  },
};

// Revalida periodicamente para refletir publicações do CMS.
export const revalidate = 60;

type Props = { searchParams: Promise<{ categoria?: string }> };

export default async function BlogPage({ searchParams }: Props) {
  const { categoria } = await searchParams;
  const [{ docs: posts }, categories] = await Promise.all([
    getPublishedPosts(12, 1, categoria),
    getBlogCategories(),
  ]);
  const activeSlug = categoria && categoria !== "todas" ? categoria : "todas";

  return (
    <main>
      <PageHero
        title="Blog Empresarial Academy"
        subtitle="Conteúdo prático sobre gestão, vendas, processos e liderança."
        crumbs={[{ label: "Blog" }]}
        image="/images/banner-blog.jpg"
        imageAlt="Mão com caneta fazendo anotações e gráficos em papel, com notebook exibindo gráficos ao fundo"
      />

      <section className="mx-auto max-w-6xl px-6 py-20">
        {categories.length > 0 && (
          <nav
            aria-label="Filtrar por categoria"
            className="mb-10 flex flex-wrap gap-2"
          >
            <Link
              href="/blog"
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                activeSlug === "todas"
                  ? "bg-navy text-white"
                  : "bg-surface text-navy hover:bg-line"
              }`}
            >
              Todos
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/blog?categoria=${cat.slug}`}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  activeSlug === cat.slug
                    ? "bg-navy text-white"
                    : "bg-surface text-navy hover:bg-line"
                }`}
              >
                {cat.name}
              </Link>
            ))}
          </nav>
        )}

        {posts.length === 0 ? (
          <div className="rounded-2xl border border-line bg-white p-12 text-center">
            <p className="text-4xl" aria-hidden>
              ✍️
            </p>
            <h2 className="mt-4 text-xl font-semibold text-navy">
              {activeSlug === "todas"
                ? "Em breve, novos conteúdos"
                : "Nenhum artigo nesta categoria ainda"}
            </h2>
            <p className="mt-2 text-gray">
              {activeSlug === "todas"
                ? "Estamos preparando artigos práticos para impulsionar a sua gestão. Volte em breve."
                : "Volte em breve ou confira todos os artigos do blog."}
            </p>
          </div>
        ) : (
          <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <li key={post.id}>
                <PostCard post={post} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
