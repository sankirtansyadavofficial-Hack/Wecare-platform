"use client";

import { useEffect, useRef, useCallback, useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import {
    CircleUserRound,
    ArrowUpIcon,
    Paperclip,
    SendIcon,
    XIcon,
    LoaderIcon,
    Sparkles,
    Command,
    Stethoscope,
    Pill,
    Clock,
    HeartPulse,
    FileText,
    Calendar,
    UploadCloud,
    CheckCircle2,
    BookOpen,
    Info,
    HelpCircle,
    ShieldAlert,
    AlertTriangle,
    Salad,
    Ban,
    Timer,
    Droplets,
    ChevronDown,
    ChevronUp
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import * as React from "react";

interface UseAutoResizeTextareaProps {
    minHeight: number;
    maxHeight?: number;
}

function useAutoResizeTextarea({
    minHeight,
    maxHeight,
}: UseAutoResizeTextareaProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const adjustHeight = useCallback(
        (reset?: boolean) => {
            const textarea = textareaRef.current;
            if (!textarea) return;

            if (reset) {
                textarea.style.height = `${minHeight}px`;
                return;
            }

            textarea.style.height = `${minHeight}px`;
            const newHeight = Math.max(
                minHeight,
                Math.min(
                    textarea.scrollHeight,
                    maxHeight ?? Number.POSITIVE_INFINITY
                )
            );

            textarea.style.height = `${newHeight}px`;
        },
        [minHeight, maxHeight]
    );

    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = `${minHeight}px`;
        }
    }, [minHeight]);

    useEffect(() => {
        const handleResize = () => adjustHeight();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [adjustHeight]);

    return { textareaRef, adjustHeight };
}

interface CommandSuggestion {
    icon: React.ReactNode;
    label: string;
    description: string;
    prefix: string;
}

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  containerClassName?: string;
  showRing?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, containerClassName, showRing = true, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);
    
    return (
      <div className={cn(
        "relative",
        containerClassName
      )}>
        <textarea
          className={cn(
            "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
            "transition-all duration-200 ease-in-out",
            "placeholder:text-muted-foreground",
            "disabled:cursor-not-allowed disabled:opacity-50",
            showRing ? "focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0" : "",
            className
          )}
          ref={ref}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        
        {showRing && isFocused && (
          <motion.span 
            className="absolute inset-0 rounded-md pointer-events-none ring-2 ring-offset-0 ring-red-500/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </div>
    )
  }
)
Textarea.displayName = "Textarea";

interface Attachment {
    name: string;
    content: string;
    type: string;
    fileBase64?: string;
    size?: number;
}

interface DietRec {
    category: string;
    icon: string;
    title: string;
    items: string[];
}

interface Warning {
    severity: "high" | "medium" | "low";
    title: string;
    description: string;
}

interface Message {
    role: "user" | "assistant";
    content: string;
    isAIGenerated?: boolean;
    aiDetectionReason?: string;
    schedule?: {
        success: boolean;
        analysis: string;
        medicines: {
            name: string;
            purpose: string;
            dosage: string;
            frequency: string;
            duration: string;
            timing: {
                morning: boolean;
                afternoon: boolean;
                evening: boolean;
                night: boolean;
                instructions: string;
            };
            weeklyDose: string;
            monthlyDose: string;
        }[];
    };
    dietRecommendations?: DietRec[];
    warnings?: Warning[];
    doctorGuidanceNotice?: string;
}

