import { observer } from "mobx-react-lite";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useStore } from "../stores/rootStore";

export const DayGuard = observer(
  ({ children }: { children: React.ReactNode }) => {
    const { authStore } = useStore();
    const location = useLocation();

    if (authStore.isInitializing) {
      return (
        <div className="h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-[#111315]">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
        </div>
      );
    }

    // If day is not open, redirect to start-day page
    // But strictly ONLY if we are authenticated. If not authenticated, ProtectedRoute handles it.
    // And avoid infinite redirect if we are already on start-day.

    if (authStore.isAuthenticated && !authStore.isDayOpen) {
      if (authStore.user?.role === "admin") {
        return <Navigate to="/start-day" state={{ from: location }} replace />;
      } else {
        return (
          <Navigate to="/system-closed" state={{ from: location }} replace />
        );
      }
    }

    // If day is open but user tries to go to start-day, redirect to dashboard
    if (
      authStore.isAuthenticated &&
      authStore.isDayOpen &&
      location.pathname === "/start-day"
    ) {
      return <Navigate to="/" replace />;
    }

    return <>{children}</>;
  }
);
