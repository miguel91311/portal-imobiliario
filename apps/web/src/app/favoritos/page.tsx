'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { NavbarMarket } from '@/components/navbar-market';
import { FooterMarket } from '@/components/footer-market';
import { api } from '@/lib/api';
import { Heart, Trash2, Loader2, ArrowLeft, MapPin, BedDouble, Bath, Maximize } from 'lucide-react';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getFavorites()
      .then((data) => setFavorites(data.value))
      .catch(() => setFavorites([]))
      .finally(() => setLoading(false));
  }, []);

  const remove = async (propertyId: string) => {
    await api.removeFavorite(propertyId);
    setFavorites((prev) => prev.filter((f) => f.propertyId !== propertyId));
  };

  return (
    <main className="min-h-screen bg-cream-100">
      <NavbarMarket />
      <div className="pt-28 pb-20 luxury-container">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/pt" className="inline-flex items-center gap-2 text-caption text-foreground-muted hover:text-olive-500 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>
          <h1 className="font-serif text-heading-1 text-foreground">Os meus Favoritos</h1>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-foreground-muted" />
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-20 bg-surface-elevated rounded-2xl border border-border">
            <Heart className="w-12 h-12 mx-auto mb-4 text-foreground-muted/30" />
            <p className="text-body text-foreground-muted">Sem favoritos ainda.</p>
            <Link href="/pt/explorar" className="inline-block mt-4 text-accent hover:text-accent-dark font-medium">
              Explorar propriedades
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((f) => {
              const p = f.property;
              const img = p.images?.[0];
              return (
                <div key={f.id} className="bg-surface-elevated rounded-2xl border border-border shadow-card overflow-hidden group">
                  <Link href={`/imovel/${p.id}`} className="block relative aspect-[4/3]">
                    {img && (
                      <Image src={img.url} alt={p.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                    )}
                    <div className="absolute top-3 left-3 px-3 py-1 bg-white/90 rounded-full text-overline text-olive-500 uppercase">
                      {p.listingType === 'sale' ? 'Venda' : 'Arrendamento'}
                    </div>
                  </Link>
                  <div className="p-5 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-serif text-heading-3 text-foreground group-hover:text-olive-500 transition-colors">{p.title}</h3>
                        <p className="text-caption text-foreground-muted flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3" />
                          {p.city} · {p.neighborhood}
                        </p>
                      </div>
                      <button
                        onClick={() => remove(p.id)}
                        className="p-2 rounded-lg hover:bg-red-50 text-foreground-muted hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="font-serif text-heading-2 text-olive-500">
                      {p.price.toLocaleString('pt-PT', { style: 'currency', currency: p.currency, maximumFractionDigits: 0 })}
                    </p>
                    <div className="flex items-center gap-4 pt-2 border-t border-border text-caption text-foreground-muted">
                      <span className="flex items-center gap-1"><BedDouble className="w-3.5 h-3.5" /> {p.bedrooms}</span>
                      <span className="flex items-center gap-1"><Bath className="w-3.5 h-3.5" /> {p.bathrooms}</span>
                      <span className="flex items-center gap-1"><Maximize className="w-3.5 h-3.5" /> {p.sqm}m²</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <FooterMarket />
    </main>
  );
}
