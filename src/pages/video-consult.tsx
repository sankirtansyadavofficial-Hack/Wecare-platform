import React, { useState, useEffect, useRef } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { 
  Video, Mic, MicOff, Camera, CameraOff, PhoneOff, Monitor, Settings, 
  PawPrint, Send, FileText, Upload, Check, Star, ShieldCheck, 
  Sparkles, MessageSquare, Paperclip, ArrowRight, ShieldAlert, Loader2,
  Plus, Trash2
} from "lucide-react";
import { useVetMode } from "@/context/vet-mode-context";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: number;
  sender: 'doctor' | 'user';
  text: string;
  timestamp: string;
  uploadProgress?: number; // 0 to 100
  isUploading?: boolean;
  attachment?: {
    name: string;
    size: string;
    type: 'pdf' | 'image' | 'doc';
  };
}

interface MedicationItem {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export function VideoConsult() {
  const { isVetMode } = useVetMode();
  const { user, hasActiveBooking } = useAuth();

  // 1. Core Call View States
  const [isInCall, setIsInCall] = useState(false);
  const [isLobby, setIsLobby] = useState(true);
  const [isCallEnded, setIsCallEnded] = useState(false);

  // Mute States
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCameraMuted, setIsCameraMuted] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  // Doctor EHR States
  const [isDoctorView, setIsDoctorView] = useState(false);
  const [activeEhrTab, setActiveEhrTab] = useState<'casesheet' | 'history'>('casesheet');
  const [diagnoses, setDiagnoses] = useState("");
  const [medications, setMedications] = useState<MedicationItem[]>([]);
  const [rxLocked, setRxLocked] = useState(false);
  const [signature, setSignature] = useState("");
  const [rxHash, setRxHash] = useState("");

  // Medication Entry states
  const [drugInput, setDrugInput] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [dosage, setDosage] = useState("500 mg");
  const [frequency, setFrequency] = useState("1-0-1");
  const [duration, setDuration] = useState("5 Days");
  const [instructions, setInstructions] = useState("After Food");

  // WebRTC Native Camera Stream Refs
  const lobbyVideoRef = useRef<HTMLVideoElement>(null);
  const activeVideoRef = useRef<HTMLVideoElement>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [hasCameraError, setHasCameraError] = useState(false);
  const [cameraErrorMessage, setCameraErrorMessage] = useState("");

  // Chat & Filesharing States
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Stopwatch States
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Doctor Details
  const doctorName = isVetMode ? "Dr. Alex Mercer, DVM" : "Dr. Sarah Jenkins";
  const doctorTitle = isVetMode ? "Senior Veterinary Surgeon" : "Chief Cardiologist & General Physician";
  const doctorAvatar = isVetMode 
    ? "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=800&h=800" 
    : "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=800&h=800";
  
  // Backup Patient Avatar if camera is disabled/blocked
  const patientAvatarBackup = isVetMode
    ? "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=400&h=300"
    : "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400&h=300";

  // Check if doctor query parameter is active in URL
  useEffect(() => {
    const isDoctor = window.location.hash.includes("role=doctor") || window.location.search.includes("role=doctor");
    if (isDoctor) {
      setIsDoctorView(true);
    }
  }, []);

  // 2. Initialize Browser Media Devices in Lobby
  useEffect(() => {
    if (isLobby && !mediaStream) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => {
          setMediaStream(stream);
          setHasCameraError(false);
          if (lobbyVideoRef.current) {
            lobbyVideoRef.current.srcObject = stream;
          }
        })
        .catch(err => {
          console.warn("Camera/Mic stream blocked or unavailable.", err);
          setHasCameraError(true);
          setCameraErrorMessage("Webcam permissions blocked or hardware busy. Falling back to secure default profile avatar.");
        });
    }

