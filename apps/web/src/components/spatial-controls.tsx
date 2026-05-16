'use client';

import { useState } from 'react';
import { MapPin, Radius, X, Crosshair, Search } from 'lucide-react';
import { useSpatialSearch } from '@/hooks/use-spatial-search';

interface SpatialControlsProps {
  onResults: (properties: any[] | null, center?: { lat: number; lng: number }, radius?: number) => void;
  onClear: () => void;
}

export function SpatialControls({ onResults, onClear }: SpatialControlsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [radiusKm, setRadiusKm] = useState(5);
  const [useLocation, setUseLocation] = useState(false);
  const [lat, setLat] = useState(38.7223); // Lisboa default
  const [lng, setLng] = useState(-9.1453);
  const { searchNearby, isLoading, error, clearResult } = useSpatialSearch();

  const handleSearch = async () => {
    let searchLat = lat;
    let searchLng = lng;

    if (useLocation && navigator.geolocation) {
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        searchLat = pos.coords.latitude;
        searchLng = pos.coords.longitude;
        setLat(searchLat);
        setLng(searchLng);
      } catch {
        // fallback to manual coords
      }
    }

    const data = await searchNearby({
      latitude: searchLat,
      longitude: searchLng,
      radiusKm,
    });

    if (data) {
      onResults(data.value, { lat: searchLat, lng: searchLng }, radiusKm);
    }
  };

  const handleClear = () => {
    clearResult();
    onClear();
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`absolute top-4 left-4 z-10 p-3 rounded-xl shadow-soft border transition-all ${
          isOpen ? 'bg-accent text-white border-accent' : 'bg-white text-olive-500 border-border hover:border-olive-300'
        }`}
        title="Pesquisa espacial"
      >
        <Radius className="w-5 h-5" />
      </button>

      {/* Controls Panel */}
      {isOpen && (
        <div className="absolute top-16 left-4 z-10 w-80 bg-white/95 backdrop-blur-md rounded-2xl shadow-elevated border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-heading-3 text-foreground">Pesquisa Espacial</h3>
            <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-lg hover:bg-cream-200 text-foreground-muted">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Use my location */}
          <button
            onClick={() => setUseLocation(!useLocation)}
            className={`w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all mb-4 ${
              useLocation ? 'bg-accent text-white' : 'bg-cream-50 text-foreground-muted border border-border hover:border-olive-300'
            }`}
          >
            <Crosshair className="w-4 h-4" />
            {useLocation ? 'A usar localização atual' : 'Usar minha localização'}
          </button>

          {/* Manual coords */}
          {!useLocation && (
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="text-overline text-foreground-muted uppercase">Latitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={lat}
                  onChange={(e) => setLat(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-cream-50 text-sm mt-1"
                />
              </div>
              <div>
                <label className="text-overline text-foreground-muted uppercase">Longitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={lng}
                  onChange={(e) => setLng(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-cream-50 text-sm mt-1"
                />
              </div>
            </div>
          )}

          {/* Radius slider */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-body text-foreground font-medium flex items-center gap-2">
                <MapPin className="w-4 h-4 text-foreground-muted" />
                Raio de proximidade
              </label>
              <span className="text-body text-accent font-medium">{radiusKm} km</span>
            </div>
            <input
              type="range"
              min="1"
              max="50"
              step="1"
              value={radiusKm}
              onChange={(e) => setRadiusKm(Number(e.target.value))}
              className="w-full accent-accent"
            />
            <div className="flex justify-between text-caption text-foreground-muted mt-1">
              <span>1 km</span>
              <span>25 km</span>
              <span>50 km</span>
            </div>
          </div>

          {error && (
            <div className="mb-3 p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleSearch}
              disabled={isLoading}
              className="flex-1 btn-primary gap-2 disabled:opacity-60"
            >
              <Search className="w-4 h-4" />
              {isLoading ? 'A pesquisar...' : 'Pesquisar'}
            </button>
            <button
              onClick={handleClear}
              className="px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground-muted hover:bg-cream-200 transition-all"
            >
              Limpar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
