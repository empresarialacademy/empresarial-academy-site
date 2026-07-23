import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/lib/site-config";
import { getInstagramPosts } from "@/lib/instagram";

function TypeIcon({ type }: { type: "image" | "video" | "carousel" }) {
  if (type === "image") return null;
  return (
    <span className="absolute right-2 top-2 text-white drop-shadow" aria-hidden>
      {type === "video" ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="7" y="7" width="13" height="13" rx="2" />
          <path d="M4 16V5a1 1 0 011-1h11" />
        </svg>
      )}
    </span>
  );
}

export async function InstagramFeed() {
  const posts = await getInstagramPosts(8);

  return (
    <section className="bg-surface">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <SectionHeading
          title="Acompanhe no Instagram"
          subtitle="Conteúdos rápidos de gestão, vendas e liderança no dia a dia."
          align="center"
        />

        {posts.length > 0 && (
          <ul className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {posts.map((p) => (
              <li key={p.id}>
                <a
                  href={p.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={p.caption || "Ver post no Instagram"}
                  className="group relative block aspect-square overflow-hidden rounded-xl bg-navy"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.image}
                    alt={p.caption || "Post do Instagram da Empresarial Academy"}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <TypeIcon type={p.type} />
                </a>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-10 flex justify-center">
          <Button href={siteConfig.social.instagram} variant="secondary" size="lg">
            Seguir @empresarial.academy
          </Button>
        </div>
      </div>
    </section>
  );
}
