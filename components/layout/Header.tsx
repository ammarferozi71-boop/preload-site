'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X, Search } from 'lucide-react';
import { useSearch } from '@/components/search/SearchProvider';
import { SITE_NAME } from '@/lib/site';

const NAV_ITEMS = [
  { label: 'Releases', href: '/releases' },
  { label: 'PC requirements', href: '/requirements' },
  { label: 'Install & preload', href: '/install' },
  { label: 'Updates', href: '/updates' },
  { label: 'Guides', href: '/guides' },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { openSearch } = useSearch();

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  return (
    <header className="w-full bg-foreground text-background">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5" aria-label={`${SITE_NAME} home`}>
          <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
            <path d="M12 3v11m0 0-4.5-4.5M12 14l4.5-4.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="4" y="18" width="16" height="3" rx="1.5" fill="#5BA0FF" />
          </svg>
          <span className="text-xl font-semibold tracking-tight">{SITE_NAME}</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium opacity-80 underline-offset-8 hover:opacity-100 hover:underline"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <button
            onClick={openSearch}
            className="flex h-9 w-9 items-center justify-center rounded opacity-80 hover:opacity-100"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </button>
          <button
            className="flex h-9 w-9 items-center justify-center rounded md:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="absolute right-0 top-0 h-full w-72 max-w-full bg-background p-6 text-foreground"
          >
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold">{SITE_NAME}</span>
              <button
                onClick={() => setMobileOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded hover:bg-secondary"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="mt-6 flex flex-col" aria-label="Mobile navigation">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="border-b border-border py-3 text-base font-medium"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
