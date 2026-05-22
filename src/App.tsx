import { HashRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./layout";
import { Home } from "./pages/home";
import { FindDoctors } from "./pages/find-doctors";
import { LiveQueueTracking } from "./pages/live-queue";
import { VideoConsult } from "./pages/video-consult";
import { LabTests } from "./pages/lab-tests";
import { Medicines } from "./pages/medicines";
import { WalletPage } from "./pages/wallet";
import { UrgentCare } from "./pages/urgent-care";
import { KnowledgeBase } from "./pages/knowledge-base";
import { CommunityForum } from "./pages/community";
import { SystemStatus } from "./pages/system-status";
import { JoinAsDoctor } from "./pages/join-doctor";
import { PartnerLabs } from "./pages/partner-labs";
import { ContactSupport } from "./pages/contact-support";
import { Login } from "./pages/login";
import { DoctorDashboard } from "./pages/doctor-dashboard";
import { Profile } from "./pages/profile";
import { ProtectedRoute } from "./components/protected-route";
import { AuthProvider } from "./context/auth-context";
import { VetModeProvider } from "./context/vet-mode-context";
import { NgoSupport } from "./pages/ngo-support";
import { Donate } from "./pages/donate";
import { HealthCamps } from "./pages/health-camps";
import { Privacy } from "./pages/privacy";
import { TermsOfService } from "./pages/terms";
import { VeterinaryCompliance } from "./pages/veterinary-compliance";
import { AIAssistant } from "./pages/ai-assistant";
import { NgoDashboard } from "./pages/ngo-dashboard";
import { LocationProvider } from "./context/location-context";export default function App() {
  return (
    <AuthProvider>
      <LocationProvider>
        <VetModeProvider>
          <HashRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              {/* Public Routes */}
              <Route path="login" element={<Login />} />
              <Route path="privacy" element={<Privacy />} />
              <Route path="terms" element={<TermsOfService />} />
              <Route path="veterinary-compliance" element={<VeterinaryCompliance />} />
              <Route path="knowledge-base" element={<KnowledgeBase />} />
              <Route path="community" element={<CommunityForum />} />
              <Route path="system-status" element={<SystemStatus />} />
              <Route path="join-doctor" element={<JoinAsDoctor />} />
              <Route path="partner-labs" element={<PartnerLabs />} />
              <Route path="contact-support" element={<ContactSupport />} />
              <Route path="ngo-support" element={<NgoSupport />} />
              <Route path="donate" element={<Donate />} />
              <Route path="health-camps" element={<HealthCamps />} />

              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route index element={<Home />} />
                <Route path="find-doctors" element={<FindDoctors />} />
                <Route path="live-queue" element={<LiveQueueTracking />} />
                <Route path="video-consult" element={<VideoConsult />} />
                <Route path="lab-tests" element={<LabTests />} />
                <Route path="medicines" element={<Medicines />} />
                <Route path="wallet" element={<WalletPage />} />
                <Route path="urgent-care" element={<UrgentCare />} />
                <Route path="doctor-dashboard" element={<DoctorDashboard />} />
                <Route path="ngo-dashboard" element={<NgoDashboard />} />
                <Route path="profile" element={<Profile />} />
                <Route path="ai-assistant" element={<AIAssistant />} />
              </Route>
            </Route>
          </Routes>
        </HashRouter>
        </VetModeProvider>
      </LocationProvider>
    </AuthProvider>
  );
}
