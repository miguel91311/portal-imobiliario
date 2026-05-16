'use client';

import Image from 'next/image';
import Link from 'next/link';
import { MapPin, BedDouble, Bath, Maximize, Footprints } from 'lucide-react';
import { PropertyFavoriteButton } from './property-favorite-button';
import { Property } from '@/types/property';
import { formatCurrency, getWalkScoreLabel } from '@/lib/data';

interface PropertyCardProps {
  property: Property;
  isActive?: boolean;
  onHover?: (id: string | null) => void;
  onClick?: (property: Property) => void;
}

export function PropertyCard({ property, isActive, onHover, onClick }: PropertyCardProps) {
  const primaryImage = property.images.find((img) => img.isPrimary) || property.images[0];
  const walkScore = property.features.walkScore ?? 0;
  const walkLabel = getWalkScoreLabel(walkScore);

  return (
    <Link
      href={`/imovel/${property.id}`}
      className={`group block relative bg-surface-elevated rounded-2xl overflow-hidden border transition-all duration-500 ease-luxury ${
        isActive
          ? 'border-accent shadow-elevated ring-1 ring-accent/20'
          : 'border-border shadow-card hover:shadow-elevated hover:-translate-y-0.5'
      }`}
      onMouseEnter={() => onHover?.(property.id)}
      onMouseLeave={() => onHover?.(null)}
      onClick={(e) => {
        if (onClick) {
          e.preventDefault();
          onClick(property);
        }
      }}
    >
      {/* Imagem */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={primaryImage?.url || '/placeholder.jpg'}
          alt={primaryImage?.alt || property.title}
          fill
          className="object-cover transition-transform duration-700 ease-luxury group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Favorite button */}
        <div className="absolute top-3 right-3 z-10">
          <PropertyFavoriteButton propertyId={property.id} size="sm" />
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-overline text-olive-500 uppercase tracking-wider">
            {property.listingType === 'sale' ? 'Venda' : 'Arrendamento'}
          </span>
          {property.featured && (
            <span className="px-3 py-1 bg-amber-500/90 backdrop-blur-sm rounded-full text-overline text-white uppercase tracking-wider flex items-center gap-1">
              ★ Destaque
            </span>
          )}
          {property.tags?.slice(0, property.featured ? 0 : 1).map((tag) => (
            <span key={tag} className="px-3 py-1 bg-accent/90 backdrop-blur-sm rounded-full text-overline text-white uppercase tracking-wider">
              {tag}
            </span>
          ))}
        </div>

        {/* Preço overlay */}
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
          <div className="px-4 py-2 bg-white/95 backdrop-blur-sm rounded-xl">
            <span className="font-serif text-heading-3 text-olive-500">
              {formatCurrency(property.price, property.currency)}
            </span>
          </div>
        </div>
      </div>

      {/* Conteúdo - Layout F-Pattern */}
      <div className="p-5 space-y-4">
        {/* Linha superior: Localização */}
        <div className="flex items-start gap-2 text-foreground-muted">
          <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
          <span className="text-caption">
            {property.location.neighborhood}, {property.location.city}
          </span>
        </div>

        {/* Título - destaque F-pattern */}
        <h3 className="font-serif text-heading-2 text-foreground leading-tight group-hover:text-olive-500 transition-colors duration-300">
          {property.title}
        </h3>

        {/* Descrição resumida */}
        <p className="text-caption text-foreground-muted line-clamp-2 leading-relaxed">
          {property.description}
        </p>

        {/* Características - linha horizontal */}
        <div className="flex items-center gap-4 pt-2 border-t border-border">
          <div className="flex items-center gap-1.5 text-foreground-muted">
            <BedDouble className="w-4 h-4" />
            <span className="text-caption font-medium">{property.features.bedrooms}</span>
          </div>
          <div className="flex items-center gap-1.5 text-foreground-muted">
            <Bath className="w-4 h-4" />
            <span className="text-caption font-medium">{property.features.bathrooms}</span>
          </div>
          <div className="flex items-center gap-1.5 text-foreground-muted">
            <Maximize className="w-4 h-4" />
            <span className="text-caption font-medium">{property.features.sqm} m²</span>
          </div>
        </div>

        {/* Walk Score - indicador premium */}
        {walkScore > 0 && (
          <div className="flex items-center gap-2">
            <Footprints className="w-4 h-4 text-olive-500" />
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-overline ${walkLabel.color}`}>
              Walk Score {walkScore} — {walkLabel.label}
            </span>
          </div>
        )}

        {/* Agente */}
        {property.agent && (
          <div className="flex items-center gap-3 pt-2">
            <div className="w-8 h-8 rounded-full bg-cream-300 flex items-center justify-center">
              <span className="text-overline text-olive-500 font-medium">
                {property.agent.name.charAt(0)}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-caption text-foreground font-medium">{property.agent.name}</span>
              <span className="text-caption text-foreground-muted">{property.agent.agency}</span>
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}
