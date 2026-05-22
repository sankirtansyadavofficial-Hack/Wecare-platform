import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useAuth } from "./auth-context";

interface VetModeContextType {
  isVetMode: boolean;
  toggleVetMode: () => void;
  setVetMode: (val: boolean) => void;
  theme: {
    primary: string;
    primaryHover: string;
    primaryDark: string;
    bgLight: string;
    bgLightDark: string;
    borderLight: string;
    borderDark: string;
    textLight: string;
    textDark: string;
    accentColor: string;
    ringColor: string;
  };
}

const VetModeContext = createContext<VetModeContextType | undefined>(undefined);

export function VetModeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [isVetMode, setIsVetModeState] = useState<boolean>(() => {
    const saved = localStorage.getItem("isVetMode");
    return saved === "true";
  });

  const setVetMode = (val: boolean) => {
    setIsVetModeState(val);
    localStorage.setItem("isVetMode", String(val));
  };

  const toggleVetMode = () => {
    setVetMode(!isVetMode);
  };

  useEffect(() => {
    if (user?.role === "doctor" && user.practiceDomain) {
      setVetMode(user.practiceDomain === "veterinary");
    }
  }, [user]);

  useEffect(() => {
    if (isVetMode) {
      document.documentElement.classList.add("vet-mode");
    } else {
      document.documentElement.classList.remove("vet-mode");
    }
  }, [isVetMode]);

  const theme = isVetMode ? {
    primary: "emerald-600",
    primaryHover: "emerald-700",
    primaryDark: "emerald-500",
    bgLight: "bg-emerald-50 dark:bg-emerald-500/10",
    bgLightDark: "bg-emerald-50 dark:bg-emerald-950/20",
    borderLight: "border-emerald-100 dark:border-emerald-500/20",
    borderDark: "border-emerald-200 dark:border-emerald-900/30",
    textLight: "text-emerald-700 dark:text-emerald-400",
    textDark: "text-emerald-600 dark:text-emerald-500",
    accentColor: "emerald",
    ringColor: "focus-within:ring-emerald-500/50"
  } : {
    primary: "red-600",
    primaryHover: "red-700",
    primaryDark: "red-500",
    bgLight: "bg-red-50 dark:bg-red-500/10",
    bgLightDark: "bg-red-50 dark:bg-red-950/20",
    borderLight: "border-red-100 dark:border-red-500/20",
    borderDark: "border-red-200 dark:border-red-900/30",
    textLight: "text-red-700 dark:text-red-400",
    textDark: "text-red-600 dark:text-red-500",
    accentColor: "red",
    ringColor: "focus-within:ring-red-500/50"
  };

  return (
    <VetModeContext.Provider value={{ isVetMode, toggleVetMode, setVetMode, theme }}>
      {children}
    </VetModeContext.Provider>
  );
}

export function useVetMode() {
  const context = useContext(VetModeContext);
  if (context === undefined) {
    throw new Error("useVetMode must be used within a VetModeProvider");
  }
  return context;
}
