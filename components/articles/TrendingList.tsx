import Link from 'next/link';
import { formatRelativeTime, getArticleUrl } from '@/lib/site';
import type { ArticleWithRelations, Category } from '@/lib/types';

type TrendingListProps = {
  articles: ArticleWithRelations[];
  categories: Category[];
};

export function TrendingList({ articles, categories }: TrendingListProps) {
  if (articles.length === 0) return null;

  return (
    <div className="rounded border border-border p-5">
      <h2 className="border-b border-border pb-3 text-base font-semibold">Also worth reading</h2>
      <ul className="mt-4 space-y-4">
        {articles.map((article) => {
          const category = categories.find((c) => c.id === article.category_id);
          const url = getArticleUrl(article);
          return (
            <li key={article.id}>
              <Link href={url} className="group flex items-start gap-4">
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
            </li>
          );
        })}
      </ul>
    </div>
  );
}
