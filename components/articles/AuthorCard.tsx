import Link from 'next/link';
import Image from 'next/image';
import { getAuthorUrl } from '@/lib/site';
import type { Author } from '@/lib/types';

type AuthorCardProps = {
  author: Author;
  articleCount?: number;
  className?: string;
};

export function AuthorCard({ author, articleCount, className = '' }: AuthorCardProps) {
  return (
    <Link
      href={getAuthorUrl(author.slug)}
      className={`flex items-center gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/50 ${className}`}
    >
      {author.avatar_url ? (
        <Image
          src={author.avatar_url}
          alt={author.name}
          width={56}
          height={56}
          className="rounded-full object-cover"
        />
      ) : (
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-lg font-bold">
          {author.name.split(' ').map((n) => n[0]).join('')}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-base font-heading font-bold text-foreground">
          {author.name}
        </h3>
        <p className="truncate text-sm text-muted-foreground">{author.title}</p>
        {articleCount != null && (
          <p className="mt-1 text-xs text-muted-foreground">
            {articleCount} {articleCount === 1 ? 'article' : 'articles'}
          </p>
        )}
      </div>
    </Link>
  );
}
