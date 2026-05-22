"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/auth-context";
import { useVetMode } from "@/context/vet-mode-context";
import { cn } from "@/lib/utils";

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

export function FloatingChatbot() {
  const { user } = useAuth();
  const { isVetMode } = useVetMode();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      text: "Hello! I am your <strong>WeCare AI Assistant</strong>. 🩺 How can I help you today?",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [attachment, setAttachment] = useState<{name: string; content: string; type: string; fileBase64?: string} | null>(null);

  const historyRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll on new messages or typing state changes
  useEffect(() => {
    if (historyRef.current) {
      historyRef.current.scrollTop = historyRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Adjust textarea height dynamically
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "18px";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight - 16,
        80
      )}px`;
    }
  };

  // Determine current active mode styling: NGO (purple), Vet (green), Human/Patient (red/orange)
  const isNgo = user?.role === "ngo";
  
  let gradientClass = "bg-gradient-to-r from-red-600 to-orange-500";
  let borderClass = "border-red-500/20";
  let textGradClass = "bg-gradient-to-r from-red-500 to-orange-500";
  let activeDotShadow = "rgba(239, 68, 68, 0.4)";
  
  if (isNgo) {
    gradientClass = "bg-gradient-to-r from-violet-600 to-pink-500";
    borderClass = "border-violet-500/20";
    textGradClass = "bg-gradient-to-r from-violet-500 to-pink-500";
    activeDotShadow = "rgba(139, 92, 246, 0.4)";
  } else if (isVetMode) {
    gradientClass = "bg-gradient-to-r from-emerald-600 to-teal-500";
    borderClass = "border-emerald-500/20";
    textGradClass = "bg-gradient-to-r from-emerald-500 to-teal-500";
    activeDotShadow = "rgba(16, 185, 129, 0.4)";
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const msg = inputValue.trim();
    if (!msg && !attachment) return;

    let displayText = msg;
    if (attachment) {
      displayText = msg ? `${msg}\n📎 ${attachment.name}` : `📎 Uploaded: ${attachment.name}`;
    }

    setMessages((prev) => [...prev, { role: "user", text: displayText }]);
    setInputValue("");
    setIsTyping(true);

    if (textareaRef.current) {
      textareaRef.current.style.height = "18px";
    }

    const currentAttachment = attachment;
    setAttachment(null);

    try {
      if (currentAttachment) {
        // Prescription analysis
        const response = await fetch("/api/prescription", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: currentAttachment.name,
            textContent: currentAttachment.content || undefined,
            fileBase64: currentAttachment.fileBase64 || undefined,
          }),
        });

        setIsTyping(false);

        if (response.ok) {
          const data = await response.json();

          if (data.isAIGenerated) {
            setMessages((prev) => [...prev, {
              role: "assistant",
              text: `⚠️ **AI-Generated Prescription Detected**\n\n${data.aiDetectionReason || "This prescription appears to be AI-generated."}\n\nFor your safety, we cannot analyze AI-generated prescriptions. Please upload a valid prescription from a licensed medical professional.`
            }]);
          } else {
            let replyParts: string[] = [];
            if (data.analysis) replyParts.push(`📋 **Analysis:** ${data.analysis}`);

            if (data.medicines?.length > 0) {
              replyParts.push(`\n💊 **Medications Found:** ${data.medicines.length}`);
              data.medicines.forEach((med: any) => {
                replyParts.push(`• **${med.name}** — ${med.purpose} (${med.dosage}, ${med.frequency})`);
              });
            }

            if (data.dietRecommendations?.length > 0) {
              replyParts.push(`\n🥗 **Diet Recommendations:**`);
              data.dietRecommendations.forEach((rec: any) => {
                replyParts.push(`\n${rec.icon} **${rec.title}:**`);
                rec.items?.slice(0, 3).forEach((item: string) => {
                  replyParts.push(`  • ${item}`);
                });
              });
            }

            if (data.warnings?.length > 0) {
              replyParts.push(`\n⚠️ **Warnings:**`);
              data.warnings.forEach((w: any) => {
                replyParts.push(`• ${w.severity === 'high' ? '🔴' : w.severity === 'medium' ? '🟡' : '🟢'} **${w.title}:** ${w.description}`);
              });
            }

            if (data.doctorGuidanceNotice) {
              replyParts.push(`\n🩺 **Important:** ${data.doctorGuidanceNotice}`);
            }

            replyParts.push(`\n\n👉 [View full analysis on the AI Assistant page](#/ai-assistant)`);

            setMessages((prev) => [...prev, {
              role: "assistant",
              text: replyParts.join("\n")
            }]);
          }
        } else {
          setMessages((prev) => [...prev, {
            role: "assistant",
            text: "Could not analyze the prescription. Please try again."
          }]);
        }
      } else {
        // Regular chat
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: msg }),
        });

        setIsTyping(false);

        if (response.ok) {
          const data = await response.json();
          setMessages((prev) => [...prev, { role: "assistant", text: data.response }]);
        } else {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", text: "Could not communicate with the assistant. Check backend status." },
          ]);
        }
      }
    } catch (err) {
      setIsTyping(false);
      setMessages((prev) => [...prev, { role: "assistant", text: "Error communicating with server." }]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.name.endsWith('.txt') || file.name.endsWith('.json')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAttachment({
          name: file.name,
          content: event.target?.result as string || "",
          type: file.type
        });
      };
      reader.readAsText(file);
    } else if (file.name.endsWith('.pdf')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const arrayBuffer = event.target?.result as ArrayBuffer;
        const base64 = btoa(
          new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
        );
        setAttachment({
          name: file.name,
          content: "",
          type: file.type,
          fileBase64: base64
        });
      };
      reader.readAsArrayBuffer(file);
    } else {
      setAttachment({
        name: file.name,
        content: "Uploaded file for analysis.",
        type: file.type
      });
    }
    // Reset file input
    if (e.target) e.target.value = '';
  };

  return (
    <div
      id="wecare-chatbot-root"
      className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end font-sans select-none"
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".txt,.json,.pdf,.png,.jpg,.jpeg"
        className="hidden"
      />
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="wecare-chat-window"
            initial={{ opacity: 0, scale: 0.85, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 30 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="flex w-[380px] max-w-[90vw] h-[500px] max-h-[80vh] bg-zinc-950/95 dark:bg-black/95 backdrop-blur-2xl rounded-2xl border border-slate-800/80 shadow-2xl flex-col overflow-hidden mb-4"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-800/50 flex items-center justify-between bg-slate-900/60 dark:bg-zinc-900/40">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center shadow-lg",
                    gradientClass
                  )}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z" />
                  </svg>
                </div>
                <div>
                  <h3 className="m-0 text-sm font-black text-white tracking-wide">
                    WeCare AI Assistant
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]"></span>
                    <span className="text-[10px] font-bold text-slate-400">
                      Online
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-gray-500 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Chat History */}
            <div
              id="wecare-chat-history"
              ref={historyRef}
              className="flex-1 overflow-y-auto p-5 flex flex-col gap-4 scrollbar-thin scrollbar-thumb-zinc-800"
            >
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex w-full",
                    msg.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[85%] text-xs leading-relaxed p-3 px-4 rounded-2xl shadow-sm border",
                      msg.role === "user"
                        ? cn("text-white font-medium rounded-br-none border-transparent", gradientClass)
                        : "bg-slate-900/60 dark:bg-zinc-900/40 border-slate-800/80 text-slate-100 rounded-bl-none"
                    )}
                    dangerouslySetInnerHTML={{
                      __html: msg.text
                        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                        .replace(/\n/g, "<br>"),
                    }}
                  />
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="text-[11px] text-slate-400 bg-slate-900/60 dark:bg-zinc-900/40 border border-slate-800/80 px-3.5 py-2 rounded-2xl rounded-bl-none flex items-center gap-2">
                    <span>Analyzing symptoms</span>
                    <div className="flex gap-1 items-center">
                      {[0, 1, 2].map((dot) => (
                        <span
                          key={dot}
                          className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce"
                          style={{
                            animationDelay: `${dot * 0.15}s`,
                            animationDuration: "1s",
                            backgroundColor: isNgo ? "#ec4899" : (isVetMode ? "#10b981" : "#f97316")
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Footer */}
            <div className="p-4 border-t border-slate-800/40 bg-zinc-950/90 dark:bg-black/90">
              {attachment && (
                <div className="flex items-center gap-2 mb-2 px-1">
                  <div className="flex items-center gap-2 text-[10px] bg-red-500/10 border border-red-500/20 py-1.5 px-3 rounded-lg text-red-400 font-bold flex-1 min-w-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                    <span className="truncate">{attachment.name}</span>
                    <button
                      onClick={() => setAttachment(null)}
                      className="ml-auto text-gray-500 hover:text-red-400 transition-colors shrink-0"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  </div>
                </div>
              )}
              <form
                onSubmit={handleSubmit}
                id="wecare-chat-form"
                className="relative flex items-center bg-slate-900/60 dark:bg-zinc-900/40 border border-slate-800/80 rounded-xl p-2 px-3 focus-within:border-slate-700/80 transition-colors"
              >
                <button
                  type="button"
                  onClick={handleFileSelect}
                  className="text-gray-500 hover:text-white transition-colors p-1 shrink-0"
                  title="Upload Prescription"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                </button>
                <textarea
                  id="wecare-chat-input"
                  ref={textareaRef}
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  rows={1}
                  placeholder="Type a message..."
                  className="flex-1 bg-transparent border-none outline-none text-white text-xs resize-none max-h-20 pr-10 h-[18px] font-sans placeholder-gray-500 scrollbar-none focus:ring-0 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() && !attachment}
                  className={cn(
                    "absolute right-2 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-800 text-slate-400 hover:text-white rounded-lg p-1.5 cursor-pointer transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed",
                    (inputValue.trim() || attachment) && gradientClass
                  )}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trigger Button */}
      <motion.button
        id="wecare-chat-trigger"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          "w-14 h-14 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:shadow-lg border-none flex items-center justify-center text-white cursor-pointer relative outline-none",
          gradientClass
        )}
        style={{
          boxShadow: `0 10px 25px -5px ${activeDotShadow}`,
        }}
      >
        <div className="relative w-6 h-6 flex items-center justify-center">
          <motion.div
            animate={{
              scale: isOpen ? 0 : 1,
              rotate: isOpen ? -90 : 0,
              opacity: isOpen ? 0 : 1,
            }}
            transition={{ duration: 0.25 }}
            className="absolute"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.25"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </motion.div>
          <motion.div
            animate={{
              scale: isOpen ? 1 : 0,
              rotate: isOpen ? 0 : 90,
              opacity: isOpen ? 1 : 0,
            }}
            transition={{ duration: 0.25 }}
            className="absolute"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.25"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </motion.div>
        </div>
      </motion.button>
    </div>
  );
}
