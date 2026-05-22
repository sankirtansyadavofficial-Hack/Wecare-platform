import { PageHeader } from "@/components/ui/page-header";
import { MessageCircle, Mail, PhoneCall, MapPin, Search } from "lucide-react";

export function ContactSupport() {
  const options = [
    { title: "Chat with Support", description: "Get immediate help from our intelligent 24/7 support assistant or a human agent.", icon: MessageCircle, action: "Start Chat" },
    { title: "Email Us", description: "Drop us an email for detailed inquiries, partnerships, or advanced account issues.", icon: Mail, action: "support@wecare.test" },
    { title: "Call Helpline", description: "Available Mon-Fri, 9am to 6pm for urgent non-medical inquiries.", icon: PhoneCall, action: "1-800-WECARE" },
  ];

  return (
    <div className="min-h-screen bg-transparent w-full pb-24">
      <PageHeader 
        title="Contact & Support" 
        description="We are here to help. Reach out to our dedicated support team or browse our quick solutions." 
        icon={MessageCircle} 
      />

      <div className="max-w-5xl mx-auto px-6 mt-12">
        <div className="bg-white/40 dark:bg-black/40 backdrop-blur-md border border-gray-200/50 dark:border-white/10 rounded-2xl p-4 shadow-sm flex items-center gap-4 focus-within:ring-2 focus-within:ring-red-500/50 transition-all mb-12">
          <Search className="text-gray-400 dark:text-gray-500 w-6 h-6 ml-2" />
          <input 
            type="text" 
            placeholder="Describe your issue..." 
            className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder:text-gray-500 text-lg py-2"
          />
          <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-sm">
            Find Solution
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
           {options.map((opt, i) => (
             <div key={i} className="bg-white/40 dark:bg-black/40 backdrop-blur-md border border-gray-200/50 dark:border-white/10 rounded-3xl p-8 hover:shadow-lg dark:hover:bg-white/5 transition-all text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-2xl flex items-center justify-center mb-6 border border-red-100 dark:border-red-500/20">
                  <opt.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{opt.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 flex-1 font-medium leading-relaxed">{opt.description}</p>
                <button className="w-full py-3 bg-gray-900 dark:bg-white text-white dark:text-black font-bold rounded-xl hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors">
                  {opt.action}
                </button>
             </div>
           ))}
        </div>

        <div className="bg-gray-50 dark:bg-zinc-900/50 border border-gray-200 dark:border-white/5 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8 shadow-inner">
           <div className="flex-1 text-center md:text-left">
              <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Corporate Headquarters</h3>
              <p className="text-gray-600 dark:text-gray-400 flex flex-col md:flex-row md:items-center gap-2 mt-4 font-medium">
                <MapPin className="w-5 h-5 text-red-500 mx-auto md:mx-0" />
                WeCare Innovations Pvt. Ltd.<br />
                Cyber Park, Block A, 4th Floor<br />
                Metro District, 10001
              </p>
           </div>
           <div className="w-full md:w-1/2 h-64 bg-gray-200 dark:bg-black/50 rounded-2xl border border-gray-300 dark:border-white/10 overflow-hidden relative">
              {/* Map placeholder */}
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=800&h=400')] bg-cover bg-center opacity-50 grayscale"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-600 text-white p-3 rounded-full shadow-lg shadow-red-500/50 animate-bounce">
                <MapPin className="w-6 h-6" />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
