import { Navigate, Outlet, useLocation } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { useRootStore } from "../../../stores/rootStore";

export const ProtectedRoute = observer(() => {
  const { authStore } = useRootStore();
  const location = useLocation();

  if (!authStore.isAuthenticated) {
    // Redirect to login page while saving the attempted URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
});
