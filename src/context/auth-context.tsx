import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";

type UserRole = "patient" | "doctor" | "ngo" | null;

export interface UserProfile {
  id?: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  dob?: string;
  licenseNumber?: string;
  issuingBoard?: string;
  practiceDomain?: "human" | "veterinary";
  proofFileName?: string;
  ngoRegNo?: string;
  ngoType?: string;
  medicalId?: string; // For doctors
  avatar?: string;
  bloodGroup?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: User | null;
  isLoading: boolean;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  hasActiveBooking: boolean;
  setHasActiveBooking: (val: boolean) => void;
  // We removed the synchronous `login` method because login.tsx now talks directly to Firebase
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Temporarily keeping local active booking state until we migrate bookings to Firestore
  const [hasActiveBooking, setHasActiveBookingState] = useState<boolean>(() => {
    return localStorage.getItem("wecare_active_booking") === "true";
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setFirebaseUser(currentUser);
      if (currentUser) {
        // Fetch user profile from Firestore
        try {
          const docRef = doc(db, "users", currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUser({ id: currentUser.uid, ...docSnap.data() } as UserProfile);
          } else {
            console.warn("No user profile found in Firestore for this auth user.");
            setUser(null);
          }
        } catch (err) {
          console.error("Error fetching user profile:", err);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
      setHasActiveBookingState(false);
      localStorage.removeItem("wecare_active_booking");
    } catch (err) {
      console.error("Logout error", err);
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (user && firebaseUser) {
      try {
        const docRef = doc(db, "users", firebaseUser.uid);
        await updateDoc(docRef, data);
        setUser({ ...user, ...data });
      } catch (err) {
        console.error("Error updating profile:", err);
      }
    }
  };

  const setHasActiveBooking = (val: boolean) => {
    setHasActiveBookingState(val);
    localStorage.setItem("wecare_active_booking", String(val));
  };

  return (
    <AuthContext.Provider value={{ user, firebaseUser, isLoading, logout, updateProfile, hasActiveBooking, setHasActiveBooking }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
