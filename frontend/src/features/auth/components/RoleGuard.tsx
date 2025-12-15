import { Navigate, Outlet } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { useRootStore } from "../../../stores/rootStore";
import { UnauthorizedPage } from "./UnauthorizedPage";
import type { UserRole } from "../../../types/auth";

interface RoleGuardProps {
  allowedRoles: UserRole[];
  redirectPath?: string;
  children?: React.ReactNode;
}

export const RoleGuard = observer(
  ({ allowedRoles, redirectPath, children }: RoleGuardProps) => {
    const { authStore } = useRootStore();
    const userRole = authStore.user?.role;

    if (!userRole || !allowedRoles.includes(userRole)) {
      if (redirectPath) {
        return <Navigate to={redirectPath} replace />;
      }
      return <UnauthorizedPage />;
    }

    return children ? <>{children}</> : <Outlet />;
  }
);
