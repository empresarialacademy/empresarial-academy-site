import Image from "next/image";
import Link from "next/link";
import type { Post } from "@/payload-types";
import { formatDatePtBR } from "@/lib/format";
import { BrandCover } from "@/components/ui/BrandCover";

export function PostCard({ post }: { post: Post }) {
  const cover = typeof post.coverImage === "object" ? post.coverImage : null;
  const category =
    typeof post.category === "object" && post.category ? post.category : null;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-gold/50 hover:shadow-xl">
      <Link
        href={`/blog/${post.slug}`}
        className="block"
        aria-hidden="true"
        tabIndex={-1}
      >
        <div className="relative aspect-[16/9] overflow-hidden bg-surface">
          {cover?.url ? (
            <Image
              src={cover.url}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <BrandCover title={post.title} tag={category?.name ?? "Artigo"} />
          )}
        </div>
      </Link>
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center gap-2 text-xs text-gray">
          {category && (
            <span className="rounded-full bg-surface px-2 py-1 font-medium text-navy">
              {category.name}
            </span>
          )}
          <time dateTime={post.publishedAt ?? undefined}>
            {formatDatePtBR(post.publishedAt)}
          </time>
        </div>
        <h3 className="mt-3 text-lg font-semibold text-navy">
          <Link href={`/blog/${post.slug}`} className="hover:text-gold">
            {post.title}
          </Link>
        </h3>
        {post.excerpt && (
          <p className="mt-2 flex-1 text-sm text-gray">{post.excerpt}</p>
        )}
        <Link
          href={`/blog/${post.slug}`}
          className="mt-4 inline-block text-sm font-semibold text-gold-ink hover:underline"
        >
          Ler artigo →
        </Link>
      </div>
    </article>
  );
}
