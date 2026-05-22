import { Outlet, useLocation } from "react-router-dom";
import { Header } from "@/components/ui/header-3";
import { CinematicFooter } from "@/components/ui/motion-footer";
import ShaderBackground from "@/components/ui/shader-background";
import { useEffect } from "react";
import { useVetMode } from "@/context/vet-mode-context";
import { cn } from "@/lib/utils";
import { FloatingChatbot } from "@/components/ui/floating-chatbot";

export function Layout() {
  const { pathname } = useLocation();
  const { isVetMode } = useVetMode();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  const isLoginPage = pathname === "/login";

  return (
    <div className={cn(
      "relative min-h-screen bg-transparent text-gray-900 dark:text-gray-100 font-sans transition-colors",
      isVetMode ? "selection:bg-emerald-500/20" : "selection:bg-red-500/20"
    )}>
      <ShaderBackground />
      {!isLoginPage && <Header />}
      <main className="relative z-10 w-full min-h-[calc(100vh-80vh)]">
        <Outlet />
      </main>
      {!isLoginPage && <FloatingChatbot />}
      {!isLoginPage && <CinematicFooter />}
    </div>
  );
}
