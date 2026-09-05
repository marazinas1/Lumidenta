import { notFound, useParams } from "@tanstack/react-router";

import { LocaleLink } from "@/components/site/LocaleLink";
import { getContent } from "@/content";
import { ensureCatalog, useCatalog } from "@/lib/catalog";
import type { PostRow } from "@/lib/catalog.functions";
import type { Locale } from "@/lib/locale";
import { ensurePageContent, usePageContent, type ContentLoaderArgs } from "@/lib/page-content";
import { pageHead } from "@/lib/seo";

const PAGE = "posts";
const SITE = "https://lumidenta.deerva.com";

export function formatPostDate(value: string) {
  // Fixed locale + UTC so the server and the browser render the same string.
  return new Intl.DateTimeFormat("lt-LT", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

/** Card used both on the list page and in the homepage teaser. */
export function PostCard({ post }: { post: PostRow }) {
  return (
    <LocaleLink to="/straipsniai/$slug" params={{ slug: post.slug }} className="post-card">
      {post.imageUrl ? (
        <div className="post-cover">
          <img src={post.imageUrl} alt={post.imageAlt || post.title} loading="lazy" />
        </div>
      ) : null}
      <div className="post-body">
        <span className="post-date">{formatPostDate(post.publishedAt)}</span>
        <h3>{post.title}</h3>
        <p>{post.excerpt}</p>
        <span className="lm">Skaityti →</span>
      </div>
    </LocaleLink>
  );
}

/* ------------------------------------------------------------------ /straipsniai */

export function postsRoute(locale: Locale) {
  const c = getContent(locale);
  return {
    loader: async ({ context }: ContentLoaderArgs) => {
      await Promise.all([ensurePageContent(context), ensureCatalog(context)]);
      return null;
    },
    head: () => ({
      ...pageHead({
        path: "/straipsniai",
        title: `Straipsniai — ${c.common.brand}`,
        description:
          "Straipsniai apie dantų priežiūrą, profilaktiką ir gydymą — gyd. odontologės pastebėjimai.",
        locale,
      }),
    }),
    component: () => <PostsPage locale={locale} />,
  };
}

function PostsPage({ locale }: { locale: Locale }) {
  const { copy } = usePageContent(PAGE, locale);
  const { posts } = useCatalog();

  return (
    <>
      <section className="page-head">
        <div className="wrap">
          <div className="eyebrow">{copy("hero_eyebrow", "Straipsniai")}</div>
          <h1>{copy("hero_heading", "Apie dantų sveikatą — paprastai.")}</h1>
          <p className="lead">
            {copy(
              "hero_lead",
              "Trumpi tekstai apie tai, ko dažniausiai klausiama kabinete: profilaktika, gydymas ir kasdienė priežiūra.",
            )}
          </p>
        </div>
      </section>

      <section className="page-body">
        <div className="wrap">
          {posts.length === 0 ? (
            <p className="lead">Straipsnių kol kas nėra — netrukus atsiras.</p>
          ) : (
            <div className="post-grid">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

/* ------------------------------------------------------------ /straipsniai/$slug */

type SlugLoaderArgs = ContentLoaderArgs & { params: { slug: string } };

export function postDetailRoute(locale: Locale) {
  const c = getContent(locale);
  return {
    loader: async ({ context, params }: SlugLoaderArgs) => {
      const [, catalog] = await Promise.all([ensurePageContent(context), ensureCatalog(context)]);
      const post = catalog.posts.find((p) => p.slug === params.slug);
      if (!post) throw notFound();
      return { post };
    },
    head: ({ loaderData }: { loaderData?: { post: PostRow } }) => {
      const post = loaderData?.post;
      if (!post) return { meta: [{ name: "robots", content: "noindex" }] };
      const head = pageHead({
        path: `/straipsniai/${post.slug}`,
        title: post.seoTitle || `${post.title} — ${c.common.brand}`,
        description: (post.seoDescription || post.excerpt).slice(0, 155),
        locale,
      });
      return {
        ...head,
        scripts: [
          {
            type: "application/ld+json",
            children: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Article",
              headline: post.title,
              datePublished: post.publishedAt,
              author: post.author ? { "@type": "Person", name: post.author } : undefined,
              mainEntityOfPage: `${SITE}/straipsniai/${post.slug}`,
              ...(post.imageUrl ? { image: post.imageUrl } : {}),
            }),
          },
        ],
      };
    },
    errorComponent: ({ error }: { error: Error }) => (
      <section className="page-body">
        <div className="wrap" role="alert">
          {error.message}
        </div>
      </section>
    ),
    notFoundComponent: () => (
      <section className="page-body">
        <div className="wrap">
          <p>Tokio straipsnio nėra.</p>
          <LocaleLink to="/straipsniai" className="btn btn-line">
            Visi straipsniai →
          </LocaleLink>
        </div>
      </section>
    ),
    component: PostDetailPage,
  };
}

function PostDetailPage() {
  const { posts } = useCatalog();
  const params = useParams({ strict: false }) as { slug?: string };
  const post = posts.find((p) => p.slug === params.slug);
  if (!post) return null;

  return (
    <>
      <section className="page-head">
        <div className="wrap">
          <LocaleLink to="/straipsniai" className="back-link">
            ← Visi straipsniai
          </LocaleLink>
          <span className="post-date">{formatPostDate(post.publishedAt)}</span>
          <h1>{post.title}</h1>
          {post.excerpt ? <p className="lead">{post.excerpt}</p> : null}
        </div>
      </section>

      <section className="page-body">
        <div className="wrap">
          {post.imageUrl ? (
            <div className="post-hero">
              <img src={post.imageUrl} alt={post.imageAlt || post.title} />
            </div>
          ) : null}

          <div className="prose">
            {post.body
              .split("\n")
              .filter((p) => p.trim())
              .map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
          </div>

          {post.author ? <p className="post-author">{post.author}</p> : null}

          <div style={{ marginTop: "40px" }}>
            <LocaleLink to="/kontaktai" className="btn">
              Registruotis vizitui →
            </LocaleLink>
          </div>
        </div>
      </section>
    </>
  );
}
