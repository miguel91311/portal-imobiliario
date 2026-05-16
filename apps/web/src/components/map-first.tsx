'use client';

import { useState, useCallback, useMemo } from 'react';
import Map, { Marker, Popup, NavigationControl, FullscreenControl, ScaleControl, Source, Layer } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin, List, X, ChevronUp } from 'lucide-react';
import { Property } from '@/types/property';
import { PropertyCard } from './property-card';
import { SearchNLP } from './search-nlp';
import { SpatialControls } from './spatial-controls';
import { formatCurrency } from '@/lib/data';

interface MapFirstProps {
  properties: Property[];
  mapboxToken: string;
}

type ViewState = {
  longitude: number;
  latitude: number;
  zoom: number;
};

const INITIAL_VIEW: ViewState = {
  longitude: -8.0,
  latitude: 20.0,
  zoom: 3.5,
};

export function MapFirst({ properties, mapboxToken }: MapFirstProps) {
  const [viewState, setViewState] = useState<ViewState>(INITIAL_VIEW);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showList, setShowList] = useState(true);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  
  // Spatial search state
  const [spatialProperties, setSpatialProperties] = useState<Property[] | null>(null);
  const [spatialCircle, setSpatialCircle] = useState<{ lat: number; lng: number; radius: number } | null>(null);

  const displayedProperties = spatialProperties ?? properties;

  const selectedProperty = useMemo(
    () => displayedProperties.find((p) => p.id === selectedId) || null,
    [selectedId, displayedProperties]
  );

  const handleCardHover = useCallback((id: string | null) => {
    setHoveredId(id);
  }, []);

  const handleCardClick = useCallback((property: Property) => {
    setSelectedId(property.id);
    setViewState({
      longitude: property.location.coordinates.longitude,
      latitude: property.location.coordinates.latitude,
      zoom: 14,
    });
    setMobileDrawerOpen(false);
  }, []);

  const handleMarkerClick = useCallback((property: Property) => {
    setSelectedId(property.id);
    setViewState({
      longitude: property.location.coordinates.longitude,
      latitude: property.location.coordinates.latitude,
      zoom: 14,
    });
  }, []);

  const handleSpatialResults = useCallback((results: any[] | null, center?: { lat: number; lng: number }, radius?: number) => {
    if (results) {
      setSpatialProperties(results as Property[]);
      if (center && radius) {
        setSpatialCircle({ lat: center.lat, lng: center.lng, radius });
        setViewState({
          longitude: center.lng,
          latitude: center.lat,
          zoom: 12,
        });
      }
    } else {
      setSpatialProperties(null);
      setSpatialCircle(null);
    }
  }, []);

  const handleClearSpatial = useCallback(() => {
    setSpatialProperties(null);
    setSpatialCircle(null);
  }, []);

  // GeoJSON circle for the radius
  const circleGeoJSON = useMemo(() => {
    if (!spatialCircle) return null;
    const points = 64;
    const coords = [];
    for (let i = 0; i <= points; i++) {
      const angle = (i * 360) / points;
      const rad = (angle * Math.PI) / 180;
      // Approximate: 1 degree latitude ~ 111km
      const dLat = (spatialCircle.radius / 111) * Math.cos(rad);
      const dLng = (spatialCircle.radius / (111 * Math.cos((spatialCircle.lat * Math.PI) / 180))) * Math.sin(rad);
      coords.push([spatialCircle.lng + dLng, spatialCircle.lat + dLat]);
    }
    return {
      type: 'Feature' as const,
      geometry: {
        type: 'Polygon' as const,
        coordinates: [coords],
      },
      properties: {},
    };
  }, [spatialCircle]);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-cream-100">
      {/* Barra de pesquisa flutuante */}
      <div className="absolute top-20 left-0 right-0 z-20 px-4 md:px-8 pointer-events-none">
        <div className="max-w-3xl mx-auto md:mx-0 md:ml-4 pointer-events-auto">
          <SearchNLP />
        </div>
      </div>

      {/* Spatial Controls */}
      <SpatialControls onResults={handleSpatialResults} onClear={handleClearSpatial} />

      {/* Layout Split: Mapa + Lista */}
      <div className="flex h-full pt-18">
        {/* Mapa */}
        <div className={`relative flex-1 h-full transition-all duration-700 ease-luxury ${showList ? 'lg:w-[60%] lg:flex-none' : 'w-full'}`}>
          <Map
            {...viewState}
            onMove={(evt) => setViewState(evt.viewState)}
            style={{ width: '100%', height: '100%' }}
            mapStyle="mapbox://styles/mapbox/light-v11"
            mapboxAccessToken={mapboxToken}
            attributionControl={false}
            reuseMaps
          >
            <NavigationControl position="bottom-right" style={{ margin: '1rem' }} />
            <FullscreenControl position="bottom-right" style={{ margin: '1rem', marginBottom: '3.5rem' }} />
            <ScaleControl position="bottom-left" style={{ margin: '1rem' }} />

            {/* Spatial Circle */}
            {circleGeoJSON && (
              <Source id="spatial-circle" type="geojson" data={circleGeoJSON}>
                <Layer
                  id="circle-fill"
                  type="fill"
                  paint={{
                    'fill-color': '#CC7722',
                    'fill-opacity': 0.1,
                  }}
                />
                <Layer
                  id="circle-line"
                  type="line"
                  paint={{
                    'line-color': '#CC7722',
                    'line-width': 2,
                    'line-dasharray': [4, 2],
                  }}
                />
              </Source>
            )}

            {displayedProperties.map((property) => {
              const isHovered = hoveredId === property.id;
              const isSelected = selectedId === property.id;
              const coords = property.location.coordinates;

              return (
                <Marker
                  key={property.id}
                  longitude={coords.longitude}
                  latitude={coords.latitude}
                  anchor="bottom"
                  onClick={(e) => {
                    e.originalEvent.stopPropagation();
                    handleMarkerClick(property);
                  }}
                >
                  <div
                    className={`relative flex flex-col items-center cursor-pointer transition-all duration-300 ease-luxury ${
                      isHovered || isSelected ? 'scale-110 -translate-y-1' : 'scale-100'
                    }`}
                    onMouseEnter={() => setHoveredId(property.id)}
                    onMouseLeave={() => setHoveredId(null)}
                  >
                    <div
                      className={`px-3 py-1.5 rounded-xl shadow-elevated text-sm font-medium whitespace-nowrap transition-colors duration-300 ${
                        isSelected
                          ? property.featured
                            ? 'bg-amber-500 text-white'
                            : 'bg-accent text-white'
                          : property.featured
                            ? 'bg-amber-100 text-amber-700 border border-amber-300 hover:bg-amber-500 hover:text-white'
                            : 'bg-white text-olive-500 hover:bg-olive-500 hover:text-white'
                      }`}
                    >
                      <span className="flex items-center gap-1">
                        {property.featured && <span className="text-xs">★</span>}
                        {formatCurrency(property.price, property.currency)}
                      </span>
                    </div>
                    <div
                      className={`w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] transition-colors duration-300 ${
                        isSelected
                          ? property.featured ? 'border-t-amber-500' : 'border-t-accent'
                          : property.featured ? 'border-t-amber-100' : 'border-t-white'
                      }`}
                    />
                  </div>
                </Marker>
              );
            })}

            {/* Popup */}
            {selectedProperty && (
              <Popup
                longitude={selectedProperty.location.coordinates.longitude}
                latitude={selectedProperty.location.coordinates.latitude}
                anchor="top"
                onClose={() => setSelectedId(null)}
                closeButton={false}
                offset={12}
                className="!z-30"
              >
                <div className="w-64 p-0">
                  <div className="relative h-32 w-full">
                    <img
                      src={selectedProperty.images.find((i) => i.isPrimary)?.url || selectedProperty.images[0]?.url}
                      alt={selectedProperty.title}
                      className="w-full h-full object-cover rounded-t-xl"
                    />
                    <button
                      onClick={() => setSelectedId(null)}
                      className="absolute top-2 right-2 p-1.5 bg-white/80 backdrop-blur rounded-full hover:bg-white transition-colors"
                    >
                      <X className="w-3.5 h-3.5 text-foreground" />
                    </button>
                  </div>
                  <div className="p-4">
                    <p className="text-overline text-accent uppercase tracking-wider mb-1">
                      {selectedProperty.typology} · {selectedProperty.location.neighborhood}
                    </p>
                    <h4 className="font-serif text-heading-3 text-foreground mb-2 line-clamp-1">
                      {selectedProperty.title}
                    </h4>
                    <p className="font-serif text-body-large text-olive-500">
                      {formatCurrency(selectedProperty.price, selectedProperty.currency)}
                    </p>
                  </div>
                </div>
              </Popup>
            )}
          </Map>

          {/* Toggle lista desktop */}
          <button
            onClick={() => setShowList(!showList)}
            className="hidden lg:flex absolute top-4 right-4 z-10 items-center gap-2 px-4 py-2.5 bg-white/90 backdrop-blur-md rounded-xl shadow-soft border border-border text-caption font-medium text-olive-500 hover:bg-white transition-colors"
          >
            {showList ? <X className="w-4 h-4" /> : <List className="w-4 h-4" />}
            {showList ? 'Fechar lista' : 'Ver lista'}
          </button>

          {/* Botão mobile */}
          <button
            onClick={() => setMobileDrawerOpen(true)}
            className="lg:hidden absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 px-6 py-3 bg-white/95 backdrop-blur-md rounded-full shadow-elevated border border-border text-body font-medium text-olive-500"
          >
            <List className="w-5 h-5" />
            Ver {displayedProperties.length} propriedades
            <ChevronUp className="w-4 h-4" />
          </button>
        </div>

        {/* Painel de listagens */}
        <aside
          className={`hidden lg:flex flex-col bg-cream-100 border-l border-border transition-all duration-700 ease-luxury overflow-hidden ${
            showList ? 'w-[40%] opacity-100' : 'w-0 opacity-0 border-l-0'
          }`}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-cream-100/80 backdrop-blur-sm sticky top-0 z-10">
            <div>
              <h2 className="font-serif text-heading-2 text-foreground">
                {displayedProperties.length} Propriedades
              </h2>
              <p className="text-caption text-foreground-muted mt-0.5">
                {spatialProperties ? 'Resultado da pesquisa espacial' : 'Portugal & Angola · Curadoria premium'}
              </p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
            {displayedProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                isActive={hoveredId === property.id || selectedId === property.id}
                onHover={handleCardHover}
                onClick={handleCardClick}
              />
            ))}
          </div>
        </aside>
      </div>

      {/* Drawer mobile */}
      <div
        className={`lg:hidden fixed inset-x-0 bottom-0 z-40 bg-cream-100 rounded-t-3xl shadow-2xl border-t border-border transition-transform duration-500 ease-luxury ${
          mobileDrawerOpen ? 'translate-y-0' : 'translate-y-[85%]'
        }`}
        style={{ height: '75vh' }}
      >
        <div className="flex flex-col h-full">
          <button onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)} className="w-full pt-3 pb-2 flex justify-center">
            <div className="w-12 h-1.5 rounded-full bg-border" />
          </button>
          <div className="px-5 pb-3 flex items-center justify-between">
            <h2 className="font-serif text-heading-2 text-foreground">{displayedProperties.length} Propriedades</h2>
            <button onClick={() => setMobileDrawerOpen(false)} className="p-2 rounded-full hover:bg-cream-200 transition-colors">
              <X className="w-5 h-5 text-foreground-muted" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-5 pb-8 space-y-4">
            {displayedProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                isActive={hoveredId === property.id || selectedId === property.id}
                onHover={handleCardHover}
                onClick={handleCardClick}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Overlay escuro drawer mobile */}
      {mobileDrawerOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-30" onClick={() => setMobileDrawerOpen(false)} />
      )}
    </div>
  );
}
