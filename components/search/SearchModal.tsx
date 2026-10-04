'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, X, Loader2 } from 'lucide-react';


import { formatRelativeTime } from '@/lib/site';

type SearchResult = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  hero_image: string;
  hero_image_alt: string;
  publish_date: string;
  category?: { slug: string; name: string } | null;
};

export function SearchModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const openHandler = () => setIsOpen(true);
    const closeHandler = () => setIsOpen(false);
    const keyHandler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('open-search', openHandler);
    window.addEventListener('close-search', closeHandler);
    window.addEventListener('keydown', keyHandler);
    return () => {
      window.removeEventListener('open-search', openHandler);
      window.removeEventListener('close-search', closeHandler);
      window.removeEventListener('keydown', keyHandler);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setQuery('');
      setResults([]);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const response=await fetch('/api/articles?'+new URLSearchParams({q:query,limit:'10'}));
        if(!response.ok) throw new Error('Search unavailable');
        const data=await response.json() as {articles: SearchResult[]};
        setResults(data.articles);
      } catch { setResults([]); }
      setLoading(false);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-20">
      <div className="absolute inset-0 bg-black/70 animate-fade-in" onClick={() => setIsOpen(false)} />
      <div role="dialog" aria-modal="true" aria-label="Search articles" className="relative z-10 w-full max-w-2xl overflow-hidden rounded-lg border border-border bg-popover shadow-2xl animate-slide-up">
        <div className="flex items-center gap-3 border-b border-border px-4">
          <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by game, platform or subject"
            className="flex h-14 w-full bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground"
            aria-label="Search"
          />
          {loading && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
          <button
            onClick={() => setIsOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded text-muted-foreground hover:bg-secondary"
            aria-label="Close search"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {query.trim() && !loading && results.length === 0 && (
            <div className="px-4 py-12 text-center text-muted-foreground">
              No results found for &ldquo;{query}&rdquo;
            </div>
          )}
          {results.length > 0 && (
            <ul className="divide-y divide-border">
              {results.map((result) => {
                const url = result.category
                  ? `/${result.category.slug}/${result.slug}`
                  : `/releases/${result.slug}`;
                return (
                  <li key={result.id}>
                    <Link
                      href={url}
                      onClick={() => setIsOpen(false)}
                      className="flex gap-4 px-4 py-3 transition-colors hover:bg-secondary"
                    >
                      {result.hero_image && (
                        <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded">
                          <Image
                            src={result.hero_image}
                            alt={result.hero_image_alt || result.title}
                            fill
                            sizes="96px"
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        {result.category && (
                          <span className="text-xs font-semibold text-primary">
                            {result.category.name}
                          </span>
                        )}
                        <h3 className="line-clamp-2 text-sm font-semibold text-foreground">
                          {result.title}
                        </h3>
                        <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                          {formatRelativeTime(result.publish_date)}
                        </p>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
          {!query.trim() && (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              Start typing to search across all articles
            </div>
          )}
        </div>
        <div className="border-t border-border px-4 py-2 text-xs text-muted-foreground">
          Press <kbd className="rounded border border-border bg-secondary px-1.5 py-0.5 text-[10px]">Esc</kbd> to close
        </div>
      </div>
    </div>
  );
}
