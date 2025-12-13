import { createBrowserRouter, Outlet } from "react-router-dom";
import { RouteLogger } from "../components/RouteLogger";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { LoginPage } from "../features/auth/components/LoginPage";
import { ProtectedRoute } from "../features/auth/components/ProtectedRoute";
import { PublicRoute } from "../features/auth/components/PublicRoute";
import { MainLayout } from "../layouts/MainLayout";
import { InactivityTracker } from "../components/InactivityTracker";
import { DashboardPage } from "../features/dashboard/components/DashboardPage";
import { OrderPage } from "../features/pos/components/OrderPage";
import { HistoryPage } from "../features/reports/components/HistoryPage";
import { SettingsPage } from "../features/settings/components/SettingsPage";
import { StartDayPage } from "../features/dashboard/components/StartDayPage";
import { DayGuard } from "../components/DayGuard";

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
              {
                index: true,
                element: <DashboardPage />,
              },
              {
                path: "order/:id",
                element: <OrderPage />,
              },
              {
                path: "history",
                element: <HistoryPage />,
              },
              {
                path: "settings",
                element: <SettingsPage />,
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
