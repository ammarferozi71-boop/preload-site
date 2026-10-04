import { ReadingBrief } from '@/components/editorial/ReadingBrief';
import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import {
  getArticleBySlug,
  getRelatedArticles,
  getMoreFromCategory,
  getCategories,
  getAuthors,
} from '@/lib/queries';
import { ArticleBody } from '@/components/articles/ArticleBody';
import { ArticleMetadata } from '@/components/articles/ArticleMetadata';
import { Breadcrumbs } from '@/components/articles/Breadcrumbs';
import { ShareButtons } from '@/components/articles/ShareButtons';
import { RelatedArticles } from '@/components/articles/RelatedArticles';
import { TableOfContents } from '@/components/articles/TableOfContents';
import { extractHeadings } from '@/lib/article-headings';
import { NewsletterSignup } from '@/components/articles/NewsletterSignup';
import { formatDate, SITE_NAME, SITE_URL_RESOLVED } from '@/lib/site';
import type { BodyBlock } from '@/lib/types';

export const revalidate = 300;

type Params = { category: string; slug: string };

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const article = await getArticleBySlug(params.slug);
  if (!article) return { title: 'Article Not Found' };

  const seoTitle = article.seo_title || article.title;
  const seoDesc = article.seo_description || article.excerpt;
  const ogImage = article.social_image || article.hero_image;
  const categorySlug = article.category?.slug || params.category;
  const url = `${SITE_URL_RESOLVED}/${categorySlug}/${article.slug}`;

  return {
    title: seoTitle,
    description: seoDesc,
    alternates: { canonical: article.canonical_url || url },
    openGraph: {
      type: 'article',
      title: seoTitle,
      description: seoDesc,
      url,
      images: ogImage ? [{ url: ogImage, width: 1200, height: 630 }] : [],
      publishedTime: article.publish_date,
      modifiedTime: article.updated_date || undefined,
      authors: article.author?.name ? [article.author.name] : [],
      siteName: SITE_NAME,
    },
    twitter: {
      card: 'summary_large_image',
      title: seoTitle,
      description: seoDesc,
      images: ogImage ? [ogImage] : [],
    },
  };
}

