import React, { useState, useEffect, useCallback } from "react";
import { Navigation, MapPin, Star, Clock, Briefcase, Phone, ShieldCheck, Calendar, X, ChevronRight, Locate } from "lucide-react";
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow } from "@vis.gl/react-google-maps";
import { Doctor } from "@/lib/doctors-data";
import { Coordinates, calculateDistanceInKm } from "@/lib/locationService";
import { cn } from "@/lib/utils";

interface LocationMapProps {
  doctors: Doctor[];
  userLocation: Coordinates | null;
  isVetMode: boolean;
  onRequestLocation: () => Promise<boolean>;
  onBook?: (doctorName: string, type: string) => void;
}

export function LocationMap({ doctors, userLocation, isVetMode, onRequestLocation, onBook }: LocationMapProps) {
  const GOOGLE_MAPS_API_KEY = 
    (import.meta as any).env.VITE_GOOGLE_MAPS_API_KEY || "YOUR_GOOGLE_MAPS_API_KEY_HERE";

  const defaultCenter = { lat: 40.7128, lng: -74.0060 };
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [mapZoom, setMapZoom] = useState(12);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [hoveredDoctorId, setHoveredDoctorId] = useState<number | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [showNearbyDoctors, setShowNearbyDoctors] = useState(false);
  const [nearbyDoctors, setNearbyDoctors] = useState<Doctor[]>([]);
  const [pulseUser, setPulseUser] = useState(false);

  // Center map on user location when available
  useEffect(() => {
    if (userLocation) {
      setMapCenter(userLocation);
    } else if (doctors.length > 0 && doctors[0].coordinates) {
      setMapCenter(doctors[0].coordinates);
    }
  }, [userLocation, doctors]);

  // Calculate nearby doctors when user location or showNearby changes
  useEffect(() => {
    if (showNearbyDoctors && userLocation) {
      const nearby = doctors
        .filter(d => d.coordinates)
        .map(d => ({
          ...d,
          distance: calculateDistanceInKm(userLocation.lat, userLocation.lng, d.coordinates!.lat, d.coordinates!.lng)
        }))
        .filter(d => d.distance <= 50) // within 50km
        .sort((a, b) => a.distance - b.distance);
      setNearbyDoctors(nearby);
    } else {
      setNearbyDoctors([]);
    }
  }, [showNearbyDoctors, userLocation, doctors]);

  // Locate Me handler with animation
  const handleLocateMe = useCallback(async () => {
    setIsLocating(true);
    try {
      const success = await onRequestLocation();
      if (success) {
        setShowNearbyDoctors(true);
        setPulseUser(true);
        setTimeout(() => setPulseUser(false), 3000);
        // Zoom in closer
        setMapZoom(13);
      } else {
        alert("Could not retrieve location. Please check browser permissions.");
      }
    } finally {
      setIsLocating(false);
    }
  }, [onRequestLocation]);

  const displayDoctors = showNearbyDoctors && nearbyDoctors.length > 0 ? nearbyDoctors : doctors;

  const getDistance = (doc: Doctor): string | null => {
    if (!userLocation || !doc.coordinates) return null;
    const km = calculateDistanceInKm(userLocation.lat, userLocation.lng, doc.coordinates.lat, doc.coordinates.lng);
    return km < 1 ? `${Math.round(km * 1000)}m` : `${km.toFixed(1)}km`;
  };

  return (
    <div className="w-full mt-4 space-y-4">
      
      {/* Top Controls Bar */}
      <div className="flex items-center justify-between gap-3 relative z-10">
        {/* Nearby doctors count */}
        <div className="flex items-center gap-3">
          {showNearbyDoctors && userLocation && (
            <div className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black border backdrop-blur-md animate-in fade-in slide-in-from-left-4 duration-300",
              isVetMode 
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400" 
                : "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400"
            )}>
              <MapPin className="w-3.5 h-3.5" />
              {nearbyDoctors.length} nearby {isVetMode ? "vets" : "doctors"} found
            </div>
          )}
        </div>

        {/* Locate Me Button */}
        <button
          onClick={handleLocateMe}
          disabled={isLocating}
          className={cn(
            "flex items-center gap-2 px-5 py-3 backdrop-blur-md border rounded-xl font-bold transition-all shadow-sm active:scale-95 disabled:opacity-60",
            showNearbyDoctors && userLocation
              ? (isVetMode 
                  ? "bg-emerald-600 border-emerald-500 text-white shadow-emerald-500/20" 
                  : "bg-red-600 border-red-500 text-white shadow-red-500/20")
              : "bg-white/40 dark:bg-black/40 border-gray-200/50 dark:border-white/10 text-gray-900 dark:text-white hover:bg-white/80 dark:hover:bg-black/80"
          )}
        >
          {isLocating ? (
            <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
          ) : (
            <Locate className={cn("w-4 h-4", showNearbyDoctors ? "text-current" : (isVetMode ? "text-emerald-500" : "text-red-500"))} />
          )}
          {isLocating ? "Locating..." : (showNearbyDoctors ? "Showing Nearby" : "Locate Me")}
        </button>
      </div>

      {/* Map Container */}
      <div className={cn(
        "h-[550px] w-full rounded-3xl overflow-hidden shadow-xl border relative",
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
              zoom={mapZoom}
              center={mapCenter}
              onCenterChanged={(ev) => setMapCenter(ev.detail.center)}
              onZoomChanged={(ev) => setMapZoom(ev.detail.zoom)}
              mapId="INTERACTIVE_LOCATION_MAP"
              disableDefaultUI={true}
              clickableIcons={false}
              onClick={() => setSelectedDoctor(null)}
            >
              {/* Doctor Markers */}
              {displayDoctors.map((doc) => {
                if (!doc.coordinates) return null;
                const isHovered = hoveredDoctorId === doc.id;
                const isSelected = selectedDoctor?.id === doc.id;

                return (
                  <AdvancedMarker 
                    key={doc.id} 
                    position={doc.coordinates} 
                    title={doc.name}
                    onClick={() => setSelectedDoctor(doc)}
                    onMouseEnter={() => setHoveredDoctorId(doc.id)}
                    onMouseLeave={() => setHoveredDoctorId(null)}
                    zIndex={isSelected ? 100 : (isHovered ? 50 : 1)}
                  >
                    {/* Custom marker with name label */}
                    <div className="flex flex-col items-center cursor-pointer group">
                      {/* Name tooltip on hover */}
                      <div className={cn(
                        "px-2.5 py-1 rounded-lg mb-1 whitespace-nowrap transition-all duration-200 shadow-lg",
                        (isHovered || isSelected)
                          ? "opacity-100 translate-y-0 scale-100"
                          : "opacity-0 translate-y-1 scale-95 pointer-events-none",
                        isVetMode 
                          ? "bg-emerald-600 text-white" 
                          : "bg-red-600 text-white"
                      )}>
                        <span className="text-[10px] font-black">{doc.name}</span>
                      </div>
                      {/* Pin */}
                      <div className={cn(
                        "relative transition-transform duration-200",
                        (isHovered || isSelected) ? "scale-125" : "scale-100"
                      )}>
                        <Pin 
                          background={isVetMode ? "#10b981" : "#ef4444"}
                          borderColor={isVetMode ? "#047857" : "#b91c1c"} 
                          glyphColor={"#ffffff"} 
                        />
                      </div>
                    </div>
                  </AdvancedMarker>
                );
              })}

              {/* User Location Marker */}
              {userLocation && (
                <AdvancedMarker position={userLocation} title="You are here" zIndex={200}>
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      "px-2.5 py-1 bg-blue-600 text-white rounded-lg mb-1 shadow-lg",
                      pulseUser ? "animate-bounce" : ""
                    )}>
                      <span className="text-[10px] font-black">📍 You</span>
                    </div>
                    <div className="relative">
                      {/* Pulsing ring */}
                      <div className="absolute inset-0 w-8 h-8 -m-1 rounded-full bg-blue-500/30 animate-ping"></div>
                      <Pin 
                        background={"#3b82f6"}
                        borderColor={"#1d4ed8"} 
                        glyphColor={"#ffffff"} 
                      />
                    </div>
                  </div>
                </AdvancedMarker>
              )}

              {/* Doctor Info Window (popup on click) */}
              {selectedDoctor && selectedDoctor.coordinates && (
                <InfoWindow 
                  position={selectedDoctor.coordinates}
                  onCloseClick={() => setSelectedDoctor(null)}
                  pixelOffset={[0, -45]}
                  maxWidth={340}
                >
                  <div className="p-1 min-w-[280px]" style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>
                    {/* Header */}
                    <div className="flex gap-3 items-start mb-3">
                      <img 
                        src={selectedDoctor.image} 
                        alt={selectedDoctor.name} 
                        className="w-14 h-14 rounded-xl object-cover shadow-sm flex-shrink-0"
                        style={{ borderRadius: "12px" }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span style={{ fontSize: "14px", fontWeight: 800, color: "#111" }}>{selectedDoctor.name}</span>
                          {selectedDoctor.verified && (
                            <span style={{ color: "#3b82f6" }}>✓</span>
                          )}
                        </div>
                        <div style={{ fontSize: "11px", color: "#6b7280", fontWeight: 600 }}>{selectedDoctor.title}</div>
                        <div style={{ 
                          fontSize: "10px", fontWeight: 700, marginTop: "4px", padding: "2px 8px", 
                          borderRadius: "6px", display: "inline-block",
                          backgroundColor: isVetMode ? "#d1fae5" : "#fef2f2",
                          color: isVetMode ? "#059669" : "#dc2626"
                        }}>
                          {selectedDoctor.specialty}
                        </div>
                      </div>
                    </div>

                    {/* Stats Row */}
                    <div style={{ display: "flex", gap: "12px", marginBottom: "10px", fontSize: "11px", color: "#374151", fontWeight: 600 }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        ⭐ {selectedDoctor.rating} ({selectedDoctor.reviewsCount})
                      </span>
                      <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        💼 {selectedDoctor.experience} yrs
                      </span>
                      {getDistance(selectedDoctor) && (
                        <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "#2563eb", fontWeight: 700 }}>
                          📍 {getDistance(selectedDoctor)}
                        </span>
                      )}
                    </div>

                    {/* Address */}
                    <div style={{ 
                      fontSize: "11px", color: "#6b7280", fontWeight: 500, 
                      padding: "8px 10px", backgroundColor: "#f9fafb", borderRadius: "8px", marginBottom: "10px",
                      lineHeight: "1.5"
                    }}>
                      📍 {selectedDoctor.location}
                    </div>

                    {/* Status & Availability */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                      <span style={{ 
                        fontSize: "10px", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px",
                        color: selectedDoctor.onlineStatus === "online" ? "#059669" : "#9ca3af"
                      }}>
                        <span style={{ 
                          width: "6px", height: "6px", borderRadius: "50%", display: "inline-block",
                          backgroundColor: selectedDoctor.onlineStatus === "online" ? "#10b981" : "#d1d5db"
                        }}></span>
                        {selectedDoctor.onlineStatus === "online" ? "Online Now" : "Offline"}
                      </span>
                      <span style={{ fontSize: "10px", fontWeight: 600, color: "#6b7280" }}>
                        🕐 {selectedDoctor.availability}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button 
                        onClick={() => onBook?.(selectedDoctor.name, "in-person")}
                        style={{ 
                          flex: 1, padding: "10px", borderRadius: "10px", border: "none", cursor: "pointer",
                          fontSize: "11px", fontWeight: 800, color: "#fff",
                          background: isVetMode 
                            ? "linear-gradient(135deg, #059669, #10b981)" 
                            : "linear-gradient(135deg, #dc2626, #ef4444)",
                          boxShadow: isVetMode ? "0 4px 12px rgba(16,185,129,0.3)" : "0 4px 12px rgba(239,68,68,0.3)"
                        }}
                      >
                        📅 Book In-Person
                      </button>
                      <button 
                        onClick={() => onBook?.(selectedDoctor.name, "video")}
                        style={{ 
                          flex: 1, padding: "10px", borderRadius: "10px", border: "1px solid #e5e7eb", 
                          cursor: "pointer", fontSize: "11px", fontWeight: 800, color: "#374151",
                          backgroundColor: "#f9fafb"
                        }}
                      >
                        🎥 Video Consult
                      </button>
                    </div>
                  </div>
                </InfoWindow>
              )}
            </Map>
          </APIProvider>
        )}
      </div>

      {/* Nearby Doctors Sidebar (below map) */}
      {showNearbyDoctors && nearbyDoctors.length > 0 && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between mb-4 mt-2">
            <h4 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
              <MapPin className={cn("w-4 h-4", isVetMode ? "text-emerald-500" : "text-red-500")} />
              Nearby {isVetMode ? "Veterinarians" : "Doctors"} ({nearbyDoctors.length})
            </h4>
            <button 
              onClick={() => setShowNearbyDoctors(false)}
              className="text-xs font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" /> Clear
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {nearbyDoctors.slice(0, 6).map((doc) => (
              <button 
                key={doc.id}
                onClick={() => {
                  setSelectedDoctor(doc);
                  if (doc.coordinates) {
                    setMapCenter(doc.coordinates);
                    setMapZoom(15);
                  }
                }}
                onMouseEnter={() => setHoveredDoctorId(doc.id)}
                onMouseLeave={() => setHoveredDoctorId(null)}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-2xl border backdrop-blur-md transition-all text-left group hover:scale-[1.01] active:scale-[0.99]",
                  selectedDoctor?.id === doc.id 
                    ? (isVetMode 
                        ? "bg-emerald-500/10 border-emerald-500/30" 
                        : "bg-red-500/10 border-red-500/30")
                    : "bg-white/40 dark:bg-black/30 border-gray-200/50 dark:border-white/5 hover:bg-white/80 dark:hover:bg-black/60"
                )}
              >
                <img src={doc.image} alt={doc.name} className="w-11 h-11 rounded-xl object-cover shadow-sm shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{doc.name}</p>
                    {doc.verified && <ShieldCheck className="w-3 h-3 text-blue-500 shrink-0" />}
                  </div>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium truncate">{doc.specialty}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-bold text-yellow-600 dark:text-yellow-400 flex items-center gap-0.5">
                      <Star className="w-2.5 h-2.5 fill-current" /> {doc.rating}
                    </span>
                    {getDistance(doc) && (
                      <span className={cn("text-[10px] font-black", isVetMode ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400")}>
                        {getDistance(doc)} away
                      </span>
                    )}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 shrink-0 transition-colors" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
