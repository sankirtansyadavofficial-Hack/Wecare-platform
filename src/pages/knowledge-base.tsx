import { PageHeader } from "@/components/ui/page-header";
import { BookOpen, Search, HelpCircle, FileText, Video, ChevronRight } from "lucide-react";

export function KnowledgeBase() {
  const categories = [
    { title: "Getting Started", icon: HelpCircle, articles: 12 },
    { title: "Account & Wallet", icon: FileText, articles: 8 },
    { title: "Video Consultations", icon: Video, articles: 15 },
    { title: "Prescriptions & Meds", icon: BookOpen, articles: 10 },
  ];

  const popularArticles = [
    "How to book an emergency ambulance?",
    "Understanding the Live Queue Tracking system",
    "How to add money to WeCare Wallet?",
    "Switching between Human and Vet modes",
    "How to upload past medical records?",
  ];

  return (
    <div className="min-h-screen bg-transparent w-full pb-24">
      <PageHeader 
        title="Knowledge Base" 
        description="Learn how to make the most of WeCare. Find guides, tutorials, and answers to common questions." 
        icon={BookOpen} 
      />

      <div className="max-w-5xl mx-auto px-6 mt-12">
        <div className="bg-white/40 dark:bg-black/40 backdrop-blur-md border border-gray-200/50 dark:border-white/10 rounded-2xl p-4 shadow-sm flex items-center gap-4 focus-within:ring-2 focus-within:ring-red-500/50 transition-all mb-12">
          <Search className="text-gray-400 dark:text-gray-500 w-6 h-6 ml-2" />
          <input 
            type="text" 
            placeholder="Search for answers, guides, or features..." 
            className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder:text-gray-500 text-lg py-2"
          />
          <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-sm">
            Search
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {categories.map((cat, i) => (
            <div key={i} className="bg-white/40 dark:bg-black/40 backdrop-blur-md border border-gray-200/50 dark:border-white/10 rounded-2xl p-6 hover:shadow-lg dark:hover:bg-white/5 transition-all cursor-pointer group">
               <cat.icon className="w-8 h-8 text-red-500 mb-4 group-hover:scale-110 transition-transform" />
               <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg mb-1">{cat.title}</h3>
               <p className="text-sm text-gray-500 dark:text-gray-400">{cat.articles} articles</p>
            </div>
          ))}
        </div>

        <div className="bg-white/40 dark:bg-black/40 backdrop-blur-md border border-gray-200/50 dark:border-white/10 rounded-3xl p-8">
           <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6">Popular Articles</h2>
           <div className="divide-y divide-gray-200/50 dark:divide-white/10">
              {popularArticles.map((article, i) => (
                <a key={i} href="#" className="flex items-center justify-between py-4 group hover:pl-2 transition-all">
                   <div className="flex items-center gap-3">
                     <FileText className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-red-500 transition-colors" />
                     <span className="font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">{article}</span>
                   </div>
                   <ChevronRight className="w-5 h-5 text-gray-300 dark:text-gray-600 group-hover:text-red-500 transition-colors" />
                </a>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}
