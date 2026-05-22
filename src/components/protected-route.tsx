import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/auth-context";

export function ProtectedRoute() {
  const { user } = useAuth();
  const location = useLocation();

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
