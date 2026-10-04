import Link from 'next/link';
import { getGames, getLatestArticles, getCategories } from '@/lib/queries';
import { formatDate, getArticleUrl, SITE_URL_RESOLVED, SITE_NAME } from '@/lib/site';
import type { ArticleWithRelations, Game } from '@/lib/types';

export const revalidate = 300;

const boardDate = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });

function ReleaseBoard({ games }: { games: Game[] }) {
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="release-board overflow-x-auto rounded border border-border">
      <table className="w-full min-w-[640px] text-left text-sm">
        <caption className="sr-only">Game releases this month with platforms and PC install size</caption>
        <thead className="bg-secondary text-muted-foreground">
          <tr>
            <th scope="col" className="px-4 py-2.5 font-medium">Date</th>
            <th scope="col" className="px-4 py-2.5 font-medium">Game</th>
            <th scope="col" className="px-4 py-2.5 font-medium">Platforms</th>
            <th scope="col" className="px-4 py-2.5 font-medium">PC install size</th>
            <th scope="col" className="px-4 py-2.5 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {games.map((game) => {
            const released = game.release_date <= today;
            return (
              <tr key={game.slug} className="border-t border-border bg-background">
                <td className="whitespace-nowrap px-4 py-3 font-medium">{boardDate(game.release_date)}</td>
                <th scope="row" className="px-4 py-3 text-base font-semibold">
                  {game.article_path ? (
                    <Link href={game.article_path} className="text-primary underline-offset-4 hover:underline">
                      {game.name}
                    </Link>
                  ) : (
                    game.name
                  )}
                </th>
                <td className="px-4 py-3 text-muted-foreground">{game.platforms.join(', ')}</td>
                <td className="whitespace-nowrap px-4 py-3">
                  {game.install_size || <span className="text-muted-foreground">Not announced</span>}
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  {released ? (
                    <span className="font-medium text-accent">Out now</span>
                  ) : (
                    <span className="text-muted-foreground">Upcoming</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ArticleRow({ article }: { article: ArticleWithRelations }) {
  return (
    <li className="border-t border-border py-4 first:border-t-0 first:pt-0">
      <Link href={getArticleUrl(article)} className="group block">
        <h3 className="text-lg font-semibold leading-snug group-hover:text-primary group-hover:underline group-hover:underline-offset-4">
          {article.title}
        </h3>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{article.excerpt}</p>
        <p className="mt-1.5 text-xs text-muted-foreground">
          {article.category?.name}, {formatDate(article.publish_date)}
        </p>
      </Link>
    </li>
  );
}

export default async function HomePage() {
  const [games, articles, categories] = await Promise.all([
    getGames(),
    getLatestArticles(40),
    getCategories(),
  ]);

  const guides = articles.filter((a) => a.category?.slug === 'guides');
  const coverage = articles.filter((a) => a.category?.slug !== 'guides');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL_RESOLVED,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="mx-auto max-w-6xl px-4 pt-10 sm:px-6">
        <h1 className="max-w-3xl text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
          When games unlock, how big they are and what your PC needs
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
          This month&apos;s releases at a glance. Select a game for its release time, install size and PC requirements.
        </p>
        <div className="mt-6">
          <ReleaseBoard games={games} />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Install sizes are the PC figures published by each game&apos;s publisher or store page.
        </p>
      </section>

      <section className="mx-auto mt-12 grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-[1.7fr_1fr]">
        <div>
          <h2 className="border-b-2 border-foreground pb-2 text-xl font-semibold">Latest coverage</h2>
          <ul className="mt-5">
            {coverage.map((article) => (
              <ArticleRow key={article.id} article={article} />
            ))}
          </ul>
        </div>

        <div className="space-y-10">
          <div>
            <h2 className="border-b-2 border-foreground pb-2 text-xl font-semibold">Before launch day</h2>
            <ul className="mt-5">
              {guides.map((article) => (
                <ArticleRow key={article.id} article={article} />
              ))}
            </ul>
          </div>

          <div>
            <h2 className="border-b-2 border-foreground pb-2 text-xl font-semibold">Sections</h2>
            <ul className="mt-4 space-y-3">
              {categories.map((category) => (
                <li key={category.id}>
                  <Link href={`/${category.slug}`} className="font-medium text-primary underline-offset-4 hover:underline">
                    {category.name}
                  </Link>
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
