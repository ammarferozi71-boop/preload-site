import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import data from '@/content/tools/release-calendar.json';
import { isPublishable } from '@/lib/tools/validate.mjs';
import { sortReleases } from '@/lib/tools/release-time.mjs';
import type { Dataset } from '@/lib/tools/types';
import type { ReleaseRow } from '@/components/tools/ReleaseCalendar';
import { ReleaseCalendar } from '@/components/tools/ReleaseCalendar';
import { ToolSources } from '@/components/tools/ToolSources';
import { SITE_NAME, SITE_URL_RESOLVED } from '@/lib/site';

// Rebuilt with each deploy; the engine commits new data, which triggers a deploy.
export const revalidate = 3600;

const ds = data as unknown as Dataset<ReleaseRow>;
const URL_PATH = '/tools/release-calendar';

export function generateMetadata(): Metadata {
  if (!isPublishable(ds)) return { title: 'Not found', robots: { index: false, follow: false } };
  return {
    title: 'Game Release Calendar: Unlock Times in Your Time Zone',
    description: 'Upcoming game releases with unlock and preload times converted to your local time, install sizes and the official source for every time.',
    alternates: { canonical: SITE_URL_RESOLVED + URL_PATH },
  };
}

export default function ReleaseCalendarPage() {
  // Hidden until the engine has published enough verified, fresh rows.
  if (!isPublishable(ds)) notFound();
  const { upcoming, released } = sortReleases(ds.rows);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: `${SITE_NAME} release calendar`,
    url: SITE_URL_RESOLVED + URL_PATH,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Any',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  };

  return (
    <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Link href="/" className="text-sm text-primary">Home</Link>
      <h1 className="mt-5 text-4xl font-semibold tracking-tight">Game release calendar</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        When each game unlocks, shown in your own time zone, with preload times and install sizes.
        Every time links to the official announcement it comes from.
      </p>
      <ReleaseCalendar upcoming={upcoming} released={released} />
      <ToolSources facts={ds.facts} generatedAt={ds.generated_at} />
    </article>
  );
}
