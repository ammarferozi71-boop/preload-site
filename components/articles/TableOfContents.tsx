'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

type TableOfContentsProps = {
  headings: { id: string; text: string; level: number }[];
  className?: string;
};

export function TableOfContents({ headings, className = '' }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0px -80% 0px' }
    );

    headings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length < 3) return null;

  return (
    <nav
      className={cn('rounded-lg border border-border bg-card p-5', className)}
      aria-label="Table of contents"
    >
      <h2 className="font-heading text-sm font-bold text-foreground">
        Table of Contents
      </h2>
      <ol className="mt-3 space-y-1.5">
        {headings.map((heading, index) => (
          <li
            key={heading.id}
            className={cn(
              'text-sm transition-colors',
              heading.level === 3 && 'ml-4'
            )}
          >
            <a
              href={`#${heading.id}`}
              className={cn(
                'flex items-start gap-2 leading-snug transition-colors',
                activeId === heading.id
                  ? 'font-medium text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <span className="mt-0.5 text-xs tabular-nums text-muted-foreground/50">
                {String(index + 1).padStart(2, '0')}
              </span>
              {heading.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
