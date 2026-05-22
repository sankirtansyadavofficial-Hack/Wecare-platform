import { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { 
  Users, CalendarCheck, HelpCircle, Activity, CheckCircle2, 
  XCircle, Clock, Video, Radio, SkipForward, Hourglass, Play,
  Eye
} from "lucide-react";
import { Link } from "react-router-dom";
import { useVetMode } from "@/context/vet-mode-context";


interface Appointment {
  id: number;
  name: string;
  patient?: string;
  phone: string;
  status: 'Waiting' | 'Checked-In' | 'In-Progress' | 'No-Show' | 'Completed' | 'Pending' | 'Cancelled';
  sequence: number;
  time: string;
  type: string;
  actualDurationSeconds?: number;
}

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

interface PatientQuery {
  id: string;
  patient: string;
  question: string;
  status: 'Unread' | 'Read' | 'Replied';
  time: string;
  timestamp: number;
  reply?: string;
}

const initialHumanQueries: PatientQuery[] = [
  { id: "Q001", patient: "Angela Martin", question: "Can I take the prescribed medicine with food?", status: "Unread", time: "10 mins ago", timestamp: Date.now() - 10 * 60 * 1000 },
  { id: "Q002", patient: "Kevin Malone", question: "Feeling slightly nauseous after the morning dose.", status: "Read", time: "2 hours ago", timestamp: Date.now() - 120 * 60 * 1000 },
  { id: "Q003", patient: "Jim Halpert", question: "Do you offer physical therapy recommendations?", status: "Replied", time: "1 day ago", timestamp: Date.now() - 1440 * 60 * 1000, reply: "Yes, Jim. We can recommend a physiotherapist at your next session." }
];

const initialVetQueries: PatientQuery[] = [
  { id: "Q001", patient: "Angela Martin (Pet: Bandit)", question: "Can I feed him standard kibble after the dewormer?", status: "Unread", time: "10 mins ago", timestamp: Date.now() - 10 * 60 * 1000 },
  { id: "Q002", patient: "Kevin Malone (Pet: Ruby)", question: "She's sleeping a lot more than usual since yesterday.", status: "Read", time: "2 hours ago", timestamp: Date.now() - 120 * 60 * 1000 },
  { id: "Q003", patient: "Jim Halpert (Pet: Blue)", question: "Is a joint care supplement needed for senior Labs?", status: "Replied", time: "1 day ago", timestamp: Date.now() - 1440 * 60 * 1000, reply: "Yes, Jim. Senior Labs benefit immensely from Glucosamine and Chondroitin supplements." }
];

export function DoctorDashboard() {
  const { isVetMode } = useVetMode();
  const accentColor = isVetMode ? "emerald" : "indigo";

  const apptsKey = isVetMode ? "wecare_vet_appointments" : "wecare_human_appointments";
  const servingKey = isVetMode ? "wecare_vet_current_serving_id" : "wecare_human_current_serving_id";
  const stopwatchKey = isVetMode ? "wecare_vet_session_start" : "wecare_human_session_start";
  const isPausedKey = isVetMode ? "wecare_vet_queue_paused" : "wecare_human_queue_paused";
  const queriesKey = isVetMode ? "wecare_vet_queries" : "wecare_human_queries";

  // Active appointments React State
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem(apptsKey);
    if (saved) return JSON.parse(saved);
    const defaults = isVetMode ? initialVetPatients : initialHumanPatients;
    localStorage.setItem(apptsKey, JSON.stringify(defaults));
    return defaults;
  });

  // Dynamic patient queries React State
  const [queries, setQueries] = useState<PatientQuery[]>(() => {
    const saved = localStorage.getItem(queriesKey);
    if (saved) return JSON.parse(saved);
    const defaults = isVetMode ? initialVetQueries : initialHumanQueries;
    localStorage.setItem(queriesKey, JSON.stringify(defaults));
    return defaults;
  });

  // Live Queue state managers
  const [currentServingId, setCurrentServingId] = useState<number | null>(() => {
    const saved = localStorage.getItem(servingKey);
    return saved ? parseInt(saved, 10) : 13;
  });

  const [sessionElapsedSeconds, setSessionElapsedSeconds] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(() => {
    return localStorage.getItem(isPausedKey) === "true";
  });

  // Query filter/reply states
  const [querySortOrder, setQuerySortOrder] = useState<'latest' | 'old'>('latest');
  const [activeReplyQueryId, setActiveReplyQueryId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  // Sync state if domain changes
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

    const savedQueries = localStorage.getItem(queriesKey);
    const qrs = savedQueries ? JSON.parse(savedQueries) : (isVetMode ? initialVetQueries : initialHumanQueries);
    setQueries(qrs);
    if (!savedQueries) {
      localStorage.setItem(queriesKey, JSON.stringify(qrs));
    }
  }, [isVetMode, apptsKey, servingKey, isPausedKey, queriesKey]);

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
      if (e.key === queriesKey && e.newValue) {
        setQueries(JSON.parse(e.newValue));
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [apptsKey, servingKey, isPausedKey, queriesKey]);

  // Session Stopwatch ticking effect
  useEffect(() => {
    let startVal = localStorage.getItem(stopwatchKey);
    if (!startVal) {
      const initialStart = Date.now() - 240 * 1000; // 4 mins elapsed default
      localStorage.setItem(stopwatchKey, String(initialStart));
      startVal = String(initialStart);
    }

    const interval = setInterval(() => {
      if (isPaused) return;
      const currentStart = localStorage.getItem(stopwatchKey);
      if (currentStart) {
        const startTime = parseInt(currentStart, 10);
        setSessionElapsedSeconds(Math.max(0, Math.floor((Date.now() - startTime) / 1000)));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused, stopwatchKey]);

  // Save changes helper
  const saveAppointments = (newAppts: Appointment[]) => {
    setAppointments(newAppts);
    localStorage.setItem(apptsKey, JSON.stringify(newAppts));
  };

  // Dynamic stats derivation
  const approvedCount = appointments.filter(a => a.status === "Checked-In" || a.status === "Waiting" || a.status === "In-Progress").length;
  const pendingCount = appointments.filter(a => a.status === "Pending").length;

  const stats = [
    { label: "Total Patients", value: "1,248", change: "+12% this month", icon: Users, color: isVetMode ? "text-emerald-500" : "text-indigo-500" },
    { label: "Active In Queue", value: String(approvedCount), change: "Waiting Room Board", icon: CalendarCheck, color: "text-green-500" },
    { label: "Pending Requests", value: String(pendingCount), change: "Requires action", icon: Clock, color: "text-orange-500" },
    { label: "Patient Queries", value: "12", change: "4 unread", icon: HelpCircle, color: "text-purple-500" },
  ];

  const handleSendReply = (id: string) => {
    if (!replyText.trim()) return;
    const updated = queries.map(q => {
      if (q.id === id) {
        return { 
          ...q, 
          status: "Replied" as const, 
          reply: replyText.trim() 
        };
      }
      return q;
    });
    setQueries(updated);
    localStorage.setItem(queriesKey, JSON.stringify(updated));
    setActiveReplyQueryId(null);
    setReplyText("");
  };

  // Action Handlers
  const handleApprove = (id: number) => {
    const updated = appointments.map(apt => {
      if (apt.id === id) {
        const nextStatus = apt.type === "Video Consult" ? "Waiting" as const : "Checked-In" as const;
        return { ...apt, status: nextStatus };
      }
      return apt;
    });
    saveAppointments(updated);
  };

  const handleDecline = (id: number) => {
    const updated = appointments.map(apt => {
      if (apt.id === id) {
        return { ...apt, status: "Cancelled" as const };
      }
      return apt;
    });
    saveAppointments(updated);
    
    if (id === currentServingId) {
      setCurrentServingId(null);
      localStorage.removeItem(servingKey);
    }
  };

  const handleCallNext = () => {
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
    }

    // 2. Set next patient to In-Progress
    updatedAppts[nextIndex].status = 'In-Progress' as const;
    setCurrentServingId(updatedAppts[nextIndex].id);
    localStorage.setItem(servingKey, String(updatedAppts[nextIndex].id));

    // 3. Reset session stopwatch to Date.now()
    localStorage.setItem(stopwatchKey, String(Date.now()));
    setSessionElapsedSeconds(0);

    saveAppointments(updatedAppts);
  };

  const formatTimeMMSS = (totalSeconds: number | null) => {
    if (totalSeconds === null || totalSeconds < 0) return "00:00";
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Derive live queue lists
  const currentlyServing = appointments.find(apt => apt.id === currentServingId && apt.status === "In-Progress");
  const nextInLine = appointments.filter(apt => (apt.status === "Checked-In" || apt.status === "Waiting") && apt.id !== currentServingId);

  // Derive sorted queries
  const sortedQueries = [...queries].sort((a, b) => {
    if (querySortOrder === 'latest') {
      return b.timestamp - a.timestamp;
    } else {
      return a.timestamp - b.timestamp;
    }
  });

  return (
    <div className="min-h-screen bg-transparent w-full pb-24">
      <PageHeader 
        title="Doctor Dashboard" 
        description={isVetMode ? "Welcome back, Dr. Arthur. Here is your veterinary overview for today." : "Welcome back, Dr. Jenkins. Here is your practice overview for today."} 
        icon={Activity} 
      />

      <div className="max-w-6xl mx-auto px-6 mt-12">
        {/* Top Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white/40 dark:bg-black/40 backdrop-blur-md rounded-3xl p-6 border border-gray-200/50 dark:border-white/10 shadow-sm relative overflow-hidden group">
               <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10 bg-current transition-transform group-hover:scale-150 ${stat.color}`}></div>
               <div className="flex justify-between items-start relative z-10">
                 <div>
                   <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">{stat.label}</p>
                   <h3 className="text-3xl font-black text-gray-900 dark:text-white">{stat.value}</h3>
                 </div>
                 <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-white dark:bg-zinc-800 shadow-sm ${stat.color}`}>
                   <stat.icon className="w-5 h-5" />
                 </div>
               </div>
               <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-4 relative z-10">{stat.change}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content: Appointments & Live Queue tracker */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Live Queue Tracking Console */}
            <div className="bg-white/40 dark:bg-black/40 backdrop-blur-md rounded-3xl border border-gray-200/50 dark:border-white/10 shadow-sm overflow-hidden p-6 relative">
              <div className="absolute top-6 right-6 flex items-center gap-1.5 px-3 py-1 bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 rounded-full font-bold text-xs border border-green-200 dark:border-green-500/20">
                <Radio className="w-3.5 h-3.5 animate-pulse text-green-600 dark:text-green-400" />
                Live Tracker Active
              </div>

              <h3 className="text-lg font-black text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Activity className={`w-5 h-5 text-${accentColor}-600 dark:text-${accentColor}-400`} />
                Live Queue Tracking Console
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                {/* Column 1: Serving Patient */}
                <div className={`p-4 rounded-2xl border border-gray-200/40 dark:border-white/5 bg-gray-50/50 dark:bg-white/5`}>
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Currently Serving</p>
                  {currentlyServing ? (
                    <div>
                      <h4 className="font-extrabold text-lg text-gray-900 dark:text-white truncate">{currentlyServing.name}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-bold mt-1 flex items-center gap-1.5">
                        <Video className="w-3.5 h-3.5 text-orange-500" /> {currentlyServing.type}
                      </p>
                      
                      <div className="mt-2.5 py-1.5 px-3 bg-white/60 dark:bg-zinc-800/80 rounded-xl inline-flex items-center gap-2 border border-zinc-200/50 dark:border-zinc-700/30">
                        <Clock className="w-3.5 h-3.5 text-blue-500 animate-spin" />
                        <span className="font-mono text-sm font-black text-gray-800 dark:text-gray-100 tracking-wider">
                          {formatTimeMMSS(sessionElapsedSeconds)}
                        </span>
                      </div>

                      <div className="mt-4 flex gap-2">
                        {currentlyServing.type === 'Video Consult' ? (
                          <Link
                            to="/video-consult?role=doctor"
                            className={`flex-1 py-2 text-center bg-${accentColor}-600 hover:bg-${accentColor}-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1 transition-all active:scale-95`}
                          >
                            <Play className="w-3 h-3 fill-current" /> Consult Now
                          </Link>
                        ) : (
                          <span className={`text-[10px] font-bold text-${accentColor}-600 dark:text-${accentColor}-400 uppercase tracking-wider mt-2 block`}>
                            In-Person Session Active
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="py-4">
                      <p className="text-sm font-semibold text-gray-400 dark:text-gray-500 italic">No active patient.</p>
                      <button 
                        onClick={() => {
                          const firstApproved = appointments.find(a => a.status === "Checked-In" || a.status === "Waiting");
                          if (firstApproved) {
                            setCurrentServingId(firstApproved.id);
                            localStorage.setItem(servingKey, String(firstApproved.id));
                            localStorage.setItem(stopwatchKey, String(Date.now()));
                            const updated = appointments.map(a => a.id === firstApproved.id ? { ...a, status: "In-Progress" as const } : a);
                            saveAppointments(updated);
                          } else {
                            alert("No approved patients in the waiting room!");
                          }
                        }} 
                        className={`mt-4 w-full py-2 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 font-bold rounded-xl text-xs hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors`}
                      >
                        Start Next Queue
                      </button>
                    </div>
                  )}
                </div>

                {/* Column 2: Wait Room Status */}
                <div className="p-4 rounded-2xl border border-gray-200/40 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 flex flex-col justify-between">
                  <div>
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Wait Room Status</p>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-3xl font-black text-${accentColor}-600 dark:text-${accentColor}-400`}>{approvedCount}</span>
                      <span className="text-xs font-bold text-gray-500">Patients Active</span>
                    </div>
                  </div>
                  <div className="border-t border-gray-200/40 dark:border-white/5 pt-2 mt-2">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Next in Line</p>
                    <p className="text-sm font-extrabold text-gray-800 dark:text-gray-200 truncate mt-1">
                      {nextInLine.length > 0 ? nextInLine[0].name : "None (Queue Empty)"}
                    </p>
                  </div>
                </div>

                {/* Column 3: Queue Admin Controls */}
                <div className="flex flex-col gap-3 justify-center">
                  <button 
                    onClick={handleCallNext}
                    className={`w-full py-3 bg-${accentColor}-600 hover:bg-${accentColor}-700 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md shadow-${accentColor}-500/20`}
                  >
                    <SkipForward className="w-4 h-4" />
                    Call Next Patient
                  </button>
                  
                  <Link 
                    to="/live-queue"
                    className="w-full py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 font-bold rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors shadow-sm"
                  >
                    <Eye className="w-4 h-4" />
                    Monitor Live Board ↗
                  </Link>
                </div>
              </div>
            </div>

            {/* Today's Appointments Card */}
            <div className="bg-white/40 dark:bg-black/40 backdrop-blur-md rounded-3xl border border-gray-200/50 dark:border-white/10 shadow-sm overflow-hidden">
               <div className="p-6 border-b border-gray-200/50 dark:border-white/10 flex justify-between items-center bg-gray-50/50 dark:bg-white/5">
                 <h2 className="text-xl font-bold text-gray-900 dark:text-white">Today's Appointments</h2>
                 <button className={`text-sm font-bold hover:underline ${isVetMode ? "text-emerald-600 dark:text-emerald-400" : "text-indigo-600 dark:text-indigo-400"}`}>View Calendar</button>
               </div>
               
               <div className="p-6">
                 {appointments.length > 0 ? (
                   <div className="space-y-4">
                     {appointments.map(apt => (
                       <div key={apt.id} className={`flex flex-col sm:flex-row justify-between sm:items-center gap-4 p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-white/5 hover:border-${accentColor}-200 dark:hover:border-${accentColor}-500/30 transition-colors`}>
                           <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 bg-${accentColor}-50 dark:bg-${accentColor}-500/10 text-${accentColor}-600 dark:text-${accentColor}-400 rounded-xl flex items-center justify-center font-bold shadow-sm`}>
                                {apt.time.split(' ')[0]}
                              </div>
                              <div>
                                <h4 className="font-bold text-gray-900 dark:text-white text-lg">{apt.patient}</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium flex items-center gap-2">
                                  {apt.type} • {apt.id}
                                </p>
                              </div>
                           </div>
                           
                           <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-auto w-full">
                              <span className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 border
                                ${apt.status === 'In-Progress' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20 animate-pulse' :
                                  apt.status === 'Checked-In' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' :
                                  apt.status === 'Waiting' ? 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20' :
                                  apt.status === 'Pending' ? 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20' :
                                  apt.status === 'Completed' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20' :
                                  apt.status === 'No-Show' ? 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-zinc-800 dark:text-gray-400 dark:border-zinc-700' :
                                  'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20'
                                }
                              `}>
                                {apt.status === 'In-Progress' && <Radio className="w-3 h-3 text-blue-500 animate-pulse" />}
                                {apt.status === 'Checked-In' && <CheckCircle2 className="w-3 h-3" />}
                                {apt.status === 'Waiting' && <Clock className="w-3 h-3" />}
                                {apt.status === 'Pending' && <Clock className="w-3 h-3 text-orange-500" />}
                                {apt.status === 'Completed' && <CheckCircle2 className="w-3 h-3 text-green-500" />}
                                {apt.status === 'No-Show' && <XCircle className="w-3 h-3" />}
                                {apt.status === 'Cancelled' && <XCircle className="w-3 h-3" />}
                                {apt.status}
                              </span>

                              {((apt.status === 'Waiting' || apt.status === 'Checked-In' || apt.status === 'In-Progress' || apt.status === 'Approved') && apt.type === 'Video Consult') && (
                                <Link
                                  to="/video-consult?role=doctor"
                                  className={`px-4 py-2 bg-${accentColor}-600 hover:bg-${accentColor}-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-sm hover:shadow active:scale-95`}
                                >
                                  <Video className="w-3.5 h-3.5" /> Start Consult
                                </Link>
                              )}
                              
                              {apt.status === 'Pending' && (
                                <div className="flex gap-2">
                                  <button 
                                    onClick={() => handleApprove(apt.id)}
                                    className="p-2 bg-green-50 hover:bg-green-100 dark:bg-green-500/10 dark:hover:bg-green-500/20 text-green-600 dark:text-green-400 rounded-lg transition-colors" 
                                    title="Approve"
                                  >
                                    <CheckCircle2 className="w-5 h-5" />
                                  </button>
                                  <button 
                                    onClick={() => handleDecline(apt.id)}
                                    className="p-2 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-lg transition-colors" 
                                    title="Decline"
                                  >
                                    <XCircle className="w-5 h-5" />
                                  </button>
                                </div>
                              )}
                           </div>
                       </div>
                     ))}
                   </div>
                 ) : (
                   <div className="text-center py-12">
                     <p className="text-gray-500 font-medium">No appointments scheduled for today yet.</p>
                   </div>
                 )}
               </div>
            </div>
          </div>

          {/* Sidebar: Patient Queries */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-gray-900 to-black rounded-3xl p-6 border border-gray-800 shadow-2xl h-full flex flex-col">
              <div className="flex items-center justify-between mb-6 gap-2">
                 <h2 className="text-lg font-black text-white flex items-center gap-2 shrink-0">
                   <HelpCircle className={`w-5 h-5 ${isVetMode ? "text-emerald-500" : "text-indigo-500"}`} />
                   Recent Queries
                 </h2>
                 <div className="flex bg-white/10 p-0.5 rounded-lg border border-white/5 select-none shrink-0">
                   <button 
                     onClick={() => setQuerySortOrder('latest')}
                     className={`px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider rounded-md transition-all ${querySortOrder === 'latest' ? `bg-${accentColor}-600 text-white shadow-sm` : 'text-gray-400 hover:text-gray-200'}`}
                   >
                     Latest
                   </button>
                   <button 
                     onClick={() => setQuerySortOrder('old')}
                     className={`px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider rounded-md transition-all ${querySortOrder === 'old' ? `bg-${accentColor}-600 text-white shadow-sm` : 'text-gray-400 hover:text-gray-200'}`}
                   >
                     Old
                   </button>
                 </div>
              </div>
              
              <div className="space-y-4 flex-1">
                {sortedQueries.map(q => (
                  <div key={q.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-colors flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-gray-200 text-base">{q.patient}</h4>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500">{q.time}</span>
                    </div>

                    <div className="flex gap-2 items-center">
                      {q.status === 'Unread' && (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-orange-500/10 text-orange-400 border border-orange-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse"></span> Response Needed
                        </span>
                      )}
                      {q.status === 'Read' && (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          Read
                        </span>
                      )}
                      {q.status === 'Replied' && (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Replied
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-gray-300 leading-relaxed font-medium bg-black/20 p-3 rounded-xl border border-white/5">
                      {q.question}
                    </p>

                    {q.status === 'Replied' && q.reply && (
                      <div className="mt-1 p-3 bg-zinc-900/60 rounded-xl border border-white/5 text-xs text-gray-300 relative pl-7 shadow-inner">
                        <span className={`absolute left-2.5 top-3.5 text-base font-extrabold text-${accentColor}-400`}>↳</span>
                        <p className={`font-extrabold text-[10px] uppercase text-${accentColor}-400 mb-1 tracking-wider`}>Your Response</p>
                        <p className="italic leading-relaxed font-medium">{q.reply}</p>
                      </div>
                    )}

                    {q.status !== 'Replied' && (
                      <div className="mt-1.5">
                        {activeReplyQueryId !== q.id ? (
                          <button 
                            onClick={() => {
                              setActiveReplyQueryId(q.id);
                              setReplyText("");
                            }}
                            className={`py-1.5 px-3 bg-${accentColor}-600/10 hover:bg-${accentColor}-600 text-${accentColor}-400 hover:text-white border border-${accentColor}-500/20 hover:border-transparent rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95`}
                          >
                            Reply Query
                          </button>
                        ) : (
                          <div className="mt-2.5 flex flex-col gap-2">
                            <textarea
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="Type your clinical response here..."
                              className="w-full bg-zinc-950/80 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/10 resize-none h-20 leading-relaxed"
                            />
                            <div className="flex gap-2 justify-end">
                              <button 
                                onClick={() => setActiveReplyQueryId(null)}
                                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-gray-200 border border-white/5 rounded-lg text-xs font-bold transition-all"
                              >
                                Cancel
                              </button>
                              <button 
                                onClick={() => handleSendReply(q.id)}
                                className={`px-3 py-1.5 bg-${accentColor}-600 hover:bg-${accentColor}-700 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-${accentColor}-500/10 active:scale-95`}
                              >
                                Send Reply
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
