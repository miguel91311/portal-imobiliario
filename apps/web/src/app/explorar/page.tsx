'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { Navbar } from '@/components/navbar';
import dynamic from 'next/dynamic';
import { api } from '@/lib/api';
import { FilterBar, ExploreFilters } from '@/components/explore-filters';

const MapLeaflet = dynamic(() => import('@/components/map-leaflet').then((mod) => mod.MapLeaflet), { ssr: false });

export default function ExplorarPage() {
  const [allProperties, setAllProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState<ExploreFilters>({});

  useEffect(() => {
    api.getProperties()
      .then((data) => setAllProperties(data.value))
      .catch((err) => setError(err?.data?.error || 'Erro ao carregar propriedades'))
      .finally(() => setIsLoading(false));
  }, []);

  const filteredProperties = useMemo(() => {
    return allProperties.filter((p) => {
      if (filters.listingType && p.listingType !== filters.listingType) return false;
      if (filters.minPrice && p.price < filters.minPrice) return false;
      if (filters.maxPrice && p.price > filters.maxPrice) return false;
      if (filters.minSqm && p.features?.sqm < filters.minSqm) return false;
      if (filters.maxSqm && p.features?.sqm > filters.maxSqm) return false;
      if (filters.bedrooms !== undefined && p.features?.bedrooms < filters.bedrooms) return false;
      if (filters.bathrooms !== undefined && p.features?.bathrooms < filters.bathrooms) return false;
      if (filters.pool && !p.features?.pool) return false;
      if (filters.garden && !p.features?.garden) return false;
      if (filters.parking && !p.features?.parking) return false;
      if (filters.elevator && !p.features?.elevator) return false;
      if (filters.balcony && !p.features?.balcony) return false;
      if (filters.terrace && !p.features?.terrace) return false;
      if (filters.airConditioning && !p.features?.airConditioning) return false;
      if (filters.storageRoom && !p.features?.storageRoom) return false;
      if (filters.condition && p.features?.condition !== filters.condition) return false;
      if (filters.energyCertificate && p.features?.energyCertificate !== filters.energyCertificate) return false;
      if (filters.floor && p.features?.floor !== filters.floor) return false;
      if (filters.propertyType && p.features?.propertyType !== filters.propertyType) return false;
      if (filters.hasFloorPlan && !p.features?.hasFloorPlan) return false;
      if (filters.hasVirtualTour && !p.features?.hasVirtualTour) return false;
      return true;
    });
  }, [allProperties, filters]);

  const handleApplyFilters = useCallback(() => {
    // Filters are already applied reactively via useMemo
    // This is just for UX (closing dropdowns etc)
  }, []);

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
      <Navbar />
      <div className="relative h-[calc(100vh-64px)]">
        <FilterBar
          filters={filters}
          onChange={setFilters}
          onApply={handleApplyFilters}
          count={filteredProperties.length}
        />
        <MapLeaflet properties={filteredProperties} />
      </div>
    </main>
  );
}