export default async function ArticlePage({ params }: { params: Params }) {
  const article = await getArticleBySlug(params.slug);
  if (!article) notFound();

  if (article.category?.slug && article.category.slug !== params.category) {
    redirect(`/${article.category.slug}/${article.slug}`);
  }

  const [categories, authors, related, moreFromCategory] = await Promise.all([
    getCategories(),
    getAuthors(),
    getRelatedArticles(article, 4),
    article.category ? getMoreFromCategory(article.category.slug, article.id, 4) : Promise.resolve([]),
  ]);

  const category = categories.find((c) => c.id === article.category_id);
  const headings = extractHeadings(article.body as BodyBlock[]);
  const url = `${SITE_URL_RESOLVED}/${article.category?.slug || params.category}/${article.slug}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': article.category?.slug === 'updates' ? 'NewsArticle' : 'Article',
    headline: article.title,
    description: article.excerpt,
    image: article.hero_image ? [article.hero_image] : [],
    datePublished: article.publish_date,
    dateModified: article.updated_date || article.publish_date,
    author: article.author
      ? { '@type': article.author.slug.endsWith('-editorial') ? 'Organization' : 'Person', name: article.author.name, url: `${SITE_URL_RESOLVED}/authors/${article.author.slug}` }
      : { '@type': 'Organization', name: SITE_NAME },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: { '@type': 'ImageObject', url: `${SITE_URL_RESOLVED}/logo.svg` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
  };

  const reviewJsonLd = article.review_score ? {
    '@context': 'https://schema.org',
    '@type': 'Review',
    itemReviewed: {
      '@type': article.review_product?.includes('GPU') || article.review_product?.includes('CPU') ? 'Product' : 'VideoGame',
      name: article.review_product || article.title,
    },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: article.review_score,
      bestRating: article.review_score.includes('%') ? '100' : article.review_score.includes('/') ? article.review_score.split('/')[1] : '5',
    },
    author: article.author ? { '@type': 'Person', name: article.author.name } : undefined,
    publisher: { '@type': 'Organization', name: SITE_NAME },
  } : null;

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL_RESOLVED },
      ...(category ? [{ '@type': 'ListItem', position: 2, name: category.name, item: `${SITE_URL_RESOLVED}/${category.slug}` }] : []),
      { '@type': 'ListItem', position: category ? 3 : 2, name: article.title, item: url },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {reviewJsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewJsonLd) }} />}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <article className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            ...(category ? [{ label: category.name, href: `/${category.slug}` }] : []),
            { label: article.title },
          ]}
        />

        {/* Category */}
        {category && (
          <Link
            href={`/${category.slug}`}
            className="mt-4 inline-block text-sm font-bold text-primary"
          >
            {category.name}
          </Link>
        )}

        {/* Title */}
        <h1 className="mt-2 font-heading text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
          {article.title}
        </h1>

        {/* Subtitle */}
        {article.excerpt && (
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            {article.excerpt}
          </p>
        )}

        {/* Metadata */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-y border-border py-4">
          <ArticleMetadata
            author={article.author}
            publishDate={article.publish_date}
            updatedDate={article.updated_date}
            readingTime={article.reading_time}
            authorPageSlug={article.author?.slug}
          />
          <ShareButtons url={url} title={article.title} />
        </div>
      </article>

      {/* Hero Image */}
      {article.hero_image && (
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <figure className="relative aspect-video w-full overflow-hidden rounded-lg">
            <Image
              src={article.hero_image}
              alt={article.hero_image_alt || article.title}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 800px"
              className="object-cover"
            />
          </figure>
          {article.hero_image_caption && (
            <figcaption className="mt-2 text-center text-sm text-muted-foreground">
              {article.hero_image_caption}
            </figcaption>
          )}
        </div>
      )}

      {/* Article Body + Sidebar */}
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
          <div className="min-w-0">
            <div className="lg:hidden">
              {headings.length >= 3 && (
                <TableOfContents headings={headings} className="mb-6" />
              )}
            </div>

            <ReadingBrief points={article.takeaways} />
            <ArticleBody body={article.body as BodyBlock[]} />

            {/* Tags */}
            {article.tags.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Author bio */}
            {article.author && (
              <div className="mt-8 flex gap-4 rounded-lg border border-border bg-card p-6">
                {article.author.avatar_url && (
                  <Image
                    src={article.author.avatar_url}
                    alt={article.author.name}
                    width={64}
                    height={64}
                    className="rounded-full"
                  />
                )}
                <div>
                  <h3 className="font-heading text-lg font-bold">{article.author.name}</h3>
                  <p className="text-sm text-muted-foreground">{article.author.title}</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {article.author.bio}
                  </p>
                  <Link
                    href={`/authors/${article.author.slug}`}
                    className="mt-2 inline-block text-sm font-semibold text-primary"
                  >
                    View all articles by {article.author.name} →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Sticky Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-20 space-y-6">
              {headings.length >= 3 && (
                <TableOfContents headings={headings} />
              )}
              <NewsletterSignup variant="compact" />
            </div>
          </aside>
        </div>
      </div>

      {/* Related Articles */}
      <div className="border-t border-border">
        <RelatedArticles
          articles={related}
          categories={categories}
          authors={authors}
          title="Related Articles"
        />
      </div>

      {/* More from category */}
      {category && moreFromCategory.length > 0 && (
        <div className="border-t border-border">
          <RelatedArticles
            articles={moreFromCategory}
            categories={categories}
            authors={authors}
            title={`More from ${category.name}`}
          />
        </div>
      )}

      {/* Newsletter */}
      <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <NewsletterSignup variant="inline" />
      </section>
    </>
  );
}
