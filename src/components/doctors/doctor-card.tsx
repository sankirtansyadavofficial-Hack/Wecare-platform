import { useState } from "react";
import { Star, MapPin, Briefcase, ShieldCheck, ChevronDown, Calendar, Video, Clock } from "lucide-react";
import { Doctor } from "@/lib/doctors-data";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface DoctorCardProps {
  key?: any;
  doctor: Doctor;
  isVetMode: boolean;
  distanceKm?: number;
  onViewProfile: (doctor: Doctor) => void;
  onBook: (doctorName: string, type: string) => void;
}

export function DoctorCard({ doctor, isVetMode, distanceKm, onViewProfile, onBook }: DoctorCardProps): any {
  const [showBookOptions, setShowBookOptions] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="bg-white/40 dark:bg-black/40 backdrop-blur-md rounded-3xl p-6 border border-gray-200/50 dark:border-white/10 flex flex-col justify-between hover:shadow-xl hover:shadow-red-500/5 dark:hover:shadow-emerald-500/5 hover:border-gray-300 dark:hover:border-white/20 transition-all duration-300 group relative overflow-hidden"
    >
      {/* Dynamic Ambient Background Glow on Hover */}
      <div className={cn(
        "absolute -right-24 -bottom-24 w-48 h-48 rounded-full blur-3xl opacity-0 group-hover:opacity-15 transition-opacity duration-500 pointer-events-none bg-gradient-to-r",
        isVetMode ? "from-emerald-500 to-teal-500" : "from-red-500 to-orange-500"
      )} />

      <div>
        {/* Upper Details Layout */}
        <div className="flex gap-4 items-start relative z-10">
          {/* Avatar Container with Active Status Indicator */}
          <div className="relative w-20 h-20 md:w-24 md:h-24 flex-shrink-0 rounded-2xl overflow-hidden shadow-inner border border-gray-200/30 dark:border-white/10">
            <img
              src={doctor.image}
              alt={doctor.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {/* Status Dot */}
            <span className={cn(
              "absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-zinc-900 shadow-md",
              doctor.onlineStatus === "online" 
                ? "bg-green-500 animate-pulse" 
                : "bg-gray-400"
            )} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-lg font-black text-gray-900 dark:text-white truncate group-hover:text-red-600 dark:group-hover:text-emerald-400 transition-colors duration-300">
                {doctor.name}
              </h3>
              {doctor.verified && (
                <ShieldCheck className={cn(
                  "w-4 h-4 shrink-0", 
                  isVetMode ? "text-emerald-500" : "text-red-500"
                )} />
              )}
            </div>
            
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 mt-0.5">
              {doctor.title}
            </p>

            <span className={cn(
              "inline-block text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md mt-2 border",
              isVetMode 
                ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20"
                : "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-100 dark:border-red-500/20"
            )}>
              {doctor.specialty}
            </span>
          </div>
        </div>

        {/* Middle Stats Section */}
        <div className="grid grid-cols-2 gap-3 mt-5 bg-gray-50/50 dark:bg-white/5 rounded-2xl p-3.5 border border-gray-100 dark:border-white/5 text-xs relative z-10">
          <div className="flex items-center gap-2 font-semibold text-gray-600 dark:text-gray-300">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 shrink-0" />
            <span>
              {doctor.rating} <span className="text-gray-400 dark:text-gray-500 font-normal">({doctor.reviewsCount} reviews)</span>
            </span>
          </div>

          <div className="flex items-center gap-2 font-semibold text-gray-600 dark:text-gray-300">
            <Briefcase className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" />
            <span>{doctor.experience} years exp</span>
          </div>

          <div className="flex flex-col col-span-2">
            <div className="flex items-center gap-2 font-semibold text-gray-600 dark:text-gray-300">
              <MapPin className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" />
              <span className="truncate">{doctor.location}</span>
            </div>
            {distanceKm !== undefined && (
              <div className="flex items-center gap-2 mt-1 ml-6 text-[10px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-md w-max border border-indigo-100 dark:border-indigo-500/20">
                • {distanceKm < 1 ? "Within 1 km" : `${distanceKm.toFixed(1)} km away`}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2 font-semibold text-gray-600 dark:text-gray-300 col-span-2 border-t border-gray-200/50 dark:border-white/5 pt-2 mt-1">
            <Clock className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" />
            <span className={cn(
              "font-bold", 
              doctor.availability.includes("Now") 
                ? "text-green-600 dark:text-green-400" 
                : "text-gray-500 dark:text-gray-400"
            )}>
              {doctor.availability}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons Funnel */}
      <div className="mt-6 flex flex-col sm:flex-row gap-3 relative z-10">
        <button
          onClick={() => onViewProfile(doctor)}
          className="flex-1 bg-white/50 hover:bg-white dark:bg-white/5 dark:hover:bg-white/10 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 font-bold py-2.5 rounded-xl text-xs transition-colors shadow-sm focus:outline-none"
        >
          View Profile & Reviews
        </button>

        <div className="flex-1 relative">
          <button
            onClick={() => setShowBookOptions(!showBookOptions)}
            className={cn(
              "w-full text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm focus:outline-none",
              isVetMode ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"
            )}
          >
            <span>Book Appointment</span>
            <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-300", showBookOptions && "rotate-180")} />
          </button>

          {/* Book Appointment Dropdown Menu */}
          <AnimatePresence>
            {showBookOptions && (
              <>
                {/* Click outside overlay */}
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowBookOptions(false)} 
                />
                
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 5, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 bottom-full sm:bottom-auto sm:top-full z-50 w-full bg-white dark:bg-zinc-950 border border-gray-200 dark:border-white/10 rounded-2xl shadow-xl p-2 flex flex-col gap-1.5"
                >
                  <button
                    onClick={() => {
                      onBook(doctor.name, "in-person");
                      setShowBookOptions(false);
                    }}
                    className="w-full hover:bg-gray-50 dark:hover:bg-white/5 text-gray-800 dark:text-gray-200 text-left font-bold px-3 py-2.5 rounded-xl text-[11px] flex items-center gap-2 transition-colors"
                  >
                    <Calendar className={cn("w-4 h-4 shrink-0", isVetMode ? "text-emerald-500" : "text-red-500")} />
                    <div>
                      <div>Book In-Person Visit</div>
                      <div className="text-[9px] text-gray-400 font-normal mt-0.5">Consult at the clinic chamber</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      onBook(doctor.name, "video");
                      setShowBookOptions(false);
                    }}
                    className="w-full hover:bg-gray-50 dark:hover:bg-white/5 text-gray-800 dark:text-gray-200 text-left font-bold px-3 py-2.5 rounded-xl text-[11px] flex items-center gap-2 transition-colors border-t border-gray-100 dark:border-white/5"
                  >
                    <Video className={cn("w-4 h-4 shrink-0", isVetMode ? "text-emerald-500" : "text-red-500")} />
                    <div>
                      <div>Book Video Consult</div>
                      <div className="text-[9px] text-gray-400 font-normal mt-0.5">Instant online high-def call</div>
                    </div>
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
