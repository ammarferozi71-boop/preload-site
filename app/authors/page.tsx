import type { Metadata } from 'next';
import { getAuthors } from '@/lib/queries';
import { AuthorCard } from '@/components/articles/AuthorCard';
import { Breadcrumbs } from '@/components/articles/Breadcrumbs';
import { SITE_URL_RESOLVED } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Authors',
  description: 'Who writes and maintains the coverage on this site.',
  alternates: { canonical: `${SITE_URL_RESOLVED}/authors` },
};

export default async function AuthorsPage() {
  const authors = await getAuthors();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumbs
        items={[{ label: 'Home', href: '/' }, { label: 'Authors' }]}
      />
      <h1 className="mt-6 font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
        Editorial Team
      </h1>
      <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
        Who writes and maintains the coverage on this site.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {authors.map((author) => (
          <AuthorCard key={author.id} author={author} />
        ))}
      </div>
    </div>
  );
}
