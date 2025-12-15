import { createBrowserRouter, Outlet } from "react-router-dom";
import { RouteLogger } from "../components/RouteLogger";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { LoginPage } from "../features/auth/components/LoginPage";
import { ProtectedRoute } from "../features/auth/components/ProtectedRoute";
import { PublicRoute } from "../features/auth/components/PublicRoute";
import { MainLayout } from "../layouts/MainLayout";
import { InactivityTracker } from "../components/InactivityTracker";
import { OrderPage } from "../features/pos/components/OrderPage";
import { POSPage } from "../features/pos/components/POSPage";
import { HistoryPage } from "../features/reports/components/HistoryPage";
import { DailyReportPage } from "../features/reports/components/DailyReportPage";
import { ReportHistoryPage } from "../features/reports/components/ReportHistoryPage";
import { SettingsPage } from "../features/settings/components/SettingsPage";
import { StartDayPage } from "../features/dashboard/components/StartDayPage";
import { DayGuard } from "../components/DayGuard";
import { RoleGuard } from "../features/auth/components/RoleGuard";
import { RoleBasedHome } from "../components/RoleBasedHome";

// Root layout component that includes global providers/components.
// Küresel sağlayıcıları/bileşenleri içeren kök düzen bileşeni.
const RootLayout = () => {
  return (
    <ErrorBoundary>
      <RouteLogger />
      <InactivityTracker />
      <Outlet />
    </ErrorBoundary>
  );
};

// Application routes configuration using Router v7 Data API.
// Router v7 Veri API'sini kullanan uygulama rotaları yapılandırması.
export const appRoutes = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        element: <PublicRoute />,
        children: [
          {
            path: "login",
            element: <LoginPage />,
          },
        ],
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: (
              <DayGuard>
                <MainLayout />
              </DayGuard>
            ),
            children: [
              // Admin Only Routes
              {
                element: (
                  <RoleGuard allowedRoles={["admin"]} redirectPath="/pos" />
                ),
                children: [
                  {
                    path: "history",
                    element: <HistoryPage />,
                  },
                  {
                    path: "reports",
                    element: <DailyReportPage />,
                  },
                  {
                    path: "reports/history",
                    element: <ReportHistoryPage />,
                  },
                  {
                    path: "reports/:date",
                    element: <DailyReportPage />,
                  },
                  {
                    path: "settings",
                    element: <SettingsPage />,
                  },
                ],
              },
              {
                index: true,
                element: <RoleBasedHome />,
              },
              // Shared Routes (Waiter + Admin)
              {
                path: "pos",
                element: <POSPage />,
              },
              {
                path: "order/:id",
                element: <OrderPage />,
              },
            ],
          },
          {
            path: "start-day",
            element: <StartDayPage />,
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <div>404 Not Found</div>,
  },
]);
