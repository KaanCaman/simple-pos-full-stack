import { Navigate } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { useRootStore } from "../stores/rootStore";
import { DashboardPage } from "../features/dashboard/components/DashboardPage";

export const RoleBasedHome = observer(() => {
  const { authStore } = useRootStore();
  const userRole = authStore.user?.role;

  if (userRole === "waiter") {
    return <Navigate to="/pos" replace />;
  }

  // Default to Dashboard for admin (or others)
  return <DashboardPage />;
});
