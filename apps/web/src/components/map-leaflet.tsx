'use client';

import { useState, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Property } from '@/types/property';
import { PropertyCard } from './property-card';
import { formatCurrency } from '@/lib/data';
import L from 'leaflet';
import { List, X, ChevronUp } from 'lucide-react';

// Fix Leaflet default icon issue in Next.js
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon.src,
  shadowUrl: iconShadow.src,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

const goldIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZjU5ZTBiIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBhdGggZD0iTTIwIDEwYzAgNi04IDEyLTggMTJzLTgtNi04LTEyYTggOCAwIDAgMSAxNiAwWiIvPjxjaXJjbGUgY3g9IjEyIiBjeT0iMTAiIHI9IjMiLz48L3N2Zz4=',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const normalIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjQ0M3NzIyIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBhdGggZD0iTTIwIDEwYzAgNi04IDEyLTggMTJzLTgtNi04LTEyYTggOCAwIDAgMSAxNiAwWiIvPjxjaXJjbGUgY3g9IjEyIiBjeT0iMTAiIHI9IjMiLz48L3N2Zz4=',
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -28],
});

interface MapLeafletProps {
  properties: Property[];
}

export function MapLeaflet({ properties }: MapLeafletProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [showList, setShowList] = useState(true);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const initialCenter: [number, number] = useMemo(() => {
    if (properties.length === 0) return [39.5, -8.0];
    // Use first property or a reasonable center for Portugal
    const first = properties[0];
    return [first.location.coordinates.latitude, first.location.coordinates.longitude];
  }, [properties]);

  const selectedProperty = useMemo(
    () => properties.find((p) => p.id === selectedId) || null,
    [selectedId, properties]
  );

  const handleCardHover = useCallback((id: string | null) => {
    setHoveredId(id);
  }, []);

  const handleCardClick = useCallback((property: Property) => {
    setSelectedId(property.id);
    setMobileDrawerOpen(false);
  }, []);

  const handleMarkerClick = useCallback((property: Property) => {
    setSelectedId(property.id);
  }, []);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-cream-100">
      {/* Layout Split: Mapa + Lista */}
      <div className="flex h-full">
        {/* Mapa */}
        <div className={`relative flex-1 h-full transition-all duration-700 ease-luxury ${showList ? 'lg:w-[60%] lg:flex-none' : 'w-full'}`}>
          <MapContainer
            center={initialCenter}
            zoom={13}
            style={{ width: '100%', height: '100%' }}
            zoomControl={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {properties.map((property) => {
              const coords = property.location.coordinates;
              const isSelected = selectedId === property.id;
              return (
                <Marker
                  key={property.id}
                  position={[coords.latitude, coords.longitude]}
                  icon={property.featured ? goldIcon : normalIcon}
                  eventHandlers={{
                    click: () => handleMarkerClick(property),
                    mouseover: () => setHoveredId(property.id),
                    mouseout: () => setHoveredId(null),
                  }}
                >
                  <Popup>
                    <div className="min-w-[200px]">
                      <p className="font-serif text-sm font-medium text-foreground">{property.title}</p>
                      <p className="text-xs text-olive-500 mt-1">{formatCurrency(property.price, property.currency)}</p>
                      <p className="text-xs text-foreground-muted">{property.location.neighborhood}, {property.location.city}</p>
                      {property.featured && (
                        <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full">
                          ★ Destaque
                        </span>
                      )}
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>

          {/* Toggle lista desktop */}
          <button
            onClick={() => setShowList(!showList)}
            className="hidden lg:flex absolute top-4 right-4 z-[1000] items-center gap-2 px-4 py-2.5 bg-white/90 backdrop-blur-md rounded-xl shadow-soft border border-border text-caption font-medium text-olive-500 hover:bg-white transition-colors"
          >
            {showList ? <X className="w-4 h-4" /> : <List className="w-4 h-4" />}
            {showList ? 'Fechar lista' : 'Ver lista'}
          </button>

          {/* Botão mobile */}
          <button
            onClick={() => setMobileDrawerOpen(true)}
            className="lg:hidden absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-2 px-6 py-3 bg-white/95 backdrop-blur-md rounded-full shadow-elevated border border-border text-body font-medium text-olive-500"
          >
            <List className="w-5 h-5" />
            Ver {properties.length} propriedades
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
                {properties.length} Propriedades
              </h2>
              <p className="text-caption text-foreground-muted mt-0.5">
                Portugal & Angola · Curadoria premium
              </p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
            {properties.map((property) => (
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
        className={`lg:hidden fixed inset-x-0 bottom-0 z-[1000] bg-cream-100 rounded-t-3xl shadow-2xl border-t border-border transition-transform duration-500 ease-luxury ${
          mobileDrawerOpen ? 'translate-y-0' : 'translate-y-[85%]'
        }`}
        style={{ height: '75vh' }}
      >
        <div className="flex flex-col h-full">
          <button onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)} className="w-full pt-3 pb-2 flex justify-center">
            <div className="w-12 h-1.5 rounded-full bg-border" />
          </button>
          <div className="px-5 pb-3 flex items-center justify-between">
            <h2 className="font-serif text-heading-2 text-foreground">{properties.length} Propriedades</h2>
            <button onClick={() => setMobileDrawerOpen(false)} className="p-2 rounded-full hover:bg-cream-200 transition-colors">
              <X className="w-5 h-5 text-foreground-muted" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-5 pb-8 space-y-4">
            {properties.map((property) => (
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
        <div className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-[999]" onClick={() => setMobileDrawerOpen(false)} />
      )}
    </div>
  );
}
