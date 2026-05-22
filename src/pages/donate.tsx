import React, { useState, useEffect, useCallback } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { 
  HeartHandshake, ShieldCheck, ArrowRight, CreditCard, CheckCircle, 
  Activity, Heart, ArrowLeft, Download, PawPrint, Wallet, Copy, 
  ExternalLink, Zap, RefreshCw, AlertCircle, Sparkles, Globe, Lock
} from "lucide-react";
import { useVetMode } from "@/context/vet-mode-context";
import { cn } from "@/lib/utils";
import {
  generateWallet, loadWallet, fundWithFriendbot, getBalance,
  sendPayment, shortenKey, NGO_WALLETS,
  type StellarWallet, type TransactionResult
} from "@/lib/stellarService";

// ─── Transaction Pipeline Steps ──────────────────────────────────
type TxStep = "idle" | "building" | "signing" | "submitting" | "confirmed" | "failed";

export function Donate() {
  const { isVetMode } = useVetMode();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [amount, setAmount] = useState<string>("");
  const [isSuccess, setIsSuccess] = useState(false);

  // Card payment state
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  // Payment method toggle
  const [paymentMethod, setPaymentMethod] = useState<"card" | "stellar">("card");

  // Stellar state
  const [wallet, setWallet] = useState<StellarWallet | null>(null);
  const [xlmBalance, setXlmBalance] = useState<string>("0");
  const [xlmAmount, setXlmAmount] = useState<string>("");
  const [isFunding, setIsFunding] = useState(false);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [txStep, setTxStep] = useState<TxStep>("idle");
  const [txResult, setTxResult] = useState<TransactionResult | null>(null);
  const [stellarError, setStellarError] = useState("");
  const [copied, setCopied] = useState(false);

  // Patient data
  const humanPatients = [
    { id: 1, name: "Aarav K.", age: "8 yrs", condition: "Congenital Heart Defect", raised: 45000, goal: 120000, image: "https://images.unsplash.com/photo-1519340241574-2cec6aef0c01?auto=format&fit=crop&q=80&w=400&h=300" },
    { id: 2, name: "Meera S.", age: "12 yrs", condition: "Bone Marrow Transplant", raised: 280000, goal: 500000, image: "https://images.unsplash.com/photo-1503454537195-1dc534b4a194?auto=format&fit=crop&q=80&w=400&h=300" },
    { id: 3, name: "Rohan M.", age: "5 yrs", condition: "Severe Burn Recovery", raised: 15000, goal: 80000, image: "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&q=80&w=400&h=300" }
  ];

  const vetPatients = [
    { id: 1, name: "Max (Golden Retriever)", age: "2 yrs", condition: "Complex Fracture Surgery", raised: 18000, goal: 45000, image: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=400&h=300" },
    { id: 2, name: "Luna (Stray Kitten)", age: "6 mos", condition: "Feline Parvovirus Therapy", raised: 8500, goal: 15000, image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=400&h=300" },
    { id: 3, name: "Bella (Shelter Horse)", age: "5 yrs", condition: "Severe Colic Recovery", raised: 32000, goal: 75000, image: "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&q=80&w=400&h=300" }
  ];

  const patients = isVetMode ? vetPatients : humanPatients;
  const selectedPatient = patients.find(p => p.id === selectedPatientId);
  const ngoWallet = isVetMode ? NGO_WALLETS["animal-rescue"] : NGO_WALLETS["human-health"];

  // ─── Stellar Wallet Init ───────────────────────────────────────
  useEffect(() => {
    const existing = loadWallet();
    if (existing) {
      setWallet(existing);
    }
  }, []);

  // Auto-fetch balance when wallet loads
  const refreshBalance = useCallback(async () => {
    if (!wallet) return;
    setIsLoadingBalance(true);
    try {
      const bal = await getBalance(wallet.publicKey);
      setXlmBalance(bal);
    } catch {
      setXlmBalance("0");
    } finally {
      setIsLoadingBalance(false);
    }
  }, [wallet]);

  useEffect(() => {
    if (wallet) refreshBalance();
  }, [wallet, refreshBalance]);

  // ─── Handlers ──────────────────────────────────────────────────
  const handleGenerateWallet = () => {
    const newWallet = generateWallet();
    setWallet(newWallet);
    setStellarError("");
  };

  const handleFundWallet = async () => {
    if (!wallet) return;
    setIsFunding(true);
    setStellarError("");
    try {
      await fundWithFriendbot(wallet.publicKey);
      await refreshBalance();
    } catch (err: any) {
      setStellarError(err.message || "Failed to fund wallet");
    } finally {
      setIsFunding(false);
    }
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStellarDonate = async () => {
    if (!wallet || !xlmAmount || parseFloat(xlmAmount) <= 0) return;
    setStellarError("");
    setTxResult(null);

    try {
      // Step 1: Building
      setTxStep("building");
      await new Promise(r => setTimeout(r, 800));

      // Step 2: Signing
      setTxStep("signing");
      await new Promise(r => setTimeout(r, 600));

      // Step 3: Submitting
      setTxStep("submitting");

      const result = await sendPayment(
        wallet.secretKey,
        ngoWallet.publicKey,
        xlmAmount,
        `WeCare-${selectedPatient?.name?.substring(0, 15) || "Donation"}`
      );

      // Step 4: Confirmed
      setTxStep("confirmed");
      setTxResult(result);
      await refreshBalance();

    } catch (err: any) {
      setTxStep("failed");
      console.error("Stellar tx error:", err);
      if (err?.response?.data?.extras?.result_codes) {
        const codes = err.response.data.extras.result_codes;
        if (codes.operations?.includes("op_underfunded")) {
          setStellarError("Insufficient XLM balance. Please fund your wallet first.");
        } else if (codes.operations?.includes("op_no_destination")) {
          setStellarError("Destination account does not exist on the network.");
        } else {
          setStellarError(`Transaction failed: ${JSON.stringify(codes)}`);
        }
      } else {
        setStellarError(err.message || "Transaction failed. Please try again.");
      }
    }
  };

  // Card handlers (existing)
  const handleDonateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccess(true);
    setStep(3);
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    const formatted = value.match(/.{1,4}/g)?.join(" ") || "";
    setCardNumber(formatted.substring(0, 19));
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length > 2) {
      setCardExpiry(`${value.slice(0, 2)}/${value.slice(2, 4)}`);
    } else {
      setCardExpiry(value);
    }
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    setCardCvv(value.substring(0, 4));
  };

  const handleReset = () => {
    setStep(1);
    setAmount("");
    setXlmAmount("");
    setSelectedPatientId(null);
    setIsSuccess(false);
    setCardName("");
    setCardNumber("");
    setCardExpiry("");
    setCardCvv("");
    setTxStep("idle");
    setTxResult(null);
    setStellarError("");
    setPaymentMethod("card");
  };

  // ─── Transaction Step UI Helper ────────────────────────────────
  const renderTxPipeline = () => {
    const steps: { key: TxStep; label: string; icon: React.ReactNode }[] = [
      { key: "building", label: "Building Transaction", icon: <Zap className="w-4 h-4" /> },
      { key: "signing", label: "Signing with Private Key", icon: <Lock className="w-4 h-4" /> },
      { key: "submitting", label: "Submitting to Stellar Network", icon: <Globe className="w-4 h-4" /> },
      { key: "confirmed", label: "Confirmed On-Chain", icon: <CheckCircle className="w-4 h-4" /> },
    ];

    const stepOrder: TxStep[] = ["building", "signing", "submitting", "confirmed"];
    const currentIdx = stepOrder.indexOf(txStep);

    return (
      <div className="space-y-3 bg-slate-950 rounded-2xl p-6 border border-cyan-500/20 mt-6">
        <h4 className="text-xs font-black uppercase tracking-widest text-cyan-400 mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 animate-pulse" /> Live Transaction Pipeline
        </h4>
        {steps.map((s, i) => {
          const isActive = txStep === s.key;
          const isComplete = currentIdx > i;
          const isFailed = txStep === "failed" && i === currentIdx;

          return (
            <div key={s.key} className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-500",
              isActive && "bg-cyan-500/10 border-cyan-500/30 animate-pulse",
              isComplete && "bg-emerald-500/10 border-emerald-500/20",
              isFailed && "bg-red-500/10 border-red-500/30",
              !isActive && !isComplete && !isFailed && "border-white/5 opacity-40"
            )}>
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all",
                isComplete && "bg-emerald-500 text-white",
                isActive && "bg-cyan-500 text-white",
                isFailed && "bg-red-500 text-white",
                !isActive && !isComplete && !isFailed && "bg-white/10 text-gray-500"
              )}>
                {isComplete ? <CheckCircle className="w-4 h-4" /> : s.icon}
              </div>
              <span className={cn(
                "text-sm font-bold",
                isActive && "text-cyan-300",
                isComplete && "text-emerald-400",
                isFailed && "text-red-400",
                !isActive && !isComplete && !isFailed && "text-gray-600"
              )}>
                {s.label}
              </span>
              {isActive && !isComplete && (
                <div className="ml-auto w-4 h-4 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-transparent w-full pb-24">
      <PageHeader 
        title={isVetMode ? "Secure Pet Rescue Fund" : "Secure Donation Portal"} 
        description={isVetMode ? "Fund critical medical treatments and rescue operations for verified animals in need. 100% of your donation goes directly to vet clinics and shelter care." : "Fund the treatment of verified patients in need. 100% of your donation goes directly to their medical care."} 
        icon={isVetMode ? PawPrint : HeartHandshake} 
      />

      <div className="max-w-5xl mx-auto px-6 mt-12">
        {/* Trust Badges */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <div className="flex items-center gap-2 text-sm font-bold text-gray-600 dark:text-gray-300 bg-white/40 dark:bg-white/5 px-4 py-2 rounded-full border border-gray-200/50 dark:border-white/10">
            <ShieldCheck className="w-4 h-4 text-green-500" /> {isVetMode ? "Verified Rescue Cases" : "Platform Verified Cases"}
          </div>
          <div className="flex items-center gap-2 text-sm font-bold text-gray-600 dark:text-gray-300 bg-white/40 dark:bg-white/5 px-4 py-2 rounded-full border border-gray-200/50 dark:border-white/10">
            <CreditCard className="w-4 h-4 text-blue-500" /> 256-bit Secure Checkout
          </div>
          <div className="flex items-center gap-2 text-sm font-bold text-cyan-600 dark:text-cyan-300 bg-cyan-50/80 dark:bg-cyan-500/10 px-4 py-2 rounded-full border border-cyan-200/50 dark:border-cyan-500/20">
            <Zap className="w-4 h-4 text-cyan-500" /> Stellar Blockchain Enabled
          </div>
          <div className="flex items-center gap-2 text-sm font-bold text-gray-600 dark:text-gray-300 bg-white/40 dark:bg-white/5 px-4 py-2 rounded-full border border-gray-200/50 dark:border-white/10">
            <Activity className={cn("w-4 h-4", isVetMode ? "text-emerald-500" : "text-red-500")} /> {isVetMode ? "Direct Vet Clinic Transfer" : "Direct Hospital Transfer"}
          </div>
        </div>

        <div className="bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 rounded-[2rem] shadow-sm relative overflow-hidden">
          
          {/* Progress Header */}
          {!isSuccess && txStep !== "confirmed" && (
            <div className="flex border-b border-gray-200/50 dark:border-white/10">
              <div className={cn(
                "flex-1 py-4 text-center font-bold text-sm transition-all",
                step === 1 
                  ? (isVetMode ? "text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50/50 dark:bg-emerald-900/20" : "text-red-600 border-b-2 border-red-600 bg-red-50/50 dark:bg-red-900/20") 
                  : "text-gray-500"
              )}>
                {isVetMode ? "1. Select Animal" : "1. Select Patient"}
              </div>
              <div className={cn(
                "flex-1 py-4 text-center font-bold text-sm transition-all",
                step === 2 
                  ? (paymentMethod === "stellar" 
                      ? "text-cyan-600 border-b-2 border-cyan-500 bg-cyan-50/50 dark:bg-cyan-900/20"
                      : (isVetMode ? "text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50/50 dark:bg-emerald-900/20" : "text-red-600 border-b-2 border-red-600 bg-red-50/50 dark:bg-red-900/20"))
                  : "text-gray-500"
              )}>
                2. Donation Details
              </div>
            </div>
          )}

          <div className="p-8">
            {/* ═══════ STEP 1: SELECT PATIENT ═══════ */}
            {step === 1 && (
              <div className="animate-in fade-in duration-500">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6">
                  {isVetMode ? "Which animal would you like to help today?" : "Who would you like to help today?"}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {patients.map(patient => (
                    <div 
                      key={patient.id} 
                      className={cn(
                        "rounded-2xl overflow-hidden border-2 cursor-pointer transition-all group",
                        selectedPatientId === patient.id 
                          ? (isVetMode ? "border-emerald-500 shadow-md scale-[1.02]" : "border-red-500 shadow-md scale-[1.02]") 
                          : "border-transparent bg-white/50 dark:bg-zinc-900/50 hover:bg-white dark:hover:bg-zinc-800"
                      )}
                      onClick={() => setSelectedPatientId(patient.id)}
                    >
                      <div className="h-40 bg-gray-200 relative overflow-hidden">
                        <img src={patient.image} alt={patient.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute top-3 left-3 bg-white/90 dark:bg-black/90 backdrop-blur text-xs font-bold px-2 py-1 rounded-md text-gray-900 dark:text-white">
                          Verified Case
                        </div>
                      </div>
                      <div className="p-5">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-lg text-gray-900 dark:text-white">{patient.name}, {patient.age}</h3>
                        </div>
                        <p className={cn("text-sm font-medium mb-4", isVetMode ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400")}>{patient.condition}</p>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs font-bold">
                            <span className="text-gray-600 dark:text-gray-400">Raised: ₹{patient.raised.toLocaleString()}</span>
                            <span className="text-gray-900 dark:text-white">Goal: ₹{patient.goal.toLocaleString()}</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                            <div className={cn("h-full rounded-full", isVetMode ? "bg-emerald-500" : "bg-red-500")} style={{ width: `${(patient.raised / patient.goal) * 100}%` }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-8 flex justify-end">
                  <button 
                    disabled={!selectedPatientId}
                    onClick={() => setStep(2)}
                    className={cn(
                      "text-white font-bold py-3 px-8 rounded-xl flex items-center gap-2 hover:gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed",
                      isVetMode ? "bg-emerald-600 hover:bg-emerald-700" : "bg-gray-900 dark:bg-white dark:text-black hover:bg-gray-800"
                    )}
                  >
                    Continue <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ═══════ STEP 2: PAYMENT ═══════ */}
            {step === 2 && selectedPatient && txStep !== "confirmed" && (
              <div className="animate-in slide-in-from-right-8 duration-500 max-w-2xl mx-auto">
                <button 
                  onClick={() => setStep(1)} 
                  className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> {isVetMode ? "Back to animals" : "Back to patients"}
                </button>
                
                {/* Patient info summary */}
                <div className="bg-white/50 dark:bg-zinc-900/50 rounded-2xl p-6 mb-8 flex items-center gap-4 border border-gray-200/50 dark:border-white/5">
                  <img src={selectedPatient.image} alt={selectedPatient.name} className="w-16 h-16 rounded-full object-cover shadow-sm" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">You are supporting</p>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">{selectedPatient.name}'s Treatment</h3>
                  </div>
                </div>

                {/* ─── Payment Method Toggle ─── */}
                <div className="flex p-1.5 bg-gray-100/50 dark:bg-zinc-900/50 rounded-2xl mb-8 border border-gray-200/50 dark:border-white/5 backdrop-blur-md">
                  <button 
                    type="button"
                    onClick={() => setPaymentMethod("card")}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-sm font-bold transition-all",
                      paymentMethod === "card" 
                        ? "bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-md" 
                        : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                    )}
                  >
                    <CreditCard className="w-4 h-4" /> Credit / Debit Card
                  </button>
                  <button 
                    type="button"
                    onClick={() => setPaymentMethod("stellar")}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-sm font-bold transition-all",
                      paymentMethod === "stellar" 
                        ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20" 
                        : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                    )}
                  >
                    <Zap className="w-4 h-4" /> ⚡ Stellar Blockchain (XLM)
                  </button>
                </div>

                {/* ═══════ CARD PAYMENT FORM ═══════ */}
                {paymentMethod === "card" && (
                  <form onSubmit={handleDonateSubmit} className="space-y-6">
                    {/* Preset Amount Grid */}
                    <div>
                      <label className="block text-sm font-bold text-gray-900 dark:text-white mb-4">Select Donation Amount</label>
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        {(isVetMode ? ["500", "2000", "5000"] : ["1000", "5000", "10000"]).map(preset => (
                          <button 
                            key={preset}
                            type="button"
                            onClick={() => setAmount(preset)}
                            className={cn(
                              "py-3 rounded-xl font-bold border transition-all bg-transparent",
                              amount === preset 
                                ? (isVetMode ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 text-emerald-600 dark:text-emerald-400" : "bg-red-50 dark:bg-red-900/20 border-red-500 text-red-600 dark:text-red-400") 
                                : "border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-white/20"
                            )}
                          >
                            ₹{parseInt(preset).toLocaleString()}
                          </button>
                        ))}
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <span className="text-gray-500 font-bold">₹</span>
                        </div>
                        <input 
                          type="number" required value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className={cn("w-full bg-white/60 dark:bg-zinc-900/60 border border-gray-200 dark:border-white/10 rounded-xl pl-16 pr-4 py-3.5 text-gray-900 dark:text-white outline-none transition-all font-bold text-lg focus:ring-2", isVetMode ? "focus:ring-emerald-500/50" : "focus:ring-red-500/50")} 
                          placeholder="Enter custom amount" 
                        />
                      </div>
                    </div>

                    {/* Card fields */}
                    <div className="space-y-4 pt-6 border-t border-gray-200/50 dark:border-white/10">
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                        <CreditCard className={cn("w-4 h-4", isVetMode ? "text-emerald-500" : "text-red-500")} /> Credit or Debit Card Details
                      </h4>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Cardholder Name</label>
                        <input type="text" required value={cardName} onChange={e => setCardName(e.target.value)}
                          className="w-full bg-white/60 dark:bg-zinc-900/60 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white outline-none font-bold focus:ring-2 focus:ring-gray-300" placeholder="John Doe" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Card Number</label>
                        <input type="text" required value={cardNumber} onChange={handleCardNumberChange} pattern="\d{4}\s?\d{4}\s?\d{4}\s?\d{4}" placeholder="4111 2222 3333 4444"
                          className="w-full bg-white/60 dark:bg-zinc-900/60 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white outline-none font-bold focus:ring-2 focus:ring-gray-300" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Expiration Date</label>
                          <input type="text" required value={cardExpiry} onChange={handleExpiryChange} pattern="(0[1-9]|1[0-2])\/[0-9]{2}" placeholder="MM/YY"
                            className="w-full bg-white/60 dark:bg-zinc-900/60 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white outline-none font-bold focus:ring-2 focus:ring-gray-300" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Security Code (CVV)</label>
                          <input type="password" required value={cardCvv} onChange={handleCvvChange} pattern="[0-9]{3,4}" placeholder="•••"
                            className="w-full bg-white/60 dark:bg-zinc-900/60 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white outline-none font-bold focus:ring-2 focus:ring-gray-300" />
                        </div>
                      </div>
                      <div className="pt-4 space-y-4">
                        <button type="submit" disabled={!amount || parseInt(amount) <= 0 || !cardName || cardNumber.length < 19 || cardExpiry.length < 5 || cardCvv.length < 3} 
                          className={cn("w-full text-white font-bold py-4 rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2",
                            isVetMode ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20" : "bg-red-600 hover:bg-red-700 shadow-red-500/20"
                          )}>
                          <Heart className="w-5 h-5 animate-pulse" /> Donate Securely
                        </button>
                        <div className="text-center text-xs font-medium text-gray-500 flex items-center justify-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-green-500" /> Payments are securely processed and 256-bit SSL encrypted
                        </div>
                      </div>
                    </div>
                  </form>
                )}

                {/* ═══════ STELLAR BLOCKCHAIN PAYMENT ═══════ */}
                {paymentMethod === "stellar" && (
                  <div className="space-y-6">

                    {/* Wallet Section */}
                    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-950 rounded-2xl p-6 border border-cyan-500/20 relative overflow-hidden">
                      {/* Decorative elements */}
                      <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                      <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -ml-10 -mb-10"></div>

                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <Wallet className="w-5 h-5 text-cyan-400" />
                            <h4 className="text-sm font-black text-white uppercase tracking-wider">Your Stellar Wallet</h4>
                          </div>
                          <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-full">
                            TESTNET
                          </span>
                        </div>

                        {!wallet ? (
                          <div className="text-center py-8">
                            <div className="w-16 h-16 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-cyan-500/20">
                              <Sparkles className="w-8 h-8 text-cyan-400" />
                            </div>
                            <p className="text-sm text-gray-400 mb-6">Generate a Stellar wallet to start making blockchain-powered donations</p>
                            <button onClick={handleGenerateWallet}
                              className="px-8 py-3.5 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all hover:scale-[1.02] active:scale-[0.98]">
                              <span className="flex items-center gap-2">
                                <Zap className="w-4 h-4" /> Generate Stellar Wallet
                              </span>
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {/* Balance Display */}
                            <div className="bg-black/30 rounded-xl p-5 border border-white/5">
                              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">XLM Balance</p>
                              <div className="flex items-end gap-2">
                                <span className="text-4xl font-black text-white tracking-tight">
                                  {isLoadingBalance ? "..." : parseFloat(xlmBalance).toFixed(2)}
                                </span>
                                <span className="text-lg font-bold text-cyan-400 pb-1">XLM</span>
                                <button onClick={refreshBalance} className="ml-auto text-gray-500 hover:text-cyan-400 transition-colors p-1.5 rounded-lg hover:bg-white/5">
                                  <RefreshCw className={cn("w-4 h-4", isLoadingBalance && "animate-spin")} />
                                </button>
                              </div>
                            </div>

                            {/* Public Key */}
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-black/20 rounded-lg px-3 py-2 border border-white/5">
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Public Key</p>
                                <p className="text-xs font-mono text-cyan-300 truncate">{wallet.publicKey}</p>
                              </div>
                              <button onClick={() => handleCopyKey(wallet.publicKey)}
                                className={cn("p-2.5 rounded-lg border transition-all shrink-0",
                                  copied ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400" : "bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10"
                                )}>
                                {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                              </button>
                            </div>

                            {/* Fund Button */}
                            {parseFloat(xlmBalance) < 1 && (
                              <button onClick={handleFundWallet} disabled={isFunding}
                                className="w-full py-3 bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/30 text-cyan-400 font-bold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                                {isFunding ? (
                                  <div className="w-4 h-4 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
                                ) : (
                                  <Zap className="w-4 h-4" />
                                )}
                                {isFunding ? "Funding via Friendbot..." : "Fund Wallet (10,000 XLM Testnet)"}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Destination Display */}
                    {wallet && (
                      <div className="bg-white/50 dark:bg-zinc-900/50 rounded-2xl p-5 border border-gray-200/50 dark:border-white/5">
                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">Recipient Wallet</p>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-violet-500/10 rounded-full flex items-center justify-center">
                            <HeartHandshake className="w-5 h-5 text-violet-500" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white text-sm">{ngoWallet.label}</p>
                            <p className="text-xs text-gray-500 font-mono">{shortenKey(ngoWallet.publicKey, 8)}</p>
                          </div>
                          <ShieldCheck className="w-5 h-5 text-green-500 ml-auto" />
                        </div>
                      </div>
                    )}

                    {/* XLM Amount */}
                    {wallet && parseFloat(xlmBalance) > 0 && (
                      <div>
                        <label className="block text-sm font-bold text-gray-900 dark:text-white mb-4">Select XLM Amount</label>
                        <div className="grid grid-cols-3 gap-3 mb-4">
                          {["10", "50", "100"].map(preset => (
                            <button 
                              key={preset} type="button"
                              onClick={() => setXlmAmount(preset)}
                              className={cn(
                                "py-3 rounded-xl font-bold border transition-all bg-transparent",
                                xlmAmount === preset 
                                  ? "bg-cyan-50 dark:bg-cyan-900/20 border-cyan-500 text-cyan-600 dark:text-cyan-400" 
                                  : "border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:border-gray-300"
                              )}
                            >
                              {preset} XLM
                            </button>
                          ))}
                        </div>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <span className="text-cyan-500 font-bold text-sm">XLM</span>
                          </div>
                          <input 
                            type="number" value={xlmAmount}
                            onChange={(e) => setXlmAmount(e.target.value)}
                            className="w-full bg-white/60 dark:bg-zinc-900/60 border border-gray-200 dark:border-white/10 rounded-xl pl-16 pr-4 py-3.5 text-gray-900 dark:text-white outline-none font-bold text-lg focus:ring-2 focus:ring-cyan-500/50" 
                            placeholder="Enter custom XLM amount" 
                          />
                        </div>
                      </div>
                    )}

                    {/* Transaction Pipeline */}
                    {txStep !== "idle" && renderTxPipeline()}

                    {/* Error Display */}
                    {stellarError && (
                      <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm font-medium flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                        <p>{stellarError}</p>
                      </div>
                    )}

                    {/* Send Button */}
                    {wallet && parseFloat(xlmBalance) > 0 && txStep === "idle" && (
                      <button 
                        onClick={handleStellarDonate}
                        disabled={!xlmAmount || parseFloat(xlmAmount) <= 0 || parseFloat(xlmAmount) > parseFloat(xlmBalance)}
                        className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99]"
                      >
                        <Zap className="w-5 h-5" /> Send {xlmAmount || "0"} XLM via Stellar Network
                      </button>
                    )}

                    {/* Retry after failure */}
                    {txStep === "failed" && (
                      <button onClick={() => { setTxStep("idle"); setStellarError(""); }}
                        className="w-full py-3 bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 font-bold rounded-xl border border-gray-200 dark:border-white/10 transition-all hover:bg-gray-200 dark:hover:bg-white/10">
                        Try Again
                      </button>
                    )}

                    {/* Footer Security Note */}
                    <div className="text-center text-xs font-medium text-gray-500 flex items-center justify-center gap-2 pt-2">
                      <Lock className="w-4 h-4 text-cyan-500" /> Transactions are cryptographically signed and verified on the Stellar public ledger
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ═══════ STEP 3: CARD SUCCESS ═══════ */}
            {step === 3 && isSuccess && (
              <div className="animate-in zoom-in-95 duration-500 py-12 flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 bg-green-50 dark:bg-green-500/10 rounded-full flex items-center justify-center mb-6 relative">
                  <div className="absolute inset-0 rounded-full border-4 border-green-500/20 animate-ping"></div>
                  <CheckCircle className="w-12 h-12 text-green-500 relative z-10" />
                </div>
                <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4">Thank You for Your Kindness!</h2>
                <p className="text-gray-500 dark:text-gray-400 max-w-md mb-8">
                  Your donation of <strong>₹{parseInt(amount).toLocaleString()}</strong> towards {selectedPatient?.name}'s care was successful. A receipt has been generated.
                </p>
                <div className="flex gap-4">
                  <button className="px-6 py-3 bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors flex items-center gap-2">
                    <Download className="w-4 h-4" /> Download Receipt
                  </button>
                  <button onClick={handleReset}
                    className={cn("px-6 py-3 font-bold rounded-xl transition-colors text-white",
                      isVetMode ? "bg-emerald-600 hover:bg-emerald-700" : "bg-gray-900 dark:bg-white dark:text-black hover:bg-gray-800"
                    )}>
                    Make Another Donation
                  </button>
                </div>
              </div>
            )}

            {/* ═══════ STELLAR SUCCESS ═══════ */}
            {txStep === "confirmed" && txResult && (
              <div className="animate-in zoom-in-95 duration-500 py-8 max-w-2xl mx-auto">
                {/* Success Header */}
                <div className="text-center mb-8">
                  <div className="w-24 h-24 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                    <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20 animate-ping"></div>
                    <CheckCircle className="w-12 h-12 text-cyan-400 relative z-10" />
                  </div>
                  <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Donation Confirmed On-Chain!</h2>
                  <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                    Your <strong>{xlmAmount} XLM</strong> donation for {selectedPatient?.name}'s treatment has been permanently recorded on the Stellar blockchain.
                  </p>
                </div>

                {/* On-Chain Receipt */}
                <div className="bg-gradient-to-br from-slate-950 to-slate-900 rounded-2xl p-6 border border-cyan-500/20 space-y-4 mb-8">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-xs font-black text-cyan-400 uppercase tracking-widest">On-Chain Transaction Receipt</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Transaction Hash</p>
                      <p className="text-xs font-mono text-cyan-300 truncate">{txResult.hash}</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Ledger Block</p>
                      <p className="text-sm font-black text-white">#{txResult.ledger}</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Network Fee</p>
                      <p className="text-sm font-bold text-gray-300">{(parseInt(txResult.fee) / 10000000).toFixed(7)} XLM</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Amount Sent</p>
                      <p className="text-sm font-black text-emerald-400">{xlmAmount} XLM</p>
                    </div>
                  </div>

                  <a 
                    href={txResult.explorerUrl} target="_blank" rel="noopener noreferrer"
                    className="w-full py-3 bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/30 text-cyan-400 font-bold rounded-xl transition-all flex items-center justify-center gap-2 mt-2"
                  >
                    <ExternalLink className="w-4 h-4" /> Verify on Stellar Explorer
                  </a>
                </div>

                {/* Actions */}
                <div className="flex gap-4 justify-center">
                  <button className="px-6 py-3 bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors flex items-center gap-2">
                    <Download className="w-4 h-4" /> Download Receipt
                  </button>
                  <button onClick={handleReset}
                    className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02]">
                    Make Another Donation
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
