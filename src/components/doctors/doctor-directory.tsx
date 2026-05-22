import { useState, useEffect } from "react";
import { 
  Search, Stethoscope, HeartPulse, Sparkles, Brain, Baby, 
  Bone, Microscope, HeartHandshake, Smile, Eye, Dog, Cat, 
  Bird, Scissors, ShieldAlert, X, Star, MapPin, Briefcase, Award, ShieldCheck, List, Map as MapIcon
} from "lucide-react";
import { Doctor, getDoctors } from "@/lib/doctors-data";
import { DoctorCard } from "./doctor-card";
import { ReviewSection } from "./review-section";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation as useGlobalLocation } from "@/context/location-context";
import { calculateDistanceInKm } from "@/lib/locationService";
import { LocationMap } from "./location-map";

interface DoctorDirectoryProps {
  isVetMode: boolean;
  onBook: (doctorName: string, type: string) => void;
  bookingRefreshCounter?: number;
}

// Map human specialty text to Lucide Icons
const humanSpecialties = [
  { name: "All Specialties", icon: Stethoscope },
  { name: "General Medicine", icon: Stethoscope },
  { name: "Cardiology", icon: HeartPulse },
  { name: "Dermatology", icon: Sparkles },
  { name: "Neurology", icon: Brain },
  { name: "Pediatrics", icon: Baby },
  { name: "Orthopedics", icon: Bone },
  { name: "Oncology", icon: Microscope },
  { name: "Gynecology", icon: HeartHandshake },
  { name: "Psychiatry", icon: Smile },
  { name: "Ophthalmology", icon: Eye }
];

// Map vet specialty text to Lucide Icons
const vetSpecialties = [
  { name: "All Specialties", icon: Dog },
  { name: "General Veterinary", icon: Dog },
  { name: "Feline Medicine", icon: Cat },
  { name: "Exotic Pets", icon: Bird },
  { name: "Veterinary Surgery", icon: Scissors },
  { name: "Veterinary Cardiology", icon: HeartPulse }
];

