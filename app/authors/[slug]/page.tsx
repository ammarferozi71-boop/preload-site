import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Image from 'next/image';
import {
  getAuthorBySlug,
  getArticlesByAuthor,
  getCategories,
  getAuthors,
} from '@/lib/queries';
import { LoadMoreList } from '@/components/articles/LoadMoreList';
import { Breadcrumbs } from '@/components/articles/Breadcrumbs';
import { NewsletterSignup } from '@/components/articles/NewsletterSignup';
import { SITE_NAME, SITE_URL_RESOLVED } from '@/lib/site';
import { Twitter, Linkedin } from 'lucide-react';

export const revalidate = 300;

type Params = { slug: string };

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const author = await getAuthorBySlug(params.slug);
  if (!author) return { title: 'Author Not Found' };

  return {
    title: author.name,
    description: author.bio || `Articles by ${author.name}`,
    alternates: { canonical: `${SITE_URL_RESOLVED}/authors/${author.slug}` },
    openGraph: {
      title: `${author.name} — ${SITE_NAME}`,
      description: author.bio || `Articles by ${author.name}`,
      url: `${SITE_URL_RESOLVED}/authors/${author.slug}`,
      images: author.avatar_url ? [{ url: author.avatar_url }] : [],
    },
  };
}

export default async function AuthorPage({ params }: { params: Params }) {
  const author = await getAuthorBySlug(params.slug);
  if (!author) notFound();

  const [categories, authors, { articles, total }] = await Promise.all([
    getCategories(),
    getAuthors(),
    getArticlesByAuthor(params.slug, 12, 0),
  ]);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': author.slug.endsWith('-editorial') ? 'Organization' : 'Person',
    name: author.name,
    jobTitle: author.title,
    description: author.bio,
    url: `${SITE_URL_RESOLVED}/authors/${author.slug}`,
    image: author.avatar_url || undefined,
    sameAs: [
      author.twitter ? `https://twitter.com/${author.twitter.replace('@', '')}` : null,
      author.linkedin || null,
    ].filter(Boolean),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="border-b border-border bg-card/30">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              { label: 'Authors', href: '/authors' },
              { label: author.name },
            ]}
          />
          <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-center">
            {author.avatar_url && (
              <Image
                src={author.avatar_url}
                alt={author.name}
                width={120}
                height={120}
                className="rounded-full"
              />
            )}
            <div>
              <h1 className="font-heading text-3xl font-semibold sm:text-4xl">{author.name}</h1>
              <p className="mt-1 text-lg text-primary">{author.title}</p>
              <p className="mt-3 max-w-2xl leading-relaxed text-muted-foreground">{author.bio}</p>
              <div className="mt-4 flex items-center gap-3">
                {author.twitter && (
                  <a
                    href={`https://twitter.com/${author.twitter.replace('@', '')}`}
                    className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground hover:text-foreground"
                    aria-label="Twitter"
                  >
                    <Twitter className="h-4 w-4" />
                  </a>
                )}
                {author.linkedin && (
                  <a
                    href={author.linkedin}
                    className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground hover:text-foreground"
                    aria-label="LinkedIn"
                  >
                    <Linkedin className="h-4 w-4" />
                  </a>
                )}
                <span className="text-sm text-muted-foreground">
                  {total} {total === 1 ? 'article' : 'articles'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h2 className="mb-6 border-b border-border pb-4 font-heading text-2xl font-semibold tracking-tight">
          Latest Articles
        </h2>
        <LoadMoreList
          initialArticles={articles}
          categories={categories}
          authors={authors}
          authorId={author.id}
          pageSize={12}
          total={total}
        />
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <NewsletterSignup variant="inline" />
      </section>
    </>
  );
}
