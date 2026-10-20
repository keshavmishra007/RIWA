import React, { useState, useEffect, useRef } from 'react';
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

// Structured diagnostic logger for browser troubleshooting
const logDiagnostics = (event: string, details: Record<string, any>) => {
  const timestamp = new Date().toISOString();
  const base = {
    event,
    timestamp,
    hasGeolocation: typeof navigator !== 'undefined' && 'geolocation' in navigator,
    isSecureContext: typeof window !== 'undefined' ? window.isSecureContext : false,
    protocol: typeof window !== 'undefined' ? window.location.protocol : '',
    hostname: typeof window !== 'undefined' ? window.location.hostname : '',
    ...details,
  };
  console.log(`[RIWA Geolocation] ${event}`, base);
};

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

// Promise-based Geolocation wrapper with timing diagnostics
const requestPosition = (
  options: PositionOptions,
  stageName: string,
  startTime: number
): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported by browser environment.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const elapsed = Math.round(performance.now() - startTime);
        logDiagnostics(`${stageName} Succeeded`, {
          elapsedMs: elapsed,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracyMeters: pos.coords.accuracy,
        });
        resolve(pos);
      },
      (err) => {
        const elapsed = Math.round(performance.now() - startTime);
        logDiagnostics(`${stageName} Failed`, {
          elapsedMs: elapsed,
          code: err.code,
          message: err.message,
          errorName:
            err.code === 1
              ? 'PERMISSION_DENIED'
              : err.code === 2
              ? 'POSITION_UNAVAILABLE'
              : err.code === 3
              ? 'TIMEOUT'
              : 'UNKNOWN',
        });
        reject(err);
      },
      options
    );
  });
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
  const [accuracyMeters, setAccuracyMeters] = useState<number | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locatingStage, setLocatingStage] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [shouldFly, setShouldFly] = useState(false);
  const [activeSource, setActiveSource] = useState<'gps' | 'manual' | null>(source || null);
  const inFlightRef = useRef(false);

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

  // Two-Stage Location Strategy: Fast Coarse Network fix -> High Accuracy GPS Retry
  const handleUseMyLocation = async () => {
    if (readOnly || isLocating || inFlightRef.current) {
      logDiagnostics('Request Skipped', { reason: 'Already locating or readOnly mode' });
      return;
    }

    setLocationError(null);

    // 1. Check browser Geolocation API support
    if (typeof window === 'undefined' || !('geolocation' in navigator) || !navigator.geolocation) {
      const msg = 'Geolocation is not supported by your browser. Please select your location manually by clicking on the map.';
      logDiagnostics('Unsupported Environment', { message: msg });
      setLocationError(msg);
      return;
    }

    // 2. Check secure context (HTTPS required by modern browsers)
    if (
      typeof window !== 'undefined' &&
      !window.isSecureContext &&
      window.location.hostname !== 'localhost' &&
      window.location.hostname !== '127.0.0.1'
    ) {
      const msg = 'Browser geolocation requires a secure HTTPS connection. Please select your location manually on the map.';
      logDiagnostics('Insecure Context', { message: msg });
      setLocationError(msg);
      return;
    }

    // Check permission status if navigator.permissions API is available
    let permissionState: string = 'unknown';
    if (typeof navigator !== 'undefined' && navigator.permissions && navigator.permissions.query) {
      try {
        const permStatus = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
        permissionState = permStatus.state;
      } catch (e: any) {
        permissionState = `query_error: ${e?.message || e}`;
      }
    }

    const overallStartTime = performance.now();
    logDiagnostics('Starting Two-Stage Geolocation Strategy', {
      permissionState,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    });

    inFlightRef.current = true;
    setIsLocating(true);
    setLocatingStage('Detecting location (Stage 1)...');

    let positionAcquired: GeolocationPosition | null = null;
    let finalError: GeolocationPositionError | Error | null = null;

    // ─── STAGE 1: Fast / Coarse Request ─────────────────────────────────
    // enableHighAccuracy: false avoids forcing cold-start satellite fix on laptops/desktops
    // maximumAge: 120000 allows using a recently cached OS/network fix (within 2 min)
    // timeout: 6000 gives 6 seconds for fast network triangulation
    const stage1Options: PositionOptions = {
      enableHighAccuracy: false,
      timeout: 6000,
      maximumAge: 120000,
    };

    try {
      positionAcquired = await requestPosition(stage1Options, 'Stage 1 (Coarse/Cached)', overallStartTime);
    } catch (err: any) {
      finalError = err;
      // If user explicitly denied permission, do not retry stage 2
      if (err.code === 1 /* PERMISSION_DENIED */) {
        logDiagnostics('Stage 1 encountered PERMISSION_DENIED. Aborting Stage 2.', { code: err.code });
      } else {
        // ─── STAGE 2: High-Accuracy GPS Request Fallback ──────────────────
        logDiagnostics('Stage 1 did not resolve. Falling back to Stage 2 (High-Accuracy GPS)...', {
          stage1ErrorCode: err.code,
          stage1ErrorMessage: err.message,
        });
        setLocatingStage('Refining GPS fix (Stage 2)...');

        const stage2Options: PositionOptions = {
          enableHighAccuracy: true,
          timeout: 12000, // 12-second timeout
          maximumAge: 0,  // Fresh reading
        };

        try {
          positionAcquired = await requestPosition(stage2Options, 'Stage 2 (High Accuracy GPS)', overallStartTime);
          finalError = null; // Cleared on success
        } catch (stage2Err: any) {
          finalError = stage2Err;
        }
      }
    } finally {
      inFlightRef.current = false;
      setIsLocating(false);
      setLocatingStage(null);
    }

    // Process coordinates or handle final error
    if (positionAcquired) {
      const lat = Number(positionAcquired.coords.latitude);
      const lng = Number(positionAcquired.coords.longitude);
      const accuracy = positionAcquired.coords.accuracy;

      // Strict numeric & global coordinate boundary validation
      if (
        isNaN(lat) ||
        isNaN(lng) ||
        lat < -90 ||
        lat > 90 ||
        lng < -180 ||
        lng > 180 ||
        (lat === 0 && lng === 0)
      ) {
        logDiagnostics('Position Rejected (Invalid Coordinates)', { lat, lng });
        setLocationError(
          'GPS returned invalid coordinates (out of bounds or 0,0). Please click directly on the map to pin your location manually.'
        );
        return;
      }

      logDiagnostics('Position Accepted & Applied', {
        lat,
        lng,
        accuracyMeters: accuracy,
        totalTimeMs: Math.round(performance.now() - overallStartTime),
      });

      const newPos = L.latLng(lat, lng);
      setPosition(newPos);
      setAccuracyMeters(accuracy ? Math.round(accuracy) : null);
      setShouldFly(true);
      setActiveSource('gps');
      setLocationError(null);

      if (onLocationSelect) {
        onLocationSelect(lat, lng, 'gps');
      }
    } else if (finalError) {
      const err = finalError as GeolocationPositionError;
      logDiagnostics('All Geolocation Stages Failed', {
        errorCode: err.code,
        errorMessage: err.message,
        totalTimeMs: Math.round(performance.now() - overallStartTime),
      });

      switch (err.code) {
        case 1: // PERMISSION_DENIED
          setLocationError(
            'Location permission was denied. Please allow location access in your browser address bar (lock/tune icon), or click directly on the map to select your location manually.'
          );
          break;
        case 2: // POSITION_UNAVAILABLE
          setLocationError(
            'Location is unavailable from your device/network provider. Please verify device location services are enabled, or click directly on the map to place your pin.'
          );
          break;
        case 3: // TIMEOUT
          setLocationError(
            'Location request timed out. Your device or network was unable to establish a GPS fix within the timeout period. Please click directly anywhere on the map to set your location manually.'
          );
          break;
        default:
          setLocationError(
            `Unable to acquire location (${err.message || 'unknown error'}). Please select your location manually by clicking on the map.`
          );
          break;
      }
    }
  };

  const handleMapClick = (lat: number, lng: number) => {
    if (readOnly) return;
    const newPos = L.latLng(lat, lng);
    setPosition(newPos);
    setAccuracyMeters(null);
    setShouldFly(false);
    setActiveSource('manual');
    setLocationError(null);

    logDiagnostics('Manual Map Click Location Set', { lat, lng });

    if (onLocationSelect) {
      onLocationSelect(lat, lng, 'manual');
    }
  };

  const handleClearPin = () => {
    setPosition(null);
    setAccuracyMeters(null);
    setActiveSource(null);
    setLocationError(null);
    logDiagnostics('Location Pin Cleared', {});
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
                  <span>{locatingStage || 'Acquiring location...'}</span>
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
                  <CheckCircle2 className="w-3.5 h-3.5" /> GPS Verified {accuracyMeters ? `(±${accuracyMeters}m)` : ''}
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
                ({activeSource === 'gps' ? `Auto-detected via GPS ${accuracyMeters ? `(±${accuracyMeters}m)` : ''}` : 'Selected via Map Click'})
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
