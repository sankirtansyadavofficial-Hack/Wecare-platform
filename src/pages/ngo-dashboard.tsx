import { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { 
  Building2, Users, CalendarCheck, Award, FileText, CheckCircle2, 
  XCircle, Clock, Video, ArrowRight, Heart, ShieldCheck, PawPrint, 
  PlusCircle, Sparkles, Settings
} from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/context/auth-context";
import { getDoctors } from "@/lib/doctors-data";
import { useBookings, cancelFirestoreBooking } from "@/lib/bookingService";
import { cn } from "@/lib/utils";

export function NgoDashboard() {
  const { user, updateProfile } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Safeguard: Redirect if not logged in or not an NGO
  if (!user || user.role !== "ngo") {
    return <Navigate to="/login" replace />;
  }

  const isVetFocus = user.ngoType === "veterinary";
  const totalQuota = isVetFocus ? 4 : 2;

  // Use Firestore Hook
  const { bookings: appointments, loading: bookingsLoading } = useBookings(user.id || user.email, "ngo");

  const handleCancelBooking = async (id: string) => {
    if (confirm("Are you sure you want to cancel this free checkup sponsorship? This will restore your monthly quota.")) {
      await cancelFirestoreBooking(id);
      setRefreshTrigger(prev => prev + 1);
    }
  };

  const handleToggleFocus = () => {
    const newFocus = isVetFocus ? "human" : "veterinary";
    updateProfile({
      ngoType: newFocus,
      practiceDomain: newFocus
    });
    // Fire event to alert context listeners
    window.dispatchEvent(new Event("wecare_booking_updated"));
  };

  const usedQuota = appointments.length;
  const availableQuota = Math.max(0, totalQuota - usedQuota);

  // Fetch doctors based on focus area
  const allDoctors = getDoctors();
  const focusDoctors = isVetFocus 
    ? allDoctors.filter(d => d.id >= 101 && d.id <= 104) 
    : allDoctors.filter(d => d.id === 2 || d.id === 1 || d.id === 5);

  const stats = [
    { 
      label: "Monthly Quota Utilized", 
      value: `${usedQuota} / ${totalQuota}`, 
      change: `${availableQuota} free sponsor slots left`, 
      icon: CalendarCheck, 
      color: isVetFocus ? "text-emerald-500" : "text-violet-500" 
    },
    { 
      label: "Active Patients Sponsored", 
      value: String(appointments.filter(a => a.status === "completed" || a.status === "pending").length), 
      change: "Direct medical case support", 
      icon: Users, 
      color: "text-blue-500" 
    },
    { 
      label: "Partner Focus Domain", 
      value: isVetFocus ? "Stray Welfare" : "Child Health", 
      change: "Verified clinic network", 
      icon: isVetFocus ? PawPrint : Heart, 
      color: isVetFocus ? "text-emerald-500" : "text-red-500" 
    },
    { 
      label: "Platform Impact Status", 
      value: "Level 1 Partner", 
      change: "80G Certificate Active", 
      icon: Award, 
      color: "text-amber-500" 
    },
  ];

  return (
    <div className="min-h-screen bg-transparent w-full pb-24 relative">
      {/* Dynamic ambient blur matching role focus */}
      <div className={cn(
        "absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full blur-[130px] pointer-events-none z-0 transition-all duration-700",
        isVetFocus ? "bg-emerald-600/10 dark:bg-emerald-500/15" : "bg-violet-600/10 dark:bg-violet-500/15"
      )}></div>

      <div className="relative z-10">
        <PageHeader 
          title="NGO Partner Dashboard" 
          description={`Welcome back, ${user.name}. Manage your free checkup quotas, active medical cases, and partner clinical consultations.`} 
          icon={Building2} 
        />

        <div className="max-w-6xl mx-auto px-6 mt-12">
          
          {/* Main Welcome Hero */}
          <div className={cn(
            "rounded-[2.5rem] p-8 md:p-10 text-white shadow-2xl relative overflow-hidden mb-12 border transition-all duration-500",
            isVetFocus 
              ? "bg-gradient-to-br from-emerald-600 to-teal-500 border-emerald-500/20" 
              : "bg-gradient-to-br from-violet-600 to-indigo-600 border-violet-500/20"
          )}>
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
              <div className="space-y-4 max-w-2xl">
                <span className="px-4 py-1.5 rounded-full bg-white/10 text-white font-extrabold text-xs tracking-wider uppercase backdrop-blur-md border border-white/10 flex items-center gap-1.5 w-fit">
                  <ShieldCheck className="w-4.5 h-4.5" />
                  Verified NGO Partner
                </span>
                
                <h2 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">
                  Sponsoring Care For {isVetFocus ? "Stray Animals & Rescues" : "Underprivileged Children"}
                </h2>
                
                <p className="text-white/80 font-medium leading-relaxed text-sm md:text-base">
                  Registration Number: <span className="font-mono font-bold text-white">{user.ngoRegNo || "NGO-REG-489201"}</span> • {isVetFocus ? "You are configured in Stray Welfare & Rescue mode, providing complete immunization and emergency veterinary treatments." : "You are configured in Pediatric Child Care mode, providing standard physical checkups and health diagnostics."}
                </p>

                <div className="flex flex-wrap gap-4 pt-2">
                  <Link 
                    to="/ngo-support" 
                    className="px-6 py-3 bg-white text-gray-900 font-extrabold text-sm rounded-xl hover:bg-gray-100 transition-all shadow-md hover:scale-[1.02] flex items-center gap-2"
                  >
                    <PlusCircle className="w-4 h-4" /> Book Quota Checkup
                  </Link>
                  <button 
                    onClick={handleToggleFocus}
                    className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-extrabold text-sm rounded-xl transition-all border border-white/20 hover:scale-[1.02] flex items-center gap-2"
                  >
                    <Settings className="w-4 h-4" /> Switch Focus Area
                  </button>
                </div>
              </div>

              {/* Progress Circle Visualizer */}
              <div className="flex flex-col items-center bg-black/10 backdrop-blur-md rounded-3xl p-6 border border-white/10 shrink-0 w-full md:w-56 text-center">
                <p className="text-xs font-bold text-white/70 uppercase tracking-widest mb-3">Quota Available</p>
                <div className="relative w-28 h-28 flex items-center justify-center mb-2">
                  {/* Circular progress path */}
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="56" cy="56" r="48" stroke="rgba(255,255,255,0.1)" strokeWidth="8" fill="transparent" />
                    <circle cx="56" cy="56" r="48" stroke="white" strokeWidth="8" fill="transparent"
                      strokeDasharray="301.6"
                      strokeDashoffset={301.6 - (301.6 * (usedQuota / totalQuota))}
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-3xl font-black leading-none">{availableQuota}</span>
                    <span className="text-[10px] font-bold opacity-80 uppercase tracking-wider mt-1">Left</span>
                  </div>
                </div>
                <p className="text-xs font-medium text-white/90">Resets in 14 days</p>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {stats.map((stat, i) => (
              <div key={i} className="bg-white/40 dark:bg-black/40 backdrop-blur-md rounded-3xl p-6 border border-gray-200/50 dark:border-white/10 shadow-sm relative overflow-hidden group">
                <div className={cn("absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10 bg-current transition-transform group-hover:scale-150", stat.color)}></div>
                <div className="flex justify-between items-start relative z-10">
                  <div>
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white">{stat.value}</h3>
                  </div>
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center bg-white dark:bg-zinc-800 shadow-sm", stat.color)}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-4 relative z-10">{stat.change}</p>
              </div>
            ))}
          </div>

          {/* Main Grid: Sponsored Cases & Doctors */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Sponsored Cases List */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white/40 dark:bg-black/40 backdrop-blur-md rounded-3xl border border-gray-200/50 dark:border-white/10 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-200/50 dark:border-white/10 flex justify-between items-center bg-gray-50/50 dark:bg-white/5">
                  <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                    <FileText className={cn("w-5 h-5", isVetFocus ? "text-emerald-500" : "text-violet-500")} />
                    Active Sponsored Cases
                  </h3>
                  <span className="px-3 py-1 bg-white/50 dark:bg-white/5 text-gray-700 dark:text-gray-300 font-bold rounded-full text-xs border border-gray-200/50 dark:border-white/10">
                    {appointments.length} Total
                  </span>
                </div>
                
                <div className="p-6">
                  {appointments.length > 0 ? (
                    <div className="space-y-4">
                      {appointments.map((apt) => {
                        const doctor = allDoctors.find(d => d.id === apt.doctorId);
                        return (
                          <div key={apt.id} className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-white/5 hover:border-gray-200 dark:hover:border-white/15 transition-all">
                            <div className="flex items-center gap-4">
                              <div className={cn(
                                "w-12 h-12 rounded-xl flex items-center justify-center font-bold shadow-sm shrink-0",
                                isVetFocus ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400"
                              )}>
                                <Clock className="w-5 h-5" />
                              </div>
                              <div>
                                <h4 className="font-extrabold text-gray-900 dark:text-white text-base">
                                  {isVetFocus ? "Sponsor Case #VET-" + apt.id.substring(4) : "Sponsor Case #CHD-" + apt.id.substring(4)}
                                </h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">
                                  Assigned to: <span className="font-bold">{doctor?.name || "Verified Expert"}</span> • Booked: {new Date(apt.date).toLocaleDateString()}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-4 sm:w-auto w-full">
                              <span className={cn(
                                "text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 border uppercase tracking-wider",
                                apt.status === "completed" 
                                  ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20" 
                                  : "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20 animate-pulse"
                              )}>
                                {apt.status === "completed" && <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />}
                                {apt.status === "pending" && <Clock className="w-3.5 h-3.5 text-orange-500" />}
                                {apt.status}
                              </span>

                              <button 
                                onClick={() => handleCancelBooking(apt.id)}
                                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors"
                                title="Cancel checkup sponsorship"
                              >
                                <XCircle className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12 flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-gray-400 dark:text-gray-500 mb-4">
                        <Sparkles className="w-8 h-8" />
                      </div>
                      <p className="text-gray-500 dark:text-gray-400 font-bold mb-2">No active sponsorships yet</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 max-w-sm mb-6">Create a free booking matching your active focus area to sponsor medical care.</p>
                      <Link 
                        to="/ngo-support" 
                        className={cn(
                          "px-5 py-2.5 text-white font-extrabold text-xs rounded-xl shadow-md transition-all hover:scale-[1.02]",
                          isVetFocus ? "bg-emerald-600 hover:bg-emerald-700" : "bg-violet-600 hover:bg-violet-700"
                        )}
                      >
                        Sponsor First Checkup
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Partner Doctors Network Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-gradient-to-br from-gray-900 to-black rounded-3xl p-6 border border-gray-800 shadow-2xl h-full flex flex-col">
                <h3 className="text-lg font-black text-white flex items-center gap-2 mb-6 shrink-0">
                  <ShieldCheck className={cn("w-5 h-5", isVetFocus ? "text-emerald-500" : "text-violet-500")} />
                  Clinical Network
                </h3>

                <div className="space-y-4 flex-1">
                  {focusDoctors.map((doc) => (
                    <div key={doc.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-3 hover:bg-white/10 transition-colors">
                      <div className="flex gap-3">
                        <img 
                          src={doc.image} 
                          alt={doc.name} 
                          className="w-12 h-12 rounded-xl object-cover border border-white/10 shrink-0" 
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1">
                            <h4 className="font-extrabold text-white text-sm truncate">{doc.name}</h4>
                            {doc.verified && <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                          </div>
                          <p className="text-xs text-gray-400 font-medium truncate">{doc.specialty}</p>
                          <p className="text-[10px] text-gray-500 font-bold mt-0.5">{doc.experience} Years Exp</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-white/5 pt-2">
                        <span className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-gray-400">
                          <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", doc.onlineStatus === "online" ? "bg-green-500 animate-pulse" : "bg-gray-500")} />
                          {doc.onlineStatus}
                        </span>
                        
                        <Link 
                          to="/ngo-support"
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all flex items-center gap-1",
                            isVetFocus 
                              ? "bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white" 
                              : "bg-violet-500/10 hover:bg-violet-500 text-violet-400 hover:text-white"
                          )}
                        >
                          Book Free <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
