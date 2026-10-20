import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Navigation, Loader2, AlertCircle, CheckCircle2, Crosshair } from 'lucide-react';
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

export interface LocationPickerProps {
  onLocationSelect?: (lat: number, lng: number, source: 'gps' | 'manual') => void;
  onLocationClear?: () => void;
  initialLat?: number | null;
  initialLng?: number | null;
  readOnly?: boolean;
  source?: 'gps' | 'manual' | null;
  className?: string;
}

// Controller component to smoothly fly/pan the map when coordinates change
const MapController: React.FC<{
  targetPosition: L.LatLng | null;
  shouldFly?: boolean;
}> = ({ targetPosition, shouldFly }) => {
  const map = useMap();

  useEffect(() => {
    // Invalidate size on mount to handle tab/step transitions cleanly
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 150);
    return () => clearTimeout(timer);
  }, [map]);

  useEffect(() => {
    if (targetPosition) {
      if (shouldFly) {
        map.flyTo(targetPosition, Math.max(map.getZoom(), 16), {
          animate: true,
          duration: 1.2,
        });
      } else {
        map.panTo(targetPosition, { animate: true });
      }
    }
  }, [targetPosition, shouldFly, map]);

  return null;
};

// Map click listener for manual coordinate selection
const LocationMarker: React.FC<{
  position: L.LatLng | null;
  onSelect: (lat: number, lng: number) => void;
  readOnly?: boolean;
}> = ({ position, onSelect, readOnly }) => {
  useMapEvents({
    click(e) {
      if (readOnly) return;
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  return position ? <Marker position={position} /> : null;
};

export const LocationPicker: React.FC<LocationPickerProps> = ({ 
  onLocationSelect, 
  onLocationClear,
  initialLat, 
  initialLng,
  readOnly = false,
  source = null,
  className = '',
}) => {
  const [position, setPosition] = useState<L.LatLng | null>(
    typeof initialLat === 'number' && typeof initialLng === 'number' && !isNaN(initialLat) && !isNaN(initialLng)
      ? L.latLng(initialLat, initialLng)
      : null
  );
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [shouldFly, setShouldFly] = useState(false);
  const [activeSource, setActiveSource] = useState<'gps' | 'manual' | null>(source || null);

  // Sync internal position state if parent props change
  useEffect(() => {
    if (
      typeof initialLat === 'number' &&
      typeof initialLng === 'number' &&
      !isNaN(initialLat) &&
      !isNaN(initialLng)
    ) {
      setPosition(L.latLng(initialLat, initialLng));
    } else if (initialLat === null || initialLat === undefined) {
      setPosition(null);
    }
  }, [initialLat, initialLng]);

  useEffect(() => {
    if (source !== undefined) {
      setActiveSource(source);
    }
  }, [source]);

  const handleUseMyLocation = () => {
    if (readOnly || isLocating) return;

    setLocationError(null);

    // 1. Check browser Geolocation API support
    if (typeof window === 'undefined' || !('geolocation' in navigator) || !navigator.geolocation) {
      setLocationError(
        'Geolocation is not supported by your browser. Please select your location manually by clicking on the map.'
      );
      return;
    }

    // 2. Check secure context (HTTPS required by modern browsers)
    if (
      typeof window !== 'undefined' &&
      !window.isSecureContext &&
      window.location.hostname !== 'localhost' &&
      window.location.hostname !== '127.0.0.1'
    ) {
      setLocationError(
        'Browser geolocation requires a secure HTTPS connection. Please select your location manually on the map.'
      );
      return;
    }

    setIsLocating(true);

    const geoOptions: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 15000, // 15-second timeout
      maximumAge: 10000, // 10-second cache
    };

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const lat = Number(pos.coords.latitude);
        const lng = Number(pos.coords.longitude);

        // Strict numeric & boundary validation
        if (
          isNaN(lat) ||
          isNaN(lng) ||
          lat < -90 ||
          lat > 90 ||
          lng < -180 ||
          lng > 180 ||
          (lat === 0 && lng === 0)
        ) {
          setLocationError(
            'GPS returned invalid coordinates. Please click on the map to pin your location manually.'
          );
          return;
        }

        const newPos = L.latLng(lat, lng);
        setPosition(newPos);
        setShouldFly(true);
        setActiveSource('gps');
        setLocationError(null);

        if (onLocationSelect) {
          onLocationSelect(lat, lng, 'gps');
        }
      },
      (err: GeolocationPositionError) => {
        setIsLocating(false);
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setLocationError(
              'Location permission was denied. Please allow location access in your browser address bar (lock/tune icon), or click on the map to select your location manually.'
            );
            break;
          case err.POSITION_UNAVAILABLE:
            setLocationError(
              'GPS location unavailable. Please verify your device location/GPS is turned on, or click directly on the map to place your pin.'
            );
            break;
          case err.TIMEOUT:
            setLocationError(
              'Location request timed out. Please try clicking "Use My Location" again or select your location manually on the map.'
            );
            break;
          default:
            setLocationError(
              `Unable to acquire location (${err.message || 'code ' + err.code}). Please click on the map to set your location.`
            );
            break;
        }
      },
      geoOptions
    );
  };

  const handleMapClick = (lat: number, lng: number) => {
    if (readOnly) return;
    const newPos = L.latLng(lat, lng);
    setPosition(newPos);
    setShouldFly(false);
    setActiveSource('manual');
    setLocationError(null);

    if (onLocationSelect) {
      onLocationSelect(lat, lng, 'manual');
    }
  };

  const handleClearPin = () => {
    setPosition(null);
    setActiveSource(null);
    setLocationError(null);
    if (onLocationClear) {
      onLocationClear();
    }
  };

  return (
    <div className={`flex flex-col gap-3 w-full ${className}`}>
      {/* Top Action Bar (hidden in readOnly mode) */}
      {!readOnly && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleUseMyLocation}
              disabled={isLocating}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all shadow-sm ${
                isLocating
                  ? 'bg-blue-100 text-blue-700 cursor-wait'
                  : 'bg-blue-600 hover:bg-blue-700 text-white active:scale-95'
              }`}
            >
              {isLocating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Acquiring GPS Location...</span>
                </>
              ) : (
                <>
                  <Navigation className="w-4 h-4" />
                  <span>Use My Location</span>
                </>
              )}
            </button>
            <span className="text-xs text-slate-500 hidden sm:inline">
              or click on the map to place a pin
            </span>
          </div>

          {activeSource && position && (
            <div className="flex items-center gap-1.5 text-xs">
              {activeSource === 'gps' ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" /> GPS Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-medium">
                  <MapPin className="w-3.5 h-3.5" /> Manually Placed
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Actionable Error Banner */}
      {locationError && !readOnly && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2.5 text-amber-800 text-xs sm:text-sm">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-amber-900">Location Notice</p>
            <p className="mt-0.5 leading-relaxed">{locationError}</p>
          </div>
          <button
            type="button"
            onClick={() => setLocationError(null)}
            className="text-amber-600 hover:text-amber-800 font-bold ml-1 text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Leaflet Map Display */}
      <div className={`${readOnly ? 'h-full' : 'h-72'} w-full rounded-xl overflow-hidden border border-slate-300 relative z-0 shadow-sm bg-slate-50`}>
        <MapContainer 
          center={position || REWA_MAP_CENTER} 
          zoom={position ? 16 : REWA_MAP_ZOOM + 1} 
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapController targetPosition={position} shouldFly={shouldFly} />
          <LocationMarker position={position} onSelect={handleMapClick} readOnly={readOnly} />
        </MapContainer>
        
        {/* Helper overlay when no pin is placed yet */}
        {!position && !readOnly && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-[400]">
            <div className="bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-blue-200 text-blue-800 font-medium text-xs sm:text-sm flex items-center gap-2">
              <Crosshair className="w-4 h-4 text-blue-600 animate-pulse" />
              Click on the map or click "Use My Location"
            </div>
          </div>
        )}
      </div>
      
      {/* Footer / Selected coordinates */}
      {!readOnly && (
        <div className="flex items-center justify-between text-xs text-slate-600 px-1">
          {position ? (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-slate-800 font-medium">
                {position.lat.toFixed(6)}° N, {position.lng.toFixed(6)}° E
              </span>
              <span className="text-slate-500">
                ({activeSource === 'gps' ? 'Auto-detected via GPS' : 'Selected via Map Click'})
              </span>
            </div>
          ) : (
            <span className="text-slate-500 italic">No location selected yet</span>
          )}
          
          {position && (
            <button
              type="button"
              onClick={handleClearPin}
              className="text-slate-400 hover:text-red-600 underline text-xs"
            >
              Clear Pin
            </button>
          )}
        </div>
      )}
    </div>
  );
};
