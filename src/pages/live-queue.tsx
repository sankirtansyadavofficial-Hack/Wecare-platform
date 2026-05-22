import React, { useState, useEffect, useRef } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { 
  Clock, Navigation2, MapPin, Bell, Play, Pause, UserCheck, 
  UserX, Plus, RefreshCw, CheckCircle2, AlertTriangle, 
  Smartphone, ShieldAlert, PawPrint, Zap, History, Send 
} from "lucide-react";
import { useVetMode } from "@/context/vet-mode-context";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";

interface Appointment {
  id: number;
  name: string;
  patient?: string;
  phone: string;
  status: 'Waiting' | 'Checked-In' | 'In-Progress' | 'No-Show' | 'Completed' | 'Pending' | 'Cancelled';
  sequence: number;
  time?: string;
  type?: string;
  actualDurationSeconds?: number;
}

interface SMSLog {
  timestamp: string;
  recipient: string;
  message: string;
}

export function LiveQueueTracking() {
  const { isVetMode } = useVetMode();
  const { user, hasActiveBooking } = useAuth();

  // 1. Initial State Definitions
  const initialHumanPatients: Appointment[] = [
    { id: 10, name: "Rohan Gupta", patient: "Rohan Gupta", phone: "+91 98765 10101", status: "Completed", sequence: 10, actualDurationSeconds: 510, time: "09:00 AM", type: "In-Clinic" },
    { id: 11, name: "Aarav Sharma", patient: "Aarav Sharma", phone: "+91 98765 20202", status: "Completed", sequence: 11, actualDurationSeconds: 555, time: "09:15 AM", type: "In-Clinic" },
    { id: 12, name: "Meera Sen", patient: "Meera Sen", phone: "+91 98765 30303", status: "Completed", sequence: 12, actualDurationSeconds: 705, time: "09:30 AM", type: "In-Clinic" },
    { id: 13, name: "Suresh Iyer", patient: "Suresh Iyer", phone: "+91 98765 40404", status: "In-Progress", sequence: 13, time: "10:00 AM", type: "In-Clinic" },
    { id: 14, name: "Anjali Rao (You)", patient: "Anjali Rao (You)", phone: "+91 98765 50505", status: "Checked-In", sequence: 14, time: "10:30 AM", type: "In-Clinic" },
    { id: 15, name: "Vikram Malhotra", patient: "Vikram Malhotra", phone: "+91 98765 60606", status: "Checked-In", sequence: 15, time: "11:00 AM", type: "In-Clinic" },
    { id: 16, name: "Pooja Hegde", patient: "Pooja Hegde", phone: "+91 98765 70707", status: "Waiting", sequence: 16, time: "11:30 AM", type: "In-Clinic" },
    { id: 17, name: "Kabir Mehta", patient: "Kabir Mehta", phone: "+91 98765 80808", status: "Checked-In", sequence: 17, time: "12:00 PM", type: "Video Consult" },
    { id: 18, name: "Sneha Nair", patient: "Sneha Nair", phone: "+91 98765 90909", status: "Waiting", sequence: 18, time: "12:30 PM", type: "Video Consult" },
    { id: 19, name: "Michael Scott", patient: "Michael Scott", phone: "+91 98765 91919", status: "Pending", sequence: 19, time: "01:00 PM", type: "Video Consult" },
    { id: 20, name: "Pam Beesly", patient: "Pam Beesly", phone: "+91 98765 92929", status: "Pending", sequence: 20, time: "01:30 PM", type: "In-Clinic" },
    { id: 21, name: "Jim Halpert", patient: "Jim Halpert", phone: "+91 98765 93939", status: "Pending", sequence: 21, time: "02:00 PM", type: "In-Clinic" },
    { id: 22, name: "Dwight Schrute", patient: "Dwight Schrute", phone: "+91 98765 94949", status: "Cancelled", sequence: 22, time: "02:30 PM", type: "Video Consult" },
  ];

  const initialVetPatients: Appointment[] = [
    { id: 10, name: "Max (Golden Retriever)", patient: "Max (Golden Retriever)", phone: "+91 98765 10101", status: "Completed", sequence: 10, actualDurationSeconds: 510, time: "09:00 AM", type: "In-Clinic" },
    { id: 11, name: "Luna (Stray Kitten)", patient: "Luna (Stray Kitten)", phone: "+91 98765 20202", status: "Completed", sequence: 11, actualDurationSeconds: 555, time: "09:15 AM", type: "In-Clinic" },
    { id: 12, name: "Rocky (Street Puppy)", patient: "Rocky (Street Puppy)", phone: "+91 98765 30303", status: "Completed", sequence: 12, actualDurationSeconds: 705, time: "09:30 AM", type: "In-Clinic" },
    { id: 13, name: "Bella (Shelter Horse)", patient: "Bella (Shelter Horse)", phone: "+91 98765 40404", status: "In-Progress", sequence: 13, time: "10:00 AM", type: "In-Clinic" },
    { id: 14, name: "Milo (Persian Cat) (You)", patient: "Milo (Persian Cat) (You)", phone: "+91 98765 50505", status: "Checked-In", sequence: 14, time: "10:30 AM", type: "In-Clinic" },
    { id: 15, name: "Coco (Chihuahua)", patient: "Coco (Chihuahua)", phone: "+91 98765 60606", status: "Checked-In", sequence: 15, time: "11:00 AM", type: "In-Clinic" },
    { id: 16, name: "Oliver (Tabby Cat)", patient: "Oliver (Tabby Cat)", phone: "+91 98765 70707", status: "Waiting", sequence: 16, time: "11:30 AM", type: "In-Clinic" },
    { id: 17, name: "Bailey (Beagle)", patient: "Bailey (Beagle)", phone: "+91 98765 80808", status: "Checked-In", sequence: 17, time: "12:00 PM", type: "Video Consult" },
    { id: 18, name: "Daisy (Labrador)", patient: "Daisy (Labrador)", phone: "+91 98765 90909", status: "Waiting", sequence: 18, time: "12:30 PM", type: "Video Consult" },
    { id: 19, name: "Buster (Pug)", patient: "Buster (Pug)", phone: "+91 98765 91919", status: "Pending", sequence: 19, time: "01:00 PM", type: "Video Consult" },
    { id: 20, name: "Teddy (Rabbit)", patient: "Teddy (Rabbit)", phone: "+91 98765 92929", status: "Pending", sequence: 20, time: "01:30 PM", type: "In-Clinic" },
    { id: 21, name: "Lily (Hamster)", patient: "Lily (Hamster)", phone: "+91 98765 93939", status: "Pending", sequence: 21, time: "02:00 PM", type: "In-Clinic" },
    { id: 22, name: "Winston (German Shepherd)", patient: "Winston (German Shepherd)", phone: "+91 98765 94949", status: "Cancelled", sequence: 22, time: "02:30 PM", type: "Video Consult" },
  ];

  const apptsKey = isVetMode ? "wecare_vet_appointments" : "wecare_human_appointments";
  const servingKey = isVetMode ? "wecare_vet_current_serving_id" : "wecare_human_current_serving_id";
  const stopwatchKey = isVetMode ? "wecare_vet_session_start" : "wecare_human_session_start";
  const isPausedKey = isVetMode ? "wecare_vet_queue_paused" : "wecare_human_queue_paused";

  // 2. Core Queue States
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem(apptsKey);
    if (saved) return JSON.parse(saved);
    const defaults = isVetMode ? initialVetPatients : initialHumanPatients;
    localStorage.setItem(apptsKey, JSON.stringify(defaults));
    return defaults;
  });

  const [currentServingId, setCurrentServingId] = useState<number | null>(() => {
    const saved = localStorage.getItem(servingKey);
    return saved ? parseInt(saved, 10) : 13;
  });

  const [isPaused, setIsPaused] = useState<boolean>(() => {
    return localStorage.getItem(isPausedKey) === "true";
  });

  const [rollingAvgSeconds, setRollingAvgSeconds] = useState(590); // 9m 50s initial
  const [totalSecondsToday, setTotalSecondsToday] = useState(1770); // initial completed sessions total
  const [completedCount, setCompletedCount] = useState(3);
  const [sessionElapsedSeconds, setSessionElapsedSeconds] = useState<number>(0);

  // Simulator Controls
  const [isAccelerated, setIsAccelerated] = useState(false);
  const [activeTab, setActiveTab] = useState<'both' | 'patient' | 'doctor'>('both');
  const [smsLogs, setSmsLogs] = useState<SMSLog[]>([]);
  const [notificationSent, setNotificationSent] = useState(false);

  // Sync state if Vet Mode changes
  useEffect(() => {
    const saved = localStorage.getItem(apptsKey);
    const appts = saved ? JSON.parse(saved) : (isVetMode ? initialVetPatients : initialHumanPatients);
    setAppointments(appts);
    if (!saved) {
      localStorage.setItem(apptsKey, JSON.stringify(appts));
    }

    const savedServing = localStorage.getItem(servingKey);
    setCurrentServingId(savedServing ? parseInt(savedServing, 10) : 13);

    const paused = localStorage.getItem(isPausedKey) === "true";
    setIsPaused(paused);

    setSmsLogs([]);
    setNotificationSent(false);
  }, [isVetMode, apptsKey, servingKey, isPausedKey]);

  // Reactive listener to pull updates from other tabs
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === apptsKey && e.newValue) {
        setAppointments(JSON.parse(e.newValue));
      }
      if (e.key === servingKey && e.newValue) {
        setCurrentServingId(e.newValue ? parseInt(e.newValue, 10) : null);
      }
      if (e.key === isPausedKey && e.newValue) {
        setIsPaused(e.newValue === "true");
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [apptsKey, servingKey, isPausedKey]);

  // 3. Ticking Stopwatch and Wait Timers with Absolute Timestamp Sync & Speed Acceleration
  useEffect(() => {
    let startVal = localStorage.getItem(stopwatchKey);
    if (!startVal) {
      const initialStart = Date.now() - 240 * 1000; // 4 mins elapsed default
      localStorage.setItem(stopwatchKey, String(initialStart));
      startVal = String(initialStart);
    }

    const interval = setInterval(() => {
      if (isPaused) return;

      if (isAccelerated) {
        // Shifting start time backward to speed up elapsed duration
        const currentStart = localStorage.getItem(stopwatchKey);
        if (currentStart) {
          const newStart = parseInt(currentStart, 10) - 9000;
          localStorage.setItem(stopwatchKey, String(newStart));
        }
      }

      const currentStart = localStorage.getItem(stopwatchKey);
      if (currentStart) {
        const startTime = parseInt(currentStart, 10);
        setSessionElapsedSeconds(Math.max(0, Math.floor((Date.now() - startTime) / 1000)));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused, isAccelerated, stopwatchKey]);

  // 4. Proximity Notification Logic (15-Minute Threshold)
  const yourAppointment = appointments.find(a => a.id === 14);
  const activeAppointment = appointments.find(a => a.status === 'In-Progress');

  // Compute wait time for all appointments
  const getCalculatedWaitSeconds = (targetId: number) => {
    if (isPaused) return null;

    const activeIndex = appointments.findIndex(a => a.status === 'In-Progress');
    const targetIndex = appointments.findIndex(a => a.id === targetId);

    if (activeIndex === -1 || targetIndex === -1 || targetIndex < activeIndex) {
      return 0;
    }

    if (targetIndex === activeIndex) {
      return 0; // Currently being served
    }

    const currentRemaining = Math.max(0, rollingAvgSeconds - sessionElapsedSeconds);
    
    // Count active patients waiting between active index and target index
    let peopleAhead = 0;
    for (let i = activeIndex + 1; i < targetIndex; i++) {
      if (appointments[i].status === 'Checked-In' || appointments[i].status === 'Waiting') {
        peopleAhead++;
      }
    }

    return currentRemaining + (peopleAhead * rollingAvgSeconds);
  };

  const yourWaitSeconds = yourAppointment ? getCalculatedWaitSeconds(14) : 0;

  // Watch for 15-minute notification trigger (900 seconds)
  useEffect(() => {
    if (yourWaitSeconds !== null && yourWaitSeconds > 0 && yourWaitSeconds <= 900 && !notificationSent && yourAppointment) {
      setNotificationSent(true);
      const now = new Date().toLocaleTimeString();
      const message = `Hi ${yourAppointment.name}, your doctor is almost ready! You are estimated to be called in ~15 minutes. Please head to the waiting room.`;
      
      setSmsLogs(prev => [
        { timestamp: now, recipient: yourAppointment.phone, message },
        ...prev
      ]);
    }
  }, [yourWaitSeconds, notificationSent, yourAppointment]);

  // Helper formatting for MM:SS
  const formatTimeMMSS = (totalSeconds: number | null) => {
    if (totalSeconds === null) return "Paused";
    if (totalSeconds <= 0) return "00:00";
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Helper formatting for dynamic time of service
  const formatEstimatedTime = (waitSeconds: number | null) => {
    if (waitSeconds === null) return "--:--";
    const targetDate = new Date(Date.now() + waitSeconds * 1000);
    return targetDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Helper to save appointments
  const saveAppointments = (newAppts: Appointment[]) => {
    setAppointments(newAppts);
    localStorage.setItem(apptsKey, JSON.stringify(newAppts));
  };

  // 5. Doctor Actions
  const handleStartSession = () => {
    const activeIndex = appointments.findIndex(a => a.status === 'In-Progress');
    
    // Find next eligible patient who is Checked-In or Waiting
    let nextIndex = -1;
    for (let i = activeIndex + 1; i < appointments.length; i++) {
      if (appointments[i].status === 'Checked-In' || appointments[i].status === 'Waiting') {
        nextIndex = i;
        break;
      }
    }

    if (nextIndex === -1) {
      // Look from the beginning
      for (let i = 0; i < appointments.length; i++) {
        if (appointments[i].status === 'Checked-In' || appointments[i].status === 'Waiting') {
          nextIndex = i;
          break;
        }
      }
    }

    if (nextIndex === -1) {
      alert("No active approved patients in the waiting room!");
      return;
    }

    const updatedAppts = [...appointments];
    
    // 1. Mark previous active session as completed
    if (activeIndex !== -1) {
      updatedAppts[activeIndex].status = 'Completed' as const;
      updatedAppts[activeIndex].actualDurationSeconds = sessionElapsedSeconds;

      // Update rolling averages
      const newTotalSeconds = totalSecondsToday + sessionElapsedSeconds;
      const newCount = completedCount + 1;
      setTotalSecondsToday(newTotalSeconds);
      setCompletedCount(newCount);
      setRollingAvgSeconds(Math.round(newTotalSeconds / newCount));
    }

    // 2. Set next patient to In-Progress
    updatedAppts[nextIndex].status = 'In-Progress' as const;
    setCurrentServingId(updatedAppts[nextIndex].id);
    localStorage.setItem(servingKey, String(updatedAppts[nextIndex].id));

    // 3. Reset stopwatch
    localStorage.setItem(stopwatchKey, String(Date.now()));
    setSessionElapsedSeconds(0);

    saveAppointments(updatedAppts);
  };

  const handleMarkNoShow = (id: number) => {
    const updatedAppts = appointments.map(appt => {
      if (appt.id === id) {
        return { ...appt, status: 'No-Show' as const };
      }
      return appt;
    });
    saveAppointments(updatedAppts);
  };

  const handlePauseQueue = () => {
    const nextPaused = !isPaused;
    setIsPaused(nextPaused);
    localStorage.setItem(isPausedKey, String(nextPaused));
  };

  const handleAddPatient = () => {
    const nextId = Math.max(...appointments.map(a => a.id)) + 1;
    const petNames = ["Teddy", "Buster", "Lily", "Winston", "Sophie"];
    const humanNames = ["Rahul Verma", "Deepa Nair", "Amit Sinha", "Preeti Roy", "Gaurav Sen"];
    const randomName = isVetMode 
      ? petNames[Math.floor(Math.random() * petNames.length)] + ` (${['Cat', 'Dog', 'Rabbit'][Math.floor(Math.random() * 3)]})`
      : humanNames[Math.floor(Math.random() * humanNames.length)];

    const newAppt: Appointment = {
      id: nextId,
      name: randomName,
      patient: randomName,
      phone: `+91 98765 ${nextId}${nextId}0${nextId}`,
      status: 'Waiting',
      sequence: nextId,
      time: "03:00 PM",
      type: "In-Clinic"
    };

    const updated = [...appointments, newAppt];
    saveAppointments(updated);
  };

  const handleResetQueue = () => {
    const defaults = isVetMode ? initialVetPatients : initialHumanPatients;
    saveAppointments(defaults);

    setIsPaused(false);
    localStorage.setItem(isPausedKey, "false");

    setCurrentServingId(13);
    localStorage.setItem(servingKey, "13");

    setRollingAvgSeconds(590);
    setTotalSecondsToday(1770);
    setCompletedCount(3);

    const initialStart = Date.now() - 240 * 1000;
    localStorage.setItem(stopwatchKey, String(initialStart));
    setSessionElapsedSeconds(240);

    setNotificationSent(false);
    setSmsLogs([]);
  };

  // 6. Dynamic Visual States for Patient countdown
  const getVisualState = () => {
    if (isPaused) return "break";
    if (yourAppointment?.status === 'In-Progress') return "serving";
    if (yourAppointment?.status === 'Completed') return "completed";
    if (yourAppointment?.status === 'No-Show') return "noshow";
    if (yourWaitSeconds !== null && yourWaitSeconds <= 900) return "amber";
    return "green";
  };

  const patientState = getVisualState();

  // Patients ahead count
  const getPatientsAhead = () => {
    const activeIndex = appointments.findIndex(a => a.status === 'In-Progress');
    const targetIndex = appointments.findIndex(a => a.id === 14);
    if (activeIndex === -1 || targetIndex === -1 || targetIndex <= activeIndex) return 0;
    
    let count = 0;
    for (let i = activeIndex + 1; i < targetIndex; i++) {
      if (appointments[i].status === 'Checked-In' || appointments[i].status === 'Waiting') {
        count++;
      }
    }
    return count;
  };

  const patientsAhead = getPatientsAhead();

  if (user?.role === "patient" && !hasActiveBooking) {
    const primaryColor = isVetMode ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" : "text-red-500 bg-red-500/10 border-red-500/20";
    const buttonStyle = isVetMode ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20" : "bg-red-600 hover:bg-red-700 shadow-red-500/20";
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black pt-24 pb-12 flex items-center justify-center px-4 relative overflow-hidden transition-colors">
        {/* Sleek background details */}
        <div className={cn("absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full blur-3xl opacity-20 bg-gradient-to-r", isVetMode ? "from-emerald-500 to-teal-500" : "from-red-500 to-orange-500")} />
        <div className={cn("absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full blur-3xl opacity-20 bg-gradient-to-r", isVetMode ? "from-emerald-500 to-teal-500" : "from-red-500 to-orange-500")} />

        <div className="max-w-md w-full bg-white/60 dark:bg-zinc-950/60 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-3xl p-8 shadow-2xl text-center relative z-10 transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)]">
          <div className={cn("mx-auto w-16 h-16 rounded-full flex items-center justify-center border mb-6", primaryColor)}>
            <Clock className="w-8 h-8" />
          </div>

          <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight mb-3">
            No Active Queue Found
          </h2>
          
          <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base leading-relaxed mb-8">
            You don't have any active clinical appointments for today. Book a visit from our premium medical discovery portal to track your live queue and wait times.
          </p>

          <div className="space-y-3">
            <button
              onClick={() => window.location.hash = "/find-doctors"}
              className={cn("w-full py-4 text-white font-extrabold rounded-2xl shadow-lg transition-all duration-300 hover:scale-[1.02]", buttonStyle)}
            >
              Book an Appointment
            </button>
            <button
              onClick={() => window.location.hash = "/"}
              className="w-full py-4 bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 font-extrabold rounded-2xl border border-gray-200 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/10 transition-all duration-300"
            >
              Return Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent w-full pb-24">
      <PageHeader 
        title={isVetMode ? "SmartQueue™ Veterinary Board" : "SmartQueue™ Patient Board"} 
        description="A real-time, Uber-like live countdown system for hospital visits. Dynamic wait times update instantly as your doctor manages sessions."
        icon={isVetMode ? PawPrint : Clock} 
      />

      {/* Simulator Master Banner */}
      <div className="max-w-7xl mx-auto px-6 mt-6">
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 dark:from-zinc-900 dark:to-zinc-950 border border-slate-700/40 text-white rounded-2xl p-4 flex flex-wrap gap-4 items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
            </span>
            <div>
              <p className="text-sm font-bold flex items-center gap-1.5 text-cyan-400">
                <Zap className="w-4 h-4 text-cyan-400 animate-bounce" /> SmartQueue™ Live Simulator Active
              </p>
              <p className="text-xs text-slate-400">Run the doctor and patient terminals side-by-side to watch live updates.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Tab Selector */}
            <div className="bg-slate-800/80 rounded-lg p-1 border border-slate-700/50 flex">
              <button 
                onClick={() => setActiveTab('both')}
                className={cn("px-3 py-1 text-xs font-bold rounded-md transition-all", activeTab === 'both' ? "bg-cyan-500 text-slate-900" : "text-slate-400 hover:text-white")}
              >
                Split Screen (Simulate)
              </button>
              <button 
                onClick={() => setActiveTab('patient')}
                className={cn("px-3 py-1 text-xs font-bold rounded-md transition-all", activeTab === 'patient' ? "bg-cyan-500 text-slate-900" : "text-slate-400 hover:text-white")}
              >
                Patient View Only
              </button>
              <button 
                onClick={() => setActiveTab('doctor')}
                className={cn("px-3 py-1 text-xs font-bold rounded-md transition-all", activeTab === 'doctor' ? "bg-slate-950 text-cyan-400 border border-cyan-500/20" : "text-slate-400 hover:text-white")}
              >
                Doctor Panel Only
              </button>
            </div>

            {/* Time Accelerator */}
            <button 
              onClick={() => setIsAccelerated(!isAccelerated)}
              className={cn("flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border", 
                isAccelerated 
                  ? "bg-amber-500 text-slate-950 border-amber-400" 
                  : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300"
              )}
            >
              <Zap className={cn("w-3.5 h-3.5", isAccelerated ? "animate-pulse" : "")} /> 
              {isAccelerated ? "Time x10" : "Normal Time"}
            </button>

            {/* Reset */}
            <button 
              onClick={handleResetQueue}
              className="bg-slate-800 hover:bg-slate-700 border border-slate-700 p-2 rounded-xl text-slate-300 transition-colors"
              title="Reset Simulator"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* =========================================================================
              DOCTOR CLINIC DASHBOARD PANEL
             ========================================================================= */}
          { (activeTab === 'both' || activeTab === 'doctor') && (
            <div className={cn(
              "bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 rounded-[2rem] p-8 shadow-sm flex flex-col justify-between",
              activeTab === 'both' ? "lg:col-span-7" : "lg:col-span-12"
            )}>
              <div>
                <div className="flex justify-between items-center border-b border-gray-200/50 dark:border-white/10 pb-6 mb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-widest">Clinic Console</span>
                      <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border", isPaused ? "bg-amber-100 text-amber-800 border-amber-200" : "bg-emerald-100 text-emerald-800 border-emerald-200")}>
                        {isPaused ? "Paused" : "Live Streaming"}
                      </span>
                    </div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white">
                      {isVetMode ? "Dr. Arthur Pendelton (Vet)" : "Dr. Ramesh Patel (Chief Cardiologist)"}
                    </h3>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-widest">Rolling Session Avg</p>
                    <p className={cn("text-2xl font-black", isVetMode ? "text-emerald-600 dark:text-emerald-500" : "text-red-600 dark:text-red-500")}>
                      {Math.round(rollingAvgSeconds / 60)} min <span className="text-sm font-medium text-gray-400">({completedCount} runs)</span>
                    </p>
                  </div>
                </div>

                {/* Session Controller Panel */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
                  {/* Active Stopwatch */}
                  <div className="md:col-span-5 bg-gray-50 dark:bg-black/40 border border-gray-100 dark:border-white/5 rounded-2xl p-5 flex flex-col justify-center items-center">
                    <p className="text-xs font-extrabold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-1">Current Stopwatch</p>
                    <p className="text-3.5xl font-black font-mono text-gray-900 dark:text-white tracking-wider">
                      {formatTimeMMSS(sessionElapsedSeconds)}
                    </p>
                    {activeAppointment ? (
                      <span className="text-xs font-medium text-blue-500 mt-1 animate-pulse">Serving #{activeAppointment.sequence}</span>
                    ) : (
                      <span className="text-xs font-medium text-gray-400 mt-1">Empty Room</span>
                    )}
                  </div>

                  {/* Controller Action buttons */}
                  <div className="md:col-span-7 flex flex-col justify-between gap-3">
                    <button 
                      onClick={handleStartSession}
                      className={cn(
                        "w-full text-white font-black py-4 px-6 rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2",
                        isVetMode ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20" : "bg-red-600 hover:bg-red-700 shadow-red-500/20"
                      )}
                    >
                      <UserCheck className="w-5 h-5" /> Start Next Patient
                    </button>

                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={handlePauseQueue}
                        className={cn(
                          "font-bold py-3.5 px-4 rounded-xl transition-all border flex items-center justify-center gap-1.5",
                          isPaused 
                            ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20 hover:bg-emerald-100" 
                            : "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20 hover:bg-amber-100"
                        )}
                      >
                        {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                        {isPaused ? "Resume Queue" : "Pause Queue"}
                      </button>

                      <button 
                        onClick={handleAddPatient}
                        className="bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-800 dark:text-gray-300 font-bold py-3.5 px-4 rounded-xl transition-all flex items-center justify-center gap-1.5"
                      >
                        <Plus className="w-4 h-4" /> Add Patient
                      </button>
                    </div>
                  </div>
                </div>

                {/* Queue list table */}
                <h4 className="text-sm font-black text-gray-700 dark:text-zinc-300 uppercase tracking-widest mb-3">Today's Sequence list</h4>
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {appointments.map((appt) => {
                    const wait = getCalculatedWaitSeconds(appt.id);
                    return (
                      <div 
                        key={appt.id} 
                        className={cn(
                          "flex items-center justify-between p-3 rounded-xl border transition-all duration-300",
                          appt.status === 'In-Progress' 
                            ? (isVetMode ? "bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-500/50" : "bg-red-50/70 dark:bg-red-950/20 border-red-500/50")
                            : appt.status === 'Completed'
                              ? "bg-gray-100/50 dark:bg-white/5 border-transparent opacity-60"
                              : appt.status === 'No-Show'
                                ? "bg-zinc-100 dark:bg-zinc-900 border-transparent opacity-40 line-through"
                                : "bg-white/60 dark:bg-black/20 border-gray-200/50 dark:border-white/5"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <span className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm",
                            appt.status === 'In-Progress'
                              ? (isVetMode ? "bg-emerald-600 text-white" : "bg-red-600 text-white")
                              : appt.status === 'Completed'
                                ? "bg-gray-200 text-gray-700 dark:bg-white/10 dark:text-gray-400"
                                : "bg-gray-100 text-gray-500 dark:bg-zinc-800 dark:text-zinc-500"
                          )}>
                            #{appt.sequence}
                          </span>
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white text-sm">{appt.name}</p>
                            <p className="text-[10px] text-gray-400">{appt.phone}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {appt.status === 'In-Progress' && (
                            <span className="text-xs font-bold text-blue-500 animate-pulse bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-500/20 px-2 py-0.5 rounded-full">
                              In Room
                            </span>
                          )}
                          {appt.status === 'Completed' && (
                            <span className="text-xs font-bold text-gray-500 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-gray-400" /> 
                              {appt.actualDurationSeconds ? `${Math.floor(appt.actualDurationSeconds / 60)}m` : "Done"}
                            </span>
                          )}
                          {appt.status === 'No-Show' && (
                            <span className="text-xs font-bold text-gray-400">Skipped</span>
                          )}
                          {(appt.status === 'Checked-In' || appt.status === 'Waiting') && (
                            <div className="text-right">
                              <p className="text-xs font-black text-gray-900 dark:text-white">~{formatTimeMMSS(wait)}</p>
                              <p className="text-[10px] text-gray-400 font-medium">Est: {formatEstimatedTime(wait)}</p>
                            </div>
                          )}

                          {/* Inline No-Show action */}
                          {(appt.status === 'Checked-In' || appt.status === 'Waiting') && (
                            <button 
                              onClick={() => handleMarkNoShow(appt.id)}
                              className="text-gray-400 hover:text-red-500 p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-all"
                              title="Mark No-Show"
                            >
                              <UserX className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Rolling average analytics summary */}
              <div className="mt-6 p-4 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-2xl flex items-center justify-between text-xs text-gray-500">
                <span className="flex items-center gap-1.5"><History className="w-4 h-4 text-gray-400" /> Log Stats:</span>
                <span>Completed Sessions today: <b>{completedCount}</b></span>
                <span>Total service duration: <b>{Math.round(totalSecondsToday / 60)} mins</b></span>
              </div>

            </div>
          )}

          {/* =========================================================================
              PATIENT LIVE TRACKING PANEL
             ========================================================================= */}
          { (activeTab === 'both' || activeTab === 'patient') && (
            <div className={cn(
              "bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 rounded-[2rem] p-8 shadow-sm flex flex-col justify-between relative overflow-hidden",
              activeTab === 'both' ? "lg:col-span-5" : "lg:col-span-12"
            )}>
              <div>
                {/* Header info */}
                <div className="flex justify-between items-start border-b border-gray-200/50 dark:border-white/10 pb-6 mb-6">
                  <div>
                    <h3 className="text-lg font-black text-gray-900 dark:text-white">
                      {isVetMode ? "Happy Paws Vet" : "City Hospital"}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-zinc-400 font-medium flex items-center gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" /> 
                      {isVetMode ? "456 Furry Lane, Pet District" : "124 Health Ave, Metro District"}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-green-200 dark:border-green-500/20">
                      Live GPS Sync
                    </span>
                  </div>
                </div>

                {/* Queue status counters */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-100/50 dark:bg-white/5 border border-gray-200/10 rounded-2xl p-4 text-center">
                    <p className="text-[10px] font-extrabold text-gray-400 dark:text-zinc-400 uppercase tracking-widest mb-1">Serving Now</p>
                    <p className="text-3xl font-black text-gray-900 dark:text-white">
                      {activeAppointment ? `#${activeAppointment.sequence}` : "None"}
                    </p>
                  </div>

                  <div className={cn(
                    "border rounded-2xl p-4 text-center relative",
                    isVetMode ? "bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-100/40" : "bg-red-50/50 dark:bg-red-950/10 border-red-100/40"
                  )}>
                    <div className="absolute top-2 right-2 animate-ping h-2 w-2 rounded-full bg-emerald-500 opacity-75"></div>
                    <p className="text-[10px] font-extrabold text-gray-400 dark:text-zinc-400 uppercase tracking-widest mb-1">Your Token</p>
                    <p className={cn("text-3xl font-black", isVetMode ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400")}>
                      #14
                    </p>
                  </div>
                </div>

                {/* Countdown Timer Display */}
                <div className={cn(
                  "p-8 rounded-[1.5rem] border text-center transition-all duration-500",
                  patientState === 'green' && "bg-green-50/70 dark:bg-green-950/10 border-green-200/50",
                  patientState === 'amber' && "bg-amber-50/70 dark:bg-amber-950/10 border-amber-200/50 shadow-md",
                  patientState === 'serving' && "bg-blue-50/70 dark:bg-blue-950/10 border-blue-200/50 animate-pulse",
                  patientState === 'break' && "bg-zinc-100/70 dark:bg-zinc-950/10 border-zinc-200/50",
                  patientState === 'completed' && "bg-gray-100/70 dark:bg-white/5 border-gray-200/50",
                  patientState === 'noshow' && "bg-rose-50/70 dark:bg-rose-950/10 border-rose-200/50 line-through opacity-50"
                )}>
                  {/* Status Headline */}
                  <p className={cn(
                    "text-xs font-black uppercase tracking-widest mb-2",
                    patientState === 'green' && "text-green-600 dark:text-green-400",
                    patientState === 'amber' && "text-amber-600 dark:text-amber-400",
                    patientState === 'serving' && "text-blue-600 dark:text-blue-400",
                    patientState === 'break' && "text-amber-600 dark:text-amber-400",
                    patientState === 'completed' && "text-gray-500 dark:text-zinc-400",
                    patientState === 'noshow' && "text-rose-600 dark:text-rose-400"
                  )}>
                    {patientState === 'green' && "Queue Flowing Smoothly"}
                    {patientState === 'amber' && "Your Checkup is Impending!"}
                    {patientState === 'serving' && "You are being seen now"}
                    {patientState === 'break' && "Doctor is on a short break"}
                    {patientState === 'completed' && "Visit Completed"}
                    {patientState === 'noshow' && "Token Skipped (No-Show)"}
                  </p>

                  {/* Primary timer digits */}
                  <h2 className="text-6.5xl font-black font-mono tracking-tight text-gray-900 dark:text-white drop-shadow-sm mb-4">
                    {patientState === 'serving' ? "Serving" : formatTimeMMSS(yourWaitSeconds)}
                  </h2>

                  {/* Dynamic wait statistics */}
                  <div className="flex justify-center gap-6 text-xs border-t border-gray-200/30 dark:border-white/5 pt-4">
                    <div>
                      <p className="text-gray-400 font-bold uppercase tracking-wider mb-0.5">Est. Arrival</p>
                      <p className="font-extrabold text-gray-800 dark:text-zinc-200 text-sm">
                        {patientState === 'serving' ? "Now" : formatEstimatedTime(yourWaitSeconds)}
                      </p>
                    </div>
                    <div className="w-px h-8 bg-gray-200 dark:bg-white/10"></div>
                    <div>
                      <p className="text-gray-400 font-bold uppercase tracking-wider mb-0.5">People Ahead</p>
                      <p className="font-extrabold text-gray-800 dark:text-zinc-200 text-sm">
                        {patientState === 'serving' ? "0" : `${patientsAhead} patients`}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Warning Banner alerts */}
                {patientState === 'amber' && (
                  <div className="mt-5 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-start gap-3 animate-bounce">
                    <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="font-extrabold text-sm">Please head to the waiting area!</h5>
                      <p className="text-xs opacity-90 leading-normal mt-0.5">Your turn is exactly 15 minutes away. To avoid skipping, be present in the clinic lobby immediately.</p>
                    </div>
                  </div>
                )}

                {patientState === 'break' && (
                  <div className="mt-5 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="font-extrabold text-sm">Doctor is on a short break</h5>
                      <p className="text-xs opacity-90 leading-normal mt-0.5">Emergency triage or break has paused active countdown timers. They will resume shortly.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation button integrations */}
              <div className="mt-10 grid grid-cols-2 gap-4">
                <button className="bg-gray-900 dark:bg-white text-white dark:text-black font-black py-4 px-6 rounded-2xl hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 text-sm shadow-md">
                  <Navigation2 className="w-4 h-4" /> Get Directions
                </button>

                <button className={cn(
                  "font-bold py-4 px-6 rounded-2xl transition-all flex items-center justify-center gap-2 border text-sm",
                  isVetMode 
                    ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20 hover:bg-emerald-100" 
                    : "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20 hover:bg-red-100"
                )}>
                  <Bell className="w-4 h-4 animate-swing" /> Notify Me
                </button>
              </div>

            </div>
          )}

        </div>
      </div>

      {/* =========================================================================
          SIMULATION NOTIFICATION & SMS ALERTS LOG WINDOW
         ========================================================================= */}
      <div className="max-w-7xl mx-auto px-6 mt-8">
        <div className="bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-2 border-b border-gray-200/50 dark:border-white/10 pb-4 mb-4 justify-between">
            <h4 className="font-extrabold text-sm text-gray-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
              <Smartphone className="w-4.5 h-4.5 text-gray-500" /> Proximity SMS Alert Engine logs (15m Proximity)
            </h4>
            <span className="text-[10px] font-bold bg-cyan-100 dark:bg-cyan-500/10 text-cyan-800 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-500/20 px-2.5 py-1 rounded-full flex items-center gap-1">
              <Send className="w-3 h-3" /> Twilio Service Online
            </span>
          </div>

          <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1">
            {smsLogs.length === 0 ? (
              <div className="text-center py-6 text-gray-400 text-xs font-medium">
                No SMS dispatches yet. Accelerate the countdown timer or click "Start Next Patient" to bring your ETA down to 15 minutes to trigger the SMS.
              </div>
            ) : (
              smsLogs.map((log, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-4 p-3 bg-cyan-50/50 dark:bg-cyan-950/10 border border-cyan-100/30 dark:border-cyan-500/10 rounded-xl text-xs text-gray-600 dark:text-zinc-300 animate-in slide-in-from-top-4"
                >
                  <span className="bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 px-2 py-0.5 rounded font-black font-mono shrink-0">{log.timestamp}</span>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 dark:text-white">To: {log.recipient}</p>
                    <p className="opacity-90 mt-0.5">{log.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
