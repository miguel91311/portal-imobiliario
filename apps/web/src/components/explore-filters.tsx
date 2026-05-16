'use client';

import { useState } from 'react';
import { SlidersHorizontal, X, ChevronDown, Home, BedDouble, Bath, Maximize, Car, TreePine, Waves, Wind, Sun, Building, Warehouse, Fence } from 'lucide-react';

export interface ExploreFilters {
  listingType?: 'sale' | 'rent';
  minPrice?: number;
  maxPrice?: number;
  minSqm?: number;
  maxSqm?: number;
  bedrooms?: number;
  bathrooms?: number;
  pool?: boolean;
  garden?: boolean;
  parking?: boolean;
  elevator?: boolean;
  airConditioning?: boolean;
  balcony?: boolean;
  terrace?: boolean;
  storageRoom?: boolean;
  condition?: string;
  energyCertificate?: string;
  status?: string;
  floor?: string;
  propertyType?: string;
  hasFloorPlan?: boolean;
  hasVirtualTour?: boolean;
}

interface FilterBarProps {
  filters: ExploreFilters;
  onChange: (filters: ExploreFilters) => void;
  onApply: () => void;
  count: number;
}

const PRICE_OPTIONS = [
  { label: 'Qualquer', value: '' },
  { label: '50.000 €', value: '50000' },
  { label: '100.000 €', value: '100000' },
  { label: '150.000 €', value: '150000' },
  { label: '200.000 €', value: '200000' },
  { label: '300.000 €', value: '300000' },
  { label: '400.000 €', value: '400000' },
  { label: '500.000 €', value: '500000' },
  { label: '750.000 €', value: '750000' },
  { label: '1.000.000 €', value: '1000000' },
];

const SQ_OPTIONS = [
  { label: 'Qualquer', value: '' },
  { label: '50 m²', value: '50' },
  { label: '75 m²', value: '75' },
  { label: '100 m²', value: '100' },
  { label: '150 m²', value: '150' },
  { label: '200 m²', value: '200' },
  { label: '300 m²', value: '300' },
  { label: '500 m²', value: '500' },
];