export function DoctorDirectory({ isVetMode, onBook, bookingRefreshCounter = 0 }: DoctorDirectoryProps) {
  const [doctorsList, setDoctorsList] = useState<Doctor[]>(() => getDoctors());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("All Specialties");
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  
  const [showNearbyOnly, setShowNearbyOnly] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  
  // Location context
  const { coordinates, permissionStatus, requestLocation } = useGlobalLocation();

  // Refresh triggers to immediately update review states or locks
  const [reviewRefreshTrigger, setReviewRefreshTrigger] = useState(0);

  // Sync with main state
  useEffect(() => {
    setDoctorsList(getDoctors());
    setSelectedSpecialty("All Specialties");
  }, [isVetMode]);

  // Update lists when review changes occur
  const triggerReviewRefresh = () => {
    setReviewRefreshTrigger(prev => prev + 1);
    setDoctorsList(getDoctors());
  };

  // Sync listing when booking is finished
  useEffect(() => {
    setDoctorsList(getDoctors());
    triggerReviewRefresh();
  }, [bookingRefreshCounter]);

  // Listen for global booking updates (e.g. cancellations or new creations)
  useEffect(() => {
    const handleBookingSync = () => {
      setDoctorsList(getDoctors());
      setReviewRefreshTrigger(prev => prev + 1);
    };
    window.addEventListener("wecare_booking_updated", handleBookingSync);
    return () => {
      window.removeEventListener("wecare_booking_updated", handleBookingSync);
    };
  }, []);

  const activeSpecialties = isVetMode ? vetSpecialties : humanSpecialties;

  // Filter list
  const filteredDoctors = doctorsList.filter(doc => {
    // Mode match
    const isVet = doc.id >= 100;
    if (isVetMode !== isVet) return false;

    // Specialty match
    const matchesSpecialty = 
      selectedSpecialty === "All Specialties" || 
      doc.specialty.toLowerCase() === selectedSpecialty.toLowerCase();

    // Query match
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      doc.name.toLowerCase().includes(query) || 
      doc.specialty.toLowerCase().includes(query) || 
      doc.location.toLowerCase().includes(query);

    // Proximity match
    let matchesProximity = true;
    if (showNearbyOnly && coordinates && doc.coordinates) {
      const distance = calculateDistanceInKm(coordinates.lat, coordinates.lng, doc.coordinates.lat, doc.coordinates.lng);
      matchesProximity = distance <= 25; // within 25km
    }

    return matchesSpecialty && matchesSearch && matchesProximity;
  });

  const handleNearbyToggle = async () => {
    if (permissionStatus === "denied") {
      alert("Location permission is denied. To use 'Nearby Me', please allow location access in your browser or set a manual location in your profile.");
      return;
    }
    
    if (permissionStatus !== "granted" || !coordinates) {
      const success = await requestLocation();
      if (success) {
        setShowNearbyOnly(!showNearbyOnly);
      }
    } else {
      setShowNearbyOnly(!showNearbyOnly);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 mt-12">
      
      {/* 1. Integrated Premium Search Bar & Nearby Toggle */}
      <div className="flex flex-col sm:flex-row gap-4 relative z-10">
        <div className={cn(
          "flex-1 bg-white/40 dark:bg-black/40 backdrop-blur-md border border-gray-200/50 dark:border-white/10 rounded-2xl p-4 shadow-sm flex items-center gap-4 transition-all focus-within:ring-2",
          isVetMode ? "focus-within:ring-emerald-500/50" : "focus-within:ring-red-500/50"
        )}>
          <Search className="text-gray-400 dark:text-gray-500 w-6 h-6 ml-2" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isVetMode ? "Search by vet specialty, clinic, name..." : "Search by specialty, doctor name, clinic..."} 
            className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder:text-gray-500 text-lg py-2"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")} 
              className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <X className="w-5 h-5 mr-1" />
            </button>
          )}
        </div>

        <button
          onClick={handleNearbyToggle}
          className={cn(
            "flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-black transition-all shadow-sm active:scale-95 whitespace-nowrap border",
            showNearbyOnly
              ? (isVetMode 
                  ? "bg-emerald-600 border-emerald-500 text-white shadow-emerald-500/20" 
                  : "bg-red-600 border-red-500 text-white shadow-red-500/20")
              : "bg-white/40 dark:bg-black/30 border-gray-200/50 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-white/10"
          )}
        >
          <MapPin className={cn("w-5 h-5", showNearbyOnly ? "text-white" : "text-gray-400")} />
          Nearby Me
        </button>
      </div>

      {/* 2. Premium Specialty Horizontal Scroller with Custom Icons */}
      <div className="mt-8 relative z-10">
        <h4 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">
          Browse Specialties
        </h4>
        
        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-zinc-800 mask-image">
          {activeSpecialties.map((spec) => {
            const Icon = spec.icon;
            const isSelected = selectedSpecialty.toLowerCase() === spec.name.toLowerCase();

            return (
              <button
                key={spec.name}
                onClick={() => setSelectedSpecialty(spec.name)}
                className={cn(
                  "flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-xs whitespace-nowrap border transition-all active:scale-95 duration-200 shrink-0",
                  isSelected
                    ? (isVetMode 
                        ? "bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                        : "bg-red-600 border-red-500 text-white shadow-lg shadow-red-500/20")
                    : "bg-white/40 dark:bg-black/30 text-gray-700 dark:text-zinc-400 border-gray-200/50 dark:border-white/5 hover:bg-white/80 dark:hover:bg-white/5"
                )}
              >
                <Icon className={cn("w-4.5 h-4.5 shrink-0", isSelected ? "text-white" : "text-gray-500 dark:text-zinc-400")} />
                <span>{spec.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Grid of Doctor Cards or Map View */}
      <div className="mt-12">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">
            {filteredDoctors.length} {isVetMode ? "Veterinarians" : "Healthcare Professionals"} Found
          </h3>
          
          {/* View Toggle */}
          <div className="flex bg-white/40 dark:bg-black/40 backdrop-blur-md border border-gray-200/50 dark:border-white/10 rounded-xl p-1 shadow-sm">
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all",
                viewMode === "list"
                  ? (isVetMode ? "bg-emerald-600 text-white" : "bg-red-600 text-white")
                  : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              <List className="w-4 h-4" />
              List
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all",
                viewMode === "map"
                  ? (isVetMode ? "bg-emerald-600 text-white" : "bg-red-600 text-white")
                  : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              <MapIcon className="w-4 h-4" />
              Map
            </button>
          </div>
        </div>

        <AnimatePresence mode="popLayout">
          {filteredDoctors.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white/30 dark:bg-black/20 border border-dashed border-gray-200 dark:border-white/10 rounded-3xl p-16 text-center"
            >
              <ShieldAlert className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
              <h4 className="text-lg font-black text-gray-900 dark:text-white">No matches found</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 max-w-sm mx-auto leading-relaxed">
                We couldn't find any specialist matching your search. Try resetting filters or updating your query.
              </p>
            </motion.div>
          ) : viewMode === "map" ? (
            <motion.div
              key="map-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <LocationMap 
                doctors={filteredDoctors} 
                userLocation={coordinates} 
                isVetMode={isVetMode} 
                onRequestLocation={requestLocation} 
              />
            </motion.div>
          ) : (
            <motion.div 
              key="list-view"
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {filteredDoctors.map((doc) => {
                let distanceKm;
                if (coordinates && doc.coordinates) {
                  distanceKm = calculateDistanceInKm(coordinates.lat, coordinates.lng, doc.coordinates.lat, doc.coordinates.lng);
                }
                return (
                  <DoctorCard
                    key={doc.id}
                    doctor={doc}
                    isVetMode={isVetMode}
                    distanceKm={distanceKm}
                    onViewProfile={(d) => setSelectedDoctor(d)}
                    onBook={onBook}
                  />
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 4. Sliding Premium Side Drawer for Profile Details & Gated Reviews */}
      <AnimatePresence>
        {selectedDoctor && (
          <>
            {/* Drawer Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDoctor(null)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md cursor-pointer"
            />

            {/* Slider Sheet Container */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-xl bg-white dark:bg-zinc-950 shadow-2xl border-l border-gray-200 dark:border-white/10 flex flex-col justify-between"
            >
              
              {/* Profile Drawer Header */}
              <div className="p-6 border-b border-gray-200 dark:border-white/10 flex justify-between items-center bg-gray-50/50 dark:bg-black/25">
                <div className="flex items-center gap-2">
                  <Award className={cn("w-5 h-5", isVetMode ? "text-emerald-500" : "text-red-500")} />
                  <span className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">
                    Physician Profile Profile
                  </span>
                </div>
                <button
                  onClick={() => setSelectedDoctor(null)}
                  className="w-9 h-9 rounded-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-white hover:scale-105 active:scale-95 transition-all shadow-sm"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Drawer Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-zinc-800">
                
                {/* Doctor Visual Portait Hero Card */}
                <div className="flex flex-col sm:flex-row gap-5 items-center bg-white/40 dark:bg-white/5 border border-gray-200/50 dark:border-white/5 rounded-3xl p-5 shadow-inner">
                  <div className="relative w-28 h-28 rounded-2xl overflow-hidden shrink-0 border border-gray-200/30 dark:border-white/10 shadow-md">
                    <img 
                      src={selectedDoctor.image} 
                      alt={selectedDoctor.name} 
                      className="w-full h-full object-cover"
                    />
                    <span className={cn(
                      "absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-white dark:border-zinc-900",
                      selectedDoctor.onlineStatus === "online" ? "bg-green-500 animate-pulse" : "bg-gray-400"
                    )} />
                  </div>

                  <div className="text-center sm:text-left flex-1 min-w-0">
                    <div className="flex items-center justify-center sm:justify-start gap-1.5 flex-wrap">
                      <h3 className="text-2xl font-black text-gray-900 dark:text-white truncate">
                        {selectedDoctor.name}
                      </h3>
                      {selectedDoctor.verified && (
                        <ShieldCheck className={cn(
                          "w-5 h-5 shrink-0", 
                          isVetMode ? "text-emerald-500" : "text-red-500"
                        )} />
                      )}
                    </div>
                    
                    <p className="text-xs font-bold text-gray-400 dark:text-gray-500 mt-1 uppercase tracking-wider">
                      {selectedDoctor.title}
                    </p>
                    
                    <span className={cn(
                      "inline-block text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full mt-3 border",
                      isVetMode 
                        ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20"
                        : "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-100 dark:border-red-500/20"
                    )}>
                      {selectedDoctor.specialty}
                    </span>
                  </div>
                </div>

                {/* Detailed Biography Block */}
                <div>
                  <h4 className="text-sm font-black text-gray-900 dark:text-white mb-3 uppercase tracking-wider">
                    Professional Biography
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed font-medium bg-gray-50/50 dark:bg-white/5 border border-gray-200/20 dark:border-white/5 p-4 rounded-2xl">
                    {selectedDoctor.bio}
                  </p>
                </div>

                {/* Location & Experience stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50/50 dark:bg-white/5 border border-gray-200/20 dark:border-white/5 p-4 rounded-2xl text-xs space-y-1">
                    <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase">
                      Clinical Location
                    </span>
                    <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300 font-bold mt-1">
                      <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                      <span className="truncate">{selectedDoctor.location}</span>
                    </div>
                  </div>

                  <div className="bg-gray-50/50 dark:bg-white/5 border border-gray-200/20 dark:border-white/5 p-4 rounded-2xl text-xs space-y-1">
                    <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase">
                      Practice Experience
                    </span>
                    <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300 font-bold mt-1">
                      <Briefcase className="w-4 h-4 text-gray-400 shrink-0" />
                      <span>{selectedDoctor.experience} Years Active</span>
                    </div>
                  </div>
                </div>

                {/* Interactive Gated Review Section */}
                <ReviewSection
                  doctorId={selectedDoctor.id}
                  isVetMode={isVetMode}
                  refreshTrigger={reviewRefreshTrigger}
                  onReviewAdded={triggerReviewRefresh}
                />

              </div>

              {/* Drawer Footer booking triggers */}
              <div className="p-6 border-t border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-black/25 flex gap-4">
                <button
                  onClick={() => {
                    onBook(selectedDoctor.name, "in-person");
                    setSelectedDoctor(null);
                  }}
                  className="flex-1 bg-gray-900 dark:bg-white text-white dark:text-black font-extrabold py-3.5 rounded-xl text-xs hover:scale-[1.02] active:scale-98 transition-all shadow-md focus:outline-none"
                >
                  Book In-Person Visit
                </button>
                <button
                  onClick={() => {
                    onBook(selectedDoctor.name, "video");
                    setSelectedDoctor(null);
                  }}
                  className={cn(
                    "flex-1 font-extrabold py-3.5 rounded-xl text-xs border hover:scale-[1.02] active:scale-98 transition-all shadow-md focus:outline-none",
                    isVetMode
                      ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20 hover:bg-emerald-100/50"
                      : "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-100 dark:border-red-500/20 hover:bg-red-100/50"
                  )}
                >
                  Book Video Consult
                </button>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
