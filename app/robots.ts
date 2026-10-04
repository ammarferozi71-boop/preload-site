import type { MetadataRoute } from 'next';
import { SITE_URL_RESOLVED } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/search'],
    },
    sitemap: `${SITE_URL_RESOLVED}/sitemap.xml`,
    host: SITE_URL_RESOLVED,
  };
}
