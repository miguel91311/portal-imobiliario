'use client';

import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { Gallery } from '@/components/pdp/gallery';
import { FeaturesGrid } from '@/components/pdp/features-grid';
import { AgentCard } from '@/components/pdp/agent-card';
import { CTASection } from '@/components/pdp/cta-section';
import { IMTJovemCalculator, IPUAngolaCalculator } from '@/components/calculators';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/data';
import { MapPin, Tag, Clock, ArrowLeft, TrendingUp, TrendingDown, Minus, Building2 } from 'lucide-react';
import Link from 'next/link';

interface PageProps {
  params: { id: string };
}

export default function PropertyPage({ params }: PageProps) {
  const [property, setProperty] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.getProperty(params.id)
      .then((data) => setProperty(data))
      .catch(() => setProperty(null))
      .finally(() => setIsLoading(false));
  }, [params.id]);

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

  const isAngola = property.location.country === 'AO';
  const isPortugal = property.location.country === 'PT';

  return (
    <main className="min-h-screen bg-cream-100">
      <Navbar />

      <div className="pt-22 pb-20">
        <div className="luxury-container">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/explorar" className="inline-flex items-center gap-2 text-caption text-foreground-muted hover:text-olive-500 transition-colors">
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
            <div className="text-left lg:text-right shrink-0">
              <p className="font-serif text-display text-olive-500">
                {formatCurrency(property.price, property.currency)}
              </p>
              <p className="text-caption text-foreground-muted mt-1">
                {property.features.sqm > 0 && `${(property.price / property.features.sqm).toLocaleString('pt-PT', { maximumFractionDigits: 0 })} ${property.currency}/m²`}
              </p>
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

              {/* Market Analysis */}
              {property.marketAnalysis && (
                <section className="bg-surface-elevated rounded-2xl border border-border shadow-card p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <TrendingUp className="w-5 h-5 text-accent" />
                    <h2 className="font-serif text-heading-2 text-foreground">Análise de Preço</h2>
                  </div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium ${
                      property.marketAnalysis.priceDifferencePercent > 0
                        ? 'bg-red-50 text-red-700'
                        : property.marketAnalysis.priceDifferencePercent < 0
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-cream-200 text-foreground-muted'
                    }`}>
                      {property.marketAnalysis.priceDifferencePercent > 0 ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : property.marketAnalysis.priceDifferencePercent < 0 ? (
                        <TrendingDown className="w-4 h-4" />
                      ) : (
                        <Minus className="w-4 h-4" />
                      )}
                      {Math.abs(property.marketAnalysis.priceDifferencePercent).toFixed(1)}% {property.marketAnalysis.priceDifferencePercent > 0 ? 'acima' : property.marketAnalysis.priceDifferencePercent < 0 ? 'abaixo' : 'na média'} do bairro
                    </div>
                    <span className="text-caption text-foreground-muted">
                      Média do bairro: {formatCurrency(property.marketAnalysis.neighborhoodAvg, property.currency)}
                    </span>
                  </div>
                </section>
              )}

              {/* Comparables */}
              {property.comparables && property.comparables.length > 0 && (
                <section>
                  <div className="flex items-center gap-3 mb-4">
                    <Building2 className="w-5 h-5 text-accent" />
                    <h2 className="font-serif text-heading-2 text-foreground">Comparáveis de Mercado</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {property.comparables.map((comp: any) => (
                      <Link
                        key={comp.id}
                        href={`/imovel/${comp.id}`}
                        className="bg-surface-elevated rounded-2xl border border-border shadow-card overflow-hidden hover:shadow-lg transition-shadow"
                      >
                        <div className="h-40 bg-cream-200 overflow-hidden">
                          {comp.images?.[0]?.url ? (
                            <img src={comp.images[0].url} alt={comp.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Building2 className="w-8 h-8 text-foreground-muted/50" />
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <p className="text-body text-foreground font-medium truncate">{comp.title}</p>
                          <p className="text-caption text-foreground-muted">{comp.city} · {comp.typology}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-body text-olive-600 font-medium">
                              {formatCurrency(comp.price, comp.currency)}
                            </span>
                            <span className={`text-xs font-medium ${
                              comp.priceDifferencePercent > 0 ? 'text-red-600' : 'text-emerald-600'
                            }`}>
                              {comp.priceDifferencePercent > 0 ? '+' : ''}{comp.priceDifferencePercent}%
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
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
                {isPortugal && <IMTJovemCalculator />}
                {isAngola && <IPUAngolaCalculator />}
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
              </div>
            </div>

            <aside className="lg:col-span-4 space-y-6">
              <div className="sticky top-24 space-y-6">
                <AgentCard agent={{ name: 'Consultor Premium', agency: 'Portal Premium' }} />
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
