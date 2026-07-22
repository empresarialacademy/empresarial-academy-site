import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { HeroCarousel } from "@/components/HeroCarousel";
import { PostCard } from "@/components/blog/PostCard";
import { MaterialCard } from "@/components/materials/MaterialCard";
import { getPublishedMaterials, getPublishedPosts } from "@/lib/payload";
import { getLatestVideos } from "@/lib/youtube";
import { InstagramFeed } from "@/components/InstagramFeed";
import { servicosMenu, siteConfig } from "@/lib/site-config";

const numeros = [
  { valor: "+20", label: "anos de experiência em gestão" },
  { valor: "6", label: "pilares no método Gestão 360" },
  { valor: "PMEs", label: "foco em pequenas e médias empresas" },
];

const servicos = servicosMenu.slice(0, 4);

export const revalidate = 60;

export default async function Home() {
  const [{ docs: posts }, { docs: materiais }, videos] = await Promise.all([
    getPublishedPosts(3),
    getPublishedMaterials(3),
    getLatestVideos(3),
  ]);

  return (
    <main>
      {/* HERO — Carrossel de 5 banners */}
      <HeroCarousel />

      {/* Números */}
      <section className="bg-navy-light text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap gap-x-12 gap-y-6 px-6 py-8">
          {numeros.map((n) => (
            <div key={n.label}>
              <div className="font-[var(--font-heading)] text-3xl font-bold text-gold">
                {n.valor}
              </div>
              <div className="max-w-[12rem] text-xs text-white/60">{n.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PRODUTOS EM DESTAQUE */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-6 md:grid-cols-2">
          <ProductCard
            image="/images/curso-gestao-360.jpg"
            tag="Em breve"
            title="Curso Gestão 360"
            text="A máquina de resultados: metodologia prática para organizar processos, multiplicar lucros e liderar com clareza."
            href="/servicos/curso-gestao-360"
          />
          <ProductCard
            image="/images/livro-gestao-360.jpg"
            tag="Em breve"
            title="Livro Gestão 360"
            text="Conhecimento em prática e planejamento em resultado, pensado para a realidade das PMEs."
            href="/livro-gestao-360"
          />
        </div>
      </section>

      {/* SOBRE / FUNDADOR */}
      <section className="bg-white">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-20 lg:grid-cols-2">
          <Image
            src="/images/thiago-marchi.jpg"
            alt="Thiago Marchi, fundador da Empresarial Academy"
            width={560}
            height={373}
            className="rounded-2xl shadow-lg"
          />
          <div>
            <h2 className="text-2xl font-bold text-navy md:text-3xl">
              Sobre a Empresarial Academy
            </h2>
            <span aria-hidden className="mt-4 block h-px w-24 bg-gold" />
            <p className="mt-6 text-gray">
              Nascemos para transformar empresas através da educação aplicada à
              realidade dos negócios. Fundada por{" "}
              <strong className="text-navy">Thiago Marchi</strong> — mais de 20
              anos em liderança estratégica e 8 como empresário — unimos
              conhecimento prático, estratégia e visão de mercado para gerar mais
              lucro, controle e liberdade.
            </p>
            <p className="mt-4 text-gray">
              Nossa missão é impulsionar o crescimento sustentável de pequenas e
              médias empresas, com gestão inteligente e decisões orientadas a
              resultado.
            </p>
            <div className="mt-8">
              <Button href="/institucional" variant="secondary" size="md">
                Conheça nossa história
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* SERVIÇOS */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-12 text-center">
          <h2 className="text-2xl font-bold text-navy md:text-3xl">
            Soluções completas para o seu crescimento
          </h2>
          <span aria-hidden className="mx-auto mt-4 block h-px w-24 bg-gold" />
          <p className="mx-auto mt-4 max-w-2xl text-gray">
            Foco em melhorar processos, aumentar lucros e fortalecer a liderança.
          </p>
        </div>
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {servicos.map((s) => (
            <li
              key={s.href}
              className="rounded-xl border border-line bg-white p-7 transition-shadow hover:shadow-md"
            >
              <span className="text-4xl" aria-hidden>
                {s.icon}
              </span>
              <h3 className="mt-4 text-lg font-semibold text-navy">{s.title}</h3>
              <p className="mt-2 text-sm text-gray">{s.desc}</p>
              <Link
                href={s.href}
                className="mt-4 inline-block text-sm font-semibold text-gold-ink hover:underline"
              >
                Saiba mais →
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* MATERIAIS EM DESTAQUE — "Conhecimento que Impulsiona" */}
      {materiais.length > 0 && (
        <section className="bg-white">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <SectionHeading
              title="Conhecimento que Impulsiona"
              subtitle="Comece agora com materiais gratuitos que geram resultado imediato no seu negócio."
            />
            <ul className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {materiais.map((m) => (
                <li key={m.id}>
                  <MaterialCard material={m} />
                </li>
              ))}
            </ul>
            <div className="mt-10">
              <Button href="/materiais" variant="secondary" size="md">
                Ver todos os materiais
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* ÚLTIMOS DO BLOG — "Empresarial Academy na Mídia" */}
      {posts.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 py-20">
          <SectionHeading
            title="Direto do nosso blog"
            subtitle="Dicas, estratégias e insights para impulsionar a sua empresa todos os dias."
          />
          <ul className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <li key={post.id}>
                <PostCard post={post} />
              </li>
            ))}
          </ul>
          <div className="mt-10">
            <Button href="/blog" variant="secondary" size="md">
              Ver todos os artigos
            </Button>
          </div>
        </section>
      )}

      {/* ÚLTIMOS VÍDEOS DO YOUTUBE */}
      {videos.length > 0 && (
        <section className="bg-white">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <SectionHeading
              title="Empresarial Academy no YouTube"
              subtitle="Conteúdo em vídeo para impulsionar a sua gestão."
            />
            <ul className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {videos.map((v) => (
                <li key={v.id}>
                  <a
                    href={v.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block overflow-hidden rounded-2xl border border-line bg-white shadow-sm transition-shadow hover:shadow-lg"
                  >
                    <div className="relative aspect-video overflow-hidden bg-navy">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={v.thumbnail}
                        alt={v.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-5">
                      <h3 className="text-base font-semibold text-navy group-hover:text-gold-ink">
                        {v.title}
                      </h3>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-10">
              <Button href={siteConfig.social.youtube} variant="secondary" size="md">
                Ver todos os vídeos
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* INSTAGRAM */}
      <InstagramFeed />

      {/* CTA FINAL */}
      <section className="bg-navy-light text-white">
        <div className="mx-auto max-w-4xl px-6 py-16 text-center">
          <h2 className="text-2xl font-bold md:text-3xl">
            Faça uma avaliação gratuita
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-white/80">
            Descubra como podemos impulsionar os resultados do seu negócio.
            Conversa sem compromisso.
          </p>
          <div className="mt-6">
            <Button href="/diagnostico-maturidade-empresarial.html" external variant="primary" size="lg">
              Fazer diagnóstico gratuito
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}

function ProductCard({
  image,
  tag,
  title,
  text,
  href,
}: {
  image: string;
  tag: string;
  title: string;
  text: string;
  href: string;
}) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-line bg-white shadow-sm transition-shadow hover:shadow-lg">
      <div className="relative aspect-[16/9] overflow-hidden">
        <Image
          src={image}
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <span className="absolute left-4 top-4 rounded-full bg-gold px-3 py-1 text-xs font-semibold text-navy">
          {tag}
        </span>
      </div>
      <div className="p-7">
        <h2 className="text-xl font-semibold text-navy">{title}</h2>
        <p className="mt-2 text-sm text-gray">{text}</p>
        <Link
          href={href}
          className="mt-4 inline-block text-sm font-semibold text-gold-ink hover:underline"
        >
          Saiba mais →
        </Link>
      </div>
    </article>
  );
}
