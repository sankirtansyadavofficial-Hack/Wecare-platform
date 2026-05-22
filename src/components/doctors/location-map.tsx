import React, { useState, useEffect } from "react";
import { Navigation } from "lucide-react";
import { APIProvider, Map, AdvancedMarker, Pin } from "@vis.gl/react-google-maps";
import { Doctor } from "@/lib/doctors-data";
import { Coordinates } from "@/lib/locationService";
import { cn } from "@/lib/utils";

interface LocationMapProps {
  doctors: Doctor[];
  userLocation: Coordinates | null;
  isVetMode: boolean;
  onRequestLocation: () => Promise<boolean>;
}

export function LocationMap({ doctors, userLocation, isVetMode, onRequestLocation }: LocationMapProps) {
  // 1. Setup API Key from Environment
  const GOOGLE_MAPS_API_KEY = 
    (import.meta as any).env.VITE_GOOGLE_MAPS_API_KEY || "YOUR_GOOGLE_MAPS_API_KEY_HERE";

  // 2. Setup coordinates (defaulting to New York if no user location is available)
  const defaultCenter = { lat: 40.7128, lng: -74.0060 };
  const [mapCenter, setMapCenter] = useState(defaultCenter);

  // Center the map when user location is found/updated
  useEffect(() => {
    if (userLocation) {
      setMapCenter(userLocation);
    } else if (doctors.length > 0 && doctors[0].coordinates) {
      // If no user location, center on the first doctor found
      setMapCenter(doctors[0].coordinates);
    }
  }, [userLocation, doctors]);

  // 3. Browser Location Request Handler (via our global context method passed as prop)
  const handleGetLocation = async () => {
    const success = await onRequestLocation();
    if (!success) {
      alert("Could not retrieve location. Please check browser permissions.");
    }
  };

  return (
    <div className="w-full mt-8 space-y-4">
      
      {/* Geolocation Button */}
      <div className="flex justify-end relative z-10">
        <button
          onClick={handleGetLocation}
          className="flex items-center gap-2 px-5 py-3 bg-white/40 dark:bg-black/40 hover:bg-white/80 dark:hover:bg-black/80 backdrop-blur-md border border-gray-200/50 dark:border-white/10 text-gray-900 dark:text-white rounded-xl font-bold transition-all shadow-sm focus:outline-none"
        >
          <Navigation className={cn("w-4 h-4 fill-current animate-pulse", isVetMode ? "text-emerald-500" : "text-red-500")} />
          Use My Location
        </button>
      </div>

      {/* Google Map Display */}
      <div className={cn(
        "h-[500px] w-full rounded-3xl overflow-hidden shadow-lg border relative",
        isVetMode ? "border-emerald-500/20 shadow-emerald-500/5" : "border-red-500/20 shadow-red-500/5"
      )}>
        {GOOGLE_MAPS_API_KEY === "YOUR_GOOGLE_MAPS_API_KEY_HERE" ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-gray-50/90 dark:bg-zinc-900/90 backdrop-blur-sm z-20 text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center mb-4">
              <Navigation className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">
              Google Maps API Key Required
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md">
              To enable the interactive map view, please add your Google Maps API key to the <code className="bg-gray-200 dark:bg-black px-1.5 py-0.5 rounded text-xs font-mono">.env</code> file as <code className="bg-gray-200 dark:bg-black px-1.5 py-0.5 rounded text-xs font-mono">VITE_GOOGLE_MAPS_API_KEY</code>.
            </p>
          </div>
        ) : (
          <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
            <Map
              defaultZoom={12}
              center={mapCenter}
              onCenterChanged={(ev) => setMapCenter(ev.detail.center)}
              mapId="INTERACTIVE_LOCATION_MAP"
              disableDefaultUI={true}
            >
              {/* Custom Location Markers for Doctors */}
              {doctors.map((doc) => {
                if (!doc.coordinates) return null;
                return (
                  <AdvancedMarker key={doc.id} position={doc.coordinates} title={doc.name}>
                    <Pin 
                      background={isVetMode ? "#10b981" : "#ef4444"} // Emerald or Red
                      borderColor={isVetMode ? "#047857" : "#b91c1c"} 
                      glyphColor={"#ffffff"} 
                    />
                  </AdvancedMarker>
                );
              })}

              {/* Blue pin showing where the user is */}
              {userLocation && (
                <AdvancedMarker position={userLocation} title="You are here">
                  <Pin 
                    background={"#3b82f6"} // Blue background pin
                    borderColor={"#1d4ed8"} 
                    glyphColor={"#ffffff"} 
                  />
                </AdvancedMarker>
              )}
            </Map>
          </APIProvider>
        )}
      </div>

    </div>
  );
}
