import { CATEGORY_LABELS } from './types';
import type { ArticleWithRelations, Author, Category } from './types';

const deploymentHost = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || (deploymentHost ? 'https://' + deploymentHost : 'http://localhost:3000')).replace(/\/$/, '');

export const SITE_NAME = 'Preload';
export const SITE_TAGLINE = 'Release times, install sizes and PC requirements';
export const SITE_DESCRIPTION =
  'When games unlock, how much space they need and what your PC needs to run them. Sourced from publisher and store listings.';
export const SITE_URL_RESOLVED = SITE_URL;
// Google Search Console verification code (the content value of the google-site-verification tag).
export const GOOGLE_SITE_VERIFICATION = (process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || '').trim();
// Public contact address. Set NEXT_PUBLIC_CONTACT_EMAIL to enable the Contact page.
export const CONTACT_EMAIL = (process.env.NEXT_PUBLIC_CONTACT_EMAIL || '').trim();

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateString);
}

export function getCategorySlug(article: ArticleWithRelations): string {
  return article.category?.slug || 'releases';
}

export function getArticleUrl(
  article: { slug: string; category?: Category | null; category_id?: string | null },
  categoryMap?: Map<string, { slug: string }>
): string {
  let categorySlug = 'releases';
  if (article.category) {
    categorySlug = article.category.slug;
  } else if (article.category_id && categoryMap) {
    const cat = categoryMap.get(article.category_id);
    if (cat) categorySlug = cat.slug;
  }
  return `/${categorySlug}/${article.slug}`;
}

export function getCategoryUrl(slug: string): string {
  return `/${slug}`;
}

export function getAuthorUrl(slug: string): string {
  return `/authors/${slug}`;
}

export function getTopicUrl(slug: string): string {
  return `/topics/${slug}`;
}

export function getCategoryLabel(slug: string): string {
  return CATEGORY_LABELS[slug] || slug.charAt(0).toUpperCase() + slug.slice(1);
}

export function getCategoryFromArticle(
  article: ArticleWithRelations,
  categories: Category[]
): Category | undefined {
  return categories.find((c) => c.id === article.category_id);
}

export function getAuthorFromArticle(
  article: ArticleWithRelations,
  authors: Author[]
): Author | undefined {
  return authors.find((a) => a.id === article.author_id);
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

// Card-sized version of an article image (saved next to the full image as "-thumb").
export function thumbFor(src: string): string {
  return src.replace(/^(\/images\/(?:games|guides)\/.+)\.(jpg|webp)$/, '$1-thumb.$2');
}
