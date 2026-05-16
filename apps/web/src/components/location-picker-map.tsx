'use client';

import { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon.src,
  shadowUrl: iconShadow.src,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

function LocationPicker({ position, onPositionChange, onAddressChange }: { 
  position: [number, number] | null; 
  onPositionChange: (pos: [number, number]) => void;
  onAddressChange?: (address: { address: string; city: string; neighborhood: string }) => void;
}) {
  const [isLoading, setIsLoading] = useState(false);

  useMapEvents({
    click(e) {
      const pos: [number, number] = [e.latlng.lat, e.latlng.lng];
      onPositionChange(pos);
      
      if (onAddressChange) {
        setIsLoading(true);
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos[0]}&lon=${pos[1]}&zoom=18&addressdetails=1`)
          .then(res => res.json())
          .then(data => {
            if (data.address) {
              const addr = data.address;
              const road = addr.road || addr.street || addr.pedestrian || addr.path || '';
              const houseNumber = addr.house_number || '';
              const city = addr.city || addr.town || addr.village || addr.municipality || addr.county || '';
              const neighborhood = addr.suburb || addr.neighbourhood || addr.district || addr.borough || city;
              const fullAddress = houseNumber ? `${road} ${houseNumber}` : road;
              
              onAddressChange({
                address: fullAddress || data.display_name || '',
                city: city,
                neighborhood: neighborhood || city,
              });
            }
          })
          .catch(() => {
            // Silenciar erros de geocoding
          })
          .finally(() => setIsLoading(false));
      }
    },
  });
  return position ? <Marker position={position} /> : null;
}

export function LocationPickerMap({ mapPosition, setMapPosition, onAddressChange }: { 
  mapPosition: [number, number] | null; 
  setMapPosition: (pos: [number, number]) => void;
  onAddressChange?: (address: { address: string; city: string; neighborhood: string }) => void;
}) {
  if (!mapPosition) return null;
  return (
    <div className="mt-4 h-64 rounded-xl overflow-hidden border border-border relative">
      <MapContainer center={mapPosition} zoom={15} style={{ width: '100%', height: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationPicker position={mapPosition} onPositionChange={setMapPosition} onAddressChange={onAddressChange} />
      </MapContainer>
    </div>
  );
}
