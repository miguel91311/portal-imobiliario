'use client';

import { useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';

interface SearchNLPProps {
  onSearch?: (query: string) => void;
}

export function SearchNLP({ onSearch }: SearchNLPProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(query);
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-2xl">
      <div className="relative flex items-center bg-surface-elevated rounded-2xl border border-border shadow-soft hover:shadow-elevated transition-shadow duration-500 ease-luxury focus-within:border-olive-300 focus-within:shadow-elevated">
        <div className="pl-5 text-foreground-muted">
          <Search className="w-5 h-5" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Preciso de um T4 em Talatona, com piscina e isenção de IPU..."
          className="flex-1 bg-transparent px-4 py-4 text-body text-foreground placeholder:text-foreground-muted/60 outline-none"
        />
        <div className="pr-2 flex items-center gap-2">
          <button
            type="button"
            className="p-2.5 rounded-xl text-foreground-muted hover:bg-cream-200 transition-colors"
            aria-label="Filtros avançados"
          >
            <SlidersHorizontal className="w-5 h-5" />
          </button>
          <button
            type="submit"
            className="hidden sm:inline-flex px-5 py-2.5 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-dark transition-colors"
          >
            Pesquisar
          </button>
        </div>
      </div>
      <p className="mt-2 text-caption text-foreground-muted/70 pl-2">
        Pesquisa inteligente em linguagem natural — experimente: "T3 no Porto com certificado A+ e walk score acima de 90"
      </p>
    </form>
  );
}
