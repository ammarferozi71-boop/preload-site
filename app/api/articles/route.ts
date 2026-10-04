import { NextRequest, NextResponse } from 'next/server';
import { getLatestArticles, getArticlesByCategory, getArticlesByTopic, getArticlesByAuthor, getTopics, getAuthors, searchArticles } from '@/lib/queries';
export const dynamic = 'force-dynamic';
export async function GET(request: NextRequest) {
  const p=request.nextUrl.searchParams;
  const number=(key: string,fallback: number,max: number) => { const n=Number(p.get(key) ?? fallback); return Number.isFinite(n) ? Math.min(max,Math.max(0,Math.floor(n))) : fallback; };
  const limit=Math.max(1,number('limit',12,100));
  const offset=number('offset',0,100000);
  if(p.has('q')) return NextResponse.json({ articles: await searchArticles((p.get('q') || '').slice(0,200),limit) });
  if(p.has('category')) return NextResponse.json(await getArticlesByCategory(p.get('category')!,limit,offset));
  if(p.has('topicId')) { const t=(await getTopics()).find(t => t.id === p.get('topicId')); return NextResponse.json(t ? await getArticlesByTopic(t.slug,limit,offset) : {articles:[],total:0}); }
  if(p.has('authorId')) { const a=(await getAuthors()).find(a => a.id === p.get('authorId')); return NextResponse.json(a ? await getArticlesByAuthor(a.slug,limit,offset) : {articles:[],total:0}); }
  return NextResponse.json({articles: await getLatestArticles(limit,offset)});
}
