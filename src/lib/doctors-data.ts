import { useState, useEffect } from "react";

export interface Doctor {
  id: number;
  name: string;
  title: string;
  specialty: string;
  experience: number;
  rating: number;
  reviewsCount: number;
  location: string;
  availability: string;
  image: string;
  onlineStatus: "online" | "offline";
  bio: string;
  verified: boolean;
  coordinates?: { lat: number; lng: number };
}

export interface Appointment {
  id: string;
  userId: string; // matches user's email or name
  doctorId: number;
  date: string;
  status: "pending" | "completed";
}

export interface Review {
  reviewId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  doctorId: number;
  rating: number;
  comment: string;
  timestamp: string;
}

// Initial Doctor Data - Human Mode
export const INITIAL_HUMAN_DOCTORS: Doctor[] = [
  {
    id: 1,
    name: "Dr. Sarah Jenkins",
    title: "MD, FACP",
    specialty: "General Medicine",
    experience: 12,
    rating: 4.9,
    reviewsCount: 124,
    location: "Metro Clinic, Chamber 3A, Downtown",
    availability: "Available Now",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300&h=300",
    onlineStatus: "online",
    bio: "Dr. Sarah Jenkins is an experienced internist specializing in preventative medicine, chronic condition management, and family health. She is dedicated to empathetic, evidence-based care.",
    verified: true,
    coordinates: { lat: 40.4672, lng: -73.7641},
  },
  {
    id: 2,
    name: "Dr. Ananya Sharma",
    title: "MD, DCH (Pediatrics)",
    specialty: "Pediatrics",
    experience: 8,
    rating: 4.8,
    reviewsCount: 89,
    location: "Little Angels Clinic, Residency Road",
    availability: "Next slots: 4:30 PM",
    image: "https://images.unsplash.com/photo-1594824432258-f9011b0e0084?auto=format&fit=crop&q=80&w=300&h=300",
    onlineStatus: "online",
    bio: "Dr. Ananya Sharma focuses on comprehensive pediatric care, childhood immunizations, and developmental tracking. She creates a warm, stress-free environment for young patients.",
    verified: true,
    coordinates: { lat: 40.5962, lng: -74.0887},
  },
  {
    id: 3,
    name: "Dr. James Wilson",
    title: "MS (Orthopedics), M.Ch",
    specialty: "Orthopedics",
    experience: 15,
    rating: 4.7,
    reviewsCount: 210,
    location: "Joint & Bone Institute, Park Avenue",
    availability: "Available Tomorrow",
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=300&h=300",
    onlineStatus: "offline",
    bio: "Dr. James Wilson is a renowned orthopedic surgeon specializing in sports medicine, joint replacements, and complex arthroscopic procedures with over 15 years of surgical excellence.",
    verified: true,
    coordinates: { lat: 40.9490, lng: -74.0159},
  },
  {
    id: 4,
    name: "Dr. Rajesh Kumar",
    title: "MD, DM (Cardiology)",
    specialty: "Cardiology",
    experience: 18,
    rating: 4.9,
    reviewsCount: 340,
    location: "Apex Heart Hospital, Outer Ring Road",
    availability: "Available Now",
    image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=300&h=300",
    onlineStatus: "online",
    bio: "Dr. Rajesh Kumar is a leading interventional cardiologist. He specializes in heart failure management, angioplasty, and cardiac rehabilitation.",
    verified: true,
    coordinates: { lat: 40.6574, lng: -74.0635},
  },
  {
    id: 5,
    name: "Dr. Chloe Bennett",
    title: "MD (Dermatology)",
    specialty: "Dermatology",
    experience: 9,
    rating: 4.6,
    reviewsCount: 75,
    location: "Radiant Skin Clinic, 5th Avenue",
    availability: "Available Now",
    image: "https://images.unsplash.com/photo-1591604466107-ec97de577aff?auto=format&fit=crop&q=80&w=300&h=300",
    onlineStatus: "online",
    bio: "Dr. Chloe Bennett is an expert in clinical and aesthetic dermatology, dealing with severe acne, eczema, skin cancer screenings, and micro-pigmentation therapy.",
    verified: true,
    coordinates: { lat: 40.5330, lng: -73.9612},
  },
  {
    id: 6,
    name: "Dr. Alan Turing",
    title: "MD, Ph.D. (Neurology)",
    specialty: "Neurology",
    experience: 14,
    rating: 4.9,
    reviewsCount: 140,
    location: "Cognitive Neuro Center, Science Park",
    availability: "Next slots: 2:00 PM Tomorrow",
    image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300&h=300",
    onlineStatus: "offline",
    bio: "Dr. Alan Turing specializes in cognitive neurology, migraine syndromes, sleep disorders, and early stage Alzheimer's diagnostics.",
    verified: true,
    coordinates: { lat: 40.9559, lng: -74.2011},
  },
  {
    id: 7,
    name: "Dr. David Attenborough",
    title: "MD, FRCP (Oncology)",
    specialty: "Oncology",
    experience: 20,
    rating: 4.9,
    reviewsCount: 195,
    location: "OncoCare Comprehensive Center, 1st Lane",
    availability: "Available in 3 days",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300&h=300",
    onlineStatus: "offline",
    bio: "Dr. David Attenborough is a compassionate oncologist specializing in chemotherapy schedules, immunotherapy trials, and supportive palliative patient circles.",
    verified: true,
    coordinates: { lat: 40.4747, lng: -73.9516},
  },
  {
    id: 8,
    name: "Dr. Elizabeth Blackwell",
    title: "MD, OB-GYN",
    specialty: "Gynecology",
    experience: 11,
    rating: 4.8,
    reviewsCount: 112,
    location: "Women's Health Plaza, Central Hub",
    availability: "Available Now",
    image: "https://images.unsplash.com/photo-1594824432258-f9011b0e0084?auto=format&fit=crop&q=80&w=300&h=300",
    onlineStatus: "online",
    bio: "Dr. Elizabeth Blackwell provides supportive prenatal care, high-risk obstetrics, and general gynecological screenings with a focus on female wellness.",
    verified: true,
    coordinates: { lat: 40.6601, lng: -74.1269},
  },
  {
    id: 9,
    name: "Dr. Sigmund Freud",
    title: "MD, Ph.D. (Psychiatry)",
    specialty: "Psychiatry",
    experience: 17,
    rating: 4.7,
    reviewsCount: 154,
    location: "Mind Balance Clinic, Quiet Heights",
    availability: "Next slots: 6:00 PM Today",
    image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=300&h=300",
    onlineStatus: "online",
    bio: "Dr. Sigmund Freud is a seasoned psychiatrist managing adult ADHD, treatment-resistant depression, anxiety counseling, and stress therapy.",
    verified: false,
    coordinates: { lat: 40.8769, lng: -73.7728},
  },
  {
    id: 10,
    name: "Dr. Helen Keller",
    title: "MD, MS (Ophthalmology)",
    specialty: "Ophthalmology",
    experience: 13,
    rating: 4.8,
    reviewsCount: 98,
    location: "Clear Sight Center, Bright Street",
    availability: "Available Tomorrow",
    image: "https://images.unsplash.com/photo-1591604466107-ec97de577aff?auto=format&fit=crop&q=80&w=300&h=300",
    onlineStatus: "online",
    bio: "Dr. Helen Keller specializes in advanced laser eye surgeries, diabetic retinopathy tracking, pediatric refraction, and cataract surgeries.",
    verified: true,
    coordinates: { lat: 40.9140, lng: -74.2366},
  }
];

