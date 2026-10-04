import { Check } from 'lucide-react';
export function ReadingBrief({points}:{points?:string[]}) {
  if(!points?.length) return null;
  return <aside className="reading-brief mb-8 rounded-xl border border-border bg-card p-5 sm:p-6" aria-label="Key takeaways">
    <h2 className="text-sm font-bold uppercase tracking-wider text-primary">Before you read</h2>
    <ul className="mt-4 space-y-3">{points.map(point=><li key={point} className="flex gap-3 text-sm leading-relaxed"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true"/><span>{point}</span></li>)}</ul>
  </aside>;
}
