import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { CATEGORY_SLUGS } from '@/lib/types';
import {
  getCategoryBySlug,
  getArticlesByCategory,
  getFeaturedByCategory,
  getTrendingArticles,
  getCategories,
  getAuthors,
} from '@/lib/queries';
import { LoadMoreList } from '@/components/articles/LoadMoreList';
import { TrendingList } from '@/components/articles/TrendingList';
import { ArticleCard } from '@/components/articles/ArticleCard';
import { NewsletterSignup } from '@/components/articles/NewsletterSignup';
import { Breadcrumbs } from '@/components/articles/Breadcrumbs';
import { SITE_NAME, SITE_URL_RESOLVED } from '@/lib/site';

export const revalidate = 300;

const VALID_CATEGORIES: string[] = [...CATEGORY_SLUGS];

type Params = { category: string };

export async function generateStaticParams() {
  return VALID_CATEGORIES.map((slug) => ({ category: slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const category = await getCategoryBySlug(params.category);
  if (!category) return { title: 'Category Not Found' };

  return {
    title: category.name,
    description: category.description || `Latest ${category.name} articles from ${SITE_NAME}`,
    alternates: { canonical: `${SITE_URL_RESOLVED}/${category.slug}` },
    openGraph: {
      title: `${category.name} — ${SITE_NAME}`,
      description: category.description || `Latest ${category.name} articles`,
      url: `${SITE_URL_RESOLVED}/${category.slug}`,
    },
  };
}

export default async function CategoryPage({ params }: { params: Params }) {
  if (!VALID_CATEGORIES.includes(params.category)) notFound();

  const category = await getCategoryBySlug(params.category);
  if (!category) notFound();

  const [featured, { articles, total }, trending, categories, authors] = await Promise.all([
    getFeaturedByCategory(params.category, 1),
    getArticlesByCategory(params.category, 12, 0),
    getTrendingArticles(5),
    getCategories(),
    getAuthors(),
  ]);

  const leadArticle = featured[0] || null;
  const remainingArticles = leadArticle
    ? articles.filter((a) => a.id !== leadArticle.id)
    : articles;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: category.name,
    description: category.description,
    url: `${SITE_URL_RESOLVED}/${category.slug}`,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Category Header */}
      <div className="border-b border-border bg-card/30">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              { label: category.name },
            ]}
          />
          <h1 className="mt-4 font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
            {category.name}
          </h1>
          {category.description && (
            <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
              {category.description}
            </p>
          )}
        </div>
      </div>

      {/* Featured category story */}
      {leadArticle && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ArticleCard
            article={leadArticle}
            categories={categories}
            authors={authors}
            variant="horizontal"
            showExcerpt
          />
        </section>
      )}

      {/* Articles + Sidebar */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="mb-6 border-b border-border pb-4 font-heading text-2xl font-semibold tracking-tight">
              Latest in {category.name}
            </h2>
            <LoadMoreList
              initialArticles={remainingArticles}
              initialOffset={articles.length}
              categories={categories}
              authors={authors}
              categorySlug={params.category}
              pageSize={12}
              total={total}
            />
          </div>
          <aside className="lg:col-span-1">
            <div className="sticky top-20 space-y-6">
              <TrendingList articles={trending} categories={categories} />
              <NewsletterSignup variant="compact" />
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
