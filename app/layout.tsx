import './globals.css';
import type { Metadata } from 'next';
import Script from 'next/script';
import { IBM_Plex_Sans } from 'next/font/google';
import { SITE_NAME, SITE_TAGLINE, SITE_DESCRIPTION, SITE_URL_RESOLVED, GOOGLE_SITE_VERIFICATION } from '@/lib/site';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { SearchProvider } from '@/components/search/SearchProvider';
import { SearchModal } from '@/components/search/SearchModal';
import { Toaster } from '@/components/ui/sonner';

const plex = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-plex',
  display: 'swap',
});

// Pages are pre-rendered and refreshed every few minutes (see each page's revalidate value).

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL_RESOLVED),
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    url: SITE_URL_RESOLVED,
  },
  twitter: {
    card: 'summary_large_image',
  },
  ...(GOOGLE_SITE_VERIFICATION ? { verification: { google: GOOGLE_SITE_VERIFICATION } } : {}),
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL_RESOLVED,
    description: SITE_DESCRIPTION,
  };

  return (
    <html lang="en" className={plex.variable}>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
      </head>
      <body className="font-sans bg-background text-foreground antialiased">
        <SearchProvider>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <SearchModal />
        </SearchProvider>
        <Toaster />
        {/* Vercel Web Analytics: cookieless page-view counts. Enabled per project in the Vercel dashboard. */}
        <Script id="vercel-analytics-init" strategy="afterInteractive">
          {`window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };`}
        </Script>
        <Script src="/_vercel/insights/script.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
