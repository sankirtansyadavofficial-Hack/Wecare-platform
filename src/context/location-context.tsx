import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { getCurrentPosition, Coordinates } from "@/lib/locationService";

export type PermissionStatus = "prompt" | "granted" | "denied";

interface LocationContextType {
  coordinates: Coordinates | null;
  permissionStatus: PermissionStatus;
  isLoading: boolean;
  requestLocation: () => Promise<boolean>;
  setManualLocation: (lat: number, lng: number) => void;
  error: string | null;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [coordinates, setCoordinates] = useState<Coordinates | null>(() => {
    const saved = sessionStorage.getItem("wecare_location_coords");
    return saved ? JSON.parse(saved) : null;
  });

  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>(() => {
    const saved = sessionStorage.getItem("wecare_location_status") as PermissionStatus;
    return saved || "prompt";
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (coordinates) {
      sessionStorage.setItem("wecare_location_coords", JSON.stringify(coordinates));
    }
  }, [coordinates]);

  useEffect(() => {
    sessionStorage.setItem("wecare_location_status", permissionStatus);
  }, [permissionStatus]);

  const requestLocation = async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const coords = await getCurrentPosition();
      setCoordinates(coords);
      setPermissionStatus("granted");
      setIsLoading(false);
      return true;
    } catch (err: any) {
      console.warn("Location request failed or denied:", err);
      // We assume denied if it fails, or it could be a timeout
      setPermissionStatus("denied");
      setError(err.message || "Failed to fetch location");
      setIsLoading(false);
      return false;
    }
  };

  const setManualLocation = (lat: number, lng: number) => {
    setCoordinates({ lat, lng });
    setPermissionStatus("granted"); // manually setting bypasses the need for true browser location
  };

  return (
    <LocationContext.Provider 
      value={{ 
        coordinates, 
        permissionStatus, 
        isLoading, 
        requestLocation, 
        setManualLocation,
        error 
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
}
