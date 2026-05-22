import { PageHeader } from "@/components/ui/page-header";
import { FlaskConical, TestTube, Truck, CheckCircle, Upload } from "lucide-react";

export function PartnerLabs() {
  const steps = [
    { title: "Apply & Verify", description: "Submit your NABL/ISO accreditation details for speedy verification.", icon: Upload },
    { title: "Integrate Inventory", description: "List your available tests, prices, and home-collection zones.", icon: TestTube },
    { title: "Receive Orders", description: "Get test bookings directly from WeCare patients instantly.", icon: Truck },
  ];

  return (
    <div className="min-h-screen bg-transparent w-full pb-24">
      <PageHeader 
        title="Become a Partner Lab" 
        description="Grow your diagnostic business by connecting directly with patients seeking reliable tests and full-body checkups." 
        icon={FlaskConical} 
      />

      <div className="max-w-6xl mx-auto px-6 mt-12 text-center">
        <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-6">How it works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative mt-12">
           <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-red-500/20 via-red-500/50 to-red-500/20 z-0"></div>
           
           {steps.map((step, i) => (
             <div key={i} className="relative z-10 flex flex-col items-center group">
                <div className="w-24 h-24 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-red-200 dark:border-red-900 shadow-xl rounded-full flex items-center justify-center text-red-600 dark:text-red-500 mb-6 group-hover:scale-110 transition-transform duration-300">
                  <step.icon className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{step.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 font-medium">{step.description}</p>
             </div>
           ))}
        </div>

        <div className="mt-20 bg-gradient-to-br from-gray-900 to-black rounded-3xl p-8 md:p-12 border border-gray-800 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between text-left">
           <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+CjxwYXRoIGQ9Ik0wIDBoNDB2NDBIMHoiIGZpbGw9Im5vbmUiLz4KPHBhdGggZD0iTTAgMGg0MHY0MEgweiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz4KPC9zdmc+')] z-0"></div>
           <div className="relative z-10 md:w-2/3 mb-8 md:mb-0">
             <h3 className="text-3xl font-black text-white mb-4">Start your digital transformation today.</h3>
             <ul className="text-gray-300 space-y-3 font-medium">
               <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-500" /> Zero onboarding fees for NABL accredited labs.</li>
               <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-500" /> Automated patient reporting & wallet settlements.</li>
               <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-500" /> Dedicated local logistics support available.</li>
             </ul>
           </div>
           <div className="relative z-10 md:w-1/3 flex justify-end w-full">
             <button className="w-full md:w-auto bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-10 rounded-xl shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-all transform hover:scale-105 active:scale-95 text-lg">
               Apply Now
             </button>
           </div>
        </div>
      </div>
    </div>
  );
}
