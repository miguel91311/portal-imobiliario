import type { Metadata } from 'next';
import { MarketProvider } from '@/context/market-context';
import { MARKET_CONFIG } from '@/lib/market';

const config = MARKET_CONFIG['AO'];

export const metadata: Metadata = {
  title: config.metaTitle,
  description: config.metaDescription,
  openGraph: {
    title: config.metaTitle,
    description: config.metaDescription,
    locale: config.ogLocale,
  },
};

export default function AOLayout({ children }: { children: React.ReactNode }) {
  return (
    <MarketProvider defaultMarket="AO">
      {children}
    </MarketProvider>
  );
}