export function AnimatedAIChat() {
    const [value, setValue] = useState("");
    const [messages, setMessages] = useState<Message[]>([
        {
            role: "assistant",
            content: "Hello! I am your **WeCare AI Medical Assistant**. 🩺\n\nI can help you with:\n• **Symptom checking** — Describe your symptoms for clinical guidance\n• **Prescription analysis** — Upload a PDF/text prescription for intelligent medication scheduling, diet recommendations, and safety warnings\n• **AI-detection** — I'll verify if your prescription is authentic before analyzing it\n\nDrag & drop a file or use the upload button below to get started!"
        }
    ]);
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [activeSuggestion, setActiveSuggestion] = useState<number>(-1);
    const [showCommandPalette, setShowCommandPalette] = useState(false);
    const [recentCommand, setRecentCommand] = useState<string | null>(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const { textareaRef, adjustHeight } = useAutoResizeTextarea({
        minHeight: 60,
        maxHeight: 200,
    });
    const [inputFocused, setInputFocused] = useState(false);
    const commandPaletteRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const chatAreaRef = useRef<HTMLDivElement>(null);

    const commandSuggestions: CommandSuggestion[] = [
        { 
            icon: <HeartPulse className="w-4 h-4 text-red-500" />, 
            label: "Check Symptoms", 
            description: "Describe symptoms to understand details", 
            prefix: "/symptoms" 
        },
        { 
            icon: <Pill className="w-4 h-4 text-orange-500" />, 
            label: "Medicine Timing", 
            description: "Request timings and dosing guidance", 
            prefix: "/timing" 
        },
        { 
            icon: <Clock className="w-4 h-4 text-blue-500" />, 
            label: "Dose Schedule", 
            description: "Organize daily, weekly and monthly schedules", 
            prefix: "/schedule" 
        },
        { 
            icon: <Stethoscope className="w-4 h-4 text-emerald-500" />, 
            label: "Ask Medical Qs", 
            description: "Check standard health or anatomy questions", 
            prefix: "/query" 
        },
    ];

    useEffect(() => {
        if (value.startsWith('/') && !value.includes(' ')) {
            setShowCommandPalette(true);
            
            const matchingSuggestionIndex = commandSuggestions.findIndex(
                (cmd) => cmd.prefix.startsWith(value)
            );
            
            if (matchingSuggestionIndex >= 0) {
                setActiveSuggestion(matchingSuggestionIndex);
            } else {
                setActiveSuggestion(-1);
            }
        } else {
            setShowCommandPalette(false);
        }
    }, [value]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            const commandButton = document.querySelector('[data-command-button]');
            
            if (commandPaletteRef.current && 
                !commandPaletteRef.current.contains(target) && 
                !commandButton?.contains(target)) {
                setShowCommandPalette(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (showCommandPalette) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActiveSuggestion(prev => 
                    prev < commandSuggestions.length - 1 ? prev + 1 : 0
                );
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActiveSuggestion(prev => 
                    prev > 0 ? prev - 1 : commandSuggestions.length - 1
                );
            } else if (e.key === 'Tab' || e.key === 'Enter') {
                e.preventDefault();
                if (activeSuggestion >= 0) {
                    const selectedCommand = commandSuggestions[activeSuggestion];
                    setValue(selectedCommand.prefix + ' ');
                    setShowCommandPalette(false);
                    
                    setRecentCommand(selectedCommand.label);
                    setTimeout(() => setRecentCommand(null), 3500);
                }
            } else if (e.key === 'Escape') {
                e.preventDefault();
                setShowCommandPalette(false);
            }
        } else if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (value.trim() || attachments.length > 0) {
                handleSendMessage();
            }
        }
    };

    const handleSendMessage = async () => {
        if (value.trim() || attachments.length > 0) {
            const userMsg = value.trim();
            const currentAttachments = [...attachments];
            
            setValue("");
            setAttachments([]);
            adjustHeight(true);
            setIsTyping(true);

            // Construct user message text
            let displayContent = userMsg;
            if (currentAttachments.length > 0) {
                const fileInfo = currentAttachments.map(f => {
                    const sizeStr = f.size ? ` (${formatFileSize(f.size)})` : "";
                    return `${f.name}${sizeStr}`;
                }).join(", ");
                displayContent = displayContent
                    ? `${displayContent}\n\n📎 *Uploaded: ${fileInfo}*`
                    : `📎 *Uploaded: ${fileInfo}*`;
            }

            setMessages(prev => [...prev, { role: "user", content: displayContent }]);
            
            try {
                if (currentAttachments.length > 0) {
                    const file = currentAttachments[0];
                    const response = await fetch('/api/prescription', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                            fileName: file.name, 
                            textContent: file.content || undefined,
                            fileBase64: file.fileBase64 || undefined
                        })
                    });

                    if (response.ok) {
                        const data = await response.json();

                        if (data.isAIGenerated) {
                            // AI-generated prescription detected
                            setMessages(prev => [...prev, { 
                                role: "assistant", 
                                content: data.aiDetectionReason || "This prescription appears to be AI-generated.",
                                isAIGenerated: true,
                                aiDetectionReason: data.aiDetectionReason
                            }]);
                        } else {
                            // Legitimate prescription — show full analysis
                            setMessages(prev => [...prev, { 
                                role: "assistant", 
                                content: data.analysis || "Here is your prescription analysis:", 
                                schedule: data,
                                dietRecommendations: data.dietRecommendations || [],
                                warnings: data.warnings || [],
                                doctorGuidanceNotice: data.doctorGuidanceNotice || ""
                            }]);
                        }
                    } else {
                        setMessages(prev => [...prev, { 
                            role: "assistant", 
                            content: "Sorry, I encountered an issue analyzing your prescription file. Please try again with a different file." 
                        }]);
                    }
                } else {
                    // Standard medical query
                    const response = await fetch('/api/chat', {
                       method: 'POST',
                       headers: { 'Content-Type': 'application/json' },
                       body: JSON.stringify({ message: userMsg })
                    });
                    
                    if (response.ok) {
                        const data = await response.json();
                        setMessages(prev => [...prev, { role: "assistant", content: data.response }]);
                    } else {
                        setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I am having trouble connecting to the medical server right now." }]);
                    }
                }
            } catch (err) {
                console.error(err);
                setMessages(prev => [...prev, { role: "assistant", content: "Sorry, an error occurred while processing your request." }]);
            } finally {
                setIsTyping(false);
            }
        }
    };

    const handleFileSelectTrigger = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) processFile(file);
        if (e.target) e.target.value = '';
    };

    const processFile = (file: File) => {
        if (file.name.endsWith(".txt") || file.name.endsWith(".json")) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const text = event.target?.result as string || "";
                setAttachments([{
                    name: file.name,
                    content: text,
                    type: file.type,
                    size: file.size
                }]);
            };
            reader.readAsText(file);
        } else if (file.name.endsWith(".pdf")) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const arrayBuffer = event.target?.result as ArrayBuffer;
                const base64 = btoa(
                    new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
                );
                setAttachments([{
                    name: file.name,
                    content: "",
                    type: file.type,
                    fileBase64: base64,
                    size: file.size
                }]);
            };
            reader.readAsArrayBuffer(file);
        } else {
            setAttachments([{
                name: file.name,
                content: "Uploaded file for analysis.",
                type: file.type,
                size: file.size
            }]);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) processFile(file);
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const removeAttachment = (index: number) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };
    
    const selectCommandSuggestion = (index: number) => {
        const selectedCommand = commandSuggestions[index];
        setValue(selectedCommand.prefix + ' ');
        setShowCommandPalette(false);
        
        setRecentCommand(selectedCommand.label);
        setTimeout(() => setRecentCommand(null), 2000);
    };

    return (
        <div className="min-h-[85vh] flex flex-col w-full items-center justify-start bg-transparent text-white p-4 md:p-6 relative overflow-hidden">
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept=".txt,.json,.pdf,.png,.jpg,.jpeg" 
                className="hidden" 
            />
            
            <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-500/5 rounded-full mix-blend-normal filter blur-[128px] animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500/5 rounded-full mix-blend-normal filter blur-[128px] animate-pulse delay-700" />
            </div>
            
            <div className="w-full max-w-3xl mx-auto relative flex flex-col space-y-8">
                <motion.div 
                    className="relative z-10 space-y-8 flex flex-col"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                >
                    <div className="text-center space-y-3">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="inline-block"
                        >
                            <h1 className="text-3xl md:text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-orange-500 pb-1">
                                WeCare AI Assistant
                            </h1>
                            <motion.div 
                                className="h-0.5 bg-gradient-to-r from-transparent via-red-500/50 to-transparent w-full"
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{ delay: 0.5, duration: 0.8 }}
                            />
                        </motion.div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                            Premium clinical answers and prescription parsing exclusively for WeCare Patients.
                        </p>
                    </div>

                    {/* Chat Area */}
                    <div 
                        ref={chatAreaRef}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={cn(
                            "w-full min-h-[45vh] max-h-[60vh] overflow-y-auto space-y-6 px-3 py-4 rounded-2xl backdrop-blur-md border shadow-inner custom-scrollbar flex flex-col relative transition-all duration-300",
                            isDragging 
                                ? "bg-red-500/5 dark:bg-red-500/5 border-red-500/30 dark:border-red-500/30 ring-2 ring-red-500/20" 
                                : "bg-white/20 dark:bg-zinc-950/20 border-gray-200/50 dark:border-white/5"
                        )}
                    >
                        {/* Drag & Drop Overlay */}
                        <AnimatePresence>
                            {isDragging && (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 z-50 flex items-center justify-center rounded-2xl bg-white/80 dark:bg-zinc-950/80 backdrop-blur-sm"
                                >
                                    <div className="flex flex-col items-center gap-3 text-center">
                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-red-500 to-orange-500 flex items-center justify-center shadow-xl shadow-red-500/20">
                                            <UploadCloud className="w-8 h-8 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-gray-900 dark:text-white">Drop your prescription here</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">PDF, TXT, JSON, or image files</p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {messages.map((msg, idx) => (
                            <motion.div 
                                key={idx}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={cn(
                                    "flex w-full mb-2",
                                    msg.role === "user" ? "justify-end" : "justify-start"
                                )}
                            >
                                <div className="flex items-start gap-3 max-w-[85%]">
                                    {msg.role === "assistant" && (
                                        <div className={cn(
                                            "w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0 shadow-md",
                                            msg.isAIGenerated 
                                                ? "bg-gradient-to-tr from-red-700 to-red-500" 
                                                : "bg-gradient-to-tr from-red-500 to-orange-500"
                                        )}>
                                            {msg.isAIGenerated ? <ShieldAlert className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                                        </div>
                                    )}
                                    <div className="flex flex-col space-y-2 w-full">
                                        {/* AI Detection Warning Banner */}
                                        {msg.isAIGenerated ? (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="rounded-2xl px-5 py-4 border-2 border-red-500/30 bg-red-50 dark:bg-red-950/30 shadow-lg shadow-red-500/10"
                                            >
                                                <div className="flex items-center gap-2 mb-2">
                                                    <ShieldAlert className="w-5 h-5 text-red-500" />
                                                    <span className="font-black text-sm text-red-600 dark:text-red-400">AI-Generated Prescription Detected</span>
                                                </div>
                                                <p className="text-xs text-red-700 dark:text-red-300 leading-relaxed font-medium">
                                                    {msg.aiDetectionReason || msg.content}
                                                </p>
                                                <div className="mt-3 p-2.5 rounded-xl bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30">
                                                    <p className="text-[11px] text-red-600 dark:text-red-300 font-bold">
                                                        ⚠️ For your safety, we cannot analyze AI-generated prescriptions. Please upload a valid prescription issued by a licensed medical professional.
                                                    </p>
                                                </div>
                                            </motion.div>
                                        ) : (
                                            <div className={cn(
                                                "rounded-2xl px-5 py-3.5 text-sm shadow-sm leading-relaxed",
                                                msg.role === "user" 
                                                    ? "bg-red-600 text-white font-medium" 
                                                    : "bg-white dark:bg-zinc-900/80 text-gray-900 dark:text-gray-100 border border-gray-200/50 dark:border-white/5 backdrop-blur-md"
                                            )}>
                                                <div 
                                                    className="prose prose-sm dark:prose-invert"
                                                    dangerouslySetInnerHTML={{ 
                                                        __html: msg.content
                                                            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                                            .replace(/\*(.*?)\*/g, '<em>$1</em>')
                                                            .replace(/\n/g, '<br/>') 
                                                    }} 
                                                />
                                            </div>
                                        )}

                                        {/* Prescription Schedule */}
                                        {msg.schedule && !msg.isAIGenerated && (
                                            <PrescriptionSchedule schedule={msg.schedule} />
                                        )}

                                        {/* Diet Recommendations */}
                                        {msg.dietRecommendations && msg.dietRecommendations.length > 0 && !msg.isAIGenerated && (
                                            <DietRecommendationsCard recommendations={msg.dietRecommendations} />
                                        )}

                                        {/* Warnings Panel */}
                                        {msg.warnings && msg.warnings.length > 0 && !msg.isAIGenerated && (
                                            <WarningsPanel warnings={msg.warnings} />
                                        )}

                                        {/* Doctor Guidance Disclaimer */}
                                        {msg.doctorGuidanceNotice && !msg.isAIGenerated && (
                                            <DoctorDisclaimer notice={msg.doctorGuidanceNotice} />
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                        {isTyping && (
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex justify-start items-center gap-3 pl-2"
                            >
                                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-zinc-900 flex items-center justify-center text-gray-500 shrink-0">
                                    <LoaderIcon className="w-4 h-4 animate-spin text-red-500" />
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 font-bold flex items-center gap-1.5 bg-white/20 dark:bg-zinc-900/40 rounded-full px-4 py-2 border border-gray-200/50 dark:border-white/5">
                                    {attachments.length > 0 ? "Analyzing Prescription" : "Parsing Clinical Query"} <TypingDots />
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Editor & Controls */}
                    <motion.div 
                        className="relative backdrop-blur-2xl bg-white/40 dark:bg-zinc-950/40 rounded-2xl border border-gray-200/50 dark:border-white/10 shadow-2xl"
                        initial={{ scale: 0.98 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.1 }}
                    >
                        <AnimatePresence>
                            {showCommandPalette && (
                                <motion.div 
                                    ref={commandPaletteRef}
                                    className="absolute left-4 right-4 bottom-full mb-3 backdrop-blur-xl bg-white dark:bg-zinc-950 rounded-xl z-50 shadow-2xl border border-gray-200/50 dark:border-white/10 overflow-hidden"
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 5 }}
                                    transition={{ duration: 0.15 }}
                                >
                                    <div className="py-1.5 bg-white dark:bg-zinc-950/95">
                                        <div className="px-3 py-2 text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-500 flex items-center gap-1">
                                            <Command className="w-3 h-3" /> Shortcuts
                                        </div>
                                        {commandSuggestions.map((suggestion, index) => (
                                            <motion.div
                                                key={suggestion.prefix}
                                                className={cn(
                                                    "flex items-center gap-3 px-4 py-3 text-xs transition-colors cursor-pointer",
                                                    activeSuggestion === index 
                                                        ? "bg-red-50 dark:bg-white/5 text-red-600 dark:text-white font-bold" 
                                                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5"
                                                )}
                                                onClick={() => selectCommandSuggestion(index)}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: index * 0.03 }}
                                            >
                                                <div className="w-6 h-6 rounded-lg bg-gray-100 dark:bg-white/5 flex items-center justify-center shrink-0">
                                                    {suggestion.icon}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="font-semibold text-gray-900 dark:text-white">{suggestion.label}</div>
                                                    <div className="text-[10px] text-gray-500 dark:text-zinc-500 font-medium">{suggestion.description}</div>
                                                </div>
                                                <div className="text-[10px] font-mono text-gray-400 bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded border border-gray-200/50 dark:border-white/5">
                                                    {suggestion.prefix}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="p-3">
                            <Textarea
                                ref={textareaRef}
                                value={value}
                                onChange={(e) => {
                                    setValue(e.target.value);
                                    adjustHeight();
                                }}
                                onKeyDown={handleKeyDown}
                                onFocus={() => setInputFocused(true)}
                                onBlur={() => setInputFocused(false)}
                                placeholder="Describe your symptoms (e.g. 'I have a fever') or upload a prescription PDF/TXT..."
                                containerClassName="w-full"
                                className={cn(
                                    "w-full px-4 py-3",
                                    "resize-none",
                                    "bg-transparent",
                                    "border-none",
                                    "text-gray-900 dark:text-white text-sm leading-relaxed",
                                    "focus:outline-none",
                                    "placeholder:text-gray-500 dark:placeholder:text-zinc-500",
                                    "min-h-[60px]"
                                )}
                                style={{
                                    overflow: "hidden",
                                }}
                                showRing={false}
                            />
                        </div>

                        <AnimatePresence>
                            {attachments.length > 0 && (
                                <motion.div 
                                    className="px-4 pb-3 flex gap-2 flex-wrap"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                >
                                    {attachments.map((file, index) => (
                                        <motion.div
                                            key={index}
                                            className="flex items-center gap-2.5 text-xs bg-red-500/10 dark:bg-red-500/5 border border-red-500/20 py-2.5 px-4 rounded-xl text-red-600 dark:text-red-400 font-bold shadow-sm"
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                        >
                                            <div className="w-7 h-7 rounded-lg bg-red-500/10 dark:bg-red-500/10 flex items-center justify-center shrink-0">
                                                <FileText className="w-3.5 h-3.5" />
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="truncate max-w-[200px] text-xs font-bold">{file.name}</span>
                                                <span className="text-[9px] text-red-400/60 dark:text-red-500/60 font-medium">
                                                    {file.size ? formatFileSize(file.size) : "Ready to analyze"} • {file.name.split('.').pop()?.toUpperCase()}
                                                </span>
                                            </div>
                                            <button 
                                                onClick={() => removeAttachment(index)}
                                                className="text-gray-400 dark:text-white/40 hover:text-red-500 transition-colors ml-1"
                                            >
                                                <XIcon className="w-3.5 h-3.5" />
                                            </button>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="p-4 border-t border-gray-200/50 dark:border-white/[0.05] flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <motion.button
                                    type="button"
                                    onClick={handleFileSelectTrigger}
                                    whileTap={{ scale: 0.94 }}
                                    className="p-2.5 text-gray-500 dark:text-zinc-400 hover:text-red-500 dark:hover:text-red-400 rounded-xl bg-gray-100/50 dark:bg-white/5 border border-gray-200/50 dark:border-white/5 transition-all flex items-center gap-1.5 font-bold text-xs"
                                    title="Upload Prescription (PDF, TXT, Image)"
                                >
                                    <Paperclip className="w-4 h-4" />
                                    <span>Upload Rx</span>
                                </motion.button>
                                <motion.button
                                    type="button"
                                    data-command-button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowCommandPalette(prev => !prev);
                                    }}
                                    whileTap={{ scale: 0.94 }}
                                    className={cn(
                                        "p-2.5 text-gray-500 dark:text-zinc-400 hover:text-red-500 dark:hover:text-red-400 rounded-xl bg-gray-100/50 dark:bg-white/5 border border-gray-200/50 dark:border-white/5 transition-all",
                                        showCommandPalette && "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
                                    )}
                                    title="Show Commands"
                                >
                                    <Command className="w-4 h-4" />
                                </motion.button>
                            </div>
                            
                            <motion.button
                                type="button"
                                onClick={handleSendMessage}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.98 }}
                                disabled={isTyping || (!value.trim() && attachments.length === 0)}
                                className={cn(
                                    "px-5 py-2.5 rounded-xl text-sm font-black transition-all",
                                    "flex items-center gap-2",
                                    (value.trim() || attachments.length > 0)
                                        ? "bg-gradient-to-r from-red-600 to-orange-500 text-white shadow-lg shadow-red-600/20"
                                        : "bg-gray-100 dark:bg-white/[0.05] text-gray-400 dark:text-white/20 border border-gray-200/50 dark:border-white/5"
                                )}
                            >
                                <SendIcon className="w-4 h-4" />
                                <span>Send</span>
                            </motion.button>
                        </div>
                    </motion.div>

                    {/* Medical Notice Box */}
                    <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-2xl flex gap-3 text-xs text-red-800 dark:text-red-300 backdrop-blur-md">
                        <Info className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                        <div className="leading-relaxed">
                            <span className="font-extrabold block mb-1">Disclaimer & Rules:</span>
                            This assistant is strictly scoped to the medical field. Non-health queries receive an <em>&quot;out of my knowledge!&quot;</em> response. Uploaded prescriptions are checked for AI-generated content before analysis. All diet and medication recommendations are <strong>strictly under the guidance of an experienced doctor</strong>. Do not self-medicate.
                            <div className="mt-2 flex items-center gap-2 text-[10px] text-red-600/60 dark:text-red-400/60 font-bold">
                                <span className="px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/10">PDF</span>
                                <span className="px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/10">TXT</span>
                                <span className="px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/10">JSON</span>
                                <span className="text-red-500/40">Supported file types for prescription upload</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {inputFocused && (
                <motion.div 
                    className="fixed w-[50rem] h-[50rem] rounded-full pointer-events-none z-0 opacity-[0.02] bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 blur-[96px]"
                    animate={{
                        x: mousePosition.x - 400,
                        y: mousePosition.y - 400,
                    }}
                    transition={{
                        type: "spring",
                        damping: 25,
                        stiffness: 150,
                        mass: 0.5,
                    }}
                />
            )}
        </div>
    );
}

function TypingDots() {
    return (
        <div className="flex items-center ml-1">
            {[1, 2, 3].map((dot) => (
                <motion.div
                    key={dot}
                    className="w-1.5 h-1.5 bg-red-500 dark:bg-white/90 rounded-full mx-0.5"
                    initial={{ opacity: 0.3 }}
                    animate={{ 
                        opacity: [0.3, 0.9, 0.3],
                        scale: [0.85, 1.1, 0.85]
                    }}
                    transition={{
                        duration: 1.2,
                        repeat: Infinity,
                        delay: dot * 0.15,
                        ease: "easeInOut",
                    }}
                    style={{
                        boxShadow: "0 0 4px rgba(220, 38, 38, 0.3)"
                    }}
                />
            ))}
        </div>
    );
}

function PrescriptionSchedule({ schedule }: { schedule: any }) {
    const [activeTab, setActiveTab] = useState<"daily" | "weekly" | "monthly">("daily");
    const [activeTime, setActiveTime] = useState<"morning" | "afternoon" | "evening" | "night">("morning");
    const [takenLogs, setTakenLogs] = useState<Record<string, boolean>>({});

    const toggleTaken = (key: string) => {
        setTakenLogs(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const medicines = schedule.medicines || [];

    const getTimeDisplayName = (time: string) => {
        switch(time) {
            case "morning": return "🌅 Morning Doses";
            case "afternoon": return "☀️ Afternoon Doses";
            case "evening": return "🌇 Evening Doses";
            case "night": return "🌙 Night Doses";
            default: return "";
        }
    };

    const filteredMeds = medicines.filter((med: any) => med.timing?.[activeTime]);

    return (
        <div className="mt-4 bg-white dark:bg-zinc-950/90 backdrop-blur-2xl border border-gray-200/50 dark:border-white/10 rounded-2xl p-4 md:p-6 shadow-xl text-gray-900 dark:text-gray-100 max-w-full overflow-hidden transition-colors w-full">
            <div className="flex items-center gap-2 border-b border-gray-200/50 dark:border-white/5 pb-4 mb-4">
                <Pill className="w-5 h-5 text-red-500 animate-pulse shrink-0" />
                <h3 className="font-extrabold text-sm md:text-base tracking-tight bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                    Interactive Medication Schedule
                </h3>
            </div>
            
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-6 leading-relaxed font-medium">
                {schedule.analysis}
            </p>

            {/* Schedule View Tabs */}
            <div className="flex p-1 bg-gray-100/80 dark:bg-white/5 rounded-xl mb-6 border border-gray-200/30 dark:border-white/5">
                {(["daily", "weekly", "monthly"] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={cn(
                            "flex-1 py-2 text-xs font-bold rounded-lg transition-all capitalize cursor-pointer",
                            activeTab === tab 
                                ? "bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-sm" 
                                : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                        )}
                    >
                        {tab} View
                    </button>
                ))}
            </div>

            {activeTab === "daily" && (
                <div className="space-y-4">
                    {/* Time of Day selectors */}
                    <div className="grid grid-cols-4 gap-1.5">
                        {(["morning", "afternoon", "evening", "night"] as const).map(time => {
                            const count = medicines.filter((m: any) => m.timing?.[time]).length;
                            return (
                                <button
                                    key={time}
                                    onClick={() => setActiveTime(time)}
                                    className={cn(
                                        "py-2 px-1 text-[10px] font-black rounded-lg border transition-all flex flex-col items-center justify-center gap-1 cursor-pointer",
                                        activeTime === time
                                            ? "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-100 dark:border-red-500/20 shadow-sm"
                                            : "bg-white/20 dark:bg-white/5 text-gray-500 dark:text-gray-400 border-gray-200/50 dark:border-white/5 hover:bg-white/30 dark:hover:bg-white/10"
                                    )}
                                >
                                    <span className="capitalize">{time}</span>
                                    <span className="px-1.5 py-0.2 rounded-full bg-gray-150 dark:bg-white/10 text-[8px] text-gray-600 dark:text-gray-300 font-extrabold">
                                        {count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="mt-6 space-y-3">
                        <h4 className="text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
                            {getTimeDisplayName(activeTime)}
                        </h4>
                        
                        {filteredMeds.length === 0 ? (
                            <div className="text-center py-6 border border-dashed border-gray-200/50 dark:border-white/5 rounded-xl">
                                <span className="text-xs text-gray-400 dark:text-gray-500">No medications scheduled for this time.</span>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {filteredMeds.map((med: any, i: number) => {
                                    const logKey = `${med.name}-${activeTime}`;
                                    const isTaken = takenLogs[logKey];
                                    return (
                                        <div 
                                            key={i} 
                                            className={cn(
                                                "p-4 rounded-xl border transition-all flex items-start justify-between gap-4",
                                                isTaken 
                                                    ? "bg-green-50/50 dark:bg-green-950/5 border-green-100/50 dark:border-green-900/10 opacity-75"
                                                    : "bg-white/40 dark:bg-zinc-900/30 border-gray-200/50 dark:border-white/5 shadow-sm"
                                            )}
                                        >
                                            <div className="space-y-1">
                                                <h5 className={cn("font-bold text-sm text-gray-900 dark:text-white", isTaken && "line-through text-gray-500")}>
                                                    {med.name}
                                                </h5>
                                                <p className="text-[11px] font-bold text-red-600 dark:text-red-400">
                                                    {med.purpose}
                                                </p>
                                                <p className="text-xs text-gray-600 dark:text-gray-300 font-medium">
                                                    <span className="font-extrabold text-gray-900 dark:text-white">Dose:</span> {med.dosage} ({med.timing.instructions})
                                                </p>
                                                <p className="text-[10px] text-gray-400 dark:text-gray-500">
                                                    <span className="font-bold">Duration:</span> {med.duration}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => toggleTaken(logKey)}
                                                className={cn(
                                                    "px-3 py-1.5 rounded-lg text-[10px] font-black transition-all shrink-0 uppercase tracking-wider cursor-pointer",
                                                    isTaken 
                                                        ? "bg-green-600 text-white shadow-md shadow-green-500/20 hover:bg-green-700"
                                                        : "bg-white dark:bg-white/5 text-gray-700 dark:text-gray-300 border border-gray-200/50 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10"
                                                )}
                                            >
                                                {isTaken ? "✓ Taken" : "Mark Taken"}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === "weekly" && (
                <div className="space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                        Weekly Dosage Summary
                    </h4>
                    <div className="border border-gray-200/50 dark:border-white/5 rounded-xl overflow-hidden bg-white/20 dark:bg-white/[0.02]">
                        <table className="w-full border-collapse text-left text-xs">
                            <thead>
                                <tr className="border-b border-gray-200/50 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 text-gray-500 dark:text-gray-400 font-bold">
                                    <th className="p-3">Medicine</th>
                                    <th className="p-3">Weekly Dose</th>
                                    <th className="p-3">Duration</th>
                                </tr>
                            </thead>
                            <tbody>
                                {medicines.map((med: any, i: number) => (
                                    <tr key={i} className="border-b border-gray-200/50 dark:border-white/5 text-gray-700 dark:text-gray-300">
                                        <td className="p-3 font-bold">{med.name}</td>
                                        <td className="p-3 text-red-600 dark:text-red-400 font-extrabold">{med.weeklyDose}</td>
                                        <td className="p-3 text-gray-500 dark:text-gray-400">{med.duration}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === "monthly" && (
                <div className="space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                        Monthly Dosage Summary
                    </h4>
                    <div className="border border-gray-200/50 dark:border-white/5 rounded-xl overflow-hidden bg-white/20 dark:bg-white/[0.02]">
                        <table className="w-full border-collapse text-left text-xs">
                            <thead>
                                <tr className="border-b border-gray-200/50 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 text-gray-500 dark:text-gray-400 font-bold">
                                    <th className="p-3">Medicine</th>
                                    <th className="p-3">Monthly Dose</th>
                                    <th className="p-3">Instructions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {medicines.map((med: any, i: number) => (
                                    <tr key={i} className="border-b border-gray-200/50 dark:border-white/5 text-gray-700 dark:text-gray-300">
                                        <td className="p-3 font-bold">{med.name}</td>
                                        <td className="p-3 text-red-600 dark:text-red-400 font-extrabold">{med.monthlyDose}</td>
                                        <td className="p-3 text-gray-500 dark:text-gray-400 leading-relaxed">{med.timing.instructions}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

function DietRecommendationsCard({ recommendations }: { recommendations: DietRec[] }) {
    const [isExpanded, setIsExpanded] = useState(true);

    const getCategoryIcon = (category: string) => {
        if (category.toLowerCase().includes("recommended")) return <Salad className="w-4 h-4 text-emerald-500" />;
        if (category.toLowerCase().includes("avoid")) return <Ban className="w-4 h-4 text-red-500" />;
        if (category.toLowerCase().includes("timing") || category.toLowerCase().includes("meal")) return <Timer className="w-4 h-4 text-blue-500" />;
        if (category.toLowerCase().includes("hydration")) return <Droplets className="w-4 h-4 text-cyan-500" />;
        return <Salad className="w-4 h-4 text-emerald-500" />;
    };

    const getCategoryColor = (category: string) => {
        if (category.toLowerCase().includes("recommended")) return "border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/10";
        if (category.toLowerCase().includes("avoid")) return "border-red-500/20 bg-red-50/50 dark:bg-red-950/10";
        if (category.toLowerCase().includes("timing") || category.toLowerCase().includes("meal")) return "border-blue-500/20 bg-blue-50/50 dark:bg-blue-950/10";
        if (category.toLowerCase().includes("hydration")) return "border-cyan-500/20 bg-cyan-50/50 dark:bg-cyan-950/10";
        return "border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/10";
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 bg-white dark:bg-zinc-950/90 backdrop-blur-2xl border border-gray-200/50 dark:border-white/10 rounded-2xl p-4 md:p-6 shadow-xl text-gray-900 dark:text-gray-100 w-full overflow-hidden transition-colors"
        >
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center justify-between w-full border-b border-gray-200/50 dark:border-white/5 pb-4 mb-4 cursor-pointer"
            >
                <div className="flex items-center gap-2">
                    <Salad className="w-5 h-5 text-emerald-500 animate-pulse shrink-0" />
                    <h3 className="font-extrabold text-sm md:text-base tracking-tight bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
                        Diet & Nutrition Recommendations
                    </h3>
                </div>
                {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </button>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {recommendations.map((rec, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className={cn(
                                        "rounded-xl border p-4 transition-all",
                                        getCategoryColor(rec.category)
                                    )}
                                >
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-7 h-7 rounded-lg bg-white dark:bg-zinc-900 border border-gray-200/50 dark:border-white/10 flex items-center justify-center shadow-sm">
                                            {getCategoryIcon(rec.category)}
                                        </div>
                                        <h4 className="font-bold text-xs text-gray-900 dark:text-white">{rec.title}</h4>
                                    </div>
                                    <ul className="space-y-1.5">
                                        {rec.items.map((item, i) => (
                                            <li key={i} className="text-[11px] text-gray-600 dark:text-gray-300 leading-relaxed flex items-start gap-1.5">
                                                <span className="text-[10px] mt-0.5 shrink-0">{rec.icon}</span>
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

function WarningsPanel({ warnings }: { warnings: Warning[] }) {
    const getSeverityStyles = (severity: string) => {
        switch (severity) {
            case "high":
                return {
                    bg: "bg-red-50/80 dark:bg-red-950/20",
                    border: "border-red-200 dark:border-red-800/30",
                    icon: "🔴",
                    label: "HIGH",
                    labelColor: "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30"
                };
            case "medium":
                return {
                    bg: "bg-amber-50/80 dark:bg-amber-950/20",
                    border: "border-amber-200 dark:border-amber-800/30",
                    icon: "🟡",
                    label: "MEDIUM",
                    labelColor: "text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30"
                };
            default:
                return {
                    bg: "bg-emerald-50/80 dark:bg-emerald-950/20",
                    border: "border-emerald-200 dark:border-emerald-800/30",
                    icon: "🟢",
                    label: "LOW",
                    labelColor: "text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30"
                };
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 bg-white dark:bg-zinc-950/90 backdrop-blur-2xl border border-gray-200/50 dark:border-white/10 rounded-2xl p-4 md:p-6 shadow-xl text-gray-900 dark:text-gray-100 w-full"
        >
            <div className="flex items-center gap-2 border-b border-gray-200/50 dark:border-white/5 pb-4 mb-4">
                <AlertTriangle className="w-5 h-5 text-amber-500 animate-pulse shrink-0" />
                <h3 className="font-extrabold text-sm md:text-base tracking-tight bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                    Important Warnings
                </h3>
            </div>

            <div className="space-y-3">
                {warnings.map((warning, idx) => {
                    const styles = getSeverityStyles(warning.severity);
                    return (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className={cn(
                                "rounded-xl border p-3.5 flex items-start gap-3",
                                styles.bg, styles.border
                            )}
                        >
                            <span className="text-sm mt-0.5">{styles.icon}</span>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <h5 className="font-bold text-xs text-gray-900 dark:text-white">{warning.title}</h5>
                                    <span className={cn("text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider", styles.labelColor)}>
                                        {styles.label}
                                    </span>
                                </div>
                                <p className="text-[11px] text-gray-600 dark:text-gray-300 leading-relaxed">{warning.description}</p>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </motion.div>
    );
}

function DoctorDisclaimer({ notice }: { notice: string }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 rounded-2xl p-4 md:p-5 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 border-2 border-red-200/50 dark:border-red-800/20 shadow-lg shadow-red-500/5"
        >
            <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-500 to-orange-500 flex items-center justify-center text-white shadow-md shadow-red-500/20 shrink-0">
                    <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                    <h4 className="font-black text-sm text-red-700 dark:text-red-400 mb-1">
                        ⚕️ Doctor Guidance Required
                    </h4>
                    <p className="text-xs text-red-600/80 dark:text-red-300/80 leading-relaxed font-medium">
                        {notice}
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                        <a
                            href="#/find-doctors"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-red-600 to-orange-500 text-white text-[10px] font-black uppercase tracking-wider shadow-md shadow-red-500/20 hover:shadow-lg transition-all"
                        >
                            <Stethoscope className="w-3 h-3" />
                            Find a Doctor
                        </a>
                        <a
                            href="#/video-consult"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 text-red-600 dark:text-red-400 text-[10px] font-black uppercase tracking-wider border border-red-200 dark:border-red-800/30 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
                        >
                            Video Consult
                        </a>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
