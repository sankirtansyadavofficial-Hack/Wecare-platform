import React, { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { MapPin, Navigation, Calendar, Stethoscope, Search, Map, Clock, ArrowRight, PawPrint } from "lucide-react";
import { useVetMode } from "@/context/vet-mode-context";
import { cn } from "@/lib/utils";

export function HealthCamps() {
  const { isVetMode } = useVetMode();
  const [locationStatus, setLocationStatus] = useState<"prompt" | "locating" | "success" | "denied">("prompt");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Mock human camps
  const humanCamps = [
    { id: 1, name: "City Center Free Vitals Camp", distance: "1.2 km", date: "May 22, 2026", time: "09:00 AM - 02:00 PM", address: "Community Hall, Downtown", specialties: ["General Physician", "Cardiology Check"] },
    { id: 2, name: "Pediatric Vaccination Drive", distance: "3.5 km", date: "May 25, 2026", time: "10:00 AM - 04:00 PM", address: "Riverside Public School", specialties: ["Pediatrics", "Immunization"] },
    { id: 3, name: "Eye & Dental Free Checkup", distance: "5.0 km", date: "June 02, 2026", time: "08:30 AM - 01:00 PM", address: "Lions Club Ground", specialties: ["Ophthalmology", "Dentistry"] }
  ];

  // Mock veterinary/animal camps
  const vetCamps = [
    { id: 1, name: "Free Rabies & Deworming Camp", distance: "0.9 km", date: "May 22, 2026", time: "09:00 AM - 03:00 PM", address: "Greenfield Park Pavilion", specialties: ["Anti-Rabies Shots", "Deworming Check"] },
    { id: 2, name: "Stray Animal Spay & Neuter Camp", distance: "2.4 km", date: "May 26, 2026", time: "08:00 AM - 05:00 PM", address: "Happy Paws Rescue Shelter", specialties: ["Surgical Spaying", "Welfare Check"] },
    { id: 3, name: "Pet Nutrition & Wellness Drive", distance: "4.1 km", date: "June 01, 2026", time: "10:00 AM - 02:00 PM", address: "Community Pet Park", specialties: ["Basic Vitals", "Nutrition Counseling"] }
  ];

  const camps = isVetMode ? vetCamps : humanCamps;

  const requestLocation = () => {
    setLocationStatus("locating");
    setTimeout(() => {
      const success = Math.random() > 0.3;
      setLocationStatus(success ? "success" : "denied");
      if (success) {
        setIsLoading(true);
        setTimeout(() => setIsLoading(false), 1000);
      }
    }, 1500);
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery) {
      setLocationStatus("success");
      setIsLoading(true);
      setTimeout(() => setIsLoading(false), 1000);
    }
  };

  return (
    <div className="min-h-screen bg-transparent w-full pb-24">
      <PageHeader 
        title={isVetMode ? "Pet & Animal Welfare Camps" : "Health Camp Locator"} 
        description={isVetMode ? "Find free rabies vaccination drives, pet wellness checks, and local stray sterilizations happening near your location." : "Find free health checkup camps and specialized medical drives happening near your location."} 
        icon={isVetMode ? PawPrint : MapPin} 
      />

      <div className="max-w-6xl mx-auto px-6 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Sidebar Controls */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 rounded-3xl p-6 shadow-sm">
             <h3 className="font-bold text-gray-900 dark:text-white mb-4">Location Services</h3>
             
             {locationStatus === "prompt" && (
                <div className="text-center py-6">
                  <div className={cn(
                    "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4",
                    isVetMode ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500" : "bg-blue-50 dark:bg-blue-500/10 text-blue-500"
                  )}>
                    <Navigation className="w-8 h-8" />
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 font-medium">
                    {isVetMode ? "Allow location access to instantly find pet wellness camps nearest to you." : "Allow location access to instantly find health camps nearest to you."}
                  </p>
                  <button 
                    onClick={requestLocation} 
                    className={cn(
                      "w-full text-white font-bold py-3 rounded-xl hover:shadow-lg transition-all",
                      isVetMode ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20" : "bg-gray-900 dark:bg-white dark:text-black"
                    )}
                  >
                    Locate Me
                  </button>
                </div>
             )}

             {locationStatus === "locating" && (
                <div className="py-8 flex flex-col items-center justify-center">
                  <div className={cn(
                    "w-8 h-8 border-4 border-t-transparent rounded-full animate-spin mb-4",
                    isVetMode ? "border-emerald-500" : "border-blue-500"
                  )}></div>
                  <p className="text-sm font-bold text-gray-500 animate-pulse">Detecting your location...</p>
                </div>
             )}

             {(locationStatus === "success" || locationStatus === "denied") && (
                <form onSubmit={handleManualSearch} className="space-y-4 animate-in fade-in">
                  {locationStatus === "denied" && (
                    <p className="text-xs font-bold text-red-500 mb-2">Location access denied. Please enter zip or city manually.</p>
                  )}
                  {locationStatus === "success" && (
                    <div className={cn(
                      "flex items-center gap-2 text-sm font-bold mb-4 p-3 rounded-xl",
                      isVetMode ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10" : "text-green-600 bg-green-50 dark:bg-green-500/10"
                    )}>
                      <MapPin className="w-4 h-4" /> Location Locked (Downtown Area)
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Change Location</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400" />
                      </div>
                      <input 
                        type="text" 
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className={cn(
                          "w-full bg-white/60 dark:bg-zinc-900/60 border border-gray-200 dark:border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-gray-900 dark:text-white outline-none transition-all text-sm focus:ring-2",
                          isVetMode ? "focus:ring-emerald-500/50" : "focus:ring-blue-500/50"
                        )} 
                        placeholder="Enter PIN code or City" 
                      />
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-900 dark:text-white font-bold py-2.5 rounded-xl transition-colors text-sm">
                    Update Area
                  </button>
                </form>
             )}
          </div>
        </div>

        {/* Results Area */}
        <div className="lg:col-span-2">
          {locationStatus === "prompt" || locationStatus === "locating" ? (
            <div className="bg-white/20 dark:bg-black/20 backdrop-blur-md rounded-3xl border border-dashed border-gray-300 dark:border-white/10 h-full min-h-[400px] flex flex-col items-center justify-center p-8 text-center">
               <Map className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
               <h3 className="text-xl font-bold text-gray-400 dark:text-gray-500">Provide location to view camps</h3>
               <p className="text-gray-400 dark:text-gray-600 font-medium mt-2">The map and list will populate based on your proximity.</p>
            </div>
          ) : isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white/40 dark:bg-black/40 rounded-2xl p-6 h-40 animate-pulse border border-gray-200/50 dark:border-white/10">
                   <div className="h-6 w-1/2 bg-gray-200 dark:bg-zinc-800 rounded mb-4"></div>
                   <div className="h-4 w-1/3 bg-gray-200 dark:bg-zinc-800 rounded mb-2"></div>
                   <div className="h-4 w-1/4 bg-gray-200 dark:bg-zinc-800 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-end mb-6">
                <h2 className="text-xl font-black text-gray-900 dark:text-white">
                  {isVetMode ? `Nearby Vet Camps (${camps.length})` : `Nearby Camps (${camps.length})`}
                </h2>
                <div className="flex bg-gray-100 dark:bg-zinc-900 rounded-lg p-1">
                  <button className="px-3 py-1.5 text-xs font-bold bg-white dark:bg-zinc-800 shadow-sm rounded-md text-gray-900 dark:text-white">List View</button>
                  <button className="px-3 py-1.5 text-xs font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">Map View</button>
                </div>
              </div>

              {camps.map(camp => (
                <div key={camp.id} className="bg-white/60 dark:bg-black/60 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 rounded-2xl p-6 hover:shadow-lg dark:hover:bg-white/5 transition-all group">
                  <div className="flex flex-col sm:flex-row justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className={cn(
                          "font-bold text-xl text-gray-900 dark:text-white transition-colors",
                          isVetMode ? "group-hover:text-emerald-600 dark:group-hover:text-emerald-400" : "group-hover:text-blue-600 dark:group-hover:text-blue-400"
                        )}>{camp.name}</h3>
                        <span className={cn(
                          "text-xs font-bold px-2 py-1 rounded-md border",
                          isVetMode 
                            ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20"
                            : "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-500/20"
                        )}>{camp.distance}</span>
                      </div>
                      <p className="text-sm font-medium text-gray-500 flex items-center gap-2 mb-4">
                        <MapPin className="w-4 h-4" /> {camp.address}
                      </p>
                      
                      <div className="flex flex-wrap gap-2">
                        {camp.specialties.map(spec => (
                          <span key={spec} className="inline-flex items-center gap-1.5 bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 text-xs font-bold px-2.5 py-1 rounded-full border border-gray-200 dark:border-zinc-700">
                            {isVetMode ? <PawPrint className="w-3 h-3 text-emerald-500" /> : <Stethoscope className="w-3 h-3" />} {spec}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="sm:text-right flex flex-col justify-between items-start sm:items-end gap-4 min-w-[140px] border-t sm:border-t-0 sm:border-l border-gray-200/50 dark:border-white/10 pt-4 sm:pt-0 sm:pl-6">
                       <div>
                         <p className="text-sm font-bold text-gray-900 dark:text-white flex items-center justify-start sm:justify-end gap-1.5 mb-1">
                           <Calendar className="w-4 h-4 text-gray-400" /> {camp.date}
                         </p>
                         <p className="text-xs font-medium text-gray-500 flex items-center justify-start sm:justify-end gap-1.5">
                           <Clock className="w-3.5 h-3.5" /> {camp.time}
                         </p>
                       </div>
                       
                       <button className={cn(
                         "w-full sm:w-auto text-white font-bold py-2.5 px-6 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2",
                         isVetMode ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20" : "bg-blue-600 hover:bg-blue-700"
                       )}>
                         Directions <ArrowRight className="w-4 h-4" />
                       </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

