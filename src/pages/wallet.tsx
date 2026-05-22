import { PageHeader } from "@/components/ui/page-header";
import { Wallet, CreditCard, ArrowRightLeft, ShieldCheck, History } from "lucide-react";

export function WalletPage() {
  const transactions = [
    { id: "TX1094", type: "Added to Wallet", date: "Today, 10:45 AM", amount: "+₹1,000", status: "Success", isCredit: true },
    { id: "TX1093", type: "Video Consult - Dr. Jenkins", date: "Yesterday, 4:30 PM", amount: "-₹500", status: "Success", isCredit: false },
    { id: "TX1092", type: "Medicine Order #M938", date: "14 May, 2:15 PM", amount: "-₹350", status: "Success", isCredit: false },
  ];

  return (
    <div className="min-h-screen bg-transparent w-full pb-24">
      <PageHeader 
        title="WeCare Wallet" 
        description="Secure and seamless payments for all your medical needs without the hassle of cash." 
        icon={Wallet} 
      />

      <div className="max-w-4xl mx-auto px-6 mt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="bg-gradient-to-tr from-gray-900 to-gray-800 dark:from-white dark:to-zinc-200 text-white dark:text-black rounded-3xl p-8 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 p-8 opacity-10 mix-blend-overlay">
              <ShieldCheck className="w-40 h-40" />
            </div>
            <p className="text-gray-400 dark:text-gray-600 font-medium tracking-wide uppercase text-sm mb-2">Available Balance</p>
            <h2 className="text-5xl font-black mb-8 tracking-tight">₹5,000.00</h2>
            
            <div className="flex gap-4">
              <button className="flex-1 bg-red-600 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 hover:bg-red-700 transition-colors shadow-lg">
                <CreditCard className="w-5 h-5" /> Top Up
              </button>
              <button className="flex-1 bg-gray-800 dark:bg-zinc-300 text-white dark:text-black font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-700 dark:hover:bg-zinc-400 transition-colors">
                <ArrowRightLeft className="w-5 h-5" /> Transfer
              </button>
            </div>
          </div>

          <div className="bg-white/40 dark:bg-black/40 backdrop-blur-md rounded-3xl p-8 border border-gray-200/50 dark:border-white/10 shadow-sm flex items-center justify-center">
             <div className="text-center">
                <div className="w-16 h-16 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 rounded-full mx-auto flex items-center justify-center mb-4 border border-green-100 dark:border-green-500/20">
                   <ShieldCheck className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">100% Secure & Regulated</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Your money is safe with us. RBI regulated nodal accounts used for settlements.</p>
             </div>
          </div>
        </div>

        <div className="bg-white/40 dark:bg-black/40 backdrop-blur-md rounded-3xl p-8 border border-gray-200/50 dark:border-white/10 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <History className="w-5 h-5 text-gray-500 dark:text-gray-400" /> Recent Transactions
            </h3>
            <button className="text-red-600 dark:text-red-400 font-bold text-sm hover:underline">View All</button>
          </div>

          <div className="flex flex-col gap-4">
            {transactions.map(tx => (
              <div key={tx.id} className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-zinc-900/50 rounded-2xl border border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-zinc-900 transition-colors">
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-gray-100">{tx.type}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{tx.date} • {tx.id}</p>
                </div>
                <div className="text-right">
                  <p className={`font-black tracking-tight ${tx.isCredit ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>{tx.amount}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{tx.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