// Initial Doctor Data - Vet Mode
export const INITIAL_VET_DOCTORS: Doctor[] = [
  {
    id: 101,
    name: "Dr. Arthur Pendelton",
    title: "DVM, PhD",
    specialty: "General Veterinary",
    experience: 14,
    rating: 4.9,
    reviewsCount: 148,
    location: "Green Fields Vet Clinic, Rural Bypass",
    availability: "Available Now",
    image: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=300&h=300",
    onlineStatus: "online",
    bio: "Dr. Arthur Pendelton is a senior veterinarian dedicated to farm animal health, canine care, and general pet vaccinations. He has served rural areas for over 14 years.",
    verified: true,
    coordinates: { lat: 40.6224, lng: -73.9077},
  },
  {
    id: 102,
    name: "Dr. Emily Vance",
    title: "DVM (Feline Care)",
    specialty: "Feline Medicine",
    experience: 7,
    rating: 4.8,
    reviewsCount: 94,
    location: "Purrfect Pets Hospital, High Street",
    availability: "Next slots: 3:00 PM",
    image: "https://images.unsplash.com/photo-1594824432258-f9011b0e0084?auto=format&fit=crop&q=80&w=300&h=300",
    onlineStatus: "online",
    bio: "Dr. Emily Vance focuses exclusively on feline physical therapy, behavioral medicine, and feline infectious diseases in a calm, stress-free clinical environment.",
    verified: true,
    coordinates: { lat: 40.6861, lng: -73.8918},
  },
  {
    id: 103,
    name: "Dr. Marcus Reed",
    title: "DVM (Exotics Specialist)",
    specialty: "Exotic Pets",
    experience: 10,
    rating: 4.7,
    reviewsCount: 110,
    location: "Wild & Exotic Clinic, Boulevard Park",
    availability: "Available Tomorrow",
    image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=300&h=300",
    onlineStatus: "offline",
    bio: "Dr. Marcus Reed is a specialist in reptilian surgeries, avian health, and small mammals (rabbits, ferrets, hamsters). Passionate about rare and exotic pet care.",
    verified: true,
    coordinates: { lat: 40.6756, lng: -73.9742},
  },
  {
    id: 104,
    name: "Dr. Priya Patel",
    title: "DVM, MS (Surgeon)",
    specialty: "Veterinary Surgery",
    experience: 12,
    rating: 4.9,
    reviewsCount: 202,
    location: "State Veterinary ER, East Lane",
    availability: "Available Now",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300&h=300",
    onlineStatus: "online",
    bio: "Dr. Priya Patel is a chief veterinary surgeon performing complex orthopedics, soft-tissue reconstructions, and neurosurgeries for pets.",
    verified: true,
    coordinates: { lat: 40.6266, lng: -74.1500},
  },
  {
    id: 105,
    name: "Dr. Charles Darwin",
    title: "DVM, DACVIM (Cardiology)",
    specialty: "Veterinary Cardiology",
    experience: 16,
    rating: 4.9,
    reviewsCount: 88,
    location: "Heart & Tail Clinic, Central Park",
    availability: "Available Tomorrow",
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=300&h=300",
    onlineStatus: "online",
    bio: "Dr. Charles Darwin specializes in animal cardiovascular assessments, electro-cardiography, and management of congenital heart diseases in dogs and cats.",
    verified: true,
    coordinates: { lat: 40.5794, lng: -73.8615},
  }
];