    // Cleanup: release tracks if switching page/state
    return () => {
      if (isLobby && mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
        setMediaStream(null);
      }
    };
  }, [isLobby]);

  // Bind active camera stream to PIP container during call
  useEffect(() => {
    if (isInCall && mediaStream && activeVideoRef.current && !isCameraMuted) {
      activeVideoRef.current.srcObject = mediaStream;
    }
  }, [isInCall, mediaStream, isCameraMuted]);

  // 3. Welcome messages on joining
  useEffect(() => {
    if (isInCall) {
      const welcomeMessages: ChatMessage[] = isVetMode ? [
        {
          id: 1,
          sender: 'doctor',
          text: `Hello! Welcome to your secure WeCare Vet TeleHealth Suite. I'm Dr. Alex Mercer. I have Milo's file loaded on my screen.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
        {
          id: 2,
          sender: 'doctor',
          text: `I've opened the clinic queue record. Feel free to drag-and-drop any clinical diet charts, lab sheets, or spay/neuter history using the paperclip button below.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ] : [
        {
          id: 1,
          sender: 'doctor',
          text: `Hello! Welcome to your secure WeCare Telehealth Premium Suite. I'm Dr. Sarah Jenkins.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
        {
          id: 2,
          sender: 'doctor',
          text: `I have reviewed your cardiac vital questionnaire. If you have your latest digital blood work or ECG charts, please click the paperclip button below to upload them directly into our secure S3 vault.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ];

      setChatMessages(welcomeMessages);
    }
  }, [isInCall, isVetMode]);

  // 4. Call duration stopwatch
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isInCall) {
      interval = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isInCall]);

  // 5. Auto-Scroll Chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const formatStopwatch = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Render empty state if Patient and no active booking
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
            <Video className="w-8 h-8" />
          </div>

          <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight mb-3">
            No Virtual Room Initialized
          </h2>
          
          <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base leading-relaxed mb-8">
            You don't have any virtual consultations scheduled for today. Once you book a teleconsultation from our premium medical discovery portal, your digital room will initialize here.
          </p>

          <div className="space-y-3">
            <button
              onClick={() => window.location.hash = "/find-doctors"}
              className={cn("w-full py-4 text-white font-extrabold rounded-2xl shadow-lg transition-all duration-300 hover:scale-[1.02]", buttonStyle)}
            >
              Consult a Doctor
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

  // 6. Mic/Camera Hardware Toggles
  const handleToggleCamera = () => {
    if (mediaStream) {
      const videoTrack = mediaStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
      }
    }
    setIsCameraMuted(!isCameraMuted);
  };

  const handleToggleMic = () => {
    if (mediaStream) {
      const audioTrack = mediaStream.getTracks().find(t => t.kind === 'audio');
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
      }
    }
    setIsMicMuted(!isMicMuted);
  };

  // 7. Chat messaging logic
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now(),
      sender: 'user',
      text: chatInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    const typedText = chatInput;
    setChatInput("");

    // Simulate doctor AI auto-reply
    setTimeout(() => {
      let replyText = `I am reviewing that now. Let's make sure we log this into your consultation summary list.`;
      
      const lower = typedText.toLowerCase();
      if (lower.includes("hello") || lower.includes("hi")) {
        replyText = `Hello! I'm here. How have you been feeling since yesterday?`;
      } else if (lower.includes("pain") || lower.includes("fever") || lower.includes("cough")) {
        replyText = isVetMode
          ? `I see. Milo's symptoms suggest we should perform a brief visual physical exam now. Please hold your camera closer to Milo's chest.`
          : `Got it. Those symptom markers are important. Let's do a quick physical description, starting with when this began.`;
      } else if (lower.includes("upload") || lower.includes("file") || lower.includes("send")) {
        replyText = `Perfect! Click the paperclip icon next to the chat bar to trigger your system file manager and share the documents.`;
      }

      const doctorReply: ChatMessage = {
        id: Date.now() + 1,
        sender: 'doctor',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setChatMessages(prev => [...prev, doctorReply]);
    }, 1500);
  };

  // EHR Handlers
  const handleDrugInputChange = (val: string) => {
    setDrugInput(val);
    if (!val.trim()) {
      setSuggestions([]);
      return;
    }
    const commonList = isVetMode
      ? ["Apoquel 5.4mg", "Carprofen 75mg", "Gabapentin 100mg", "Clavamox 125mg", "Heartgard Plus", "Bravecto Medium", "Prednisolone 5mg", "Metronidazole 250mg"]
      : ["Paracetamol 500mg", "Amoxicillin 250mg", "Atorvastatin 10mg", "Metformin 500mg", "Ibuprofen 400mg", "Azithromycin 500mg", "Pantoprazole 40mg", "Cetirizine 10mg"];
    
    const filtered = commonList.filter(d => d.toLowerCase().includes(val.toLowerCase()));
    setSuggestions(filtered);
  };

  const handleAddMedication = () => {
    if (!drugInput.trim()) return;
    const newItem: MedicationItem = {
      id: Date.now().toString(),
      name: drugInput,
      dosage,
      frequency,
      duration,
      instructions
    };
    setMedications(prev => [...prev, newItem]);
    setDrugInput("");
    setSuggestions([]);
  };

  const handleRemoveMedication = (id: string) => {
    setMedications(prev => prev.filter(m => m.id !== id));
  };

  const handleLockPrescription = () => {
    if (medications.length === 0 || !signature.trim()) return;
    const generatedHash = "wc_rx_" + Math.random().toString(36).substr(2, 9) + "_" + Date.now();
    setRxHash(generatedHash);
    setRxLocked(true);

    // Push secure prescription card directly into the chat room timeline
    const rxMsg: ChatMessage = {
      id: Date.now(),
      sender: 'doctor',
      text: isVetMode 
        ? `Prescription issued for Milo. Locked via SHA-256 seal. Verified by ${signature}.`
        : `Prescription issued by Dr. Sarah Jenkins. Locked via SHA-256 seal. Verified by ${signature}.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachment: {
        name: isVetMode ? `prescription_milo_${Date.now().toString().slice(-4)}.pdf` : `prescription_cardiac_${Date.now().toString().slice(-4)}.pdf`,
        size: "135 KB",
        type: 'pdf'
      }
    };
    setChatMessages(prev => [...prev, rxMsg]);
  };

  // 8. Native File Manager Integration & Upload Progress simulation
  const handleTriggerFilePicker = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const msgId = Date.now();
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2) + " MB";
    const extension = file.name.split('.').pop()?.toLowerCase();
    const filetype = (extension === 'png' || extension === 'jpg' || extension === 'jpeg') ? 'image' : 'pdf';

    // 1. Append message showing upload state
    const uploadingMsg: ChatMessage = {
      id: msgId,
      sender: 'user',
      text: `Uploading file: ${file.name}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isUploading: true,
      uploadProgress: 0,
      attachment: {
        name: file.name,
        size: fileSizeMB,
        type: filetype
      }
    };

    setChatMessages(prev => [...prev, uploadingMsg]);

    // 2. Simulate Upload Progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      setChatMessages(prev => 
        prev.map(m => m.id === msgId ? { ...m, uploadProgress: progress } : m)
      );

      if (progress >= 100) {
        clearInterval(interval);
        
        // Mark as uploaded
        setChatMessages(prev => 
          prev.map(m => m.id === msgId ? { ...m, isUploading: false } : m)
        );

        // 3. Trigger Doctor response acknowledging document
        setTimeout(() => {
          const docReply: ChatMessage = {
            id: Date.now() + 5,
            sender: 'doctor',
            text: isVetMode 
              ? `Thank you. The medical file "${file.name}" has been securely stored. I am analyzing Milo's records on my right screen.`
              : `Got it. I see the medical report "${file.name}" has loaded in our HIPAA-compliant panel. Vitals look stable. Let's walk through it together.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          setChatMessages(prev => [...prev, docReply]);
        }, 1200);
      }
    }, 400);

    // Reset file input value
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // 9. Call room lifecycle transitions
  const handleJoinCall = () => {
    setIsLobby(false);
    setIsInCall(true);
    setIsCallEnded(false);
    setElapsedSeconds(0);
  };

  const handleHangUp = () => {
    // Release hardware camera tracks
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      setMediaStream(null);
    }
    setIsInCall(false);
    setIsCallEnded(true);
  };

  const handleReturnToLobby = () => {
    setIsCallEnded(false);
    setIsLobby(true);
    setChatMessages([]);
  };

  return (
    <div className="min-h-screen bg-transparent w-full pb-24">
      <PageHeader 
        title={isVetMode ? "TeleHealth Premium Suite (Vet)" : "TeleHealth Premium Suite"} 
        description="A completely embedded, luxury-tier WebRTC live consultation module. Zero external links, 1080p high definition, and HIPAA secure file uploads."
        icon={isVetMode ? PawPrint : Video} 
      />

      <div className="max-w-7xl mx-auto px-6 mt-12">
        
        {/* Quick Perspective Switcher for Testing */}
        <div className="max-w-5xl mx-auto mb-8 bg-white/40 dark:bg-black/40 border border-gray-200/50 dark:border-white/10 backdrop-blur-md p-4 rounded-3xl flex flex-col sm:flex-row justify-between items-center gap-4 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3 text-left">
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse"></div>
            <div>
              <p className="text-xs font-black uppercase text-gray-900 dark:text-white">Active Session Perspective</p>
              <p className="text-[10px] text-gray-500 dark:text-zinc-400 font-semibold">Toggle between Patient and Doctor views to inspect different interfaces.</p>
            </div>
          </div>
          <div className="flex bg-zinc-100 dark:bg-zinc-950/80 p-1 rounded-xl border border-gray-200/50 dark:border-white/5 gap-1 select-none shrink-0">
            <button
              onClick={() => setIsDoctorView(false)}
              className={cn(
                "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all",
                !isDoctorView
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/15"
                  : "text-zinc-500 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              Patient View
            </button>
            <button
              onClick={() => setIsDoctorView(true)}
              className={cn(
                "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all",
                isDoctorView
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/15"
                  : "text-zinc-500 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              Doctor EHR View
            </button>
          </div>
        </div>

        {/* =========================================================================
            LOBBY VIEW (PRE-CALL SETUP WITH LIVE WEBCAM)
           ========================================================================= */}
        {isLobby && (
          <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-500">
            
            {/* Left Box: Hardware test & Live Camera */}
            <div className="lg:col-span-7 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 rounded-[2rem] p-8 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-black text-gray-900 dark:text-white">Device Diagnostics & Preview</h3>
                  <span className="bg-cyan-500/10 text-cyan-500 text-[10px] font-bold px-2 py-0.5 rounded border border-cyan-500/20 uppercase tracking-wide">
                    WebRTC Local Link
                  </span>
                </div>
                
                {/* Dynamic Camera Feed Container */}
                <div className="aspect-video bg-zinc-950 rounded-2xl overflow-hidden relative border border-gray-200 dark:border-zinc-800 shadow-inner flex items-center justify-center">
                  {!hasCameraError && !isCameraMuted ? (
                    <video 
                      ref={lobbyVideoRef} 
                      autoPlay 
                      playsInline 
                      muted 
                      className="w-full h-full object-cover transform -scale-x-100"
                    />
                  ) : (
                    <div className="text-center p-6 max-w-sm">
                      <div className="w-16 h-16 rounded-full bg-zinc-800/80 backdrop-blur-md flex items-center justify-center mx-auto mb-3 border border-white/10">
                        <CameraOff className="w-8 h-8 text-zinc-500" />
                      </div>
                      <p className="text-sm font-bold text-zinc-400">
                        {isCameraMuted ? "Camera is turned off" : "Camera Access Blocked"}
                      </p>
                      <p className="text-[10px] text-zinc-500 leading-normal mt-1">
                        {isCameraMuted ? "You can turn the webcam back on using the control buttons below." : cameraErrorMessage}
                      </p>
                    </div>
                  )}

                  {/* Status Indicator */}
                  {!hasCameraError && !isCameraMuted && (
                    <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-bold text-white border border-white/10 flex items-center gap-1.5 shadow-sm">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Dynamic Camera Sync
                    </div>
                  )}
                </div>

                {/* Device controls */}
                <div className="flex justify-center gap-4 mt-6">
                  <button 
                    onClick={handleToggleMic}
                    className={cn(
                      "w-14 h-14 rounded-full flex items-center justify-center transition-all border shadow-sm",
                      isMicMuted 
                        ? "bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20" 
                        : "bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-zinc-300 border-gray-200 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/10"
                    )}
                    title={isMicMuted ? "Unmute Mic" : "Mute Mic"}
                  >
                    {isMicMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>

                  <button 
                    onClick={handleToggleCamera}
                    className={cn(
                      "w-14 h-14 rounded-full flex items-center justify-center transition-all border shadow-sm",
                      isCameraMuted 
                        ? "bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20" 
                        : "bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-zinc-300 border-gray-200 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/10"
                    )}
                    title={isCameraMuted ? "Camera On" : "Camera Off"}
                  >
                    {isCameraMuted ? <CameraOff className="w-5 h-5" /> : <Camera className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Hardware Selection Mocks */}
              <div className="mt-8 grid grid-cols-2 gap-4 border-t border-gray-200/50 dark:border-white/10 pt-6">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Mic Device Profile</label>
                  <select className="w-full text-xs font-bold bg-gray-50 dark:bg-black/35 border border-gray-200/60 dark:border-white/5 p-3 rounded-xl text-gray-700 dark:text-zinc-300 outline-none">
                    <option>Default - Internal Microphone</option>
                    <option>External Mic (USB Audio Jack)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Webcam Device Profile</label>
                  <select className="w-full text-xs font-bold bg-gray-50 dark:bg-black/35 border border-gray-200/60 dark:border-white/5 p-3 rounded-xl text-gray-700 dark:text-zinc-300 outline-none">
                    <option>Default - HD Web Camera</option>
                    <option>DSLR Virtual Camera Link</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Right Box: Doctor profile card & Trigger */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <div className="bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 rounded-[2rem] p-8 shadow-sm text-center">
                <div className="relative w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-4 border-white/80 dark:border-zinc-800 shadow-md">
                  <img src={doctorAvatar} alt={doctorName} className="w-full h-full object-cover" />
                  <span className="absolute bottom-1 right-1 w-4.5 h-4.5 bg-emerald-500 rounded-full border-2 border-white dark:border-zinc-950 flex items-center justify-center">
                    <span className="w-2.5 h-2.5 bg-white rounded-full animate-ping opacity-75"></span>
                  </span>
                </div>

                <div className="flex items-center justify-center gap-1 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-black px-3 py-1 rounded-full border border-amber-100 dark:border-amber-500/20 w-fit mx-auto mb-3">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> 4.95 Rating
                </div>

                <h3 className="text-xl font-black text-gray-900 dark:text-white">{doctorName}</h3>
                <p className="text-sm font-semibold text-gray-500 dark:text-zinc-400 mt-1">{doctorTitle}</p>

                <div className="grid grid-cols-2 gap-4 mt-6 border-t border-b border-gray-200/50 dark:border-white/10 py-5 text-xs text-gray-500">
                  <div className="border-r border-gray-200/50 dark:border-white/10">
                    <p className="font-bold text-gray-400 uppercase tracking-widest mb-0.5">Vitals Status</p>
                    <p className="font-extrabold text-emerald-500 text-sm">Checked-In</p>
                  </div>
                  <div>
                    <p className="font-bold text-gray-400 uppercase tracking-widest mb-0.5">Secure Protocol</p>
                    <p className="font-extrabold text-gray-900 dark:text-white text-sm">WebRTC SFU</p>
                  </div>
                </div>

                <button 
                  onClick={handleJoinCall}
                  className={cn(
                    "w-full text-white font-black py-4 px-6 rounded-2xl hover:shadow-lg transition-all flex items-center justify-center gap-2 mt-8 text-base tracking-tight",
                    isVetMode ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20" : "bg-red-600 hover:bg-red-700 shadow-red-500/20"
                  )}
                >
                  Join Tele-Consultation Room <ArrowRight className="w-5 h-5" />
                </button>
              </div>

              {/* Encryption banner */}
              <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-5 flex items-start gap-4">
                <ShieldCheck className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-extrabold text-sm text-emerald-700 dark:text-emerald-400">HIPAA Compliant Room</h4>
                  <p className="text-xs text-emerald-600/80 dark:text-emerald-500/60 leading-relaxed mt-1">
                    All file uploads are streamed securely using AES-256 encrypted storage buckets to satisfy strict healthcare security compliances.
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* =========================================================================
            ACTIVE CALL ROOM VIEW (GOOGLE MEET SPLIT DESIGN)
           ========================================================================= */}
        {isInCall && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[650px] animate-in zoom-in-95 duration-500 relative">
            
            {/* LEFT COLUMN: THEATERS / MAIN VIDEO STAGE (8 COLS) */}
            <div className="lg:col-span-8 flex flex-col justify-between h-full bg-zinc-950 rounded-[2.5rem] overflow-hidden border border-zinc-800 shadow-2xl relative">
              
              {/* Split layout inside the left stage column if EHR is active */}
              <div className="flex-1 w-full h-full flex flex-col md:flex-row overflow-hidden">
                
                {/* 1. Left side: Video Stage (50% width in split, or 100% if normal) */}
                <div className={cn(
                  "relative h-full flex-1 min-h-[300px] md:min-h-0",
                  isDoctorView ? "md:border-r border-zinc-800" : ""
                )}>
                  {/* Doctor main feed */}
                  {!isScreenSharing ? (
                    <img 
                      src={doctorAvatar} 
                      alt="Doctor stream" 
                      className="w-full h-full object-cover opacity-90 transition-opacity"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center text-center p-8">
                      <Monitor className="w-16 h-16 text-cyan-400 animate-pulse mb-3" />
                      <p className="text-lg font-black text-white text-sm sm:text-base">Presenting: Your Desktop Screen</p>
                      <p className="text-[10px] text-slate-400 mt-1">WebRTC Screen Share channel is active. Sharing primary display.</p>
                      <button 
                        onClick={() => setIsScreenSharing(false)}
                        className="bg-red-500 hover:bg-red-600 text-white font-bold text-[10px] py-1.5 px-3 rounded-lg mt-3 transition-colors"
                      >
                        Stop Presenting
                      </button>
                    </div>
                  )}

                  {/* Floating Self-View Video element */}
                  <div className={cn(
                    "absolute bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 z-10 transition-all",
                    isDoctorView 
                      ? "top-4 right-4 w-28 md:w-36 aspect-video" 
                      : "top-6 right-6 w-44 md:w-56 aspect-video"
                  )}>
                    {!hasCameraError && !isCameraMuted ? (
                      <video 
                        ref={activeVideoRef} 
                        autoPlay 
                        playsInline 
                        muted 
                        className="w-full h-full object-cover transform -scale-x-100"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 text-center p-2">
                        {isCameraMuted ? (
                          <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center border border-white/5 animate-pulse">
                            <CameraOff className="w-3.5 h-3.5 text-zinc-500" />
                          </div>
                        ) : (
                          <img src={patientAvatarBackup} alt="Mock Avatar" className="w-full h-full object-cover" />
                        )}
                        {isCameraMuted && <p className="text-[8px] font-bold text-zinc-500 mt-1">Camera Muted</p>}
                      </div>
                    )}
                  </div>

                  {/* Performance HUD Vitals */}
                  <div className="absolute top-4 left-4 flex items-center gap-1.5 z-10">
                    <span className={cn(
                      "text-white text-[10px] font-black px-2 py-1 rounded-lg flex items-center gap-1.5 border shadow-sm",
                      isVetMode ? "bg-emerald-600 border-emerald-500" : "bg-red-600 border-red-500"
                    )}>
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                      REC {formatStopwatch(elapsedSeconds)}
                    </span>
                    <span className="bg-black/60 backdrop-blur-md border border-white/10 text-white text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" /> WebRTC SFU Link
                    </span>
                  </div>

                  {/* Speaker detail tag */}
                  <div className="absolute bottom-28 left-4 bg-black/35 backdrop-blur-md border border-white/5 p-3 rounded-2xl text-white z-10 max-w-[200px]">
                    <h3 className="font-extrabold text-sm leading-tight flex items-center gap-1">
                      {doctorName} <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
                    </h3>
                    <p className="text-[10px] text-white/70 font-medium mt-0.5">{doctorTitle}</p>
                  </div>
                </div>

                {/* 2. Right side: EHR Casesheet & Digital Prescription */}
                {isDoctorView && (
                  <div className="w-full md:w-1/2 h-full bg-zinc-900 border-t md:border-t-0 border-zinc-800 flex flex-col justify-between overflow-y-auto">
                    
                    {/* EHR Header Tabs */}
                    <div className="p-4 border-b border-zinc-800 flex items-center justify-between shrink-0 bg-zinc-950/20">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setActiveEhrTab('casesheet')}
                          className={cn(
                            "text-[10px] md:text-xs font-bold px-2 md:px-2.5 py-1 rounded-lg transition-all",
                            activeEhrTab === 'casesheet' 
                              ? "bg-white/10 text-white" 
                              : "text-zinc-500 hover:text-zinc-300"
                          )}
                        >
                          Casesheet & Rx
                        </button>
                        <button
                          onClick={() => setActiveEhrTab('history')}
                          className={cn(
                            "text-[10px] md:text-xs font-bold px-2 md:px-2.5 py-1 rounded-lg transition-all",
                            activeEhrTab === 'history' 
                              ? "bg-white/10 text-white" 
                              : "text-zinc-500 hover:text-zinc-300"
                          )}
                        >
                          Patient History
                        </button>
                      </div>
                      <span className="bg-emerald-500/10 text-emerald-400 text-[8px] font-black px-2 py-0.5 rounded border border-emerald-500/20 uppercase tracking-widest">
                        EHR Mode
                      </span>
                    </div>

                    {/* Tab 1: Casesheet Content */}
                    {activeEhrTab === 'casesheet' && (
                      <div className="flex-1 p-4 space-y-4 text-left overflow-y-auto text-xs">
                        
                        {/* Diagnoses textbox */}
                        <div>
                          <label className="text-[8px] font-black text-zinc-400 uppercase tracking-widest block mb-1">Observations & Diagnoses</label>
                          <textarea
                            value={diagnoses}
                            onChange={(e) => setDiagnoses(e.target.value)}
                            disabled={rxLocked}
                            rows={2}
                            placeholder="Describe clinical notes or signs..."
                            className="w-full text-[11px] bg-zinc-950 border border-zinc-800 p-2 rounded-xl text-zinc-200 focus:outline-none focus:border-zinc-700 disabled:opacity-50"
                          />
                        </div>

                        {/* Medications Table */}
                        <div className="border-t border-zinc-800 pt-3">
                          <label className="text-[8px] font-black text-zinc-400 uppercase tracking-widest block mb-2">Medications List</label>
                          
                          {medications.length === 0 ? (
                            <p className="text-[9px] text-zinc-500 text-center py-3 bg-zinc-950/20 rounded-xl">No active drugs in prescription list.</p>
                          ) : (
                            <div className="space-y-1.5 max-h-36 overflow-y-auto mb-2">
                              {medications.map((item) => (
                                <div key={item.id} className="flex justify-between items-center p-2 rounded-xl bg-zinc-950 border border-zinc-800/60">
                                  <div>
                                    <p className="font-bold text-white text-[10px]">{item.name}</p>
                                    <p className="text-[8px] text-zinc-400">{item.dosage} • {item.frequency} • {item.duration} • {item.instructions}</p>
                                  </div>
                                  {!rxLocked && (
                                    <button
                                      onClick={() => handleRemoveMedication(item.id)}
                                      className="text-red-400 hover:text-red-300 p-1 hover:bg-red-500/10 rounded"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Add Medication Box */}
                          {!rxLocked && (
                            <div className="bg-zinc-950/40 p-2.5 rounded-xl border border-zinc-800 space-y-2 mt-1.5">
                              <div className="relative">
                                <input
                                  type="text"
                                  value={drugInput}
                                  onChange={(e) => handleDrugInputChange(e.target.value)}
                                  placeholder="Medication Search..."
                                  className="w-full text-[10px] bg-zinc-900 border border-zinc-800 rounded-lg p-1.5 text-zinc-200 outline-none"
                                />
                                {suggestions.length > 0 && (
                                  <div className="absolute top-full left-0 right-0 z-40 bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden shadow-2xl max-h-24 overflow-y-auto mt-1">
                                    {suggestions.map((sug) => (
                                      <div
                                        key={sug}
                                        onClick={() => {
                                          setDrugInput(sug);
                                          setSuggestions([]);
                                        }}
                                        className="p-1.5 text-[9px] hover:bg-emerald-600 cursor-pointer transition-colors text-white"
                                      >
                                        {sug}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>

                              <div className="grid grid-cols-2 gap-2 text-[9px]">
                                <div>
                                  <label className="text-[7px] text-zinc-500 font-bold block mb-0.5">Dosage</label>
                                  <input
                                    type="text"
                                    value={dosage}
                                    onChange={(e) => setDosage(e.target.value)}
                                    className="w-full bg-zinc-900 border border-zinc-800 p-1 rounded text-zinc-200 text-[10px]"
                                  />
                                </div>
                                <div>
                                  <label className="text-[7px] text-zinc-500 font-bold block mb-0.5">Frequency</label>
                                  <select
                                    value={frequency}
                                    onChange={(e) => setFrequency(e.target.value)}
                                    className="w-full bg-zinc-900 border border-zinc-800 p-1 rounded text-zinc-200 text-[10px]"
                                  >
                                    <option value="1-0-1">1-0-1 BD</option>
                                    <option value="1-1-1">1-1-1 TID</option>
                                    <option value="0-0-1">0-0-1 OD</option>
                                    <option value="S.O.S">S.O.S</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="text-[7px] text-zinc-500 font-bold block mb-0.5">Duration</label>
                                  <input
                                    type="text"
                                    value={duration}
                                    onChange={(e) => setDuration(e.target.value)}
                                    className="w-full bg-zinc-900 border border-zinc-800 p-1 rounded text-zinc-200 text-[10px]"
                                  />
                                </div>
                                <div>
                                  <label className="text-[7px] text-zinc-500 font-bold block mb-0.5">Intake</label>
                                  <select
                                    value={instructions}
                                    onChange={(e) => setInstructions(e.target.value)}
                                    className="w-full bg-zinc-900 border border-zinc-800 p-1 rounded text-zinc-200 text-[10px]"
                                  >
                                    <option value="After Food">After Food</option>
                                    <option value="Before Food">Before Food</option>
                                  </select>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={handleAddMedication}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 rounded-lg text-[9px] mt-1 transition-transform"
                              >
                                Add Medication
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Sign e-Prescription */}
                        <div className="border-t border-zinc-800 pt-3">
                          {!rxLocked ? (
                            <div className="space-y-2">
                              <div>
                                <label className="text-[8px] font-black text-zinc-400 uppercase tracking-widest block mb-1">Doctor Signature</label>
                                <input
                                  type="text"
                                  value={signature}
                                  onChange={(e) => setSignature(e.target.value)}
                                  placeholder="Type name (e.g. Dr. Jenkins)"
                                  className="w-full text-[11px] bg-zinc-950 border border-zinc-800 p-2 rounded-xl text-zinc-200 outline-none"
                                />
                              </div>
                              <button
                                onClick={handleLockPrescription}
                                disabled={medications.length === 0 || !signature.trim()}
                                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black rounded-xl text-[10px] uppercase tracking-wider transition-all shadow-lg"
                              >
                                Sign & Finalize Prescription
                              </button>
                            </div>
                          ) : (
                            <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl space-y-1 font-mono text-[9px] text-emerald-400">
                              <p className="font-extrabold uppercase">🔒 Cryptographic Seal ID:</p>
                              <p className="truncate">{rxHash}</p>
                              <p>Certified Signed by {signature}</p>
                            </div>
                          )}
                        </div>

                      </div>
                    )}

                    {/* Tab 2: Patient History Content */}
                    {activeEhrTab === 'history' && (
                      <div className="flex-1 p-4 space-y-4 text-left overflow-y-auto text-xs">
                        <div>
                          <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block mb-2">Previous Consultation Reports</p>
                          <div className="space-y-2">
                            <div className="p-2 rounded-xl bg-zinc-950 border border-zinc-800/60">
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-bold text-white text-[9px]">Cardiac Vital Checkup</span>
                                <span className="text-[8px] text-zinc-500 font-mono">14 Days Ago</span>
                              </div>
                              <p className="text-[9px] text-zinc-400 leading-normal">BP: 124/82 mmHg, HR: 74 bpm. Vitals stable. Advised light exercise.</p>
                            </div>
                            <div className="p-2 rounded-xl bg-zinc-950 border border-zinc-800/60">
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-bold text-white text-[9px]">Lipid Profile Lab Review</span>
                                <span className="text-[8px] text-zinc-500 font-mono">2 Months Ago</span>
                              </div>
                              <p className="text-[9px] text-zinc-400 leading-normal">Total Cholesterol: 210 mg/dL. Replaced Atorvastatin dose.</p>
                            </div>
                          </div>
                        </div>

                        <div className="border-t border-zinc-800 pt-3">
                          <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block mb-2">Allergies & Medical Risks</p>
                          <div className="flex flex-wrap gap-1">
                            <span className="bg-red-500/10 text-red-400 border border-red-500/20 text-[8px] font-bold px-1.5 py-0.5 rounded">Penicillin Sensitive</span>
                            <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[8px] font-bold px-1.5 py-0.5 rounded">Lactose Intolerance</span>
                          </div>
                        </div>
                      </div>
                    )}

                  </div>
                )}

              </div>

              {/* Centered Floating Control Bar */}
              <div className="h-24 bg-zinc-900 border-t border-zinc-800 flex items-center justify-center gap-4 px-6 relative z-10">
                
                {/* Audio Toggle */}
                <button 
                  onClick={handleToggleMic}
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center transition-all border shadow-sm text-white",
                    isMicMuted 
                      ? "bg-red-500/20 hover:bg-red-500/30 border-red-500/40" 
                      : "bg-white/5 hover:bg-white/10 border-white/5"
                  )}
                  title={isMicMuted ? "Unmute Mic" : "Mute Mic"}
                >
                  {isMicMuted ? <MicOff className="w-5 h-5 text-red-500" /> : <Mic className="w-5 h-5" />}
                </button>

                {/* Video Toggle */}
                <button 
                  onClick={handleToggleCamera}
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center transition-all border shadow-sm text-white",
                    isCameraMuted 
                      ? "bg-red-500/20 hover:bg-red-500/30 border-red-500/40" 
                      : "bg-white/5 hover:bg-white/10 border-white/5"
                  )}
                  title={isCameraMuted ? "Turn Camera On" : "Turn Camera Off"}
                >
                  {isCameraMuted ? <CameraOff className="w-5 h-5 text-red-500" /> : <Camera className="w-5 h-5" />}
                </button>

                {/* Document Attachment Button (Native File Picker) */}
                <button 
                  onClick={handleTriggerFilePicker}
                  className="w-12 h-12 rounded-full flex items-center justify-center transition-all border border-white/5 bg-white/5 hover:bg-white/10 text-white"
                  title="Share Medical Reports (System Files)"
                >
                  <Paperclip className="w-5 h-5" />
                </button>

                {/* Present Screen */}
                <button 
                  onClick={() => setIsScreenSharing(!isScreenSharing)}
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center transition-all border shadow-sm text-white",
                    isScreenSharing 
                      ? "bg-cyan-500/20 hover:bg-cyan-500/30 border-cyan-500/40" 
                      : "bg-white/5 hover:bg-white/10 border-white/5"
                  )}
                  title={isScreenSharing ? "Stop Screen Share" : "Present Screen"}
                >
                  <Monitor className={cn("w-5 h-5", isScreenSharing ? "text-cyan-400" : "")} />
                </button>

                {/* Doctor EHR Casesheet Switch */}
                <button 
                  onClick={() => setIsDoctorView(!isDoctorView)}
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center transition-all border shadow-sm text-white",
                    isDoctorView 
                      ? "bg-emerald-500/20 hover:bg-emerald-500/30 border-emerald-500/40" 
                      : "bg-white/5 hover:bg-white/10 border-white/5"
                  )}
                  title={isDoctorView ? "Switch to Full Video Stage" : "Open EHR Casesheet"}
                >
                  <FileText className={cn("w-5 h-5", isDoctorView ? "text-emerald-400" : "")} />
                </button>

                {/* Cut/End Call */}
                <button 
                  onClick={handleHangUp}
                  className="w-16 h-12 rounded-2xl flex items-center justify-center text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/20 hover:scale-105 active:scale-95 transition-all"
                  title="Cut Call Session"
                >
                  <PhoneOff className="w-6 h-6" />
                </button>

              </div>

            </div>

            {/* RIGHT COLUMN: COLLAPSIBLE CHAT & FILE MANAGER PANELS (4 COLS) */}
            <div className="lg:col-span-4 flex flex-col justify-between h-full bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 rounded-[2.5rem] overflow-hidden shadow-sm">
              
              {/* Sidebar Header */}
              <div className="p-5 border-b border-gray-200/50 dark:border-white/10 flex items-center justify-between bg-white/30 dark:bg-black/20">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-gray-500" />
                  <span className="font-extrabold text-sm text-gray-900 dark:text-white uppercase tracking-wider">Secure Sidebar Chat</span>
                </div>
                <span className="bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-black px-2 py-0.5 rounded border border-blue-200 dark:border-blue-500/20">
                  HIPAA Vault
                </span>
              </div>

              {/* Scrolling messages feed */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 max-h-[460px]">
                {chatMessages.map(msg => (
                  <div 
                    key={msg.id}
                    className={cn(
                      "flex flex-col max-w-[85%] rounded-2xl p-3.5 text-xs transition-all",
                      msg.sender === 'doctor'
                        ? "bg-gray-100 dark:bg-white/5 text-gray-800 dark:text-zinc-300 rounded-tl-none mr-auto border border-gray-200/20 dark:border-white/5"
                        : (isVetMode 
                            ? "bg-emerald-600 text-white rounded-tr-none ml-auto shadow-md shadow-emerald-500/10" 
                            : "bg-red-600 text-white rounded-tr-none ml-auto shadow-md shadow-red-500/10")
                    )}
                  >
                    <div className="flex items-center justify-between gap-4 mb-1">
                      <span className="font-bold opacity-60 uppercase text-[9px] tracking-wider">
                        {msg.sender === 'doctor' ? doctorName : "You"}
                      </span>
                      <span className="opacity-55 text-[8px]">{msg.timestamp}</span>
                    </div>

                    {!msg.isUploading && <p className="leading-relaxed font-medium">{msg.text}</p>}

                    {/* Upload progress indicator bar */}
                    {msg.isUploading && msg.attachment && (
                      <div className="space-y-2 py-1 min-w-[150px]">
                        <p className="font-bold text-[10px] text-white/95 flex items-center gap-1.5">
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                          Uploading {msg.attachment.name}...
                        </p>
                        <div className="w-full bg-black/20 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className="bg-white h-full transition-all duration-300 rounded-full shadow-[0_0_10px_white]"
                            style={{ width: `${msg.uploadProgress}%` }}
                          ></div>
                        </div>
                        <span className="text-[9px] opacity-60 block text-right font-mono">{msg.uploadProgress}%</span>
                      </div>
                    )}

                    {/* Completed File attachment card */}
                    {!msg.isUploading && msg.attachment && (
                      <div className="mt-3 p-2.5 rounded-lg bg-black/15 border border-white/10 flex items-center justify-between gap-3 text-white shadow-inner">
                        <div className="flex items-center gap-2">
                          <FileText className="w-5 h-5 text-cyan-400" />
                          <div className="text-left">
                            <p className="font-bold truncate max-w-[120px]">{msg.attachment.name}</p>
                            <p className="text-[9px] opacity-60">{msg.attachment.size}</p>
                          </div>
                        </div>
                        <a 
                          href="#"
                          onClick={(e) => e.preventDefault()}
                          className="bg-emerald-500 text-white text-[8px] font-black px-2 py-0.5 rounded flex items-center gap-0.5 hover:bg-emerald-600 transition-colors"
                        >
                          <Check className="w-2.5 h-2.5" /> Shared
                        </a>
                      </div>
                    )}
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Hidden System File manager input */}
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={handleFileSelected} 
                accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
              />

              {/* Message inputs */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200/50 dark:border-white/10 flex gap-2 items-center bg-white/30 dark:bg-black/20">
                <button 
                  type="button" 
                  onClick={handleTriggerFilePicker}
                  className="p-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-all"
                  title="Attach Reports (Opens native File Manager)"
                >
                  <Paperclip className="w-5 h-5" />
                </button>

                <input 
                  type="text" 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Type a message or symptom details..." 
                  className="flex-1 text-xs bg-gray-50 dark:bg-black/35 border border-gray-200/60 dark:border-white/5 p-3 rounded-xl text-gray-800 dark:text-zinc-200 outline-none focus:ring-1 focus:ring-blue-500/50"
                />

                <button 
                  type="submit"
                  className={cn(
                    "p-3 rounded-xl text-white hover:scale-105 active:scale-95 transition-all shadow-sm",
                    isVetMode ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"
                  )}
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>

            </div>

          </div>
        )}

        {/* =========================================================================
            POST-CALL SUMMARY VIEWS
           ========================================================================= */}
        {isCallEnded && (
          <div className="max-w-xl mx-auto bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 rounded-[2rem] p-10 shadow-lg text-center animate-in zoom-in-95 duration-500">
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
              <ShieldCheck className="w-10 h-10" />
            </div>
            
            <h3 className="text-2xl font-black text-gray-900 dark:text-white">Consultation Completed</h3>
            <p className="text-sm text-gray-500 dark:text-zinc-400 font-semibold mt-1">
              Your WebRTC session with {doctorName} was completed successfully. Peer connection released.
            </p>

            <div className="mt-8 bg-gray-50 dark:bg-black/30 border border-gray-100 dark:border-white/5 p-4 rounded-2xl flex items-center justify-between text-xs text-gray-500 text-left">
              <div>
                <p className="text-gray-400">Total duration</p>
                <p className="font-bold text-sm text-gray-900 dark:text-white mt-0.5">{formatStopwatch(elapsedSeconds)} minutes</p>
              </div>
              <div className="w-px h-8 bg-gray-200 dark:bg-white/10"></div>
              <div>
                <p className="text-gray-400">Encrypted Cloud Storage</p>
                <p className="font-bold text-sm text-gray-900 dark:text-white mt-0.5 flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" /> S3 (AES-256)
                </p>
              </div>
            </div>

            {/* Rating */}
            <div className="mt-8">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-3">Rate your Consultation experience</label>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button 
                    key={star}
                    className="p-1 hover:scale-110 active:scale-95 transition-all text-amber-500"
                  >
                    <Star className="w-8 h-8 fill-amber-500 text-amber-500" />
                  </button>
                ))}
              </div>
            </div>

            {/* Summary Actions */}
            <div className="mt-10 grid grid-cols-2 gap-4">
              <button 
                onClick={handleReturnToLobby}
                className="w-full bg-gray-900 dark:bg-white text-white dark:text-black font-black py-4 px-6 rounded-2xl hover:bg-gray-800 dark:hover:bg-gray-200 transition-all text-xs"
              >
                Return to Lobby
              </button>
              <button 
                onClick={() => window.location.href = "/"}
                className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-800 dark:text-zinc-300 font-bold py-4 px-6 rounded-2xl transition-all text-xs"
              >
                Go to Home
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
