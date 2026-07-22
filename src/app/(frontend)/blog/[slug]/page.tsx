import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RichText } from "@payloadcms/richtext-lexical/react";
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";
import { PageHero } from "@/components/layout/PageHero";
import { getPostBySlug } from "@/lib/payload";
import { siteConfig } from "@/lib/site-config";
import { formatDatePtBR } from "@/lib/format";

export const revalidate = 60;

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Artigo não encontrado" };

  const seo = post.seo ?? {};
  const cover = typeof post.coverImage === "object" ? post.coverImage : null;

  return {
    title: seo.metaTitle || post.title,
    description: seo.metaDescription || post.excerpt || undefined,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: seo.metaTitle || post.title,
      description: seo.metaDescription || post.excerpt || undefined,
      publishedTime: post.publishedAt ?? undefined,
      images: cover?.url ? [{ url: cover.url }] : undefined,
    },
  };
}

export default async function PostPage({ params }: Params) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const cover = typeof post.coverImage === "object" ? post.coverImage : null;
  const category =
    typeof post.category === "object" && post.category ? post.category : null;
  const author =
    typeof post.author === "object" && post.author ? post.author : null;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    datePublished: post.publishedAt ?? undefined,
    description: post.excerpt ?? undefined,
    image: cover?.url ? `${siteConfig.url}${cover.url}` : undefined,
    author: { "@type": "Person", name: author?.name || siteConfig.founder },
    publisher: { "@type": "Organization", name: siteConfig.name },
  };

  return (
    <main>
      <PageHero
        title={post.title}
        crumbs={[{ label: "Blog", href: "/blog" }, { label: post.title }]}
        image={cover?.url ?? "/images/blog.jpg"}
      />

      <article className="mx-auto max-w-3xl px-6 py-16">
        <div className="flex items-center gap-3 text-sm text-gray">
          {category && (
            <span className="rounded-full bg-surface px-3 py-1 font-medium text-navy">
              {category.name}
            </span>
          )}
          <time dateTime={post.publishedAt ?? undefined}>
            {formatDatePtBR(post.publishedAt)}
          </time>
          {author?.name && <span>· por {author.name}</span>}
        </div>

        {cover?.url && (
          <div className="relative mt-6 aspect-[16/9] overflow-hidden rounded-2xl">
            <Image
              src={cover.url}
              alt={cover.alt ?? post.title}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
            />
          </div>
        )}

        <div className="prose-ea mt-10">
          {post.content && (
            <RichText
              data={post.content as unknown as SerializedEditorState}
            />
          )}
        </div>

        <div className="mt-12 border-t border-line pt-8">
          <Link
            href="/blog"
            className="text-sm font-semibold text-gold-ink hover:underline"
          >
            ← Voltar para o blog
          </Link>
        </div>
      </article>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
    </main>
  );
}
