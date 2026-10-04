import Link from 'next/link';
import Image from 'next/image';
import { formatRelativeTime, getArticleUrl } from '@/lib/site';
import type { ArticleWithRelations, Category, Author } from '@/lib/types';

type ArticleCardProps = {
  article: ArticleWithRelations;
  categories: Category[];
  authors: Author[];
  variant?: 'default' | 'compact' | 'horizontal' | 'minimal';
  showExcerpt?: boolean;
  showImage?: boolean;
  className?: string;
};

export function ArticleCard({
  article,
  categories,
  authors,
  variant = 'default',
  showExcerpt = true,
  showImage = true,
  className = '',
}: ArticleCardProps) {
  const category = categories.find((c) => c.id === article.category_id);
  const author = authors.find((a) => a.id === article.author_id);
  const url = getArticleUrl(article);

  if (variant === 'minimal') {
    return (
      <Link href={url} className={`group block ${className}`}>
        {category && (
          <span className="text-xs font-semibold text-primary">
            {category.name}
          </span>
        )}
        <h3 className="mt-1 line-clamp-2 text-sm font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
          {article.title}
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          {formatRelativeTime(article.publish_date)}
        </p>
      </Link>
    );
  }

  if (variant === 'compact') {
    return (
      <Link href={url} className={`group flex gap-3 ${className}`}>
        {showImage && article.hero_image && (
          <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded">
            <Image
            src={article.hero_image}
              alt={article.hero_image_alt || article.title}
              fill
              sizes="96px"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        )}
        <div className="min-w-0 flex-1">
          {category && (
            <span className="text-[11px] font-semibold text-primary">
              {category.name}
            </span>
          )}
          <h3 className="mt-0.5 line-clamp-2 text-sm font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
            {article.title}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {formatRelativeTime(article.publish_date)}
          </p>
        </div>
      </Link>
    );
  }

  if (variant === 'horizontal') {
    return (
      <Link href={url} className={`group flex flex-col gap-4 sm:flex-row ${className}`}>
        {showImage && article.hero_image && (
          <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-lg sm:w-64">
            <Image
              src={article.hero_image}
              alt={article.hero_image_alt || article.title}
              fill
              sizes="(max-width: 640px) 100vw, 256px"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        )}
        <div className="min-w-0 flex-1">
          {category && (
            <span className="text-xs font-semibold text-primary">
              {category.name}
            </span>
          )}
          <h3 className="mt-1.5 line-clamp-2 text-lg font-heading font-bold leading-snug text-foreground transition-colors group-hover:text-primary">
            {article.title}
          </h3>
          {showExcerpt && (
            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
              {article.excerpt}
            </p>
          )}
          <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
            {author && <span>{author.name}</span>}
            <span>&middot;</span>
            <span>{formatRelativeTime(article.publish_date)}</span>
            <span>&middot;</span>
            <span>{article.reading_time} min read</span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={url} className={`group flex flex-col ${className}`}>
      {showImage && article.hero_image && (
        <div className="relative aspect-video w-full overflow-hidden rounded-lg">
          <Image
            src={article.hero_image}
            alt={article.hero_image_alt || article.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {category && (
            <span className="absolute left-3 top-3 rounded bg-primary px-2.5 py-1 text-xs font-bold text-primary-foreground">
              {category.name}
            </span>
          )}
        </div>
      )}
      <div className="mt-3 flex flex-1 flex-col">
        {category && !showImage && (
          <span className="text-xs font-semibold text-primary">
            {category.name}
          </span>
        )}
        <h3 className="line-clamp-3 text-base font-heading font-bold leading-snug text-foreground transition-colors group-hover:text-primary">
          {article.title}
        </h3>
        {showExcerpt && (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {article.excerpt}
          </p>
        )}
        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          {author && (
            <>
              {author.avatar_url && (
                <Image
                  src={author.avatar_url}
                  alt={author.name}
                  width={20}
                  height={20}
                  className="rounded-full"
                />
              )}
              <span>{author.name}</span>
              <span>&middot;</span>
            </>
          )}
          <span>{formatRelativeTime(article.publish_date)}</span>
        </div>
      </div>
    </Link>
  );
}
