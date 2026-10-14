import type { FactSource } from '@/lib/tools/types';

const TIER_LABEL: Record<string, string> = {
  official: 'Official',
  major_outlet: 'Major outlet',
  minor_outlet: 'Outlet',
  community: 'Community',
};

/** Lists every source the tool's data rests on, with tier and check date. */
export function ToolSources({ facts, generatedAt }: { facts: Record<string, FactSource>; generatedAt: string }) {
  const list = Object.entries(facts);
  return (
    <section className="mt-12 border-t pt-6" aria-labelledby="tool-sources">
      <h2 id="tool-sources" className="text-xl font-semibold">Sources and checks</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Every figure in this tool comes from the sources below. Data last checked{' '}
        {new Date(generatedAt).toUTCString().replace(' GMT', ' UTC')}.
      </p>
      <ol className="mt-4 space-y-3 text-sm">
        {list.map(([id, f]) => (
          <li key={id} id={`source-${id}`} className="leading-relaxed">
            <a href={f.url} rel="noopener nofollow" target="_blank" className="font-medium text-primary underline-offset-2 hover:underline">
              {f.title || new URL(f.url).hostname}
            </a>{' '}
            <span className="text-muted-foreground">
              ({TIER_LABEL[f.tier] || f.tier}, checked {f.as_of})
            </span>
            <blockquote className="mt-1 border-l-2 pl-3 text-muted-foreground">&ldquo;{f.excerpt}&rdquo;</blockquote>
          </li>
        ))}
      </ol>
    </section>
  );
}
