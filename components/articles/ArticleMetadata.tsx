import Image from 'next/image';
import { Clock, Calendar, Edit3 } from 'lucide-react';
import { formatDate, formatRelativeTime } from '@/lib/site';
import type { Author } from '@/lib/types';
import Link from 'next/link';

type ArticleMetadataProps = {
  author: Author | null | undefined;
  publishDate: string;
  updatedDate: string | null;
  readingTime: number;
  authorPageSlug?: string;
};

export function ArticleMetadata({
  author,
  publishDate,
  updatedDate,
  readingTime,
  authorPageSlug,
}: ArticleMetadataProps) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
      {author && (
        <Link
          href={authorPageSlug ? `/authors/${authorPageSlug}` : '#'}
          className="flex items-center gap-2"
        >
          {author.avatar_url && (
            <Image
              src={author.avatar_url}
              alt={author.name}
              width={32}
              height={32}
              className="rounded-full"
            />
          )}
          <span className="font-medium text-foreground">{author.name}</span>
        </Link>
      )}
      <span className="flex items-center gap-1.5">
        <Calendar className="h-3.5 w-3.5" />
        {formatDate(publishDate)}
      </span>
      {updatedDate && (
        <span className="flex items-center gap-1.5">
          <Edit3 className="h-3.5 w-3.5" />
          Updated {formatRelativeTime(updatedDate)}
        </span>
      )}
      <span className="flex items-center gap-1.5">
        <Clock className="h-3.5 w-3.5" />
        {readingTime} min read
      </span>
    </div>
  );
}
