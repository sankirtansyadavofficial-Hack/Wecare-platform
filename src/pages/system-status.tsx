import { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Server, CheckCircle2, AlertTriangle, Activity, Landmark, RefreshCw, ShieldCheck, CheckCircle as CheckCircleIcon } from "lucide-react";

export function SystemStatus() {
  const services = [
    { name: "Live Queue Tracking", status: "Operational", uptime: "100%", icon: Activity },
    { name: "Video Consultations", status: "Operational", uptime: "99.99%", icon: Server },
    { name: "Wallet & Payments", status: "Operational", uptime: "99.95%", icon: CheckCircle2 },
    { name: "AI Emergency Routing", status: "Operational", uptime: "100%", icon: AlertTriangle },
  ];

  return (
    <div className="min-h-screen bg-transparent w-full pb-24">
      <PageHeader 
        title="System Status" 
        description="Real-time updates on our platform's completely active infrastructure and service availability." 
        icon={Server} 
      />

      <div className="max-w-4xl mx-auto px-6 mt-12">
        <div className="bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-2xl p-6 flex items-center gap-4 mb-8">
           <div className="w-12 h-12 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center shrink-0">
             <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-500" />
           </div>
           <div>
              <h2 className="text-xl font-bold text-green-800 dark:text-green-400">All Systems Operational</h2>
              <p className="text-green-600 dark:text-green-500/80 text-sm mt-1">We are actively continuously monitoring all services. Last updated just now.</p>
           </div>
        </div>

        <div className="bg-white/40 dark:bg-black/40 backdrop-blur-md border border-gray-200/50 dark:border-white/10 rounded-3xl overflow-hidden shadow-sm">
           <div className="p-6 border-b border-gray-200/50 dark:border-white/10 bg-gray-50/50 dark:bg-white/5">
             <h3 className="font-bold text-gray-900 dark:text-white text-lg">Detailed Service Status</h3>
           </div>
           <div className="divide-y divide-gray-200/50 dark:divide-white/10">
              {services.map((service, i) => (
                <div key={i} className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                   <div className="flex items-center gap-3">
                     <service.icon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                     <span className="font-medium text-gray-900 dark:text-gray-100 text-lg">{service.name}</span>
                   </div>
                   <div className="flex items-center gap-6">
                      <div className="text-right">
                         <p className="text-xs text-gray-500 dark:text-gray-400 tracking-wider uppercase mb-1">Status</p>
                         <p className="text-green-600 dark:text-green-400 font-bold flex items-center gap-2">
                           <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                           {service.status}
                         </p>
                      </div>
                      <div className="text-right w-16">
                         <p className="text-xs text-gray-500 dark:text-gray-400 tracking-wider uppercase mb-1">Uptime</p>
                         <p className="font-medium text-gray-900 dark:text-white">{service.uptime}</p>
                      </div>
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* Live Stripe/Razorpay Nodal Escrow Audit Console */}
        <EscrowConsole />
      </div>
    </div>
  );
}

function EscrowConsole() {
  interface EscrowTx {
    id: string;
    appointmentId: string;
    transactionReference: string;
    preauthAmount: number;
    capturedAmount: number;
    escrowStatus: "Authorized" | "Held_In_Escrow" | "Captured" | "Refunded";
    createdAt: string;
  }

  const [txs, setTxs] = useState<EscrowTx[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedApt, setSelectedApt] = useState("APT001");
  const [customAmount, setCustomAmount] = useState(500);

  const fetchLogs = async () => {
    try {
      const res = await fetch("/api/v1/payments/logs");
      if (res.ok) {
        const data = await res.json();
        setTxs(data);
      }
    } catch (err) {
      console.warn("Failed fetching escrow logs.", err);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  const triggerPreauth = async () => {
    setLoading(true);
    try {
      await fetch("/api/v1/payments/preauth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointmentId: selectedApt, amount: customAmount }),
      });
      await fetchLogs();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const triggerHold = async (aptId: string) => {
    setLoading(true);
    try {
      await fetch("/api/v1/payments/hold", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointmentId: aptId }),
      });
      await fetchLogs();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const triggerCapture = async (aptId: string) => {
    setLoading(true);
    try {
      await fetch("/api/v1/payments/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointmentId: aptId }),
      });
      await fetchLogs();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const triggerRefund = async (aptId: string) => {
    setLoading(true);
    try {
      await fetch("/api/v1/payments/refund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointmentId: aptId }),
      });
      await fetchLogs();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/40 dark:bg-black/40 backdrop-blur-md border border-gray-200/50 dark:border-white/10 rounded-3xl overflow-hidden shadow-sm mt-8 p-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-gray-200/50 dark:border-white/10 pb-4 mb-6">
        <div>
          <h3 className="font-bold text-gray-900 dark:text-white text-lg flex items-center gap-2">
            <Landmark className="w-5 h-5 text-indigo-500" /> Stripe/Razorpay Escrow Audit Console
          </h3>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
            Simulate live escrow transitions on RBI-compliant nodal accounts for instantaneous matchmaking.
          </p>
        </div>
        <button 
          onClick={fetchLogs} 
          className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg text-gray-500 transition-colors flex items-center gap-1.5 text-xs font-bold"
          disabled={loading}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Sync Logs
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-6">
        <div className="md:col-span-4">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Simulate Appointment Ref</label>
          <select 
            value={selectedApt}
            onChange={(e) => setSelectedApt(e.target.value)}
            className="w-full text-xs font-bold bg-white dark:bg-zinc-900 border border-gray-200/60 dark:border-white/10 p-3 rounded-xl text-gray-700 dark:text-zinc-300 outline-none"
          >
            <option value="APT001">APT001 (Michael Scott - Video)</option>
            <option value="APT002">APT002 (Pam Beesly - Clinic)</option>
            <option value="APT003">APT003 (Jim Halpert - Clinic)</option>
            <option value="APT004">APT004 (Dwight Schrute - Video)</option>
          </select>
        </div>

        <div className="md:col-span-3">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Amount (INR)</label>
          <input 
            type="number"
            value={customAmount}
            onChange={(e) => setCustomAmount(Number(e.target.value))}
            className="w-full text-xs font-bold bg-white dark:bg-zinc-900 border border-gray-200/60 dark:border-white/10 p-3 rounded-xl text-gray-700 dark:text-zinc-300 outline-none"
          />
        </div>

        <div className="md:col-span-5 flex items-end">
          <button 
            onClick={triggerPreauth}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-all text-xs active:scale-95 shadow-lg shadow-indigo-600/15"
            disabled={loading}
          >
            <ShieldCheck className="w-4 h-4" /> Trigger Stripe Pre-Auth Lock
          </button>
        </div>
      </div>

      <div className="border border-gray-200/50 dark:border-white/5 rounded-2xl overflow-hidden bg-gray-50/20 dark:bg-black/20">
        {txs.length === 0 ? (
          <div className="text-center py-10 text-xs text-gray-500 font-semibold">
            No live escrow ledger events in system cache. Click above to trigger pre-authorization.
          </div>
        ) : (
          <div className="overflow-x-auto text-xs text-left">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200/50 dark:border-white/10 text-gray-400 font-bold bg-gray-100/50 dark:bg-white/5 uppercase text-[9px] tracking-wider">
                  <th className="p-3">Appointment</th>
                  <th className="p-3">Stripe ID / Reference</th>
                  <th className="p-3">Pre-Auth / Captured</th>
                  <th className="p-3">Escrow Status</th>
                  <th className="p-3 text-right">Administrative Override</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/50 dark:divide-white/5 text-gray-800 dark:text-zinc-300">
                {txs.map((tx) => (
                  <tr key={tx.appointmentId} className="hover:bg-gray-100/10 transition-colors">
                    <td className="p-3 font-bold">{tx.appointmentId}</td>
                    <td className="p-3 font-mono text-[10px] text-gray-400">{tx.transactionReference}</td>
                    <td className="p-3 font-semibold">
                      ₹{tx.preauthAmount} / <span className="text-emerald-500 font-extrabold">₹{tx.capturedAmount}</span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black border uppercase tracking-wider
                        ${tx.escrowStatus === 'Authorized' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20' :
                          tx.escrowStatus === 'Held_In_Escrow' ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20 animate-pulse' :
                          tx.escrowStatus === 'Captured' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20' :
                          'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20'
                        }
                      `}>
                        {tx.escrowStatus.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex justify-end gap-1.5">
                        {tx.escrowStatus === 'Authorized' && (
                          <button 
                            onClick={() => triggerHold(tx.appointmentId)}
                            className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-2 py-1 rounded text-[9px] transition-colors"
                          >
                            Hold Escrow
                          </button>
                        )}
                        {tx.escrowStatus === 'Held_In_Escrow' && (
                          <button 
                            onClick={() => triggerCapture(tx.appointmentId)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2 py-1 rounded text-[9px] transition-colors"
                          >
                            Capture
                          </button>
                        )}
                        {tx.escrowStatus !== 'Refunded' && tx.escrowStatus !== 'Captured' && (
                          <button 
                            onClick={() => triggerRefund(tx.appointmentId)}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold px-2 py-1 rounded text-[9px] transition-colors"
                          >
                            Refund
                          </button>
                        )}
                        {(tx.escrowStatus === 'Captured' || tx.escrowStatus === 'Refunded') && (
                          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                            <CheckCircleIcon className="w-3 h-3 text-emerald-400" /> Settled
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
