'use client';

import { useState } from 'react';
import { Loader2, ChevronDown } from 'lucide-react';

import { ArticleCard } from '@/components/articles/ArticleCard';
import type { Article, Category, Author } from '@/lib/types';

type LoadMoreListProps = {
  initialArticles: Article[];
  categories: Category[];
  authors: Author[];
  categorySlug?: string;
  topicId?: string;
  authorId?: string;
  pageSize?: number;
  searchQuery?: string;
  total: number;
  initialOffset?: number;
};

export function LoadMoreList({
  initialArticles,
  categories,
  authors,
  categorySlug,
  topicId,
  authorId,
  searchQuery,
  pageSize = 12,
  total,
  initialOffset,
}: LoadMoreListProps) {
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(initialOffset ?? initialArticles.length);
  const hasMore = offset < total;

  const loadMore = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({offset: String(offset), limit: String(pageSize)});
      if (categorySlug) params.set('category',categorySlug);
      if (authorId) params.set('authorId',authorId);
      if (topicId) params.set('topicId',topicId);
      if (searchQuery) params.set('q',searchQuery);
      const response=await fetch('/api/articles?'+params.toString());
      if(!response.ok) throw new Error('Unable to load articles');
      const { articles: data } = await response.json() as {articles: Article[]};
      if(data.length) {
        setArticles(prev => [...prev,...data.filter(a => !prev.some(existing => existing.id === a.id))]);
        setOffset(prev => prev + data.length);
      } else setOffset(total);
    } catch { /* Keep the current page available so the reader can retry. */ }

    setLoading(false);
  };

  if (articles.length === 0) {
    return (
      <div className="py-16 text-center text-muted-foreground">
        No articles found.
      </div>
    );
  }

  return (
    <div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <ArticleCard
            key={article.id}
            article={article}
            categories={categories}
            authors={authors}
          />
        ))}
      </div>
      {hasMore && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={loadMore}
            disabled={loading}
            className="flex items-center gap-2 rounded-md border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-secondary disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                Load More
                <ChevronDown className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