// Initial mock reviews
export const INITIAL_REVIEWS: Review[] = [
  {
    reviewId: "rev_1",
    userId: "patient1@example.com",
    userName: "David Miller",
    userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100&h=100",
    doctorId: 1,
    rating: 5,
    comment: "Dr. Jenkins was extremely thorough and patient. She explained my symptoms clearly and took the time to answer all my questions. Highly recommended!",
    timestamp: "2026-05-18T10:30:00Z"
  },
  {
    reviewId: "rev_2",
    userId: "patient2@example.com",
    userName: "Sophia Martinez",
    doctorId: 1,
    rating: 4,
    comment: "Very professional and modern clinic space. The diagnosis was precise and I felt comfortable throughout my visit.",
    timestamp: "2026-05-15T14:15:00Z"
  },
  {
    reviewId: "rev_3",
    userId: "patient3@example.com",
    userName: "Robert Chen",
    userAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100&h=100",
    doctorId: 2,
    rating: 5,
    comment: "Incredibly good with children! Dr. Sharma made my 4-year-old feel so safe and happy during the entire vaccination checkup.",
    timestamp: "2026-05-20T09:00:00Z"
  },
  {
    reviewId: "rev_4",
    userId: "patient4@example.com",
    userName: "Jane Foster",
    doctorId: 3,
    rating: 4,
    comment: "Great experience with my knee surgery follow-up. Dr. Wilson is direct and provides practical recovery schedules.",
    timestamp: "2026-05-10T11:45:00Z"
  },
  {
    reviewId: "rev_5",
    userId: "patient5@example.com",
    userName: "Amit Patel",
    userAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100&h=100",
    doctorId: 4,
    rating: 5,
    comment: "One of the best cardiologists out there. Under his guidance, my father's hypertension is fully controlled now.",
    timestamp: "2026-05-19T16:20:00Z"
  },
  {
    reviewId: "rev_6",
    userId: "user@example.com", // Michael Scott
    userName: "Michael Scott",
    doctorId: 1,
    rating: 5,
    comment: "Dr. Sarah Jenkins is outstanding. I had a severe throat issue and she diagnosed and resolved it with great care! Top notch physician.",
    timestamp: "2026-05-12T08:30:00Z"
  },
  {
    reviewId: "rev_7",
    userId: "user@example.com", // Michael Scott
    userName: "Michael Scott",
    doctorId: 101,
    rating: 5,
    comment: "Brought my dog Rocky here for vaccine checks. Dr. Pendelton is extremely caring and Rocky was so calm around him. The best rural veterinarian service!",
    timestamp: "2026-05-14T11:20:00Z"
  }
];

// Initial mock appointments mapping "Michael Scott" to specific doctors
export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: "app_1",
    userId: "user@example.com", // matches Michael Scott's email
    doctorId: 1, // Dr. Sarah Jenkins (unlocked)
    date: "2026-05-12T08:00:00Z",
    status: "completed"
  },
  {
    id: "app_2",
    userId: "user@example.com",
    doctorId: 101, // Dr. Arthur Pendelton (unlocked)
    date: "2026-05-14T11:00:00Z",
    status: "completed"
  }
];

