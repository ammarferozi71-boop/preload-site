import type { Metadata } from 'next';
import { getTopics } from '@/lib/queries';
import { Breadcrumbs } from '@/components/articles/Breadcrumbs';
import { SITE_URL_RESOLVED } from '@/lib/site';
import Link from 'next/link';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Topics',
  description: 'Browse release, install and requirements coverage by game, platform and subject.',
  alternates: { canonical: `${SITE_URL_RESOLVED}/topics` },
};

export default async function TopicsPage() {
  const topics = await getTopics();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumbs
        items={[{ label: 'Home', href: '/' }, { label: 'Topics' }]}
      />
      <h1 className="mt-6 font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
        Topics
      </h1>
      <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
        Browse coverage by game, platform and subject.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {topics.map((topic) => (
          <Link
            key={topic.id}
            href={`/topics/${topic.slug}`}
            className="group rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/50"
          >
            <h2 className="font-heading text-lg font-bold text-foreground transition-colors group-hover:text-primary">
              {topic.name}
            </h2>
            {topic.description && (
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                {topic.description}
              </p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
