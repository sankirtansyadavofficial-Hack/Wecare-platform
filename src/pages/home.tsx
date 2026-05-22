import Hero from "@/components/ui/animated-shader-hero";
import RadialOrbitalTimeline, { TimelineItem } from "@/components/ui/radial-orbital-timeline";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { Clock, Stethoscope, MapPin, HeartPulse } from "lucide-react";
import { useVetMode } from "@/context/vet-mode-context";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";

export function Home() {
  const { isVetMode } = useVetMode();
  const { user } = useAuth();

  const isNgo = user?.role === "ngo";
  const isVetFocus = user?.ngoType === "veterinary";

  const timelineData: TimelineItem[] = isNgo ? [
    {
      id: 1,
      title: "Circular Quota Allocation",
      date: "Real-time resetting",
      content: "Instantly distribute verified child health or stray welfare clinical checkups. Restores quota immediately upon case cancellations.",
      category: "Quotas",
      icon: Clock,
      relatedIds: [2],
      status: "in-progress",
      energy: 95,
    },
    {
      id: 2,
      title: "Interactive Focus Toggle",
      date: "Instant Swap",
      content: "Toggle your NGO focus area with a single tap. Instantly swaps target quotas, local clinical rosters, and active medical directories.",
      category: "Features",
      icon: Stethoscope,
      relatedIds: [1, 3],
      status: "completed",
      energy: 85,
    },
    {
      id: 3,
      title: "Verified Partner Network",
      date: "Direct Care Access",
      content: "Direct linkages with verified pediatricians and veterinarians active on WeCare, bypassing typical commercial queues.",
      category: "Network",
      icon: MapPin,
      relatedIds: [2, 4],
      status: "pending",
      energy: 70,
    },
    {
      id: 4,
      title: "AI Chatbot Pre-screening",
      date: "Symptom Helper",
      content: "Empower field agents with our AI assistant to pre-screen patient cases and stray symptom profiles before booking.",
      category: "AI",
      icon: HeartPulse,
      relatedIds: [1, 3],
      status: "completed",
      energy: 100,
    },
  ] : (isVetMode ? [
    {
      id: 1,
      title: "Pet Live Queue Tracking",
      date: "Real-time",
      content: "Track your pet's position in the clinic queue, view dynamic ETAs, and reduce clinic wait anxiety with automated push alerts.",
      category: "Features",
      icon: Clock,
      relatedIds: [2],
      status: "in-progress",
      energy: 90,
    },
    {
      id: 2,
      title: "Dedicated Vet System",
      date: "Instant Swapped",
      content: "Complete veterinary portal with one-click access. Multi-specialty support covering pet pediatricians, bird experts, and equine surgeons.",
      category: "Features",
      icon: Stethoscope,
      relatedIds: [1, 3],
      status: "completed",
      energy: 85,
    },
    {
      id: 3,
      title: "Rural Stray Support",
      date: "Welfare Network",
      content: "Geolocation search prioritizing local animal shelters and suburban veterinarians. Raising the standard of veterinary care.",
      category: "Network",
      icon: MapPin,
      relatedIds: [2, 4],
      status: "pending",
      energy: 60,
    },
    {
      id: 4,
      title: "AI Pet ER SOS",
      date: "Instant Launch",
      content: "Single-tap emergency SOS button connects pet parents to local active animal hospitals and pet ambulances instantly.",
      category: "Emergency",
      icon: HeartPulse,
      relatedIds: [1, 3],
      status: "completed",
      energy: 100,
    },
  ] : [
    {
      id: 1,
      title: "Live Queue Tracking",
      date: "Real-time",
      content: "Track your position in line, view dynamic ETAs, and reduce waiting-room overcrowding with automated push notifications.",
      category: "Features",
      icon: Clock,
      relatedIds: [2],
      status: "in-progress",
      energy: 90,
    },
    {
      id: 2,
      title: "Dual-Species Care",
      date: "Instant Switch",
      content: "One-click toggle between Human Medical Care and Professional Veterinary Services. Multi-specialty support covering pediatricians to animal behavioral experts.",
      category: "Features",
      icon: Stethoscope,
      relatedIds: [1, 3],
      status: "completed",
      energy: 85,
    },
    {
      id: 3,
      title: "Rural Empowerment",
      date: "Verified Network",
      content: "Geolocation search prioritizing independent local and suburban doctors. Highlights clinical capability over marketing budget.",
      category: "Network",
      icon: MapPin,
      relatedIds: [2, 4],
      status: "pending",
      energy: 60,
    },
    {
      id: 4,
      title: "AI Emergency Routing",
      date: "Instant Launch",
      content: "Single-tap SOS button bypasses traditional searching to isolate immediate local clinics with active duty verification.",
      category: "Emergency",
      icon: HeartPulse,
      relatedIds: [1, 3],
      status: "completed",
      energy: 100,
    },
  ]);

  return (
    <>
      <Hero
        trustBadge={isNgo ? {
          text: isVetFocus ? "Verified NGO Sponsor · Stray Welfare Active" : "Verified NGO Sponsor · Pediatric Health Active",
          icons: ["💜", "🛡️"]
        } : {
          text: isVetMode ? "Verified Veterinary Experts · 100% Secure Pet Wallet" : "Verified Local Experts · 100% Secure Medical Wallet",
          icons: isVetMode ? ["🐾", "🛡️"] : ["❤️", "🛡️"]
        }}
        headline={isNgo ? {
          line1: "WeCare NGO Hub 24|7",
          line2: isVetFocus ? "Smart Stray Welfare Network" : "Smart Pediatric Care Network"
        } : {
          line1: isVetMode ? "WeCare Vet 24|7" : "WeCare 24|7",
          line2: isVetMode ? "Smart Pet Care Tracking" : "Smart Health Tracking"
        }}
        subtitle={isNgo 
          ? `Welcome to WeCare's Social Impact ecosystem, ${user.name}. Sponsoring verified clinical checkups for those who need it most. Manage free slots, locate partner camps, and consult our AI Assistant.` 
          : (isVetMode ? "Bridging the gap connecting you to capable Local & Rural Veterinarians instantly. Skip the waiting room with Real-Time Queue Tracking for your beloved pets." : "Bridging the gap connecting you to capable Local & Rural Doctors instantly. Skip the waiting room with Real-Time Queue Tracking for Humans & Pets.")
        }
        buttons={isNgo ? {
          primary: {
            text: "Go to NGO Dashboard",
            onClick: () => window.location.hash = "/ngo-dashboard"
          }
        } : (!user ? {
          primary: {
            text: isVetMode ? "Track Pet Queue" : "Track Live Queue",
            onClick: () => console.log('Opening tracking dashboard')
          }
        } : undefined)}
      />

      <div className="relative w-full rounded-t-[3rem] bg-white/20 dark:bg-black/20 backdrop-blur-xl shadow-[0_-20px_40px_rgba(0,0,0,0.05)] dark:shadow-none border-t border-gray-100 dark:border-white/10">
        <div className="flex flex-col overflow-hidden pb-10 pt-20">
          <ContainerScroll
            titleComponent={
              <div className="mb-10 text-gray-900 dark:text-gray-100">
                <h2 className="text-3xl md:text-5xl font-black mb-4">
                  {isNgo ? (
                    <>
                      The Unified <span className="text-purple-600 dark:text-purple-500">NGO Care</span> System
                    </>
                  ) : (
                    <>
                      The Intelligent {isVetMode ? "Pet Care" : "Care"}{" "}
                      <span className={isVetMode ? "text-emerald-600 dark:text-emerald-500" : "text-red-600 dark:text-red-500"}>Ecosystem</span>
                    </>
                  )}
                </h2>
                <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
                  {isNgo 
                    ? "Monitor verified checkup quotas, restore slots dynamically on cancellations, and consult our localized clinical network."
                    : (isVetMode ? "Redefining veterinary care accessibility with modern tracking, integrated pet wallets, and immediate online video consultations." : "Redefining accessibility with modern tracking technology, integrated top-ups, and one-click consults.")}
                </p>
              </div>
            }
          >
            {isNgo ? (
              <div className="h-full w-full bg-white/40 dark:bg-zinc-950/40 backdrop-blur-md flex flex-col p-6 rounded-2xl relative overflow-hidden text-gray-900 dark:text-white">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 to-indigo-500" />
                <div className="flex items-center justify-between border-b dark:border-white/10 pb-4 mt-2">
                  <div>
                    <h3 className="font-bold text-xl text-gray-900 dark:text-gray-100">{user.name}</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Verified NGO Partner • Focus: {isVetFocus ? "Stray Welfare" : "Child Pediatric Care"}</p>
                  </div>
                  <div className="px-3 py-1 bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 rounded-full font-semibold text-xs border border-purple-200 dark:border-purple-500/20">
                    Active Session
                  </div>
                </div>
                
                <div className="mt-8 grid grid-cols-2 gap-6 relative">
                  <div className="absolute -inset-4 bg-gradient-to-b from-purple-50/50 dark:from-purple-950/20 to-transparent blur-2xl pointer-events-none rounded-[100px]" />
                  <div className="flex flex-col items-center justify-center p-8 rounded-2xl border border-purple-100 dark:border-purple-900/30 bg-purple-50 dark:bg-purple-950/20 relative z-10">
                    <p className="text-gray-500 dark:text-gray-400 font-medium tracking-wide text-sm uppercase mb-2">Available Quota</p>
                    <p className="text-6xl font-black text-purple-600 dark:text-purple-500">
                      {isVetFocus ? "4 Slots" : "2 Slots"}
                    </p>
                  </div>
                  <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-zinc-900 shadow-[0_10px_30px_rgba(139,92,246,0.1)] dark:shadow-none rounded-2xl border border-gray-100 dark:border-white/10 relative z-10">
                    <p className="text-gray-500 dark:text-gray-400 font-medium tracking-wide text-sm uppercase mb-2">Sponsor Focus</p>
                    <p className="text-2xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-wider mt-3">
                      {isVetFocus ? "🐾 Strays" : "👶 Children"}
                    </p>
                    <div className="mt-4 px-4 py-2 rounded-full text-xs font-bold bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
                      Verified 80G Active
                    </div>
                  </div>
                </div>

                <div className="mt-auto grid grid-cols-3 gap-4">
                  <button 
                    onClick={() => window.location.hash = "/ngo-support"}
                    className="py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-md col-span-2 transition-colors"
                  >
                    Book Sponsored Checkup
                  </button>
                  <button 
                    onClick={() => window.location.hash = "/ngo-dashboard"}
                    className="py-3 bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 rounded-xl font-bold border border-gray-200 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/10 col-span-1 transition-colors"
                  >
                    Dashboard
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full w-full bg-white/40 dark:bg-zinc-950/40 backdrop-blur-md flex flex-col p-6 rounded-2xl relative overflow-hidden text-gray-900 dark:text-white">
                 <div className={cn("absolute top-0 left-0 w-full h-2 bg-gradient-to-r", isVetMode ? "from-emerald-500 to-teal-500" : "from-red-500 to-orange-500")} />
                 <div className="flex items-center justify-between border-b dark:border-white/10 pb-4 mt-2">
                   <div>
                     <h3 className="font-bold text-xl text-gray-900 dark:text-gray-100">{isVetMode ? "Dr. Arthur Pendelton" : "Dr. Sarah Jenkins"}</h3>
                     <p className="text-gray-500 dark:text-gray-400 text-sm">{isVetMode ? "Senior Veterinarian · 1.5km away" : "General Physician · 1.2km away"}</p>
                   </div>
                   <div className="px-3 py-1 bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 rounded-full font-semibold text-xs border border-green-200 dark:border-green-500/20">
                     Available Now
                   </div>
                 </div>
                 
                 <div className="mt-8 grid grid-cols-2 gap-6 relative">
                   <div className={cn("absolute -inset-4 bg-gradient-to-b blur-2xl opacity-50 pointer-events-none rounded-[100px]", isVetMode ? "from-emerald-50 dark:from-emerald-950/30 to-transparent" : "from-red-50 dark:from-red-950/30 to-transparent")} />
                   <div className={cn("flex flex-col items-center justify-center p-8 rounded-2xl border relative z-10 transition-colors", isVetMode ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30" : "bg-red-50 dark:bg-red-950/20 border-red-100 dark:border-red-900/30")}>
                     <p className="text-gray-500 dark:text-gray-400 font-medium tracking-wide text-sm uppercase mb-2">Current Serving</p>
                     <p className={cn("text-6xl font-black drop-shadow-sm", isVetMode ? "text-emerald-600 dark:text-emerald-500" : "text-red-600 dark:text-red-500")}>#42</p>
                   </div>
                   <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-zinc-900 shadow-[0_10px_30px_rgba(16,185,129,0.1)] dark:shadow-none rounded-2xl border border-gray-100 dark:border-white/10 relative z-10 transition-colors">
                     <p className="text-gray-500 dark:text-gray-400 font-medium tracking-wide text-sm uppercase mb-2">Pet Token</p>
                     <p className="text-6xl font-black text-gray-900 dark:text-gray-100">#45</p>
                     <div className={cn("mt-4 px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2", isVetMode ? "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : "bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400")}>
                       <span className={cn("w-2 h-2 rounded-full bg-emerald-500 animate-pulse", isVetMode ? "bg-emerald-500" : "bg-red-500")}></span>
                       ETA: 12 Mins
                     </div>
                   </div>
                 </div>
    
                 <div className="mt-auto grid grid-cols-3 gap-4">
                   <button className={cn("py-3 text-white rounded-xl font-bold shadow-md col-span-2 transition-colors", isVetMode ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700")}>{isVetMode ? "Start Pet Consult" : "Start Video Consult"}</button>
                   <button className="py-3 bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 rounded-xl font-bold border border-gray-200 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/10 col-span-1 transition-colors">Cancel Appt</button>
                 </div>
              </div>
            )}
          </ContainerScroll>
        </div>

        <div className="py-24 relative overflow-hidden bg-transparent border-y border-gray-200/50 dark:border-white/10 transition-colors">
           <div className={cn("absolute inset-0 z-0 [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)]", 
             isNgo 
               ? "bg-purple-500/5 dark:bg-purple-500/10" 
               : (isVetMode ? "bg-emerald-500/5 dark:bg-emerald-500/10" : "bg-red-500/5 dark:bg-red-500/10")
           )}></div>
           
           <div className="relative z-10 max-w-4xl mx-auto text-center px-4 mb-20 drop-shadow-sm">
             <span className={cn("font-bold uppercase tracking-widest text-sm mb-4 block", 
               isNgo ? "text-purple-500" : (isVetMode ? "text-emerald-500" : "text-red-500")
             )}>
               {isNgo ? "Verified Social Impact" : "Interactive Architecture"}
             </span>
             <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-gray-100 tracking-tight">
               {isNgo ? "Sponsorship & Quota Pipeline" : "Real-Time Vet Operations"}
             </h2>
             <p className="mt-6 text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
               {isNgo 
                 ? "Toggle your NGO focus area, manage active clinical slots, and trace WeCare's real-time verification sequence."
                 : (isVetMode ? "Experience high-end routing to independent local veterinary clinics and free shelter checkups seamlessly. Select nodes below to explore." : "Click on any node to expand our smart tracking logic. Experience high-end routing to independent human and veterinary clinics seamlessly.")}
             </p>
           </div>
           
           <div className="relative z-10 drop-shadow-xl">
             <RadialOrbitalTimeline timelineData={timelineData} />
           </div>
        </div>
      </div>
    </>
  );
}
