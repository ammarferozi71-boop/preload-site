import { ArticleCard } from '@/components/articles/ArticleCard';
import type { ArticleWithRelations, Category, Author } from '@/lib/types';

type RelatedArticlesProps = {
  articles: ArticleWithRelations[];
  categories: Category[];
  authors: Author[];
  title?: string;
};

export function RelatedArticles({
  articles,
  categories,
  authors,
  title = 'Related Articles',
}: RelatedArticlesProps) {
  if (articles.length === 0) return null;

  return (
    <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h2 className="mb-6 border-b border-border pb-4 font-heading text-2xl font-semibold tracking-tight">
        {title}
      </h2>
      <div className="grid gap-6 sm:grid-cols-2">
        {articles.map((article) => (
          <ArticleCard
            key={article.id}
            article={article}
            categories={categories}
            authors={authors}
            variant="horizontal"
            showExcerpt={false}
          />
        ))}
      </div>
    </section>
  );
}
