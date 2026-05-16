'use client';

import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import { useMarket, Market } from '@/context/market-context';
import { NavbarMarket } from '@/components/navbar-market';
import { Gallery } from '@/components/pdp/gallery';
import { FeaturesGrid } from '@/components/pdp/features-grid';
import { AgentCard } from '@/components/pdp/agent-card';
import { CTASection } from '@/components/pdp/cta-section';
import { IMTJovemCalculator, IPUAngolaCalculator } from '@/components/calculators';
import { CreditCalculator } from '@/components/credit-calculator';
import { PriceHistory } from '@/components/price-history';
import { VirtualTour } from '@/components/virtual-tour';
import { AgentReviews } from '@/components/agent-reviews';
import { AggregatorSection } from '@/components/aggregator-section';
import { PropertyFavoriteButton } from '@/components/property-favorite-button';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/market';
import { MapPin, Tag, Clock, ArrowLeft, Heart, Share2, BarChart3 } from 'lucide-react';
import Link from 'next/link';

export function MarketPropertyPage({ market, id }: { market: Market; id: string }) {
  const { market: ctxMarket } = useMarket();
  const activeMarket = ctxMarket || market;

  const [property, setProperty] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.getProperty(id)
      .then((data) => setProperty(data))
      .catch(() => setProperty(null))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-cream-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-olive-200 border-t-olive-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-body text-foreground-muted">A carregar propriedade...</p>
        </div>
      </main>
    );
  }

  if (!property) {
    notFound();
  }

  const isPT = activeMarket === 'PT';

  return (
    <main className="min-h-screen bg-cream-100">
      <NavbarMarket />

      <div className="pt-22 pb-20">
        <div className="luxury-container">
          <div className="flex items-center gap-4 mb-6">
            <Link href={`/${activeMarket.toLowerCase()}/explorar`} className="inline-flex items-center gap-2 text-caption text-foreground-muted hover:text-olive-500 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Voltar à pesquisa
            </Link>
            <span className="text-border">|</span>
            <span className="text-caption text-foreground-muted">
              {property.location.city} · {property.location.neighborhood}
            </span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-8">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 bg-accent/10 rounded-full text-overline text-accent uppercase tracking-wider">
                  {property.listingType === 'sale' ? 'Para Venda' : 'Para Arrendar'}
                </span>
                {property.tags?.map((tag: string) => (
                  <span key={tag} className="px-3 py-1 bg-cream-200 rounded-full text-overline text-foreground-muted uppercase tracking-wider">
                    {tag}
                  </span>
                ))}
              </div>
              <h1 className="font-serif text-display text-foreground leading-tight">{property.title}</h1>
              <div className="flex items-center gap-2 mt-3 text-foreground-muted">
                <MapPin className="w-4 h-4" />
                <span className="text-body">{property.location.address}, {property.location.neighborhood}, {property.location.city}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-left lg:text-right shrink-0">
                <p className="font-serif text-display text-olive-500">
                  {formatCurrency(property.price, property.currency)}
                </p>
                <p className="text-caption text-foreground-muted mt-1">
                  {property.features.sqm > 0 && `${(property.price / property.features.sqm).toLocaleString('pt-PT', { maximumFractionDigits: 0 })} ${property.currency}/m²`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <PropertyFavoriteButton propertyId={property.id} />
                <button className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-soft flex items-center justify-center hover:bg-white transition-all">
                  <Share2 className="w-5 h-5 text-foreground-muted" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="luxury-container mb-12">
          <Gallery images={property.images} title={property.title} />
        </div>

        <div className="luxury-container">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-8 space-y-12">
              <section>
                <h2 className="font-serif text-heading-2 text-foreground mb-4">Sobre esta Propriedade</h2>
                <p className="text-body-large text-foreground-muted leading-relaxed whitespace-pre-line">{property.description}</p>
              </section>

              <section>
                <FeaturesGrid features={property.features} typology={property.typology} />
              </section>

              {property.virtualTourUrl && (
                <section>
                  <VirtualTour url={property.virtualTourUrl} title={property.title} />
                </section>
              )}

              <section className="space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <Tag className="w-5 h-5 text-accent" />
                  <h2 className="font-serif text-heading-2 text-foreground">Simulação Fiscal</h2>
                </div>
                <p className="text-body text-foreground-muted">
                  Calcule os impostos aplicáveis a esta transação. Estas simulações servem como referência preliminar.
                </p>
                {isPT ? <IMTJovemCalculator /> : <IPUAngolaCalculator />}
              </section>

              <section>
                <div className="flex items-center gap-3 mb-4">
                  <BarChart3 className="w-5 h-5 text-accent" />
                  <h2 className="font-serif text-heading-2 text-foreground">Simulação de Crédito</h2>
                </div>
                <CreditCalculator market={activeMarket} propertyValue={property.price} />
              </section>

              <section>
                <PriceHistory propertyId={property.id} currency={property.currency} />
              </section>

              {property.agent?.id && (
                <section>
                  <AgentReviews agentId={property.agent.id} />
                </section>
              )}

              <section>
                <AggregatorSection
                  city={property.location.city}
                  country={property.location.country}
                  typology={property.typology}
                />
              </section>

              <div className="flex flex-wrap items-center gap-6 pt-6 border-t border-border text-caption text-foreground-muted">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Publicado: {new Date(property.createdAt).toLocaleDateString('pt-PT')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  <span>ID: {property.id}</span>
                </div>
                {property.source && (
                  <div className="flex items-center gap-2">
                    <span>Fonte: {property.source}</span>
                  </div>
                )}
              </div>
            </div>

            <aside className="lg:col-span-4 space-y-6">
              <div className="sticky top-24 space-y-6">
                <AgentCard agent={property.agent || { name: 'Consultor Premium', agency: 'Portal Premium' }} />
                <div className="p-6 rounded-2xl bg-surface-elevated border border-border shadow-card">
                  <h4 className="font-serif text-heading-3 text-foreground mb-4">Interessado?</h4>
                  <CTASection propertyId={property.id} />
                </div>
                <div className="p-6 rounded-2xl bg-olive-500 text-white">
                  <h4 className="font-serif text-heading-3 mb-2">Pesquisa Partilhada</h4>
                  <p className="text-sm text-white/80 mb-4 leading-relaxed">
                    Partilhe esta propriedade com o seu cônjuge, gestor de património ou advogado.
                  </p>
                  <button className="w-full py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-medium transition-colors">
                    Criar Sala de Discussão
                  </button>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
}
