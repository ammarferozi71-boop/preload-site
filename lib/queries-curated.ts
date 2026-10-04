import data from '@/content/launch.json';
import type { Article, ArticleWithRelations, Author, Category, Topic, Deal, Game } from './types';
const categories = data.categories as Category[];
const topics = data.topics as Topic[];
const authors = data.authors as Author[];
const articles = (data.articles as unknown as Article[]).map((article): ArticleWithRelations => ({
  ...article,
  author: authors.find(a => a.id === article.author_id) || null,
  category: categories.find(c => c.id === article.category_id) || null,
  topics: topics.filter(t => article.tags.includes(t.slug)),
})).sort((a,b) => b.publish_date.localeCompare(a.publish_date));
const page = (items: ArticleWithRelations[], limit: number, offset: number) => ({ articles: items.slice(offset, offset + limit), total: items.length });
export async function getCategories() { return categories; }
export async function getCategoryBySlug(slug: string) { return categories.find(c => c.slug === slug) || null; }
export async function getAuthors() { return authors; }
export async function getAuthorBySlug(slug: string) { return authors.find(a => a.slug === slug) || null; }
export async function getTopics() { return topics; }
export async function getTopicBySlug(slug: string) { return topics.find(t => t.slug === slug) || null; }
export async function getFeaturedArticles(limit=5) { return articles.filter(a => a.featured).slice(0,limit); }
export async function getLeadArticle() { return (await getFeaturedArticles(1))[0] || null; }
export async function getTrendingArticles(limit=5) { return articles.filter(a => a.trending).slice(0,limit); }
export async function getLatestArticles(limit=12,offset=0) { return articles.slice(offset,offset+limit); }
export async function getArticlesByCategory(slug: string,limit=12,offset=0) { return page(articles.filter(a => a.category?.slug === slug),limit,offset); }
export async function getFeaturedByCategory(slug: string,limit=4) { return articles.filter(a => a.category?.slug === slug).slice(0,limit); }
export async function getArticlesByTopic(slug: string,limit=12,offset=0) { return page(articles.filter(a => a.topics?.some(t => t.slug === slug)),limit,offset); }
export async function getArticleBySlug(slug: string) { return articles.find(a => a.slug === slug) || null; }
export async function getRelatedArticles(article: Article,limit=4) { const score=(a: ArticleWithRelations) => (a.category_id === article.category_id ? 10 : 0) + a.tags.filter(t => article.tags.includes(t)).length; return articles.filter(a => a.id !== article.id && score(a)>0).sort((a,b)=>score(b)-score(a)).slice(0,limit); }
export async function getMoreFromCategory(slug: string,excludeId: string,limit=6) { return articles.filter(a => a.category?.slug === slug && a.id !== excludeId).slice(0,limit); }
export async function getArticlesByAuthor(slug: string,limit=12,offset=0) { return page(articles.filter(a => a.author?.slug === slug),limit,offset); }
export async function searchArticles(query: string,limit=20) { const q=query.trim().toLowerCase(); return q ? articles.filter(a => (a.title+' '+a.excerpt+' '+a.tags.join(' ')).toLowerCase().includes(q)).slice(0,limit) : []; }
export async function searchArticlesByTags(query: string,limit=20) { const q=query.trim().toLowerCase(); return q ? articles.filter(a => a.tags.some(t => t.includes(q))).slice(0,limit) : []; }
export async function getDeals(limit=6) { return (data.deals as Deal[]).slice(0,limit); }
export async function getArticleCount() { return articles.length; }
export async function getAllArticleSlugs() { return articles.map(({slug,category_id,updated_date,publish_date}) => ({slug,category_id,updated_date,publish_date})); }
export async function getAllAuthorSlugs() { return authors.map(({slug}) => ({slug})); }
export async function getAllTopicSlugs() { return topics.map(({slug}) => ({slug})); }
export async function getGames() { return [...(data.games as unknown as Game[])].sort((a,b) => a.release_date.localeCompare(b.release_date)); }
