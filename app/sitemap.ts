import type { MetadataRoute } from 'next';
import { getAllArticleSlugs, getAllAuthorSlugs, getAllTopicSlugs, getCategories } from '@/lib/queries';
import { CONTACT_EMAIL, SITE_URL_RESOLVED } from '@/lib/site';

export const revalidate = 3600;
export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, authors, topics, categories] = await Promise.all([
    getAllArticleSlugs(),
    getAllAuthorSlugs(),
    getAllTopicSlugs(),
    getCategories(),
  ]);

  const catMap = new Map(categories.map((c) => [c.id, c.slug]));

  const articleUrls: MetadataRoute.Sitemap = articles.map((a) => {
    const catSlug = catMap.get(a.category_id || '') || 'releases';
    return {
      url: `${SITE_URL_RESOLVED}/${catSlug}/${a.slug}`,
      lastModified: new Date(a.updated_date || a.publish_date),
      changeFrequency: 'weekly',
      priority: 0.8,
    };
  });

  const categoryUrls: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${SITE_URL_RESOLVED}/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.7,
  }));

  const authorUrls: MetadataRoute.Sitemap = authors.map((a) => ({
    url: `${SITE_URL_RESOLVED}/authors/${a.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  const topicUrls: MetadataRoute.Sitemap = topics.map((t) => ({
    url: `${SITE_URL_RESOLVED}/topics/${t.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.6,
  }));

  const staticUrls: MetadataRoute.Sitemap = [
    ...['about', 'editorial-standards', 'privacy', ...(CONTACT_EMAIL ? ['contact'] : [])].map(slug => ({url: SITE_URL_RESOLVED+'/'+slug, lastModified: new Date('2026-10-04T08:00:00Z')})),
    { url: SITE_URL_RESOLVED, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${SITE_URL_RESOLVED}/authors`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.5 },
    { url: `${SITE_URL_RESOLVED}/topics`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.5 },
  ];

  return [...staticUrls, ...articleUrls, ...categoryUrls, ...authorUrls, ...topicUrls];
}
