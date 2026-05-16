'use client';

import { useEffect, useState } from 'react';
import { useMarket, Market } from '@/context/market-context';
import { NavbarMarket } from '@/components/navbar-market';
import dynamic from 'next/dynamic';
import { api } from '@/lib/api';

const MapLeaflet = dynamic(() => import('@/components/map-leaflet').then((mod) => mod.MapLeaflet), { ssr: false });

export function MarketExplorarPage({ market }: { market: Market }) {
  const { market: ctxMarket } = useMarket();
  const activeMarket = ctxMarket || market;

  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getProperties({ country: activeMarket })
      .then((data) => setProperties(data.value))
      .catch((err) => setError(err?.data?.error || 'Erro ao carregar propriedades'))
      .finally(() => setIsLoading(false));
  }, [activeMarket]);

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

  if (isLoading) {
    return (
      <main className="h-screen w-full flex items-center justify-center bg-cream-100">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-olive-200 border-t-olive-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-body text-foreground-muted">A carregar propriedades...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="h-screen w-full flex items-center justify-center bg-cream-100">
        <div className="text-center max-w-md">
          <p className="text-body text-red-600 mb-4">{error}</p>
          <p className="text-caption text-foreground-muted">
            Certifique-se de que o backend está em execução em http://localhost:3001
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="h-screen w-full overflow-hidden">
      <NavbarMarket />
      <MapLeaflet properties={properties} />
    </main>
  );
}