export function FilterBar({ filters, onChange, onApply, count }: FilterBarProps) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showMore, setShowMore] = useState(false);

  const update = (partial: Partial<ExploreFilters>) => {
    onChange({ ...filters, ...partial });
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== undefined && v !== '');

  const FilterChip = ({
    label,
    active,
    onClick,
    icon: Icon,
  }: {
    label: string;
    active?: boolean;
    onClick?: () => void;
    icon?: React.ElementType;
  }) => (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border transition-all whitespace-nowrap ${
        active
          ? 'bg-olive-500 text-white border-olive-500 shadow-sm'
          : 'bg-white/95 backdrop-blur-sm text-foreground border-border hover:border-olive-300 hover:bg-cream-50'
      }`}
    >
      {Icon && <Icon className="w-3.5 h-3.5" />}
      {label}
      {active && <X className="w-3 h-3 ml-0.5" />}
    </button>
  );

  const Dropdown = ({
    id,
    label,
    children,
  }: {
    id: string;
    label: string;
    children: React.ReactNode;
  }) => (
    <div className="relative">
      <FilterChip
        label={label}
        active={expanded === id}
        onClick={() => setExpanded(expanded === id ? null : id)}
        icon={ChevronDown}
      />
      {expanded === id && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setExpanded(null)} />
          <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl shadow-elevated border border-border p-5 z-50 space-y-4">
            {children}
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <button
                onClick={() => {
                  onChange({});
                  setExpanded(null);
                }}
                className="text-sm text-foreground-muted hover:text-foreground"
              >
                Limpar
              </button>
              <button
                onClick={() => {
                  onApply();
                  setExpanded(null);
                }}
                className="px-4 py-2 bg-olive-500 text-white rounded-xl text-sm font-medium hover:bg-olive-600"
              >
                Ver {count} resultados
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="absolute top-0 left-0 right-0 z-[500] px-4 py-3">
      <div className="flex flex-col gap-3">
        {/* Main filter row */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <FilterChip
            label={filters.listingType === 'rent' ? 'Arrendar' : 'Comprar'}
            active={true}
            onClick={() =>
              update({ listingType: filters.listingType === 'rent' ? 'sale' : 'rent' })
            }
            icon={Home}
          />

          <Dropdown id="price" label="Preço">
            <div>
              <label className="block text-xs font-medium text-foreground-muted mb-2">Preço mínimo</label>
              <div className="grid grid-cols-2 gap-2">
                {PRICE_OPTIONS.map((o) => (
                  <button
                    key={`min-${o.value}`}
                    onClick={() => update({ minPrice: o.value ? Number(o.value) : undefined })}
                    className={`px-3 py-2 rounded-lg text-sm border transition-colors ${
                      filters.minPrice === Number(o.value)
                        ? 'bg-olive-50 border-olive-500 text-olive-700'
                        : 'bg-white border-border hover:bg-cream-50'
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground-muted mb-2">Preço máximo</label>
              <div className="grid grid-cols-2 gap-2">
                {PRICE_OPTIONS.map((o) => (
                  <button
                    key={`max-${o.value}`}
                    onClick={() => update({ maxPrice: o.value ? Number(o.value) : undefined })}
                    className={`px-3 py-2 rounded-lg text-sm border transition-colors ${
                      filters.maxPrice === Number(o.value)
                        ? 'bg-olive-50 border-olive-500 text-olive-700'
                        : 'bg-white border-border hover:bg-cream-50'
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          </Dropdown>

          <Dropdown id="size" label="Tamanho">
            <div>
              <label className="block text-xs font-medium text-foreground-muted mb-2">Área mínima</label>
              <div className="grid grid-cols-2 gap-2">
                {SQ_OPTIONS.map((o) => (
                  <button
                    key={`min-${o.value}`}
                    onClick={() => update({ minSqm: o.value ? Number(o.value) : undefined })}
                    className={`px-3 py-2 rounded-lg text-sm border transition-colors ${
                      filters.minSqm === Number(o.value)
                        ? 'bg-olive-50 border-olive-500 text-olive-700'
                        : 'bg-white border-border hover:bg-cream-50'
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground-muted mb-2">Área máxima</label>
              <div className="grid grid-cols-2 gap-2">
                {SQ_OPTIONS.map((o) => (
                  <button
                    key={`max-${o.value}`}
                    onClick={() => update({ maxSqm: o.value ? Number(o.value) : undefined })}
                    className={`px-3 py-2 rounded-lg text-sm border transition-colors ${
                      filters.maxSqm === Number(o.value)
                        ? 'bg-olive-50 border-olive-500 text-olive-700'
                        : 'bg-white border-border hover:bg-cream-50'
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          </Dropdown>

          <Dropdown id="rooms" label="Quartos">
            <div className="flex gap-2">
              {['T0', 'T1', 'T2', 'T3', 'T4', 'T5+'].map((label, idx) => (
                <button
                  key={label}
                  onClick={() =>
                    update({ bedrooms: filters.bedrooms === idx ? undefined : idx })
                  }
                  className={`flex-1 px-3 py-2 rounded-lg text-sm border transition-colors ${
                    filters.bedrooms === idx
                      ? 'bg-olive-50 border-olive-500 text-olive-700'
                      : 'bg-white border-border hover:bg-cream-50'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </Dropdown>

          <Dropdown id="bathrooms" label="Casas de banho">
            <div className="flex gap-2">
              {[1, 2, 3].map((n) => (
                <button
                  key={n}
                  onClick={() => update({ bathrooms: filters.bathrooms === n ? undefined : n })}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm border transition-colors ${
                    filters.bathrooms === n
                      ? 'bg-olive-50 border-olive-500 text-olive-700'
                      : 'bg-white border-border hover:bg-cream-50'
                  }`}
                >
                  {n === 3 ? '3+' : n}
                </button>
              ))}
            </div>
          </Dropdown>

          <FilterChip
            label="Mais filtros"
            active={showMore}
            onClick={() => setShowMore(!showMore)}
            icon={SlidersHorizontal}
          />

          {hasActiveFilters && (
            <button
              onClick={() => onChange({})}
              className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors whitespace-nowrap"
            >
              Limpar filtros
            </button>
          )}
        </div>

        {/* Expanded more filters */}
        {showMore && (
          <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-border shadow-soft p-5 space-y-4">
            <div className="space-y-4">
              {/* Tipo de casa */}
              <div>
                <label className="block text-xs font-medium text-foreground-muted mb-2">Tipo de casa</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'apartment', label: 'Apartamento' },
                    { value: 'penthouse', label: 'Penthouse' },
                    { value: 'duplex', label: 'Duplex' },
                    { value: 'detached', label: 'Moradia isolada' },
                    { value: 'semi-detached', label: 'Geminada' },
                    { value: 'terraced', label: 'Em banda' },
                    { value: 'villa', label: 'Villa' },
                    { value: 'quinta', label: 'Quinta' },
                    { value: 'rustic', label: 'Rústica' },
                  ].map((t) => (
                    <button
                      key={t.value}
                      onClick={() => update({ propertyType: filters.propertyType === t.value ? undefined : t.value })}
                      className={`px-3 py-2 rounded-lg text-sm border transition-colors ${
                        filters.propertyType === t.value
                          ? 'bg-olive-50 border-olive-500 text-olive-700'
                          : 'bg-white border-border hover:bg-cream-50'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Andar */}
              <div>
                <label className="block text-xs font-medium text-foreground-muted mb-2">Andar</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'last', label: 'Último' },
                    { value: 'intermediate', label: 'Intermédio' },
                    { value: 'ground', label: 'Rés-do-chão' },
                  ].map((f) => (
                    <button
                      key={f.value}
                      onClick={() => update({ floor: filters.floor === f.value ? undefined : f.value })}
                      className={`px-3 py-2 rounded-lg text-sm border transition-colors ${
                        filters.floor === f.value
                          ? 'bg-olive-50 border-olive-500 text-olive-700'
                          : 'bg-white border-border hover:bg-cream-50'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Estado */}
              <div>
                <label className="block text-xs font-medium text-foreground-muted mb-2">Estado</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'nova-construcao', label: 'Nova construção' },
                    { value: 'bom-estado', label: 'Bom estado' },
                    { value: 'para-recuperar', label: 'Para recuperar' },
                  ].map((c) => (
                    <button
                      key={c.value}
                      onClick={() => update({ condition: filters.condition === c.value ? undefined : c.value })}
                      className={`px-3 py-2 rounded-lg text-sm border transition-colors ${
                        filters.condition === c.value
                          ? 'bg-olive-50 border-olive-500 text-olive-700'
                          : 'bg-white border-border hover:bg-cream-50'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Características */}
              <div>
                <label className="block text-xs font-medium text-foreground-muted mb-2">Características</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { key: 'pool', label: 'Piscina', icon: Waves },
                    { key: 'garden', label: 'Jardim', icon: TreePine },
                    { key: 'parking', label: 'Garagem', icon: Car },
                    { key: 'elevator', label: 'Elevador', icon: Building },
                    { key: 'airConditioning', label: 'Ar condicionado', icon: Wind },
                    { key: 'balcony', label: 'Varanda', icon: Sun },
                    { key: 'terrace', label: 'Terraço', icon: Fence },
                    { key: 'storageRoom', label: 'Arrecadação', icon: Warehouse },
                  ].map((feat) => (
                    <button
                      key={feat.key}
                      onClick={() =>
                        update({
                          [feat.key]: filters[feat.key as keyof ExploreFilters] ? undefined : true,
                        } as Partial<ExploreFilters>)
                      }
                      className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm border transition-colors ${
                        filters[feat.key as keyof ExploreFilters]
                          ? 'bg-olive-50 border-olive-500 text-olive-700'
                          : 'bg-white border-border hover:bg-cream-50'
                      }`}
                    >
                      <feat.icon className="w-4 h-4" />
                      {feat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Multimédia */}
              <div>
                <label className="block text-xs font-medium text-foreground-muted mb-2">Multimédia</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { key: 'hasFloorPlan', label: 'Com planta' },
                    { key: 'hasVirtualTour', label: 'Com visita virtual' },
                  ].map((m) => (
                    <button
                      key={m.key}
                      onClick={() =>
                        update({
                          [m.key]: filters[m.key as keyof ExploreFilters] ? undefined : true,
                        } as Partial<ExploreFilters>)
                      }
                      className={`px-3 py-2 rounded-lg text-sm border transition-colors ${
                        filters[m.key as keyof ExploreFilters]
                          ? 'bg-olive-50 border-olive-500 text-olive-700'
                          : 'bg-white border-border hover:bg-cream-50'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border">
              <button
                onClick={() => onChange({})}
                className="text-sm text-foreground-muted hover:text-foreground"
              >
                Limpar tudo
              </button>
              <button
                onClick={() => {
                  onApply();
                  setShowMore(false);
                }}
                className="px-6 py-2.5 bg-olive-500 text-white rounded-xl text-sm font-medium hover:bg-olive-600"
              >
                Ver {count} resultados
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
