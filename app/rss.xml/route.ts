import { getLatestArticles, getCategories, getAuthors } from '@/lib/queries';
import { SITE_NAME, SITE_URL_RESOLVED, SITE_DESCRIPTION } from '@/lib/site';

export const revalidate = 3600;
export const dynamic = 'force-dynamic';

export async function GET() {
  const [articles, categories, authors] = await Promise.all([
    getLatestArticles(50),
    getCategories(),
    getAuthors(),
  ]);

  const catMap = new Map(categories.map((c) => [c.id, c]));
  const authorMap = new Map(authors.map((a) => [a.id, a]));

  const items = articles
    .map((article) => {
      const category = article.category_id ? catMap.get(article.category_id) : undefined;
      const author = article.author_id ? authorMap.get(article.author_id) : undefined;
      const url = `${SITE_URL_RESOLVED}/${category?.slug || 'releases'}/${article.slug}`;
      return `    <item>
      <title><![CDATA[${article.title}]]></title>
      <link>${url}</link>
      <guid>${url}</guid>
      <pubDate>${new Date(article.publish_date).toUTCString()}</pubDate>
      <description><![CDATA[${article.excerpt}]]></description>
      ${category ? `<category>${category.name}</category>` : ''}
      ${author ? `<dc:creator><![CDATA[${author.name}]]></dc:creator>` : ''}
    </item>`;
    })
    .join('\n');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title><![CDATA[${SITE_NAME}]]></title>
    <link>${SITE_URL_RESOLVED}</link>
    <description><![CDATA[${SITE_DESCRIPTION}]]></description>
    <language>en-us</language>
    <atom:link href="${SITE_URL_RESOLVED}/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
