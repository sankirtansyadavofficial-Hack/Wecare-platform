import { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Stethoscope, Loader2, CheckCircle2, ShieldCheck, Database, Calendar } from "lucide-react";
import { useVetMode } from "@/context/vet-mode-context";
import { useAuth } from "@/context/auth-context";
import { DoctorDirectory } from "@/components/doctors/doctor-directory";
import { getDoctors } from "@/lib/doctors-data";
import { createFirestoreBooking } from "@/lib/bookingService";
import { cn } from "@/lib/utils";

export function FindDoctors() {
  const { isVetMode } = useVetMode();
  const { user, setHasActiveBooking } = useAuth();
  
  const [bookingRefreshCounter, setBookingRefreshCounter] = useState(0);
  const [bookingState, setBookingState] = useState<{
    isBooking: boolean;
    step: 0 | 1 | 2 | 3;
    type: 'in-person' | 'video' | null;
    doctorName: string;
  }>({
    isBooking: false,
    step: 0,
    type: null,
    doctorName: "",
  });

  const handleStartBooking = (doctorName: string, type: 'in-person' | 'video') => {
    setBookingState({
      isBooking: true,
      step: 0,
      type,
      doctorName,
    });
  };

  useEffect(() => {
    if (!bookingState.isBooking) return;

    if (bookingState.step < 3) {
      const timer = setTimeout(() => {
        setBookingState(prev => ({
          ...prev,
          step: (prev.step + 1) as 0 | 1 | 2 | 3,
        }));
      }, 1200);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        // Find doctor to record completed booking
        const doctors = getDoctors();
        const matchedDoc = doctors.find(d => d.name === bookingState.doctorName);
        if (matchedDoc && user) {
          // Fire-and-forget the promise, or handle it properly. 
          // Since it's inside a timeout, we'll just execute it asynchronously.
          createFirestoreBooking({
            userId: user.id || user.email || "unknown_user",
            doctorId: matchedDoc.id,
            doctorName: matchedDoc.name,
            status: "completed",
            date: new Date().toISOString(),
            type: bookingState.type || "in-person"
          }).catch(err => console.error("Booking error:", err));
          
          // Emit local event so all elements react immediately
          window.dispatchEvent(new Event("wecare_booking_updated"));
          setBookingRefreshCounter(prev => prev + 1);
        }

        setHasActiveBooking(true);
        setBookingState(prev => ({ ...prev, isBooking: false }));
        if (bookingState.type === 'in-person') {
          window.location.hash = "/live-queue";
        } else {
          window.location.hash = "/video-consult";
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [bookingState.isBooking, bookingState.step, bookingState.type, setHasActiveBooking, bookingState.doctorName, user]);

  return (
    <div className="min-h-screen bg-transparent w-full pb-24">
      <PageHeader 
        title={isVetMode ? "Find Vets" : "Find Doctors"} 
        description={isVetMode ? "Discover and connect with top-rated rural and urban veterinary professionals near you in seconds." : "Discover and connect with top-rated rural and urban healthcare professionals near you in seconds."} 
        icon={Stethoscope} 
      />

      <DoctorDirectory 
        isVetMode={isVetMode} 
        onBook={handleStartBooking}
        bookingRefreshCounter={bookingRefreshCounter}
      />


      {bookingState.isBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 transition-opacity duration-300">
          <div className="bg-white/90 dark:bg-zinc-950/90 border border-gray-200 dark:border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden transition-all duration-300 transform scale-100">
            {/* Dynamic background glow */}
            <div className={cn("absolute -top-24 -left-24 w-48 h-48 rounded-full blur-3xl opacity-20 bg-gradient-to-r", isVetMode ? "from-emerald-500 to-teal-500" : "from-red-500 to-orange-500")} />
            
            <div className="text-center relative z-10">
              <div className="flex justify-center mb-6">
                {bookingState.step === 0 && (
                  <div className={cn("w-16 h-16 rounded-full flex items-center justify-center border animate-pulse", isVetMode ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" : "text-red-500 bg-red-500/10 border-red-500/20")}>
                    <Calendar className="w-8 h-8 animate-bounce" />
                  </div>
                )}
                {bookingState.step === 1 && (
                  <div className={cn("w-16 h-16 rounded-full flex items-center justify-center border animate-pulse", isVetMode ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" : "text-red-500 bg-red-500/10 border-red-500/20")}>
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                )}
                {bookingState.step === 2 && (
                  <div className={cn("w-16 h-16 rounded-full flex items-center justify-center border", isVetMode ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" : "text-red-500 bg-red-500/10 border-red-500/20")}>
                    <Database className="w-8 h-8 animate-spin" />
                  </div>
                )}
                {bookingState.step === 3 && (
                  <div className="w-16 h-16 rounded-full flex items-center justify-center text-green-500 bg-green-500/10 border border-green-500/20">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                )}
              </div>

              <h3 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white mb-2">
                {bookingState.step === 3 ? "Booking Successful!" : "Processing Booking"}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                {bookingState.step === 3 
                  ? `Your appointment with ${bookingState.doctorName} is confirmed.` 
                  : `Connecting with ${bookingState.doctorName}...`}
              </p>

              {/* Progress Steps List */}
              <div className="space-y-4 text-left mb-8 bg-gray-50 dark:bg-white/5 rounded-2xl p-5 border border-gray-100 dark:border-white/5">
                <div className="flex items-center gap-3">
                  {bookingState.step > 0 ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : bookingState.step === 0 ? (
                    <Loader2 className={cn("w-5 h-5 animate-spin", isVetMode ? "text-emerald-500" : "text-red-500")} />
                  ) : (
                    <div className="w-5 h-5 rounded-full border border-gray-300 dark:border-white/20" />
                  )}
                  <span className={cn("text-sm font-medium", bookingState.step >= 0 ? "text-gray-900 dark:text-white" : "text-gray-400 dark:text-gray-500")}>
                    Securing medical appointment node...
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {bookingState.step > 1 ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : bookingState.step === 1 ? (
                    <Loader2 className={cn("w-5 h-5 animate-spin", isVetMode ? "text-emerald-500" : "text-red-500")} />
                  ) : (
                    <div className="w-5 h-5 rounded-full border border-gray-300 dark:border-white/20" />
                  )}
                  <span className={cn("text-sm font-medium", bookingState.step >= 1 ? "text-gray-900 dark:text-white" : "text-gray-400 dark:text-gray-500")}>
                    Escrow payment pre-authorized...
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {bookingState.step > 2 ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : bookingState.step === 2 ? (
                    <Loader2 className={cn("w-5 h-5 animate-spin", isVetMode ? "text-emerald-500" : "text-red-500")} />
                  ) : (
                    <div className="w-5 h-5 rounded-full border border-gray-300 dark:border-white/20" />
                  )}
                  <span className={cn("text-sm font-medium", bookingState.step >= 2 ? "text-gray-900 dark:text-white" : "text-gray-400 dark:text-gray-500")}>
                    Synchronizing hospital queue...
                  </span>
                </div>
              </div>

              {/* Graphical Progress Bar */}
              <div className="w-full bg-gray-200 dark:bg-white/10 rounded-full h-2 mb-2 overflow-hidden">
                <div 
                  className={cn("h-full transition-all duration-500 rounded-full bg-gradient-to-r", isVetMode ? "from-emerald-500 to-teal-500" : "from-red-500 to-orange-500")}
                  style={{ width: `${(bookingState.step / 3) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-xs font-semibold text-gray-400 dark:text-gray-500">
                <span>PROGRESS</span>
                <span>{Math.round((bookingState.step / 3) * 100)}%</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
