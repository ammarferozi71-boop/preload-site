import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CONTACT_EMAIL, SITE_NAME, SITE_URL_RESOLVED } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Contact',
  description: `How to reach ${SITE_NAME} about corrections, press material and general questions.`,
  alternates: { canonical: SITE_URL_RESOLVED + '/contact' },
};

const paragraph = 'mt-3 leading-relaxed text-muted-foreground';

export default function ContactPage() {
  // The page only exists once a contact address is configured (NEXT_PUBLIC_CONTACT_EMAIL).
  if (!CONTACT_EMAIL) notFound();

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Link href="/" className="text-sm text-primary">Home</Link>
      <h1 className="mt-5 font-heading text-4xl font-semibold">Contact</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        Email us at{' '}
        <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary underline underline-offset-4">
          {CONTACT_EMAIL}
        </a>
        .
      </p>

      <section className="mt-8">
        <h2 className="font-heading text-2xl font-bold">Corrections</h2>
        <p className={paragraph}>
          If something in an article is wrong or out of date, send the article link and a source for
          the correct information. We update the article and record the change date.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="font-heading text-2xl font-bold">Press and publishers</h2>
        <p className={paragraph}>
          Release dates, install sizes, system requirements and official artwork for upcoming games
          are welcome at the same address.
        </p>
      </section>

      <nav className="mt-10 flex flex-wrap gap-5 text-primary">
        <Link href="/about">About</Link>
        <Link href="/editorial-standards">Editorial standards</Link>
        <Link href="/privacy">Privacy policy</Link>
      </nav>
    </article>
  );
}
