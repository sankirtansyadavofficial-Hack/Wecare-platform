import React, { useState } from "react";
import { Star, ShieldAlert, CheckCircle2, Lock, Send, Sparkles } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useVerifyAppointment, addReview } from "@/lib/doctors-data";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface WriteReviewFormProps {
  doctorId: number;
  isVetMode: boolean;
  onReviewAdded: () => void;
  refreshTrigger?: number;
}

export function WriteReviewForm({ doctorId, isVetMode, onReviewAdded, refreshTrigger = 0 }: WriteReviewFormProps) {
  const { user } = useAuth();
  
  // Custom hook checks if the patient has a confirmed/completed appointment with this doctor ID
  const isVerifiedPatient = useVerifyAppointment(user?.name, doctorId, refreshTrigger);
  
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!comment.trim()) return;

    setIsSubmitting(true);
    
    // Simulate slight server latency
    setTimeout(() => {
      addReview(
        doctorId, 
        rating, 
        comment.trim(), 
        user.name, 
        user.email || "user@example.com"
      );

      // Trigger a local storage update event so other components immediately know about it
      window.dispatchEvent(new Event("wecare_reviews_updated"));

      setComment("");
      setRating(5);
      setIsSubmitting(false);
      setSuccessMsg(true);
      onReviewAdded();

      setTimeout(() => setSuccessMsg(false), 3000);
    }, 800);
  };

  return (
    <div className="bg-white/30 dark:bg-black/20 backdrop-blur-md rounded-2xl p-6 border border-gray-200/40 dark:border-white/5 relative overflow-hidden mt-6">
      
      {/* Decorative Accent Ring */}
      <div className={cn(
        "absolute -right-16 -top-16 w-32 h-32 rounded-full blur-2xl opacity-10 pointer-events-none bg-gradient-to-r",
        isVetMode ? "from-emerald-500 to-teal-500" : "from-red-500 to-orange-500"
      )} />

      <h4 className="text-base font-black text-gray-900 dark:text-white flex items-center gap-2 mb-4 relative z-10">
        <Sparkles className={cn("w-4.5 h-4.5", isVetMode ? "text-emerald-500" : "text-red-500")} />
        <span>Share Your Consultation Experience</span>
      </h4>

      <AnimatePresence mode="wait">
        {!user ? (
          /* GUEST MODE: Please log in */
          <motion.div
            key="login-prompt"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-6 text-center"
          >
            <ShieldAlert className="w-10 h-10 text-gray-400 dark:text-gray-600 mb-2 animate-bounce" />
            <p className="text-sm font-bold text-gray-500 dark:text-gray-400">
              Please sign in to write a review.
            </p>
          </motion.div>
        ) : !isVerifiedPatient ? (
          /* GATED MODE: Locked glass layover */
          <motion.div
            key="gated-lock"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white/40 dark:bg-zinc-950/40 border border-red-500/10 dark:border-emerald-500/10 rounded-xl p-6 text-center flex flex-col items-center justify-center relative z-10"
          >
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center mb-3 shadow-inner",
              isVetMode ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
            )}>
              <Lock className="w-5 h-5" />
            </div>
            <p className="text-sm font-black text-gray-800 dark:text-gray-200">
              Verified Review Restricton
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 max-w-xs mt-2 leading-relaxed">
              Only patients with a completed or past appointment with this healthcare professional can submit a review.
            </p>
          </motion.div>
        ) : successMsg ? (
          /* SUCCESS STATE */
          <motion.div
            key="success-state"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center justify-center py-6 text-center"
          >
            <div className="w-12 h-12 bg-green-500/10 text-green-500 border border-green-500/20 rounded-full flex items-center justify-center mb-3">
              <CheckCircle2 className="w-6 h-6 animate-pulse" />
            </div>
            <h5 className="text-sm font-bold text-gray-900 dark:text-white">Review Submitted!</h5>
            <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">
              Thank you for helping other patients find top-tier care.
            </p>
          </motion.div>
        ) : (
          /* ACTIVE REVIEW FORM */
          <motion.form
            key="active-form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit}
            className="space-y-4 relative z-10"
          >
            {/* Star Picker */}
            <div className="flex items-center gap-4">
              <label className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                Your Rating
              </label>
              
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isActive = hoverRating !== null ? star <= hoverRating : star <= rating;
                  return (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                      onClick={() => setRating(star)}
                      className="focus:outline-none transition-transform active:scale-95 group"
                    >
                      <Star
                        className={cn(
                          "w-6 h-6 transition-colors duration-200",
                          isActive
                            ? "text-yellow-500 fill-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.3)]"
                            : "text-gray-300 dark:text-zinc-700"
                        )}
                      />
                    </button>
                  );
                })}
              </div>
              
              <span className="text-xs font-bold text-yellow-500 bg-yellow-500/5 px-2 py-0.5 rounded-md border border-yellow-500/10">
                {rating}.0 / 5.0
              </span>
            </div>

            {/* Comment Area */}
            <div>
              <label className="block text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
                Written Review
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
                rows={3}
                placeholder="Share specific details about the chamber environment, wait time, and doctor's advice..."
                className="w-full text-sm bg-white/50 dark:bg-zinc-900/50 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-white/10 transition-all resize-none"
              />
              <div className="flex justify-between text-[10px] text-gray-400 font-semibold mt-1">
                <span>VERIFIED PATIENT SUBMISSION</span>
                <span>{comment.length} characters</span>
              </div>
            </div>

            {/* Submit CTA */}
            <button
              type="submit"
              disabled={isSubmitting || !comment.trim()}
              className={cn(
                "w-full text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed",
                isVetMode ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"
              )}
            >
              <span>{isSubmitting ? "Publishing Review..." : "Publish Verified Review"}</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
