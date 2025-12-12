import { createBrowserRouter, Outlet } from "react-router-dom";
import { RouteLogger } from "../components/RouteLogger";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { LoginPage } from "../features/auth/components/LoginPage";
import { ProtectedRoute } from "../features/auth/components/ProtectedRoute";
import { PublicRoute } from "../features/auth/components/PublicRoute";
import { InactivityTracker } from "../components/InactivityTracker";

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
export const router = createBrowserRouter([
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
            index: true,
            element: <div>Welcome to Tostçu POS</div>, // Temporary placeholder
          },
          // Future protected routes will go here
        ],
      },
    ],
  },
  {
    path: "*",
    element: <div>404 Not Found</div>, // Temporary 404
  },
]);
