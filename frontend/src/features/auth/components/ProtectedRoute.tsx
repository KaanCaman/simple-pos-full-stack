import { Navigate, Outlet, useLocation } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { useRootStore } from "../../../stores/rootStore";
import { Loader2 } from "lucide-react";

export const ProtectedRoute = observer(() => {
  const { authStore } = useRootStore();
  const location = useLocation();

  if (authStore.isInitializing) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-[#111315]">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (!authStore.isAuthenticated) {
    // Redirect to login page while saving the attempted URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
});
