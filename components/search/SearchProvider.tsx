'use client';

import { createContext, useContext, useCallback } from 'react';

type SearchContextValue = {
  openSearch: () => void;
  closeSearch: () => void;
};

const SearchContext = createContext<SearchContextValue | null>(null);

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const openSearch = useCallback(() => {
    window.dispatchEvent(new CustomEvent('open-search'));
  }, []);

  const closeSearch = useCallback(() => {
    window.dispatchEvent(new CustomEvent('close-search'));
  }, []);

  return (
    <SearchContext.Provider value={{ openSearch, closeSearch }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const ctx = useContext(SearchContext);
  if (!ctx) {
    return { openSearch: () => {}, closeSearch: () => {} };
  }
  return ctx;
}
