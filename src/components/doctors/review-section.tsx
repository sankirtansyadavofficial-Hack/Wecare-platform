import { useState, useEffect } from "react";
import { Star, MessageSquare, User, ShieldAlert, Award } from "lucide-react";
import { Review, getReviews } from "@/lib/doctors-data";
import { WriteReviewForm } from "./write-review-form";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ReviewSectionProps {
  doctorId: number;
  isVetMode: boolean;
  refreshTrigger: number;
  onReviewAdded: () => void;
}

export function ReviewSection({ doctorId, isVetMode, refreshTrigger, onReviewAdded }: ReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Sync reviews when doctorId or refreshTrigger shifts
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setReviews(getReviews(doctorId));
      setIsLoading(false);
    }, 600); // Premium brief loader feel

    return () => clearTimeout(timer);
  }, [doctorId, refreshTrigger]);

  // Listener to instantly sync reviews across component edits or forms
  useEffect(() => {
    const handleSync = () => {
      setReviews(getReviews(doctorId));
    };
    window.addEventListener("wecare_reviews_updated", handleSync);
    return () => {
      window.removeEventListener("wecare_reviews_updated", handleSync);
    };
  }, [doctorId]);

  // Calculate Aggregates
  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0 
    ? Number((reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)) 
    : 0;

  const starDistribution = [5, 4, 3, 2, 1].map(star => {
    const count = reviews.filter(r => r.rating === star).length;
    const percentage = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
    return { star, count, percentage };
  });

  const formatDate = (isoStr: string) => {
    try {
      return new Date(isoStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric"
      });
    } catch {
      return "Recently";
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Rating Distribution Aggregate Layout (Luxury Dashboard Styling) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-gray-50/50 dark:bg-white/5 border border-gray-200/30 dark:border-white/5 rounded-2xl p-6">
        
        {/* Main Agg rating score */}
        <div className="md:col-span-4 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-gray-200 dark:border-white/10 pb-6 md:pb-0 md:pr-6 text-center">
          <span className="text-5xl font-black tracking-tight text-gray-900 dark:text-white">
            {totalReviews > 0 ? avgRating : "N/A"}
          </span>
          <div className="flex items-center gap-1 mt-2 text-yellow-500">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star 
                key={s} 
                className={cn(
                  "w-4 h-4 shrink-0", 
                  s <= Math.round(avgRating) ? "fill-yellow-500 text-yellow-500" : "text-gray-300 dark:text-zinc-700"
                )} 
              />
            ))}
          </div>
          <span className="text-xs font-bold text-gray-400 dark:text-gray-500 mt-2 uppercase tracking-wider">
            {totalReviews} PATIENT REVIEWS
          </span>
        </div>

        {/* Horizontal rating distribution bars */}
        <div className="md:col-span-8 flex flex-col justify-center space-y-2">
          {starDistribution.map(({ star, percentage, count }) => (
            <div key={star} className="flex items-center gap-3 text-xs">
              <span className="w-8 text-gray-500 dark:text-gray-400 font-bold text-right shrink-0">
                {star} star
              </span>
              <div className="flex-1 h-2 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className={cn(
                    "h-full rounded-full bg-gradient-to-r",
                    isVetMode ? "from-emerald-500 to-teal-500" : "from-red-500 to-orange-500"
                  )}
                />
              </div>
              <span className="w-12 text-gray-400 dark:text-gray-500 font-semibold shrink-0">
                {percentage}% ({count})
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Conditionally Gated Write Review Form */}
      <WriteReviewForm 
        doctorId={doctorId} 
        isVetMode={isVetMode} 
        onReviewAdded={onReviewAdded}
        refreshTrigger={refreshTrigger}
      />

      {/* 3. Review Lists Wrapper */}
      <div className="mt-8">
        <h4 className="text-sm font-black text-gray-900 dark:text-white mb-4 uppercase tracking-wider flex items-center gap-2">
          <MessageSquare className="w-4 h-4" />
          <span>Patient Testimonials</span>
        </h4>

        {isLoading ? (
          /* PREMIUM SHIMMER / SKELETON LOADER */
          <div className="space-y-4">
            {[1, 2].map((s) => (
              <div key={s} className="bg-white/20 dark:bg-black/10 border border-gray-100 dark:border-white/5 rounded-2xl p-5 space-y-3 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-zinc-800" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-3 bg-gray-300 dark:bg-zinc-800 w-1/3 rounded" />
                    <div className="h-2 bg-gray-300 dark:bg-zinc-800 w-1/4 rounded" />
                  </div>
                </div>
                <div className="space-y-1 pt-2">
                  <div className="h-2.5 bg-gray-300 dark:bg-zinc-800 w-full rounded" />
                  <div className="h-2.5 bg-gray-300 dark:bg-zinc-800 w-5/6 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-white/10 dark:bg-black/10 border border-dashed border-gray-200 dark:border-white/10 rounded-2xl p-8 text-center">
            <ShieldAlert className="w-8 h-8 text-gray-400 dark:text-gray-600 mx-auto mb-2" />
            <p className="text-xs font-bold text-gray-400 dark:text-zinc-500">
              No reviews have been written for this doctor yet. Be the first to share your experience!
            </p>
          </div>
        ) : (
          /* REVIEWS CONTAINER LIST */
          <div className="space-y-4">
            {reviews.map((review, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                key={review.reviewId}
                className="bg-white/20 dark:bg-black/15 border border-gray-200/30 dark:border-white/5 rounded-2xl p-5 hover:border-gray-300 dark:hover:border-white/10 transition-colors group"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex items-center gap-3">
                    
                    {/* User Avatar Initials or Image */}
                    {review.userAvatar ? (
                      <img 
                        src={review.userAvatar} 
                        alt={review.userName} 
                        className="w-10 h-10 rounded-full object-cover border border-gray-200/50 dark:border-white/10"
                      />
                    ) : (
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white shrink-0 shadow-inner",
                        isVetMode ? "bg-emerald-600" : "bg-red-600"
                      )}>
                        {review.userName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-extrabold text-sm text-gray-900 dark:text-white">
                          {review.userName}
                        </span>
                        
                        {/* Verified consultation badge for past bookers */}
                        <span className="text-[9px] font-black text-green-600 dark:text-green-400 bg-green-500/5 dark:bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/15 flex items-center gap-1">
                          <Award className="w-3 h-3" />
                          VERIFIED PATIENT
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-400 dark:text-zinc-500 font-semibold">
                        Consulted on {formatDate(review.timestamp)}
                      </span>
                    </div>
                  </div>

                  {/* Individual rating stars */}
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star 
                        key={s} 
                        className={cn(
                          "w-3.5 h-3.5 shrink-0", 
                          s <= review.rating ? "fill-yellow-500 text-yellow-500" : "text-gray-200 dark:text-zinc-800"
                        )} 
                      />
                    ))}
                  </div>
                </div>

                <p className="text-xs text-gray-600 dark:text-gray-300 mt-4 leading-relaxed font-medium">
                  "{review.comment}"
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
