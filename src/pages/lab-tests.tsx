import { PageHeader } from "@/components/ui/page-header";
import { FlaskConical, Search, Clock, FileText, CheckCircle2, PawPrint } from "lucide-react";
import { useVetMode } from "@/context/vet-mode-context";
import { cn } from "@/lib/utils";

export function LabTests() {
  const { isVetMode } = useVetMode();

  const humanTests = [
    { title: "Complete Blood Count (CBC)", price: "₹299", time: "12 Hours", popularity: "High" },
    { title: "Lipid Profile Basic", price: "₹349", time: "24 Hours", popularity: "High" },
    { title: "Thyroid Profile (T3, T4, TSH)", price: "₹399", time: "24 Hours", popularity: "Medium" },
    { title: "HbA1c Component", price: "₹250", time: "12 Hours", popularity: "High" },
    { title: "Liver Function Test (LFT)", price: "₹450", time: "24 Hours", popularity: "Medium" },
    { title: "Vitamin D Total", price: "₹599", time: "48 Hours", popularity: "Low" },
  ];

  const vetTests = [
    { title: "Pet Complete Blood Count (CBC)", price: "₹499", time: "12 Hours", popularity: "High" },
    { title: "Feline Leukemia Screen (FeLV)", price: "₹699", time: "24 Hours", popularity: "High" },
    { title: "Canine Parvovirus Antibody Test", price: "₹599", time: "24 Hours", popularity: "High" },
    { title: "Basic Animal Biochemistry Panel", price: "₹899", time: "24 Hours", popularity: "Medium" },
    { title: "Pet Allergy Panel Screening", price: "₹1,299", time: "48 Hours", popularity: "Medium" },
    { title: "Vet Urinalysis & Parasite Check", price: "₹399", time: "12 Hours", popularity: "Low" },
  ];

  const tests = isVetMode ? vetTests : humanTests;

  return (
    <div className="min-h-screen bg-transparent w-full pb-24">
      <PageHeader 
        title={isVetMode ? "Animal Lab Tests At Home" : "Lab Tests At Home"} 
        description={isVetMode ? "Book diagnostic tests and pet health screenings with convenient, stress-free home sample collection by trained vet technicians." : "Book diagnostic tests and full body checkups from certified local labs with convenient home sample collection."} 
        icon={isVetMode ? PawPrint : FlaskConical} 
      />

      <div className="max-w-5xl mx-auto px-6 mt-12">
        <div className={cn(
          "bg-white/40 dark:bg-black/40 backdrop-blur-md border border-gray-200/50 dark:border-white/10 rounded-2xl p-4 shadow-sm flex items-center gap-4 transition-all focus-within:ring-2",
          isVetMode ? "focus-within:ring-emerald-500/50" : "focus-within:ring-red-500/50"
        )}>
          <Search className="text-gray-400 dark:text-gray-500 w-6 h-6 ml-2" />
          <input 
            type="text" 
            placeholder={isVetMode ? "Search for animal lab tests (e.g. CBC Pet, Feline Leukemia, Allergy Panel)" : "Search for lab tests (e.g. CBC, HbA1c, Full Body)"} 
            className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder:text-gray-500 text-lg py-2"
          />
        </div>

        <div className="mt-8 flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          <button className={cn(
            "whitespace-nowrap px-6 py-2.5 text-white font-bold rounded-full text-sm hover:opacity-90 transition-opacity",
            isVetMode ? "bg-emerald-600" : "bg-gray-900 dark:bg-white dark:text-black"
          )}>
            {isVetMode ? "Popular Vet Tests" : "Popular Tests"}
          </button>
          <button className="whitespace-nowrap px-6 py-2.5 bg-white/60 dark:bg-zinc-800/60 backdrop-blur-md text-gray-700 dark:text-gray-300 font-medium rounded-full text-sm border border-gray-200/50 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-zinc-700/60 transition-colors">
            {isVetMode ? "Pet Wellness Checkups" : "Full Body Checkups"}
          </button>
          <button className="whitespace-nowrap px-6 py-2.5 bg-white/60 dark:bg-zinc-800/60 backdrop-blur-md text-gray-700 dark:text-gray-300 font-medium rounded-full text-sm border border-gray-200/50 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-zinc-700/60 transition-colors">
            {isVetMode ? "Canine Specific" : "Women's Health"}
          </button>
          <button className="whitespace-nowrap px-6 py-2.5 bg-white/60 dark:bg-zinc-800/60 backdrop-blur-md text-gray-700 dark:text-gray-300 font-medium rounded-full text-sm border border-gray-200/50 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-zinc-700/60 transition-colors">
            {isVetMode ? "Feline Specific" : "Senior Citizens"}
          </button>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tests.map((test, i) => (
            <div key={i} className="bg-white/40 dark:bg-black/40 backdrop-blur-md rounded-2xl p-6 border border-gray-200/50 dark:border-white/10 hover:shadow-lg dark:hover:bg-white/5 transition-all flex flex-col justify-between">
               <div>
                  <div className="flex items-start justify-between mb-2">
                     <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 pr-4">{test.title}</h3>
                     <span className={cn("text-sm font-black mt-1", isVetMode ? "text-emerald-600 dark:text-emerald-400" : "text-green-600 dark:text-green-400")}>{test.price}</span>
                  </div>
                  <div className="flex gap-4 mt-4">
                     <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 font-medium">
                        <Clock className="w-4 h-4" /> Reports in {test.time}
                     </div>
                     <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 font-medium">
                        <CheckCircle2 className={cn("w-4 h-4", isVetMode ? "text-emerald-500" : "text-blue-500")} /> {isVetMode ? "Vet Certified Labs" : "NABL Accredited"}
                     </div>
                  </div>
               </div>
               
               <button className={cn(
                 "mt-6 w-full py-3 font-bold rounded-xl text-sm border transition-colors flex items-center justify-center gap-2",
                 isVetMode 
                   ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20 hover:bg-emerald-100 dark:hover:bg-emerald-500/20"
                   : "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-100 dark:border-red-500/20 hover:bg-red-100 dark:hover:bg-red-500/20"
               )}>
                 <FileText className="w-4 h-4" /> {isVetMode ? "Book Pet Home Collection" : "Book Home Collection"}
               </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

