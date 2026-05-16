'use client';

import { useEffect, useState, useCallback } from 'react';
import { ExternalLink, Layers, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

interface AggregatorSectionProps {
  city: string;
  country: string;
  typology?: string;
}

export function AggregatorSection({ city, country, typology }: AggregatorSectionProps) {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    try {
      const data = await api.getAggregatedListings({ city, country, typology: typology || '', limit: '5' });
      setListings(data.value);
    } catch {
      setListings([]);
    } finally {
      setLoading(false);
    }
  }, [city, country, typology]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  if (loading) {
    return (
      <div className="bg-surface-elevated rounded-2xl border border-border shadow-card p-6">
        <Loader2 className="w-5 h-5 animate-spin text-foreground-muted" />
      </div>
    );
  }

  if (listings.length === 0) return null;

  const portalNames: Record<string, string> = {
    idealista: 'Idealista',
    imovirtual: 'Imovirtual',
    casasapo: 'CASA SAPO',
    supercasa: 'SUPERCASA',
    olx: 'OLX',
  };

  return (
    <div className="bg-surface-elevated rounded-2xl border border-border shadow-card overflow-hidden">
      <div className="px-6 py-5 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-olive-100">
            <Layers className="w-5 h-5 text-olive-500" />
          </div>
          <div>
            <h3 className="font-serif text-heading-3 text-foreground">Similares noutros portais</h3>
            <p className="text-caption text-foreground-muted">Agregado de várias fontes</p>
          </div>
        </div>
      </div>

      <div className="divide-y divide-border">
        {listings.map((listing) => (
          <a
            key={listing.id}
            href={listing.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 px-6 py-4 hover:bg-cream-50/50 transition-colors group"
          >
            <div className="w-16 h-16 rounded-xl bg-cream-200 overflow-hidden shrink-0">
              {listing.imageUrl ? (
                <img src={listing.imageUrl} alt={listing.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-foreground-muted text-xs">
                  Sem foto
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-body text-foreground font-medium truncate group-hover:text-accent transition-colors">
                {listing.title}
              </h4>
              <p className="text-caption text-foreground-muted">
                {listing.city}{listing.neighborhood ? ` · ${listing.neighborhood}` : ''}
                {listing.sqm ? ` · ${listing.sqm}m²` : ''}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-body font-medium text-foreground">
                {listing.price.toLocaleString('pt-PT', { style: 'currency', currency: listing.currency, maximumFractionDigits: 0 })}
              </p>
              <div className="flex items-center gap-1 justify-end mt-1">
                <span className="px-2 py-0.5 bg-cream-200 rounded text-xs text-foreground-muted">
                  {portalNames[listing.sourcePortal] || listing.sourcePortal}
                </span>
                <ExternalLink className="w-3 h-3 text-foreground-muted" />
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
