import { PageHeader } from "@/components/ui/page-header";
import { Users, MessageSquare, TrendingUp, ThumbsUp, Plus } from "lucide-react";

export function CommunityForum() {
  const discussions = [
    { title: "Managing seasonal allergies in pets", author: "Sarah Jenkins", replies: 24, likes: 56, tags: ["Veterinary", "Seasonal"] },
    { title: "Experiences with the new AI SOS feature?", author: "Mike Ross", replies: 18, likes: 42, tags: ["Features", "Feedback"] },
    { title: "Tips for preparing for a blood test", author: "Dr. Ananya", replies: 12, likes: 89, tags: ["Health Tips", "Doctor Advised"] },
  ];

  return (
    <div className="min-h-screen bg-transparent w-full pb-24">
      <PageHeader 
        title="Community Forum" 
        description="Connect with other users, share experiences, and engage in discussions about health, wellness, and our platform." 
        icon={Users} 
      />

      <div className="max-w-5xl mx-auto px-6 mt-12">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
           <h2 className="text-2xl font-black text-gray-900 dark:text-white">Active Discussions</h2>
           <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-sm flex items-center gap-2">
             <Plus className="w-5 h-5" /> New Topic
           </button>
        </div>

        <div className="flex flex-col gap-4">
          {discussions.map((post, i) => (
            <div key={i} className="bg-white/40 dark:bg-black/40 backdrop-blur-md border border-gray-200/50 dark:border-white/10 rounded-2xl p-6 hover:shadow-lg dark:hover:bg-white/5 transition-all">
               <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
                  <div className="flex-1">
                     <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg sm:text-xl drop-shadow-sm cursor-pointer hover:text-red-500 transition-colors">
                       {post.title}
                     </h3>
                     <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                       Started by <span className="font-medium text-gray-700 dark:text-gray-300">{post.author}</span>
                     </p>
                     <div className="flex gap-2 mt-4">
                       {post.tags.map(tag => (
                         <span key={tag} className="bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 text-xs px-2.5 py-1 rounded-md font-medium border border-gray-200 dark:border-zinc-700">
                           {tag}
                         </span>
                       ))}
                     </div>
                  </div>
                  
                  <div className="flex items-center gap-6 sm:flex-col sm:items-end">
                     <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                        <MessageSquare className="w-4 h-4" />
                        <span className="font-bold">{post.replies}</span>
                     </div>
                     <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                        <ThumbsUp className="w-4 h-4" />
                        <span className="font-bold">{post.likes}</span>
                     </div>
                  </div>
               </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
