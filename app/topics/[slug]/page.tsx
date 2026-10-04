import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  getTopicBySlug,
  getArticlesByTopic,
  getTrendingArticles,
  getCategories,
  getAuthors,
} from '@/lib/queries';
import { LoadMoreList } from '@/components/articles/LoadMoreList';
import { TrendingList } from '@/components/articles/TrendingList';
import { Breadcrumbs } from '@/components/articles/Breadcrumbs';
import { NewsletterSignup } from '@/components/articles/NewsletterSignup';
import { SITE_NAME, SITE_URL_RESOLVED } from '@/lib/site';

export const revalidate = 300;

type Params = { slug: string };

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const topic = await getTopicBySlug(params.slug);
  if (!topic) return { title: 'Topic Not Found' };

  return {
    title: topic.name,
    description: topic.description || `Release, install and requirements coverage for ${topic.name}.`,
    alternates: { canonical: `${SITE_URL_RESOLVED}/topics/${topic.slug}` },
    openGraph: {
      title: `${topic.name} — ${SITE_NAME}`,
      description: topic.description || `Latest ${topic.name} articles`,
      url: `${SITE_URL_RESOLVED}/topics/${topic.slug}`,
    },
  };
}

export default async function TopicPage({ params }: { params: Params }) {
  const topic = await getTopicBySlug(params.slug);
  if (!topic) notFound();

  const [categories, authors, { articles, total }, trending] = await Promise.all([
    getCategories(),
    getAuthors(),
    getArticlesByTopic(params.slug, 12, 0),
    getTrendingArticles(5),
  ]);

  return (
    <>
      <div className="border-b border-border bg-card/30">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              { label: 'Topics', href: '/topics' },
              { label: topic.name },
            ]}
          />
          <h1 className="mt-4 font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
            {topic.name}
          </h1>
          {topic.description && (
            <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
              {topic.description}
            </p>
          )}
        </div>
      </div>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="mb-6 border-b border-border pb-4 font-heading text-2xl font-semibold tracking-tight">
              Latest in {topic.name}
            </h2>
            <LoadMoreList
              initialArticles={articles}
              categories={categories}
              authors={authors}
              topicId={topic.id}
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
