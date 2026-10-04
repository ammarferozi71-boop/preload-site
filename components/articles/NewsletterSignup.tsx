import Link from 'next/link';
import { cn } from '@/lib/utils';
import { SITE_NAME } from '@/lib/site';

type NewsletterSignupProps = { variant?: 'default' | 'compact' | 'inline'; className?: string; id?: string };

// There is no email list yet, so this points readers to the RSS feed instead.
export function NewsletterSignup({ variant = 'default', className = '', id }: NewsletterSignupProps) {
  return (
    <section
      id={id}
      className={cn(
        'rounded border border-border bg-secondary p-5',
        variant === 'inline' && 'flex flex-wrap items-center justify-between gap-4',
        className
      )}
    >
      <div>
        <h3 className="text-base font-semibold">Follow {SITE_NAME}</h3>
        <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted-foreground">
          New release, install and requirements pages appear in our RSS feed.
        </p>
      </div>
      <div className="mt-3 flex flex-wrap gap-4 text-sm font-medium">
        <a href="/rss.xml" className="rounded bg-primary px-4 py-2 text-primary-foreground">Open RSS feed</a>
        <Link href="/releases" className="py-2 text-primary underline-offset-4 hover:underline">Browse releases</Link>
      </div>
    </section>
  );
}
