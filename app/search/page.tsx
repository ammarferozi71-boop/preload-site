import type { Metadata } from 'next';
import Link from 'next/link';
import { Search as SearchIcon } from 'lucide-react';
import { getCategories, getAuthors, searchArticles } from '@/lib/queries';
import { LoadMoreList } from '@/components/articles/LoadMoreList';
import { Breadcrumbs } from '@/components/articles/Breadcrumbs';
import { SITE_URL_RESOLVED } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Search',
  description: 'Search release, install and requirements pages.',
  alternates: { canonical: `${SITE_URL_RESOLVED}/search` },
  robots: { index: false, follow: true },
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const query = searchParams.q || '';
  const [categories, authors, results] = await Promise.all([
    getCategories(),
    getAuthors(),
    query ? searchArticles(query, 20) : Promise.resolve([]),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumbs
        items={[{ label: 'Home', href: '/' }, { label: 'Search' }]}
      />

      <div className="mt-6">
        <h1 className="flex items-center gap-3 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          <SearchIcon className="h-8 w-8 text-primary" />
          Search
        </h1>
        <p className="mt-2 text-muted-foreground">
          {query ? `Showing results for "${query}"` : 'Search by game name, platform or subject.'}
        </p>
      </div>

      <div className="mt-6">
      </div>

      {query ? (
        <div className="mt-8">
          <LoadMoreList
            initialArticles={results}
            categories={categories}
            authors={authors}
            searchQuery={query}
            pageSize={12}
            total={results.length}
          />
        </div>
      ) : (
        <div className="mt-12 max-w-2xl">
          <div className="rounded-lg border border-border bg-card p-8 text-center">
            <SearchIcon className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-muted-foreground">
              Enter a search term above or use the search icon in the header to find articles.
            </p>
          </div>

          <div className="mt-8">
            <h2 className="mb-4 font-heading text-lg font-bold">
              Browse by Category
            </h2>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/${cat.slug}`}
                  className="rounded-full border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
