import { PageHeader } from "@/components/ui/page-header";
import { FileText } from "lucide-react";

export function TermsOfService() {
  return (
    <div className="min-h-screen bg-transparent w-full pb-24">
      <PageHeader 
        title="Terms of Service" 
        description="Our commitments and guidelines." 
        icon={FileText} 
      />
      <div className="max-w-4xl mx-auto px-6 mt-12 bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 rounded-3xl p-8 shadow-sm text-gray-700 dark:text-gray-300">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">1. Use of Services</h2>
        <p className="mb-6">
          By utilizing WeCare, you agree to these terms. Our platform serves as a bridge connecting patients, 
          veterinarians, and healthcare professionals to schedule and manage medical care.
        </p>

        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">2. Core Features</h2>
        <ul className="list-disc pl-6 space-y-4 mb-6">
          <li><strong>Video Consultation:</strong> Provided "as-is", dependent on your network connection. Not a substitute for life-threatening emergency care.</li>
          <li><strong>Lab Tests & Diagnostics:</strong> Sample collections are facilitated by third-party partner labs. WeCare guarantees verified agents will perform the pickup.</li>
          <li><strong>NGO Support & Donations:</strong> WeCare verifies all campaigns. 100% of donation funds strictly reach the designated accounts, minus payment gateway fees.</li>
          <li><strong>Community Forum:</strong> Users must maintain respect and decorum. Any medical advice shared by non-professionals should be taken at your own risk.</li>
        </ul>

        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">3. Platform Liability</h2>
        <p>
          WeCare guarantees the verification of medical professionals on the platform. However, the final 
          medical outcome depends entirely on the consulting physician. 
        </p>
      </div>
    </div>
  );
}
