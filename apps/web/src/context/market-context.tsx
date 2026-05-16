'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Market = 'PT' | 'AO';

interface MarketContextType {
  market: Market;
  setMarket: (m: Market) => void;
}

const MarketContext = createContext<MarketContextType | undefined>(undefined);

const STORAGE_KEY = 'portal_market';

export function MarketProvider({ children, defaultMarket }: { children: ReactNode; defaultMarket: Market }) {
  const [market, setMarketState] = useState<Market>(defaultMarket);

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) as Market | null : null;
    if (stored && (stored === 'PT' || stored === 'AO')) {
      setMarketState(stored);
    }
  }, []);

  const setMarket = (m: Market) => {
    setMarketState(m);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, m);
    }
  };

  return (
    <MarketContext.Provider value={{ market, setMarket }}>
      {children}
    </MarketContext.Provider>
  );
}

export function useMarket() {
  const ctx = useContext(MarketContext);
  if (!ctx) throw new Error('useMarket must be used within MarketProvider');
  return ctx;
}