// LocalStorage Helper functions to persist ratings, appointments and reviews
function getLocalStorageData<T>(key: string, defaultValue: T): T {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch (e) {
    console.error("Failed to read from localStorage", e);
    return defaultValue;
  }
}

function saveLocalStorageData<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to write to localStorage", e);
  }
}

// State Accessors
export function getDoctors(): Doctor[] {
  const customDoctors = getLocalStorageData<Doctor[]>("wecare_custom_doctors", []);
  const initialDoctors = [...INITIAL_HUMAN_DOCTORS, ...INITIAL_VET_DOCTORS];
  
  // Merge initial doctors with custom ones to load updated average ratings
  return initialDoctors.map(initDoc => {
    const custom = customDoctors.find(c => c.id === initDoc.id);
    return custom ? { ...initDoc, rating: custom.rating, reviewsCount: custom.reviewsCount } : initDoc;
  });
}

export function getAppointments(): Appointment[] {
  return getLocalStorageData<Appointment[]>("wecare_appointments", INITIAL_APPOINTMENTS);
}

export function getReviews(doctorId: number): Review[] {
  const reviews = getLocalStorageData<Review[]>("wecare_reviews", INITIAL_REVIEWS);
  return reviews.filter(r => r.doctorId === doctorId).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function addReview(doctorId: number, rating: number, comment: string, userName: string, userId: string): Review {
  const reviews = getLocalStorageData<Review[]>("wecare_reviews", INITIAL_REVIEWS);
  const newReview: Review = {
    reviewId: `rev_${Math.random().toString(36).substring(2, 9)}`,
    userId,
    userName,
    doctorId,
    rating,
    comment,
    timestamp: new Date().toISOString()
  };
  
  const updatedReviews = [newReview, ...reviews];
  saveLocalStorageData("wecare_reviews", updatedReviews);

  // Recalculate doctor ratings
  const allDoctors = getDoctors();
  const doctor = allDoctors.find(d => d.id === doctorId);
  if (doctor) {
    const doctorReviews = updatedReviews.filter(r => r.doctorId === doctorId);
    const sumRatings = doctorReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = Number((sumRatings / doctorReviews.length).toFixed(1));
    
    const customDoctors = getLocalStorageData<Doctor[]>("wecare_custom_doctors", []);
    const updatedCustomDoctors = customDoctors.filter(d => d.id !== doctorId);
    updatedCustomDoctors.push({
      ...doctor,
      rating: avgRating,
      reviewsCount: doctorReviews.length
    });
    saveLocalStorageData("wecare_custom_doctors", updatedCustomDoctors);
  }

  return newReview;
}

export function createAppointment(userId: string, doctorId: number, status: "pending" | "completed" = "completed"): Appointment {
  const appointments = getLocalStorageData<Appointment[]>("wecare_appointments", INITIAL_APPOINTMENTS);
  const newApp: Appointment = {
    id: `app_${Math.random().toString(36).substring(2, 9)}`,
    userId,
    doctorId,
    date: new Date().toISOString(),
    status
  };

  const updatedApps = [...appointments, newApp];
  saveLocalStorageData("wecare_appointments", updatedApps);
  return newApp;
}

export function cancelAppointment(appointmentId: string): void {
  const appointments = getLocalStorageData<Appointment[]>("wecare_appointments", INITIAL_APPOINTMENTS);
  const updatedApps = appointments.filter(app => app.id !== appointmentId);
  saveLocalStorageData("wecare_appointments", updatedApps);
  
  // Dispatch event so all components react immediately
  window.dispatchEvent(new Event("wecare_booking_updated"));
}

export function useVerifyAppointment(userId: string | undefined, doctorId: number, refreshTrigger: number = 0) {
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    if (!userId) {
      setIsVerified(false);
      return;
    }
    
    const checkVerification = () => {
      const apps = getAppointments();
      // Match email, name, or default user conversions
      const hasMatch = apps.some(app => {
        const matchesUser = 
          app.userId.toLowerCase() === userId.toLowerCase() ||
          (userId === "Michael Scott" && app.userId.toLowerCase() === "user@example.com") ||
          (userId.toLowerCase() === "user@example.com" && app.userId === "Michael Scott");
        return matchesUser && app.doctorId === doctorId;
      });
      setIsVerified(hasMatch);
    };

    checkVerification();

    // Set up a small local event listener to instantly capture booking completions
    window.addEventListener("wecare_booking_updated", checkVerification);
    return () => {
      window.removeEventListener("wecare_booking_updated", checkVerification);
    };
  }, [userId, doctorId, refreshTrigger]);

  return isVerified;
}
