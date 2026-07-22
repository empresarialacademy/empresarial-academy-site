import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { PostCard } from "@/components/blog/PostCard";
import { getPublishedPosts } from "@/lib/payload";

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

export default async function BlogPage() {
  const { docs: posts } = await getPublishedPosts(12);

  return (
    <main>
      <PageHero
        title="Blog Empresarial Academy"
        subtitle="Conteúdo prático sobre gestão, vendas, processos e liderança."
        crumbs={[{ label: "Blog" }]}
        image="/images/blog.jpg"
      />

      <section className="mx-auto max-w-6xl px-6 py-20">
        {posts.length === 0 ? (
          <div className="rounded-2xl border border-line bg-white p-12 text-center">
            <p className="text-4xl" aria-hidden>
              ✍️
            </p>
            <h2 className="mt-4 text-xl font-semibold text-navy">
              Em breve, novos conteúdos
            </h2>
            <p className="mt-2 text-gray">
              Estamos preparando artigos práticos para impulsionar a sua gestão.
              Volte em breve.
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
