import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Navigation } from 'lucide-react';
import { REWA_MAP_CENTER, REWA_MAP_ZOOM } from '../../data/mockData';

// Fix Leaflet default icon bug
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

interface LocationPickerProps {
  onLocationSelect: (lat: number, lng: number) => void;
  initialLat?: number;
  initialLng?: number;
}

const LocationMarker = ({ position, setPosition, onSelect }: any) => {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  return position === null ? null : (
    <Marker position={position} />
  );
};

export const LocationPicker: React.FC<LocationPickerProps> = ({ 
  onLocationSelect, 
  initialLat, 
  initialLng 
}) => {
  const [position, setPosition] = useState<L.LatLng | null>(
    initialLat && initialLng ? L.latLng(initialLat, initialLng) : null
  );

  const handleUseMyLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const latlng = L.latLng(pos.coords.latitude, pos.coords.longitude);
          setPosition(latlng);
          onLocationSelect(latlng.lat, latlng.lng);
        },
        (err) => {
          console.error('Error getting location:', err);
          alert('Could not get your location. Please ensure location permissions are granted.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="h-64 w-full rounded-lg overflow-hidden border border-slate-300 relative z-0">
        <MapContainer 
          center={position || REWA_MAP_CENTER} 
          zoom={REWA_MAP_ZOOM + 1} 
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker position={position} setPosition={setPosition} onSelect={onLocationSelect} />
        </MapContainer>
        
        {!position && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-[400]">
            <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-md border border-blue-200 text-blue-700 font-medium text-sm flex items-center gap-2">
              <MapPin size={16} />
              Click on the map to set location
            </div>
          </div>
        )}
      </div>
      
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-600">
          {position ? (
            <span>Selected: {position.lat.toFixed(6)}, {position.lng.toFixed(6)}</span>
          ) : (
            <span>No location selected</span>
          )}
        </div>
        
        <button
          type="button"
          onClick={handleUseMyLocation}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-md transition-colors border border-slate-200"
        >
          <Navigation size={14} />
          Use My Location
        </button>
      </div>
    </div>
  );
};
