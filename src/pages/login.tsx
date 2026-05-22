import React, { useState, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { 
  ShieldCheck, HeartPulse, User as UserIcon, Mail, Lock, 
  Stethoscope, ChevronRight, Activity, Phone, Calendar, 
  Award, FileText, Upload, Check, AlertCircle, Heart, MapPin
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useLocation as useGlobalLocation } from "@/context/location-context";
import { cn } from "@/lib/utils";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export function Login() {
  const [selectedRole, setSelectedRole] = useState<"patient" | "doctor" | "ngo">("patient");
  const isDoctor = selectedRole === "doctor";
  const isNgo = selectedRole === "ngo";
  const [isSignUp, setIsSignUp] = useState(false);
  
  // Shared States
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  
  // Patient States
  const [dob, setDob] = useState("");
  
  // Doctor States
  const [licenseNumber, setLicenseNumber] = useState("");
  const [issuingBoard, setIssuingBoard] = useState("");
  const [practiceDomain, setPracticeDomain] = useState<"human" | "veterinary">("human");
  const [proofFileName, setProofFileName] = useState("");
  
  // NGO States
  const [ngoRegNo, setNgoRegNo] = useState("");
  const [ngoType, setNgoType] = useState<"human" | "veterinary">("human"); // "human" for Child Support, "veterinary" for Stray Animal Support
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Existing code hooks
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { requestLocation, isLoading: isLocationLoading } = useGlobalLocation();

  const from = location.state?.from?.pathname || "/";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === "application/pdf" || file.type === "image/jpeg" || file.type === "image/png" || file.type === "image/jpg") {
        setProofFileName(file.name);
      } else {
        alert("Please upload a PDF or JPEG/PNG image file.");
      }
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  // Firebase Auth State
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);
    
    try {
      if (isSignUp) {
        if (isDoctor && (!licenseNumber || !issuingBoard || !proofFileName)) {
          setAuthError("Please fill in all medical credential details and upload proof.");
          setAuthLoading(false);
          return;
        }
        if (isNgo && (!ngoRegNo || !proofFileName)) {
          setAuthError("Please fill in all NGO registration details and upload proof.");
          setAuthLoading(false);
          return;
        }
        
        // 1. Create User in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 2. Save Rich Profile to Firestore
        const profileData = {
          name,
          email,
          role: selectedRole,
          phone,
          dob: selectedRole === "patient" ? dob : null,
          licenseNumber: isDoctor ? licenseNumber : null,
          issuingBoard: isDoctor ? issuingBoard : null,
          practiceDomain: isDoctor ? practiceDomain : (isNgo ? ngoType : null),
          proofFileName: (isDoctor || isNgo) ? proofFileName : null,
          ngoRegNo: isNgo ? ngoRegNo : null,
          ngoType: isNgo ? ngoType : null,
          avatar: "",
          bloodGroup: "O+",
          createdAt: new Date().toISOString()
        };

        // We use Promise.race to timeout setDoc if Firestore is not initialized (which causes infinite hang)
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Firestore timeout: Did you create the database in the Firebase Console?")), 10000)
        );
        
        await Promise.race([
          setDoc(doc(db, "users", user.uid), profileData),
          timeoutPromise
        ]);

      } else {
        // Sign In
        await signInWithEmailAndPassword(auth, email, password);
      }

      // Redirection logic
      if (isDoctor) {
        navigate("/doctor-dashboard", { replace: true });
      } else if (isNgo) {
        navigate("/ngo-dashboard", { replace: true });
      } else {
        navigate(from === "/login" ? "/" : from, { replace: true });
      }
    } catch (err: any) {
      console.error("Auth Error:", err);
      // Format Firebase error codes to user-friendly messages
      if (err.code === "auth/email-already-in-use") {
        setAuthError("This email is already registered. Please sign in.");
      } else if (err.code === "auth/invalid-credential") {
        setAuthError("Invalid email or password.");
      } else if (err.code === "auth/weak-password") {
        setAuthError("Password should be at least 6 characters.");
      } else {
        setAuthError(err.message || "An error occurred during authentication.");
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const [showLocationModal, setShowLocationModal] = useState(true);
  const [locationGranted, setLocationGranted] = useState(false);
  const [locationDismissing, setLocationDismissing] = useState(false);
  const locationContext = useGlobalLocation();
  const permissionStatus = locationContext?.permissionStatus;

  // We only want to show the custom prompt if permission hasn't been granted/denied yet
  const needsLocationPrompt = permissionStatus === "prompt" && showLocationModal && !locationGranted;
  // If permission was already granted from a prior visit, don't show at all
  const showBar = needsLocationPrompt || (locationGranted && showLocationModal);

  const handleAllowLocation = async () => {
    try {
      await locationContext.requestLocation();
      setLocationGranted(true);
      // Show success briefly, then smoothly dismiss
      setTimeout(() => {
        setLocationDismissing(true);
        setTimeout(() => setShowLocationModal(false), 400);
      }, 1200);
    } catch {
      setLocationDismissing(true);
      setTimeout(() => setShowLocationModal(false), 400);
    }
  };

  const handleSkipLocation = () => {
    setLocationDismissing(true);
    setTimeout(() => setShowLocationModal(false), 400);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-transparent">
      {/* Chrome-style Location Permission Bar — slides in from top */}
      {showBar && (
        <div 
          className={cn(
            "fixed top-0 left-0 right-0 z-50 transition-all duration-400 ease-out",
            locationDismissing ? "translate-y-[-100%] opacity-0" : "translate-y-0 opacity-100"
          )}
          style={{ animation: locationDismissing ? undefined : "slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1)" }}
        >
          <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border-b border-gray-200/80 dark:border-white/10 shadow-lg shadow-black/5 dark:shadow-black/30">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3 sm:gap-4">
              {/* Icon */}
              <div className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all duration-500",
                locationGranted 
                  ? "bg-emerald-100 dark:bg-emerald-500/20" 
                  : "bg-red-100 dark:bg-red-500/20"
              )}>
                {locationGranted ? (
                  <Check className="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <MapPin className="w-4.5 h-4.5 text-red-600 dark:text-red-400" />
                )}
              </div>
              
              {/* Text */}
              <div className="flex-1 min-w-0">
                {locationGranted ? (
                  <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                    Location access granted ✓
                  </p>
                ) : (
                  <>
                    <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
                      WeCare wants to know your location
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                      Used to find nearby doctors and clinics in your area
                    </p>
                  </>
                )}
              </div>

              {/* Action Buttons */}
              {!locationGranted && (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleSkipLocation}
                    className="px-4 py-2 text-xs font-bold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-all"
                  >
                    Block
                  </button>
                  <button
                    onClick={handleAllowLocation}
                    className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm shadow-blue-500/20 transition-all active:scale-95"
                  >
                    Allow
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Slide-down animation keyframe (injected inline) */}
      <style>{`
        @keyframes slideDown {
          from { transform: translateY(-100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
      {/* Ambient background decoration specific to login */}
      <div className={cn(
        "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[120px] pointer-events-none z-0 transition-colors duration-500",
        isDoctor 
          ? (practiceDomain === "veterinary" ? "bg-emerald-600/10 dark:bg-emerald-500/15" : "bg-indigo-600/10 dark:bg-indigo-500/15")
          : (isNgo ? "bg-violet-600/10 dark:bg-violet-500/15" : "bg-red-600/10 dark:bg-red-500/15")
      )}></div>

      <div className="w-full max-w-lg relative z-10">
        <div className="flex justify-center mb-8">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center shadow-2xl">
              <HeartPulse className={cn(
                "h-7 w-7 transition-colors duration-500 group-hover:scale-110",
                isDoctor 
                  ? (practiceDomain === "veterinary" ? "text-emerald-500" : "text-indigo-500") 
                  : (isNgo ? "text-violet-500" : "text-red-500")
              )} />
            </div>
            <span className="font-extrabold text-3xl tracking-tight text-gray-900 dark:text-white">WeCare</span>
          </Link>
        </div>

        <div className="bg-white/40 dark:bg-black/40 backdrop-blur-2xl border border-gray-200/50 dark:border-white/10 rounded-[2rem] p-8 shadow-xl relative overflow-hidden">
          <div className={cn(
            "absolute top-0 left-0 w-full h-1.5 transition-colors duration-500 bg-gradient-to-r",
            isDoctor 
              ? (practiceDomain === "veterinary" ? "from-emerald-500 to-teal-500" : "from-indigo-600 to-blue-500") 
              : (isNgo ? "from-violet-600 to-fuchsia-500" : "from-red-600 to-orange-500")
          )}></div>
          
          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
            {isSignUp ? "Create an Account" : "Welcome Back"}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-8">
            {isSignUp ? "Join our intelligent healthcare ecosystem." : "Sign in to access your medical dashboard."}
          </p>

          {/* User Type Toggle */}
          <div className="flex p-1 bg-gray-100/50 dark:bg-zinc-900/50 rounded-xl mb-8 border border-gray-200/50 dark:border-white/5 backdrop-blur-md">
            <button 
              type="button"
              onClick={() => setSelectedRole("patient")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all",
                selectedRole === "patient" 
                  ? "bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-sm" 
                  : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              <UserIcon className="w-4 h-4" /> Patient
            </button>
            <button 
              type="button"
              onClick={() => setSelectedRole("doctor")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all",
                selectedRole === "doctor" 
                  ? (practiceDomain === "veterinary" 
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20" 
                      : "bg-indigo-600 text-white shadow-md shadow-indigo-500/20") 
                  : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              <Stethoscope className="w-4 h-4" /> Doctor
            </button>
            <button 
              type="button"
              onClick={() => setSelectedRole("ngo")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all",
                selectedRole === "ngo" 
                  ? "bg-violet-600 text-white shadow-md shadow-violet-500/20" 
                  : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              <Heart className="w-4 h-4" /> NGO Partner
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isDoctor && (
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Practice Domain</label>
                <div className="flex p-1 bg-gray-100/50 dark:bg-zinc-900/50 rounded-xl border border-gray-200/50 dark:border-white/5 backdrop-blur-md">
                  <button
                    type="button"
                    onClick={() => setPracticeDomain("human")}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all",
                      practiceDomain === "human"
                        ? "bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-gray-200/30"
                        : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                    )}
                  >
                    Human Medicine
                  </button>
                  <button
                    type="button"
                    onClick={() => setPracticeDomain("veterinary")}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all",
                      practiceDomain === "veterinary"
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
                        : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                    )}
                  >
                    Veterinary Medicine
                  </button>
                </div>
              </div>
            )}

            {isSignUp && (
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input 
                    type="text" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    required 
                    className="w-full bg-white/60 dark:bg-zinc-900/60 border border-gray-200 dark:border-white/10 rounded-xl pl-11 pr-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500/50 outline-none transition-all" 
                    placeholder="John Doe" 
                  />
                </div>
              </div>
            )}

            {isSignUp && (
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input 
                    type="tel" 
                    value={phone} 
                    onChange={e => setPhone(e.target.value)} 
                    required 
                    className="w-full bg-white/60 dark:bg-zinc-900/60 border border-gray-200 dark:border-white/10 rounded-xl pl-11 pr-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500/50 outline-none transition-all" 
                    placeholder="+91 98765 43210" 
                  />
                </div>
              </div>
            )}

            {isSignUp && selectedRole === "patient" && (
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Date of Birth</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input 
                    type="date" 
                    value={dob} 
                    onChange={e => setDob(e.target.value)} 
                    required 
                    className="w-full bg-white/60 dark:bg-zinc-900/60 border border-gray-200 dark:border-white/10 rounded-xl pl-11 pr-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500/50 outline-none transition-all" 
                  />
                </div>
              </div>
            )}

            {isSignUp && isNgo && (
              <>
                {/* NGO Focus Area */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">NGO Focus Area</label>
                  <div className="flex p-1 bg-gray-100/50 dark:bg-zinc-900/50 rounded-xl border border-gray-200/50 dark:border-white/5 backdrop-blur-md">
                    <button
                      type="button"
                      onClick={() => setNgoType("human")}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all",
                        ngoType === "human"
                          ? "bg-white dark:bg-zinc-800 text-violet-600 dark:text-violet-400 shadow-sm border border-gray-200/30"
                          : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                      )}
                    >
                      Child Health Support
                    </button>
                    <button
                      type="button"
                      onClick={() => setNgoType("veterinary")}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all",
                        ngoType === "veterinary"
                          ? "bg-violet-600 text-white shadow-md shadow-violet-500/20 animate-in fade-in"
                          : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                      )}
                    >
                      Stray Animal Welfare
                    </button>
                  </div>
                </div>

                {/* NGO registration details */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">NGO Registration Number</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Activity className="h-5 w-5 text-gray-400" />
                    </div>
                    <input 
                      type="text" 
                      value={ngoRegNo} 
                      onChange={e => setNgoRegNo(e.target.value)} 
                      required 
                      className="w-full bg-white/60 dark:bg-zinc-900/60 border border-gray-200 dark:border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500/50 outline-none transition-all" 
                      placeholder="NGO-IND-123456" 
                    />
                  </div>
                </div>

                {/* File Upload component for NGO */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">NGO Certificate of Incorporation</label>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept=".pdf,image/jpeg,image/png,image/jpg" 
                    className="hidden" 
                  />
                  <div 
                    onClick={triggerFileSelect}
                    className="w-full border-2 border-dashed border-gray-200 dark:border-white/10 bg-white/30 dark:bg-zinc-950/20 hover:bg-white/50 dark:hover:bg-zinc-950/40 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors"
                  >
                    {proofFileName ? (
                      <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-bold text-sm">
                        <Check className="w-5 h-5 shrink-0" />
                        <span className="truncate max-w-[250px]">{proofFileName}</span>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-xs text-gray-500 dark:text-zinc-400 font-bold">Upload 80G Certificate / MoA (PDF/JPEG)</span>
                      </>
                    )}
                  </div>
                </div>
              </>
            )}

            {isSignUp && isDoctor && (
              <>
                {/* License credentials */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Medical License No.</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Activity className="h-5 w-5 text-gray-400" />
                      </div>
                      <input 
                        type="text" 
                        value={licenseNumber} 
                        onChange={e => setLicenseNumber(e.target.value)} 
                        required 
                        className="w-full bg-white/60 dark:bg-zinc-900/60 border border-gray-200 dark:border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500/50 outline-none transition-all" 
                        placeholder="MCI-123456" 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Issuing Authority</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Award className="h-5 w-5 text-gray-400" />
                      </div>
                      <input 
                        type="text" 
                        value={issuingBoard} 
                        onChange={e => setIssuingBoard(e.target.value)} 
                        required 
                        className="w-full bg-white/60 dark:bg-zinc-900/60 border border-gray-200 dark:border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500/50 outline-none transition-all" 
                        placeholder="Medical Council" 
                      />
                    </div>
                  </div>
                </div>

                {/* File Upload component */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Proof of Medical Registration</label>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept=".pdf,image/jpeg,image/png,image/jpg" 
                    className="hidden" 
                  />
                  <div 
                    onClick={triggerFileSelect}
                    className="w-full border-2 border-dashed border-gray-200 dark:border-white/10 bg-white/30 dark:bg-zinc-950/20 hover:bg-white/50 dark:hover:bg-zinc-950/40 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors"
                  >
                    {proofFileName ? (
                      <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-bold text-sm">
                        <Check className="w-5 h-5 shrink-0" />
                        <span className="truncate max-w-[250px]">{proofFileName}</span>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-xs text-gray-500 dark:text-zinc-400 font-bold">Upload License Proof (PDF/JPEG)</span>
                      </>
                    )}
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  required 
                  className="w-full bg-white/60 dark:bg-zinc-900/60 border border-gray-200 dark:border-white/10 rounded-xl pl-11 pr-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500/50 outline-none transition-all" 
                  placeholder="name@example.com" 
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Password</label>
                {!isSignUp && <a href="#" className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline">Forgot?</a>}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input 
                  type="password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  required 
                  className="w-full bg-white/60 dark:bg-zinc-900/60 border border-gray-200 dark:border-white/10 rounded-xl pl-11 pr-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500/50 outline-none transition-all" 
                  placeholder="••••••••" 
                />
              </div>
            </div>

            {authError && (
              <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm font-medium flex items-start gap-2 mt-4">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p>{authError}</p>
              </div>
            )}

            <button 
              type="submit" 
              disabled={authLoading}
              className={cn(
                "w-full text-white font-bold py-4 rounded-xl transition-all mt-6 flex items-center justify-center gap-2 group shadow-md disabled:opacity-70 disabled:cursor-not-allowed",
                isDoctor 
                  ? (practiceDomain === "veterinary" 
                      ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20" 
                      : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20") 
                  : (isNgo 
                      ? "bg-violet-600 hover:bg-violet-700 shadow-violet-500/20" 
                      : "bg-red-600 hover:bg-red-700 shadow-red-500/20")
              )}
            >
              {authLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  {isSignUp ? "Create Account" : "Sign In"}
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
          
          <div className="mt-8 text-center border-t border-gray-200/50 dark:border-white/10 pt-6">
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
              {isSignUp ? "Already have an account? Log In" : "Don't have an account? Sign Up"}
              <button type="button" onClick={() => setIsSignUp(!isSignUp)} className={cn(
                "ml-2 font-bold hover:underline",
                isDoctor 
                  ? (practiceDomain === "veterinary" ? "text-emerald-500" : "text-indigo-500") 
                  : (isNgo ? "text-violet-500" : "text-red-500")
              )}>
                {isSignUp ? "Sign In" : "Sign Up"}
              </button>
            </p>
          </div>
        </div>

        <div className="mt-8 text-center flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400 text-xs font-medium">
          <ShieldCheck className="w-4 h-4 text-green-500" />
          HIPAA & GDPR Compliant Security
        </div>
      </div>
    </div>
  );
}
