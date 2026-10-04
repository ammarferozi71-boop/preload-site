import Link from 'next/link';
import type { Metadata } from 'next';
import { CONTACT_EMAIL, SITE_NAME, SITE_URL_RESOLVED } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: `What ${SITE_NAME} collects when you read the site, and what it does not.`,
  alternates: { canonical: SITE_URL_RESOLVED + '/privacy' },
};

const sectionHeading = 'font-heading text-2xl font-bold';
const paragraph = 'mt-3 leading-relaxed text-muted-foreground';

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Link href="/" className="text-sm text-primary">Home</Link>
      <h1 className="mt-5 font-heading text-4xl font-semibold">Privacy Policy</h1>
      <p className="mt-4 text-lg text-muted-foreground">Last updated: October 2, 2026</p>

      <section className="mt-8">
        <h2 className={sectionHeading}>What we collect</h2>
        <p className={paragraph}>
          You can read {SITE_NAME} without an account. We do not ask for your name, email address or
          payment details, and the site has no comments, sign-up form or user profiles.
        </p>
        <p className={paragraph}>
          The site does not currently use analytics, advertising or tracking cookies.
        </p>
      </section>

      <section className="mt-8">
        <h2 className={sectionHeading}>Hosting and server logs</h2>
        <p className={paragraph}>
          The site is hosted by Vercel. Like any web host, Vercel processes technical request data
          such as your IP address, browser type and the page requested in order to deliver pages and
          protect the service. We do not use this data to identify individual readers.
        </p>
      </section>

      <section className="mt-8">
        <h2 className={sectionHeading}>Links to other sites</h2>
        <p className={paragraph}>
          Articles link to publishers and official stores such as Steam, the
          PlayStation Store and the Xbox Store. Those sites have their own privacy policies, and we
          do not control what they collect once you leave {SITE_NAME}.
        </p>
      </section>

      <section className="mt-8">
        <h2 className={sectionHeading}>Children</h2>
        <p className={paragraph}>
          {SITE_NAME} is a general-audience publication and does not knowingly collect personal
          information from children.
        </p>
      </section>

      <section className="mt-8">
        <h2 className={sectionHeading}>Changes to this policy</h2>
        <p className={paragraph}>
          If we add analytics, advertising, affiliate links or a newsletter, we will update this page
          before those features go live and change the date above.
        </p>
      </section>

      {CONTACT_EMAIL && (
        <section className="mt-8">
          <h2 className={sectionHeading}>Contact</h2>
          <p className={paragraph}>
            Questions about this policy can be sent to{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary underline underline-offset-4">
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </section>
      )}
    </article>
  );
}
