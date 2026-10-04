export interface Author {
  id: string;
  name: string;
  slug: string;
  title: string;
  bio: string;
  avatar_url: string;
  twitter?: string | null;
  linkedin?: string | null;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
}

export interface Topic {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
}

export interface Deal {
  id: string;
  product: string;
  slug: string;
  merchant: string;
  original_price: number | null;
  sale_price: number | null;
  discount: number;
  image_url: string;
  affiliate_url: string;
  expiry_date: string | null;
}

export type BodyBlock =
  | { type: 'link'; text: string; url: string }
  | { type: 'heading'; level: 2 | 3 | 4; text: string; id?: string }
  | { type: 'paragraph'; text: string }
  | { type: 'quote'; text: string; attribution?: string }
  | { type: 'image'; url: string; alt: string; caption?: string }
  | { type: 'list'; ordered?: boolean; items: string[] }
  | { type: 'callout'; text: string; variant?: 'info' | 'warning' | 'tip' }
  | { type: 'video'; url: string; title?: string }
  | { type: 'table'; headers: string[]; rows: string[][] };

export interface Article {
  takeaways?: string[];
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  hero_image: string;
  hero_image_alt: string;
  hero_image_caption: string;
  body: BodyBlock[];
  author_id: string | null;
  category_id: string | null;
  tags: string[];
  publish_date: string;
  updated_date: string | null;
  featured: boolean;
  trending: boolean;
  editor_choice: boolean;
  review_score: string | null;
  review_product: string | null;
  seo_title: string | null;
  seo_description: string | null;
  canonical_url: string | null;
  social_image: string | null;
  reading_time: number;
  created_at: string;
}

export interface ArticleWithRelations extends Article {
  author?: Author | null;
  category?: Category | null;
  topics?: Topic[];
}

export interface ArticleListItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  hero_image: string;
  hero_image_alt: string;
  category_id: string | null;
  author_id: string | null;
  publish_date: string;
  reading_time: number;
  review_score: string | null;
  review_product: string | null;
  featured: boolean;
  trending: boolean;
  tags: string[];
}

export interface Game {
  slug: string;
  name: string;
  /** ISO date, e.g. 2026-10-23 */
  release_date: string;
  platforms: string[];
  /** PC install size as listed by the publisher, or null when not announced */
  install_size: string | null;
  /** Site path of our page for this game, or null when we have none yet */
  article_path: string | null;
}

export const CATEGORY_SLUGS = ['releases', 'requirements', 'install', 'updates', 'guides'] as const;

export const CATEGORY_LABELS: Record<string, string> = {
  releases: 'Releases',
  requirements: 'PC Requirements',
  install: 'Install & Preload',
  updates: 'Updates',
  guides: 'Guides',
};
