import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/auth-context";

export function ProtectedRoute() {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // CRITICAL: While Firebase auth state is still loading, show nothing instead of
  // redirecting to login. This prevents the redirect-loop on sign-in.
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-gray-200 dark:border-white/10 border-t-red-500 rounded-full animate-spin"></div>
          <p className="text-sm font-bold text-gray-500 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user is a Doctor, deny access to patient discovery, live tracking, and AI Assistant
  const patientOnlyRoutes = ["/find-doctors", "/live-queue", "/ai-assistant"];
  const isDoctorSearch = location.search.includes("role=doctor") || window.location.hash.includes("role=doctor");
  
  if (user.role === "doctor") {
    const isPatientConsultRoom = location.pathname === "/video-consult" && !isDoctorSearch;
    if (patientOnlyRoutes.includes(location.pathname) || isPatientConsultRoom) {
      return <Navigate to="/doctor-dashboard" replace />;
    }
  }

  // If user is a Patient, block access to Doctor workspace dashboards
  const doctorOnlyRoutes = ["/doctor-dashboard"];
  if (user.role === "patient" && doctorOnlyRoutes.includes(location.pathname)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
