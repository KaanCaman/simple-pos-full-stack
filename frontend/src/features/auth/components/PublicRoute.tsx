import { Navigate, Outlet } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { useRootStore } from "../../../stores/rootStore";

export const PublicRoute = observer(() => {
  const { authStore } = useRootStore();

  if (authStore.isAuthenticated) {
    // If user is already authenticated, redirect to dashboard
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
});
