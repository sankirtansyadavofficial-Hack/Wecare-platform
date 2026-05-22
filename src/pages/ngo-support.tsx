import React, { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { 
  Heart, Calendar as CalendarIcon, Video, Building2, CheckCircle2, 
  Clock, Info, PawPrint, ShieldCheck, UserCheck, Phone, Sparkles,
  ArrowRight, Download
} from "lucide-react";
import { useVetMode } from "@/context/vet-mode-context";
import { useAuth } from "@/context/auth-context";
import { getAppointments } from "@/lib/doctors-data";
import { createFirestoreBooking } from "@/lib/bookingService";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

export function NgoSupport() {
  const { isVetMode } = useVetMode();
  const { user, setHasActiveBooking } = useAuth();
  
  const [consultType, setConsultType] = useState<"online" | "offline">("online");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  
  // Patient details state
  const [patientName, setPatientName] = useState("");
  const [patientAgeOrBreed, setPatientAgeOrBreed] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [bookingNotes, setBookingNotes] = useState("");

  const [appointments, setAppointments] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdBooking, setCreatedBooking] = useState<any>(null);

  // Sync sponsored appointments from localStorage to track quota
  useEffect(() => {
    if (user) {
      const apps = getAppointments().filter(app => app.userId === user.email);
      setAppointments(apps);
    }
  }, [user, refreshTrigger]);

  const isVetFocus = user?.ngoType === "veterinary" || isVetMode;
  const totalQuota = isVetFocus ? 4 : 2;
  const usedQuota = user ? appointments.length : 1; // Fallback for guest demo
  const availableQuota = Math.max(0, totalQuota - usedQuota);

  const quota = {
    total: totalQuota,
    used: usedQuota,
    available: availableQuota,
    resetsIn: "14 days"
  };

  const timeSlots = [
    "09:00 AM", "10:30 AM", "01:00 PM", "03:30 PM", "05:00 PM"
  ];

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime) {
      alert("Please select a date and time slot.");
      return;
    }
    if (!patientName || !patientPhone) {
      alert("Please fill in the patient details.");
      return;
    }

    // Assign appropriate doctor
    // Dr. Arthur Pendelton (id: 101) for Vet Mode, Dr. Ananya Sharma (id: 2) for Human Mode
    const doctorId = isVetFocus ? 101 : 2;
    const docName = isVetFocus ? "Dr. Arthur Pendelton" : "Dr. Ananya Sharma";
    const clinicLoc = isVetFocus ? "Green Fields Vet Clinic, Rural Bypass" : "Little Angels Clinic, Residency Road";

    // Create the booking in our persistent Firestore DB
    const newApp = await createFirestoreBooking({
      userId: user?.id || user?.email || "partner@hopengo.org",
      doctorId: doctorId,
      status: "pending",
      date: selectedDate,
      patientName,
      patientAgeOrBreed,
      doctorName: docName,
      location: clinicLoc,
      type: consultType === "online" ? "Online Video Consult" : "In-Clinic Visit"
    });

    // Update state to render success ticket
    setCreatedBooking({
      id: newApp.id,
      patientName,
      patientAgeOrBreed,
      phone: patientPhone,
      doctorName: docName,
      location: clinicLoc,
      date: selectedDate,
      time: selectedTime,
      type: consultType === "online" ? "Online Video Consult" : "In-Clinic Visit",
    });

    // Notify auth context & broadcast update events to navigation components
    setHasActiveBooking(true);
    window.dispatchEvent(new Event("wecare_booking_updated"));
    
    setIsSuccess(true);
    setRefreshTrigger(prev => prev + 1);
  };

  const renderCalendar = () => {
    const days = [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25];
    return (
      <div className="grid grid-cols-7 gap-2">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
          <div key={d} className="text-center text-xs font-bold text-gray-500 mb-2">{d}</div>
        ))}
        {days.map((day, i) => (
          <button 
            type="button"
            key={i}
            onClick={() => {
              setSelectedDate(`2026-05-${day}`);
              setSelectedTime(null); // Reset time selection on date change
            }}
            className={cn(
              "py-3 rounded-xl font-medium transition-all",
              selectedDate === `2026-05-${day}` 
                ? (isVetFocus ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/30" : "bg-violet-600 text-white shadow-md shadow-violet-500/30") 
                : "bg-white/50 dark:bg-zinc-900/50 hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-900 dark:text-white border border-gray-200/50 dark:border-white/5"
            )}
          >
            {day}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-transparent w-full pb-24 relative">
      {/* Background ambient light matching active mode */}
      <div className={cn(
        "absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full blur-[130px] pointer-events-none z-0 transition-colors duration-500",
        isVetFocus ? "bg-emerald-600/10 dark:bg-emerald-500/15" : "bg-violet-600/10 dark:bg-violet-500/15"
      )}></div>

      <div className="relative z-10">
        <PageHeader 
          title={isVetFocus ? "Stray & Rescue NGO Support" : "NGO Support System"} 
          description={isVetFocus ? "Providing shelter animals and stray pets with 4 free comprehensive veterinary checkups and vaccinations every month." : "Providing children with 2 free comprehensive health checkups every month. A commitment to our future."} 
          icon={isVetFocus ? PawPrint : Heart} 
        />

        <div className="max-w-6xl mx-auto px-6 mt-12">
          {isSuccess && createdBooking ? (
            /* Premium Glassmorphic Success Screen */
            <div className="max-w-2xl mx-auto bg-white/40 dark:bg-black/40 backdrop-blur-2xl border border-gray-200/50 dark:border-white/10 rounded-[2.5rem] p-8 md:p-10 shadow-2xl text-center animate-in fade-in zoom-in-95 duration-500">
              <div className={cn(
                "w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg",
                isVetFocus ? "bg-emerald-500/10 text-emerald-500" : "bg-violet-500/10 text-violet-500"
              )}>
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Checkup Sponsored!</h2>
              <p className="text-gray-500 dark:text-gray-400 font-medium mb-8">
                Your medical sponsorship booking is verified. Zero fees have been charged under your NGO quota.
              </p>

              {/* Digital Ticket */}
              <div className="bg-gradient-to-br from-zinc-50 to-white dark:from-zinc-950 dark:to-zinc-900 border border-gray-200 dark:border-white/10 rounded-3xl p-6 text-left shadow-md relative overflow-hidden mb-8">
                {/* Visual coupon edge notches */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 w-6 h-6 bg-white/40 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-full backdrop-blur-2xl"></div>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 w-6 h-6 bg-white/40 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-full backdrop-blur-2xl"></div>

                <div className="flex justify-between items-start border-b border-gray-200 dark:border-white/5 pb-4 mb-4">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">Sponsorship ID</span>
                    <h4 className="font-mono text-sm font-black text-gray-800 dark:text-gray-100">{createdBooking.id}</h4>
                  </div>
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border",
                    isVetFocus ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400" : "bg-violet-50 text-violet-600 border-violet-200 dark:bg-violet-500/10 dark:text-violet-400"
                  )}>
                    {createdBooking.type}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm mb-4">
                  <div>
                    <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">Beneficiary Name</span>
                    <span className="font-extrabold text-gray-900 dark:text-white">{createdBooking.patientName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">{isVetFocus ? "Animal Breed / Info" : "Beneficiary Age"}</span>
                    <span className="font-extrabold text-gray-900 dark:text-white">{createdBooking.patientAgeOrBreed || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">Assigned Clinician</span>
                    <span className="font-extrabold text-gray-900 dark:text-white flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-blue-500" />
                      {createdBooking.doctorName}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">Date & Time</span>
                    <span className="font-extrabold text-gray-900 dark:text-white">{createdBooking.date} • {createdBooking.time}</span>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-white/5 pt-4">
                  <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">Access Instructions</span>
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 leading-relaxed mt-1">
                    {consultType === "online" 
                      ? "Google Meet details have been shared with your registered NGO partner inbox. Direct video handshake consultation starts on selected slot."
                      : `Please present this digital coupon upon arrival at: ${createdBooking.location}.`
                    }
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {user.role === "ngo" ? (
                  <Link 
                    to="/ngo-dashboard" 
                    className={cn(
                      "px-6 py-3 text-white font-extrabold text-sm rounded-xl transition-all shadow-md hover:scale-[1.02] flex items-center justify-center gap-2",
                      isVetFocus ? "bg-emerald-600 hover:bg-emerald-700" : "bg-violet-600 hover:bg-violet-700"
                    )}
                  >
                    Go to NGO Dashboard <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <Link 
                    to="/" 
                    className="px-6 py-3 bg-gray-900 dark:bg-white dark:text-black hover:bg-gray-800 text-white font-extrabold text-sm rounded-xl transition-all shadow-md hover:scale-[1.02] flex items-center justify-center gap-2"
                  >
                    Go to Home <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
                <button 
                  onClick={() => alert("Ticket downloaded successfully (Mock PDF generated).")}
                  className="px-6 py-3 bg-white/5 hover:bg-white/10 dark:bg-white/5 text-gray-800 dark:text-white border border-gray-200/50 dark:border-white/10 font-extrabold text-sm rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" /> Download Coupon
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Dashboard & Details */}
              <div className="lg:col-span-1 space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
                <div className={cn(
                  "rounded-3xl p-6 text-white shadow-lg relative overflow-hidden transition-all duration-300",
                  isVetFocus ? "bg-gradient-to-br from-emerald-600 to-teal-500" : "bg-gradient-to-br from-violet-600 to-indigo-500"
                )}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                  <h3 className="font-bold text-white/80 mb-1">Monthly Quota Available</h3>
                  <div className="flex items-end gap-2 mb-6">
                    <span className="text-5xl font-black">{quota.available}</span>
                    <span className="text-xl font-medium text-white/80 pb-1">/ {quota.total} Available</span>
                  </div>
                  
                  <div className="w-full bg-black/20 rounded-full h-2 mb-4 overflow-hidden">
                    <div className="bg-white h-full rounded-full" style={{ width: `${(quota.used/quota.total)*100}%` }}></div>
                  </div>
                  
                  <p className="text-sm font-medium flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Resets in {quota.resetsIn}
                  </p>
                </div>

                <div className="bg-white/40 dark:bg-black/40 backdrop-blur-md rounded-3xl p-6 border border-gray-200/50 dark:border-white/10 shadow-sm">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Info className="w-5 h-5 text-gray-400" /> How it works
                  </h3>
                  <ul className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
                    <li className="flex gap-3">
                      <div className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center font-bold shrink-0 text-xs",
                        isVetFocus ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400"
                      )}>1</div>
                      <p>{isVetFocus ? "Select whether you prefer a secure online video consultation or an offline shelter/clinic visit." : "Select whether you prefer an online video consultation or an offline clinic visit."}</p>
                    </li>
                    <li className="flex gap-3">
                      <div className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center font-bold shrink-0 text-xs",
                        isVetFocus ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400"
                      )}>2</div>
                      <p>Choose an available date and time slot from the calendar.</p>
                    </li>
                    <li className="flex gap-3">
                      <div className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center font-bold shrink-0 text-xs",
                        isVetFocus ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400"
                      )}>3</div>
                      <p>{isVetFocus ? "Provide basic information about the stray pet or rescue animal for clinical onboarding." : "Provide beneficiary child registration details for clinical onboarding."}</p>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Right Column: Booking Interface */}
              <div className="lg:col-span-2 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="bg-white/40 dark:bg-black/40 backdrop-blur-md rounded-3xl p-8 border border-gray-200/50 dark:border-white/10 shadow-sm">
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6">
                    {isVetFocus ? "Schedule Sponsored Vet Checkup" : "Schedule Sponsored Checkup"}
                  </h2>
                  
                  {quota.available > 0 ? (
                    <form onSubmit={handleBookingSubmit}>
                      {/* Consultation Type Toggle */}
                      <div className="flex p-1 bg-gray-100/50 dark:bg-zinc-900/50 rounded-xl mb-8 border border-gray-200/50 dark:border-white/5">
                        <button 
                          type="button"
                          onClick={() => setConsultType("online")}
                          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all ${consultType === 'online' ? 'bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
                        >
                          <Video className="w-4 h-4" /> Online Consultation
                        </button>
                        <button 
                          type="button"
                          onClick={() => setConsultType("offline")}
                          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all ${consultType === 'offline' ? 'bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
                        >
                          <Building2 className="w-4 h-4" /> {isVetFocus ? "Clinic / Shelter Visit" : "Offline Clinic Visit"}
                        </button>
                      </div>

                      {/* Step 1: Calendar */}
                      <div className="mb-8">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                          <CalendarIcon className={cn("w-5 h-5", isVetFocus ? "text-emerald-500" : "text-violet-500")} /> Select Date
                        </h3>
                        {renderCalendar()}
                      </div>

                      {/* Step 2: Time Slots */}
                      {selectedDate && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 mb-8">
                          <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Clock className={cn("w-5 h-5", isVetFocus ? "text-emerald-500" : "text-violet-500")} /> Select Time
                          </h3>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {timeSlots.map(time => (
                              <button 
                                type="button"
                                key={time} 
                                onClick={() => setSelectedTime(time)}
                                className={cn(
                                  "py-3 border rounded-xl font-medium transition-all bg-transparent",
                                  selectedTime === time 
                                    ? (isVetFocus ? "border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5" : "border-violet-500 text-violet-600 dark:text-violet-400 bg-violet-500/5")
                                    : "border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:border-gray-400"
                                )}
                              >
                                {time}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Step 3: Patient Info Form */}
                      {selectedDate && selectedTime && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6 border-t border-gray-200/50 dark:border-white/10 pt-8">
                          <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Sparkles className={cn("w-5 h-5", isVetFocus ? "text-emerald-500" : "text-violet-500")} /> Beneficiary Clinical Details
                          </h3>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                                {isVetFocus ? "Pet / Rescue Name *" : "Child Beneficiary Name *"}
                              </label>
                              <input 
                                type="text"
                                required
                                value={patientName}
                                onChange={(e) => setPatientName(e.target.value)}
                                placeholder={isVetFocus ? "e.g. Bandit, Rocky" : "e.g. Aarav Gupta"}
                                className="w-full bg-white/50 dark:bg-zinc-950 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-violet-500"
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                                {isVetFocus ? "Animal Breed / Type (Optional)" : "Beneficiary Age (Optional)"}
                              </label>
                              <input 
                                type="text"
                                value={patientAgeOrBreed}
                                onChange={(e) => setPatientAgeOrBreed(e.target.value)}
                                placeholder={isVetFocus ? "e.g. Stray Cat, Labrador Mix" : "e.g. 8 years"}
                                className="w-full bg-white/50 dark:bg-zinc-950 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-violet-500"
                              />
                            </div>

                            <div className="space-y-2 sm:col-span-2">
                              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                                Emergency Contact Phone *
                              </label>
                              <input 
                                type="tel"
                                required
                                value={patientPhone}
                                onChange={(e) => setPatientPhone(e.target.value)}
                                placeholder="e.g. +91 98765 43210"
                                className="w-full bg-white/50 dark:bg-zinc-950 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-violet-500"
                              />
                            </div>

                            <div className="space-y-2 sm:col-span-2">
                              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                                Clinical/Medical Notes
                              </label>
                              <textarea 
                                value={bookingNotes}
                                onChange={(e) => setBookingNotes(e.target.value)}
                                placeholder={isVetFocus ? "e.g. Rescue puppy with limp in left front leg, requires general checkup." : "e.g. Periodic checkup for child, has general cold symptoms."}
                                className="w-full bg-white/50 dark:bg-zinc-950 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-violet-500 h-24 resize-none"
                              />
                            </div>
                          </div>

                          <button 
                            type="submit"
                            className={cn(
                              "w-full font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] text-white text-sm mt-4",
                              isVetFocus 
                                ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20" 
                                : "bg-violet-600 hover:bg-violet-700 shadow-violet-500/20"
                            )}
                          >
                            {isVetFocus ? "Confirm Free Vet Consultation" : "Confirm Free Checkup"}
                          </button>
                        </div>
                      )}
                    </form>
                  ) : (
                    <div className="py-12 flex flex-col items-center justify-center text-center">
                      <div className="w-20 h-20 bg-green-50 dark:bg-green-500/10 rounded-full flex items-center justify-center mb-6">
                        <CheckCircle2 className="w-10 h-10 text-green-500" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Quota Fulfilled</h3>
                      <p className="text-gray-500 dark:text-gray-400 max-w-md">You have utilized your free health checkups for this month. The quota will reset in {quota.resetsIn}.</p>
                      {user.role === "ngo" && (
                        <Link 
                          to="/ngo-dashboard"
                          className={cn(
                            "mt-6 px-6 py-2.5 font-bold text-xs text-white rounded-xl shadow-md transition-all hover:scale-[1.02]",
                            isVetFocus ? "bg-emerald-600 hover:bg-emerald-700" : "bg-violet-600 hover:bg-violet-700"
                          )}
                        >
                          Go to NGO Dashboard
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
