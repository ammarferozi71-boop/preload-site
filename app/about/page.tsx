import Link from 'next/link';
import type { Metadata } from 'next';
import { SITE_NAME, SITE_URL_RESOLVED } from '@/lib/site';

export const metadata: Metadata = {
  title: 'About',
  description: `${SITE_NAME} tracks when games unlock, how much space they need and what a PC needs to run them.`,
  alternates: { canonical: SITE_URL_RESOLVED + '/about' },
};

const heading = 'text-2xl font-semibold';
const paragraph = 'mt-3 leading-relaxed text-muted-foreground';

export default function AboutPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Link href="/" className="text-sm text-primary">Home</Link>
      <h1 className="mt-5 text-4xl font-semibold tracking-tight">About {SITE_NAME}</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        {SITE_NAME} answers three questions about a game before you download it: when it unlocks, how
        much space it needs, and what your PC needs to run it.
      </p>

      <section className="mt-8">
        <h2 className={heading}>What we cover</h2>
        <p className={paragraph}>
          Release dates and unlock times, editions and prices, install sizes, preload dates, official PC
          requirements and major updates. We also publish short guides for the settings and storage
          tasks that come up around a launch.
        </p>
      </section>

      <section className="mt-8">
        <h2 className={heading}>Where the information comes from</h2>
        <p className={paragraph}>
          Each page is built from publisher announcements and official store listings, with the sources
          linked at the end. When we rely on another publication&apos;s report of an official figure, we
          say so. Details that have not been announced are marked as not announced.
        </p>
      </section>

      <section className="mt-8">
        <h2 className={heading}>What we do not do</h2>
        <p className={paragraph}>
          We do not publish benchmark results or performance claims from our own testing, because we
          have not tested these games ourselves. Requirement pages explain what the official figures
          mean; they are not reviews.
        </p>
      </section>

      <nav className="mt-10 flex flex-wrap gap-5 text-primary">
        <Link href="/editorial-standards">Editorial standards</Link>
        <Link href="/privacy">Privacy policy</Link>
      </nav>
    </article>
  );
}
