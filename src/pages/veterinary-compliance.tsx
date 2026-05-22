import { PageHeader } from "@/components/ui/page-header";
import { Shield } from "lucide-react"; // Using shield for compliance

export function VeterinaryCompliance() {
  return (
    <div className="min-h-screen bg-transparent w-full pb-24">
      <PageHeader 
        title="Veterinary Compliance Guidelines" 
        description="Dual-species care regulations and policies." 
        icon={Shield} 
      />
      <div className="max-w-4xl mx-auto px-6 mt-12 bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 rounded-3xl p-8 shadow-sm text-gray-700 dark:text-gray-300">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">1. Dual-Species Mandate</h2>
        <p className="mb-6">
          WeCare proudly supports both Human and Veterinary healthcare. To maintain quality and legality, 
          veterinary professionals operate under a strict, separated directory from human-care providers.
        </p>

        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">2. Feature Allocation for Pets</h2>
        <ul className="list-disc pl-6 space-y-4 mb-6">
          <li><strong>Find Veterinarians:</strong> Specialized filter ensures only certified veterinary surgeons and physicians are listed.</li>
          <li><strong>Pet Video Consultation:</strong> Allows remote triage for animals, but owners must agree that critical care requires an in-person visit.</li>
          <li><strong>Pet Medicines:</strong> Integrated directly with certified veterinary pharmacies to prevent cross-contamination or misuse.</li>
          <li><strong>Animal Urgent Care:</strong> Dedicated rapid-response network that differs entirely from human ambulance services to comply with local transport laws.</li>
        </ul>

        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">3. Professional Licensing</h2>
        <p>
          Every veterinarian on WeCare has undergone rigorous licensing background checks by their respective 
          local or national veterinary boards. Misrepresentation of veterinary capacity will result in immediate lifetime bans.
        </p>
      </div>
    </div>
  );
}
