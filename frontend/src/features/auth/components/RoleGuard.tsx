import { Navigate, Outlet } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { useRootStore } from "../../../stores/rootStore";
import type { UserRole } from "../../../types/auth";

interface RoleGuardProps {
  allowedRoles: UserRole[];
  redirectPath?: string;
}

export const RoleGuard = observer(
  ({ allowedRoles, redirectPath = "/" }: RoleGuardProps) => {
    const { authStore } = useRootStore();
    const userRole = authStore.user?.role;

    if (!userRole || !allowedRoles.includes(userRole)) {
      return <Navigate to={redirectPath} replace />;
    }

    return <Outlet />;
  }
);
