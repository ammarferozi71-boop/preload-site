import Link from 'next/link';
import type { Metadata } from 'next';
import { SITE_NAME, SITE_URL_RESOLVED } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Editorial standards',
  description: `How ${SITE_NAME} sources release dates, install sizes and system requirements, and how corrections are handled.`,
  alternates: { canonical: SITE_URL_RESOLVED + '/editorial-standards' },
};

const heading = 'text-2xl font-semibold';
const paragraph = 'mt-3 leading-relaxed text-muted-foreground';

export default function EditorialStandardsPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Link href="/" className="text-sm text-primary">Home</Link>
      <h1 className="mt-5 text-4xl font-semibold tracking-tight">Editorial standards</h1>

      <section className="mt-8">
        <h2 className={heading}>Sources</h2>
        <p className={paragraph}>
          Dates, sizes, prices and requirements come from publishers, developers and official store
          pages. Sources are listed at the end of each article. If a figure reaches us through another
          publication, the article names that publication.
        </p>
      </section>

      <section className="mt-8">
        <h2 className={heading}>Confirmed, reported and not announced</h2>
        <p className={paragraph}>
          We separate what a publisher has confirmed from what has only been reported elsewhere. When a
          detail such as an install size or unlock time has not been published, the page says it is not
          announced. We do not fill gaps with estimates.
        </p>
      </section>

      <section className="mt-8">
        <h2 className={heading}>Prices</h2>
        <p className={paragraph}>
          Prices are the listed store prices at the time of writing, usually in US dollars. Regional
          prices differ, so check your local store before buying.
        </p>
      </section>

      <section className="mt-8">
        <h2 className={heading}>No hands-on claims</h2>
        <p className={paragraph}>
          We do not present benchmark numbers or performance results as our own. When an article
          explains what a requirement tier is likely to mean in practice, it is labelled as our reading
          of the official figures.
        </p>
      </section>

      <section className="mt-8">
        <h2 className={heading}>Updates and corrections</h2>
        <p className={paragraph}>
          Release information changes. When a page is updated, its updated date changes with it. If you
          spot an error, tell us with a link to the correct source and we will fix it.
        </p>
      </section>
    </article>
  );
}
