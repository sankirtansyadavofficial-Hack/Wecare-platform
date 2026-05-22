import { PageHeader } from "@/components/ui/page-header";
import { Pill, Search, Store, ShieldCheck, Truck, PawPrint } from "lucide-react";
import { useVetMode } from "@/context/vet-mode-context";
import { cn } from "@/lib/utils";

export function Medicines() {
  const { isVetMode } = useVetMode();

  const humanPharmacies = [
    { name: "Apollo Pharmacy", distance: "0.8 km", rating: 4.8, type: "24/7 Open" },
    { name: "Religare Wellness", distance: "1.2 km", rating: 4.5, type: "Delivery Available" },
    { name: "MedPlus Local", distance: "2.1 km", rating: 4.2, type: "Standard Supplies" },
  ];

  const vetPharmacies = [
    { name: "Paws & Claws Pet Pharmacy", distance: "0.5 km", rating: 4.9, type: "Veterinary Approved" },
    { name: "TailWaggers Vet Apothecary", distance: "1.4 km", rating: 4.7, type: "Prescriptions & Grooming" },
    { name: "Barkside Animal Meds", distance: "2.5 km", rating: 4.6, type: "Home Delivery" },
  ];

  const pharmacies = isVetMode ? vetPharmacies : humanPharmacies;

  return (
    <div className="min-h-screen bg-transparent w-full pb-24">
      <PageHeader 
        title={isVetMode ? "Pet Medicines & Supplies" : "Medicines & Supplies"} 
        description={isVetMode ? "Upload your pet's prescription to order veterinary-approved medicines. Get flea, tick, dewormers, and animal supplies fast." : "Upload your prescription to order from verified local pharmacies. Get fast delivery or pick up directly from a store near you."} 
        icon={isVetMode ? PawPrint : Pill} 
      />

      <div className="max-w-5xl mx-auto px-6 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2">
            <div className={cn(
              "bg-white/40 dark:bg-black/40 backdrop-blur-md border border-gray-200/50 dark:border-white/10 rounded-2xl p-4 shadow-sm flex items-center gap-4 transition-all mb-8 focus-within:ring-2",
              isVetMode ? "focus-within:ring-emerald-500/50" : "focus-within:ring-red-500/50"
            )}>
              <Search className="text-gray-400 dark:text-gray-500 w-6 h-6 ml-2" />
              <input 
                type="text" 
                placeholder={isVetMode ? "Search for pet medicines, grooming supplies, flea treatments..." : "Search for medicines, equipments..."} 
                className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder:text-gray-500 text-lg py-2"
              />
              <button className={cn(
                "px-6 py-3 rounded-xl font-bold transition-colors shadow-sm text-white",
                isVetMode ? "bg-emerald-600 hover:bg-emerald-700" : "bg-gray-900 dark:bg-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100"
              )}>
                Search
              </button>
            </div>

            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 drop-shadow-sm">
              {isVetMode ? "Nearby Verified Pet Pharmacies" : "Nearby Verified Pharmacies"}
            </h3>
            
            <div className="flex flex-col gap-4">
              {pharmacies.map((pharmacy, i) => (
                <div key={i} className="bg-white/40 dark:bg-black/40 backdrop-blur-md rounded-2xl p-6 border border-gray-200/50 dark:border-white/10 hover:shadow-lg dark:hover:bg-white/5 transition-all flex flex-col sm:flex-row items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className={cn(
                      "w-14 h-14 rounded-full flex items-center justify-center shrink-0 border",
                      isVetMode 
                        ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/30"
                        : "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800/30"
                    )}>
                      <Store className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100">{pharmacy.name}</h4>
                      <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
                        <span className="flex items-center gap-1"><Truck className="w-4 h-4" /> {pharmacy.distance}</span>
                        <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                        <span className={cn("font-semibold line-clamp-1", isVetMode ? "text-emerald-600 dark:text-emerald-400" : "text-green-600 dark:text-green-400")}>{pharmacy.type}</span>
                      </div>
                    </div>
                  </div>
                  <button className={cn(
                    "w-full sm:w-auto px-6 py-2.5 font-bold rounded-xl text-sm border transition-colors",
                    isVetMode 
                      ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20 hover:bg-emerald-100 dark:hover:bg-emerald-500/20"
                      : "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-100 dark:border-red-500/20 hover:bg-red-100 dark:hover:bg-red-500/20"
                  )}>
                    Order Here
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-gradient-to-b from-gray-900 to-black rounded-3xl p-8 border border-gray-800 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-10">
                <ShieldCheck className="w-32 h-32 text-white" />
              </div>
              <div className="relative z-10">
                <span className={cn(
                  "text-white text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full",
                  isVetMode ? "bg-emerald-500" : "bg-red-500"
                )}>
                  New Feature
                </span>
                <h3 className="text-2xl font-black text-white mt-4 tracking-tight">
                  {isVetMode ? "Express Pet Rx Match" : "Express Prescription Match"}
                </h3>
                <p className="text-gray-400 mt-3 text-sm leading-relaxed">
                  {isVetMode 
                    ? "Upload your vet prescription and let our system automatically find the nearest animal apothecary with the required veterinary medicines in stock."
                    : "Upload your prescription and let our system automatically find the nearest pharmacy with the required medicines in stock."}
                </p>
                <div className={cn(
                  "mt-8 border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors hover:bg-white/5",
                  isVetMode ? "border-emerald-900/50 hover:border-emerald-500" : "border-gray-700 hover:border-gray-500"
                )}>
                  <div className="mx-auto w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 mb-4">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                  </div>
                  <span className="text-white font-bold block mb-1">Click to Upload Rx</span>
                  <span className="text-gray-500 text-xs font-medium uppercase tracking-wide">Or drag & drop here (JPG, PNG, PDF)</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

