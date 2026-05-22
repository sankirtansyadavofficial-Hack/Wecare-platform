import { PageHeader } from "@/components/ui/page-header";
import { HeartPulse, Ambulance, Phone, AlertTriangle, PawPrint } from "lucide-react";
import { useVetMode } from "@/context/vet-mode-context";
import { cn } from "@/lib/utils";

export function UrgentCare() {
  const { isVetMode } = useVetMode();

  return (
    <div className="min-h-screen bg-transparent w-full pb-24">
      <PageHeader 
        title={isVetMode ? "AI Pet Emergency SOS" : "AI Emergency SOS"} 
        description={isVetMode ? "Immediate response for pet and stray animal emergencies. Connect to the nearest veterinary ICU, animal ambulance, or duty vet instantly." : "Immediate response for medical emergencies. Connect to the nearest active hospital, ambulance, or duty doctor instantly."} 
        icon={isVetMode ? PawPrint : HeartPulse} 
      />

      <div className="max-w-4xl mx-auto px-6 mt-12 text-center">
        <div className={cn(
          "flex flex-col items-center justify-center p-12 rounded-3xl border relative overflow-hidden group transition-all duration-300",
          isVetMode 
            ? "bg-emerald-600 shadow-[0_20px_60px_-15px_rgba(16,185,129,0.5)] border-emerald-500" 
            : "bg-red-600 shadow-[0_20px_60px_-15px_rgba(220,38,38,0.5)] border-red-500"
        )}>
           <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.2)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
           
           <div className={cn(
             "relative z-10 w-48 h-48 bg-white rounded-full flex flex-col items-center justify-center shadow-2xl cursor-pointer hover:scale-105 active:scale-95 transition-all duration-300 animate-pulse border-8",
             isVetMode ? "text-emerald-600 border-emerald-200" : "text-red-600 border-red-200"
           )}>
             <AlertTriangle className="w-16 h-16 mb-2" />
             <span className="font-black text-2xl tracking-tighter">SOS</span>
           </div>

           <p className="mt-8 text-white/90 text-lg font-medium max-w-lg">
             {isVetMode 
               ? "Tap the SOS button or hold for 3 seconds to trigger a priority emergency alert to the nearest 3 veterinary clinics and animal rescue responders."
               : "Tap the SOS button or hold for 3 seconds to trigger a priority emergency alert to the nearest 3 active hospitals and an ambulance service."}
           </p>

           <div className="mt-12 w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button className={cn(
                "text-white font-bold py-4 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 border",
                isVetMode 
                  ? "bg-emerald-700 hover:bg-emerald-800 border-emerald-500/50" 
                  : "bg-red-700 hover:bg-red-800 border-red-500/50"
              )}>
                <Ambulance className="w-5 h-5" /> {isVetMode ? "Dispatch Pet Ambulance" : "Dispatch Ambulance"}
              </button>
              <button className={cn(
                "text-white font-bold py-4 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 border",
                isVetMode 
                  ? "bg-emerald-700 hover:bg-emerald-800 border-emerald-500/50" 
                  : "bg-red-700 hover:bg-red-800 border-red-500/50"
              )}>
                <Phone className="w-5 h-5" /> {isVetMode ? "Call Duty Vet" : "Call Duty Doctor"}
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}

