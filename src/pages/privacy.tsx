import { PageHeader } from "@/components/ui/page-header";
import { Shield } from "lucide-react";

export function Privacy() {
  return (
    <div className="min-h-screen bg-transparent w-full pb-24">
      <PageHeader 
        title="Medical Data Privacy Policy" 
        description="We protect your data securely and strictly." 
        icon={Shield} 
      />
      <div className="max-w-4xl mx-auto px-6 mt-12 bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 rounded-3xl p-8 shadow-sm text-gray-700 dark:text-gray-300">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">1. Data Security & HIPAA Compliance</h2>
        <p className="mb-6">
          WeCare is committed to ensuring that all patient data, medical records, and appointment histories are 
          securely encrypted and fully compliant with HIPAA (Health Insurance Portability and Accountability Act) and GDPR.
        </p>

        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">2. Features Using Your Data</h2>
        <ul className="list-disc pl-6 space-y-4 mb-6">
          <li><strong>Find Doctors:</strong> Uses your general location to suggest nearby professionals.</li>
          <li><strong>Live Queue Tracking:</strong> Tracks appointment times without revealing personal identity to others.</li>
          <li><strong>Medicines & Pharmacy:</strong> Stores previous prescriptions strictly for your own reference.</li>
          <li><strong>Health Camps:</strong> Requires temporary location access for accurate mapping.</li>
          <li><strong>Donations:</strong> Only verified cases are displayed with patient or guardian consent.</li>
        </ul>

        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">3. Third-Party Sharing</h2>
        <p>
          We never sell your data. We strictly share it only with our verified hospital and clinic partners 
          when you explicitly book an appointment, consult via video, or request NGO support.
        </p>
      </div>
    </div>
  );
}
