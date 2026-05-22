import { PageHeader } from "@/components/ui/page-header";
import { UserPlus, ShieldCheck, TrendingUp, Calendar, Upload, Award, PawPrint } from "lucide-react";
import { useVetMode } from "@/context/vet-mode-context";
import { cn } from "@/lib/utils";

export function JoinAsDoctor() {
  const { isVetMode } = useVetMode();

  const humanBenefits = [
    { title: "Expanded Reach", description: "Connect with patients from rural to urban areas without heavy marketing.", icon: TrendingUp },
    { title: "Smart Scheduling", description: "Manage live queue, appointments, and teleconsultations from a unified dashboard.", icon: Calendar },
    { title: "Secure Payments", description: "Automated settlements in T+1 business days directly to your nodal account.", icon: ShieldCheck },
  ];

  const vetBenefits = [
    { title: "Expanded Pet Care Reach", description: "Connect with dedicated pet owners and local animal rescuers looking for trusted vets.", icon: TrendingUp },
    { title: "Intelligent Pet Queues", description: "Smartly manage walk-ins, online vet visits, and emergency consults from a single screen.", icon: Calendar },
    { title: "Secure Animal Welfare Funds", description: "Accept consultation fees, welfare organization tokens, and direct pet care donations smoothly.", icon: ShieldCheck },
  ];

  const benefits = isVetMode ? vetBenefits : humanBenefits;

  return (
    <div className="min-h-screen bg-transparent w-full pb-24">
      <PageHeader 
        title={isVetMode ? "Join as a Partner Vet" : "Join as a Partner Doctor"} 
        description={isVetMode ? "Empower your veterinary practice. Increase your clinic's visibility, manage appointments smartly, and offer outstanding pet care." : "Empower your medical practice. Increase your clinic's visibility, manage patients smartly, and offer the best care."} 
        icon={isVetMode ? PawPrint : UserPlus} 
      />

      <div className="max-w-6xl mx-auto px-6 mt-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        
        {/* Registration Form Area */}
        <div className="bg-white/40 dark:bg-black/40 backdrop-blur-md border border-gray-200/50 dark:border-white/10 rounded-3xl p-8 shadow-sm relative overflow-hidden">
           <div className={cn(
             "absolute top-0 left-0 w-full h-2",
             isVetMode ? "bg-gradient-to-r from-emerald-500 to-teal-500" : "bg-gradient-to-r from-red-500 to-orange-500"
           )}></div>
           <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6 pt-2">Begin Verification</h2>
           
           <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">First Name</label>
                  <input 
                    type="text" 
                    className={cn(
                      "w-full bg-white/60 dark:bg-zinc-900/60 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white outline-none transition-all focus:ring-2",
                      isVetMode ? "focus:ring-emerald-500/50" : "focus:ring-red-500/50"
                    )} 
                    placeholder="Dr. First" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Last Name</label>
                  <input 
                    type="text" 
                    className={cn(
                      "w-full bg-white/60 dark:bg-zinc-900/60 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white outline-none transition-all focus:ring-2",
                      isVetMode ? "focus:ring-emerald-500/50" : "focus:ring-red-500/50"
                    )} 
                    placeholder="Last Name" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  {isVetMode ? "Veterinary License Number" : "Medical Registration Number"}
                </label>
                <input 
                  type="text" 
                  className={cn(
                    "w-full bg-white/60 dark:bg-zinc-900/60 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white outline-none transition-all focus:ring-2",
                    isVetMode ? "focus:ring-emerald-500/50" : "focus:ring-red-500/50"
                  )} 
                  placeholder={isVetMode ? "e.g. VCI-123456" : "e.g. MCI-123456"} 
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Specialty</label>
                <select className={cn(
                  "w-full bg-white/60 dark:bg-zinc-900/60 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white outline-none transition-all focus:ring-2",
                  isVetMode ? "focus:ring-emerald-500/50" : "focus:ring-red-500/50"
                )}>
                  <option value="">Select Specialty</option>
                  {isVetMode ? (
                    <>
                      <option value="small-animal">Small Animal Practitioner</option>
                      <option value="avian-exotic">Avian & Exotic Specialist</option>
                      <option value="equine">Large Animal / Equine Surgeon</option>
                      <option value="veterinary-surgeon">General Veterinary Surgeon</option>
                    </>
                  ) : (
                    <>
                      <option value="physician">General Physician</option>
                      <option value="pediatrician">Pediatrician</option>
                      <option value="cardiologist">Cardiologist</option>
                      <option value="surgeon">General Surgeon</option>
                    </>
                  )}
                </select>
              </div>

              <div className={cn(
                "border-2 border-dashed rounded-2xl p-6 text-center hover:bg-gray-50 dark:hover:bg-zinc-900/50 transition-colors cursor-pointer",
                isVetMode ? "border-emerald-900/30 hover:border-emerald-500/70" : "border-gray-300 dark:border-zinc-700 hover:border-red-500/50"
              )}>
                 <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                 <p className="font-bold text-gray-900 dark:text-white mb-1">
                   {isVetMode ? "Upload Veterinary License" : "Upload Medical License"}
                 </p>
                 <p className="text-sm text-gray-500 dark:text-gray-400">PDF, JPG or PNG (Max 5MB)</p>
              </div>

              <button className={cn(
                "w-full text-white font-bold py-4 rounded-xl shadow-lg transition-colors mt-4",
                isVetMode ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"
              )}>
                 Submit for Verification
              </button>
           </div>
        </div>

        {/* Benefits Area */}
        <div className="flex flex-col gap-8">
           <div className="flex items-center gap-4 border-b border-gray-200/50 dark:border-white/10 pb-6">
              <Award className={cn("w-12 h-12", isVetMode ? "text-emerald-500" : "text-red-500")} />
              <div>
                 <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                   {isVetMode ? "Why partner with WeCare Vet?" : "Why partner with WeCare?"}
                 </h3>
                 <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm font-medium">
                   {isVetMode ? "Join 2,000+ verified veterinarians across the country." : "Join 5,000+ verified doctors across the country."}
                 </p>
              </div>
           </div>

           <div className="grid grid-cols-1 gap-6">
              {benefits.map((benefit, i) => (
                <div key={i} className="flex gap-4 p-6 bg-white/40 dark:bg-black/40 backdrop-blur-md rounded-2xl border border-gray-200/50 dark:border-white/10 shadow-sm hover:shadow-md transition-shadow">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border",
                      isVetMode 
                        ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20"
                        : "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-100 dark:border-red-500/20"
                    )}>
                      <benefit.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-gray-900 dark:text-white">{benefit.title}</h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 leading-relaxed">{benefit.description}</p>
                    </div>
                </div>
              ))}
           </div>
        </div>

      </div>
    </div>
  );
}

