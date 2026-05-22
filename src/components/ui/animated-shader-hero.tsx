import React from 'react';
import { HeartPulse, PawPrint, HeartHandshake, Sparkles } from 'lucide-react';
import { useVetMode } from "@/context/vet-mode-context";
import { useAuth } from "@/context/auth-context";

// Types for component props
export interface HeroProps {
  trustBadge?: {
    text: string;
    icons?: string[];
  };
  headline: {
    line1: string;
    line2: string;
  };
  subtitle: string;
  buttons?: {
    primary?: {
      text: string;
      onClick?: () => void;
    };
    secondary?: {
      text: string;
      onClick?: () => void;
    };
  };
  className?: string;
}

// Reusable Hero Component
const Hero: React.FC<HeroProps> = ({
  trustBadge,
  headline,
  subtitle,
  buttons,
  className = ""
}) => {
  const { isVetMode } = useVetMode();
  const { user } = useAuth();
  
  const isNgo = user?.role === "ngo";
  
  // Dynamic styling variables based on active mode
  let badgeColor = "bg-red-500/10 border-red-500/20 text-red-900 dark:text-red-400";
  let gradientText = "from-red-600 to-rose-500 dark:from-red-500 dark:to-orange-400";
  let primaryBtnColor = "bg-red-600 hover:bg-red-700 dark:hover:bg-red-500 hover:shadow-red-500/25";
  let sosBorder = "border-red-100 dark:border-red-900/30";
  let sosTag = "text-red-600 dark:text-red-400";
  let sosPing = "bg-red-400";
  let sosIndicator = "bg-red-500";
  let sosTitle = "Emergency Services";
  let sosDesc = "Critical situation? Instantly connect with the nearest human or veterinary emergency room.";
  let sosBtnText = "AI EMERGENCY SOS";
  let sosBtnBg = "bg-red-600 hover:bg-red-700 shadow-red-500/20";
  let SosIcon = HeartPulse;

  if (isNgo) {
    badgeColor = "bg-purple-500/10 border-purple-500/20 text-purple-900 dark:text-purple-400";
    gradientText = "from-purple-600 to-indigo-500 dark:from-purple-500 dark:to-indigo-400";
    primaryBtnColor = "bg-purple-600 hover:bg-purple-700 dark:hover:bg-purple-500 hover:shadow-purple-500/25";
    sosBorder = "border-purple-100 dark:border-purple-900/30";
    sosTag = "text-purple-600 dark:text-purple-400";
    sosPing = "bg-purple-400";
    sosIndicator = "bg-purple-500";
    sosTitle = "Social Impact Support";
    sosDesc = "Critical case? Instantly book a sponsored checkup or consult our AI Assistant to route patient cases.";
    sosBtnText = "AI NGO ASSISTANT";
    sosBtnBg = "bg-purple-600 hover:bg-purple-700 shadow-purple-500/20";
    SosIcon = Sparkles;
  } else if (isVetMode) {
    badgeColor = "bg-emerald-500/10 border-emerald-500/20 text-emerald-900 dark:text-emerald-400";
    gradientText = "from-emerald-600 to-teal-500 dark:from-emerald-500 dark:to-teal-400";
    primaryBtnColor = "bg-emerald-600 hover:bg-emerald-700 dark:hover:bg-emerald-500 hover:shadow-emerald-500/25";
    sosBorder = "border-emerald-100 dark:border-emerald-900/30";
    sosTag = "text-emerald-600 dark:text-emerald-400";
    sosPing = "bg-emerald-400";
    sosIndicator = "bg-emerald-500";
    sosTitle = "Pet Emergency Services";
    sosDesc = "Critical pet situation? Instantly connect with the nearest veterinary emergency room.";
    sosBtnText = "AI PET ER SOS";
    sosBtnBg = "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20";
    SosIcon = PawPrint;
  }

  const handleSosClick = () => {
    if (isNgo) {
      window.location.hash = "/ai-assistant";
    } else {
      window.location.hash = "/urgent-care";
    }
  };

  return (
    <div className={`relative w-full h-screen overflow-hidden bg-transparent transition-colors flex flex-col justify-center ${className}`}>
      <style>{`
        @keyframes fade-in-down {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-down { animation: fade-in-down 0.8s ease-out forwards; }
        .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; opacity: 0; }
        .animation-delay-200 { animation-delay: 0.2s; }
        .animation-delay-400 { animation-delay: 0.4s; }
        .animation-delay-600 { animation-delay: 0.6s; }
        .animation-delay-800 { animation-delay: 0.8s; }
      `}</style>
      
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-gray-900 dark:text-gray-100 bg-gradient-to-b from-white/20 via-transparent to-white/60 dark:from-black/20 dark:via-transparent dark:to-black/60 backdrop-blur-sm transition-colors">
        {trustBadge && (
          <div className="mb-8 animate-fade-in-down">
            <div className={`flex items-center gap-2 px-6 py-3 backdrop-blur-md border rounded-full text-sm ${badgeColor}`}>
              {trustBadge.icons && (
                <div className="flex">
                  {trustBadge.icons.map((icon, index) => (
                    <span key={index} className="mr-1">
                      {icon}
                    </span>
                  ))}
                </div>
              )}
              <span className="font-semibold">{trustBadge.text}</span>
            </div>
          </div>
        )}

        <div className="text-center space-y-6 max-w-5xl mx-auto px-4 drop-shadow-sm">
          <div className="space-y-2">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-gray-900 dark:text-white tracking-tighter animate-fade-in-up animation-delay-200">
              {headline.line1}
            </h1>
            <h1 className={`text-5xl md:text-7xl lg:text-8xl font-black bg-gradient-to-r bg-clip-text text-transparent animate-fade-in-up animation-delay-400 tracking-tighter ${gradientText}`}>
              {headline.line2}
            </h1>
          </div>
          
          <div className="max-w-3xl mx-auto animate-fade-in-up animation-delay-600">
            <p className="text-lg md:text-xl lg:text-2xl text-gray-800 dark:text-gray-200 font-medium leading-relaxed drop-shadow-sm">
              {subtitle}
            </p>
          </div>
          
          {buttons && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10 animate-fade-in-up animation-delay-800">
              {buttons.primary && (
                <button 
                  onClick={buttons.primary.onClick}
                  className={`px-8 py-4 text-white rounded-full font-bold text-lg transition-all duration-300 hover:scale-105 hover:shadow-xl ${primaryBtnColor}`}
                >
                  {buttons.primary.text}
                </button>
              )}
              {buttons.secondary && (
                <button 
                  onClick={buttons.secondary.onClick}
                  className="px-8 py-4 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-full font-bold text-lg transition-all duration-300 hover:scale-105 shadow-sm dark:shadow-none"
                >
                  {buttons.secondary.text}
                </button>
              )}
            </div>
          )}

          {/* Emergency Services / NGO SOS CTA */}
          <div className="mt-16 animate-fade-in-up animation-delay-1000 w-full px-4">
            <div className={`flex flex-col sm:flex-row items-center justify-between gap-6 p-6 sm:px-8 bg-white/70 dark:bg-zinc-900/60 border rounded-3xl shadow-sm max-w-4xl mx-auto backdrop-blur-md ${sosBorder}`}>
              <div className="text-left space-y-2">
                <span className={`font-bold uppercase tracking-wider text-sm flex items-center gap-2 ${sosTag}`}>
                  <span className="relative flex h-2.5 w-2.5">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${sosPing}`}></span>
                    <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${sosIndicator}`}></span>
                  </span>
                  {sosTitle}
                </span>
                <p className="text-gray-900 dark:text-gray-100 md:text-lg font-medium leading-snug max-w-xl">
                  {sosDesc}
                </p>
              </div>
              <button 
                onClick={handleSosClick}
                className={`whitespace-nowrap px-6 py-3.5 w-full sm:w-auto text-white font-bold rounded-full transition-all flex items-center justify-center gap-2 shadow-lg group hover:scale-105 active:scale-95 ${sosBtnBg}`}
              >
                <SosIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                {sosBtnText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
