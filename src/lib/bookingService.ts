import { useState, useEffect } from "react";
import { db } from "./firebase";
import { collection, addDoc, query, where, onSnapshot, deleteDoc, doc, getDocs, updateDoc } from "firebase/firestore";

export interface Booking {
  id?: string;
  userId: string;
  doctorId: number;
  date: string;
  status: "pending" | "completed";
  patientName?: string;
  patientAgeOrBreed?: string;
  doctorName?: string;
  type?: string;
  location?: string;
}

// 1. Create a Booking
export async function createFirestoreBooking(bookingData: Omit<Booking, "id">) {
  try {
    const docRef = await addDoc(collection(db, "bookings"), bookingData);
    // Dispatch an event just in case any legacy local components need a nudge, though Firestore snapshot listeners handle this better
    window.dispatchEvent(new Event("wecare_booking_updated"));
    return { id: docRef.id, ...bookingData };
  } catch (e) {
    console.error("Error adding booking: ", e);
    throw e;
  }
}

// 2. Cancel a Booking
export async function cancelFirestoreBooking(bookingId: string) {
  try {
    await deleteDoc(doc(db, "bookings", bookingId));
    window.dispatchEvent(new Event("wecare_booking_updated"));
  } catch (e) {
    console.error("Error deleting booking: ", e);
    throw e;
  }
}

// 3. React Hook to listen to bookings
export function useBookings(userId: string | undefined, role: string | null | undefined, doctorId?: number) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setBookings([]);
      setLoading(false);
      return;
    }

    let q;
    const bookingsRef = collection(db, "bookings");

    if (role === "patient" || role === "ngo") {
      q = query(bookingsRef, where("userId", "==", userId));
    } else if (role === "doctor" && doctorId) {
      q = query(bookingsRef, where("doctorId", "==", doctorId));
    } else {
      q = query(bookingsRef, where("userId", "==", userId));
    }

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetched: Booking[] = [];
      querySnapshot.forEach((doc) => {
        fetched.push({ id: doc.id, ...doc.data() } as Booking);
      });
      setBookings(fetched);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching bookings:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId, role, doctorId]);

  return { bookings, loading };
}
