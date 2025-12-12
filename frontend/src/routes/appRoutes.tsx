import { createBrowserRouter, Outlet } from "react-router-dom";
import { RouteLogger } from "../components/RouteLogger";
import { ErrorBoundary } from "../components/ErrorBoundary";

// Root layout component that includes global providers/components.
// Küresel sağlayıcıları/bileşenleri içeren kök düzen bileşeni.
const RootLayout = () => {
  return (
    <ErrorBoundary>
      <RouteLogger />
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
        index: true,
        element: <div>Welcome to Tostçu POS</div>, // Temporary placeholder
      },
      // Feature routes will be added here later.
      // Özellik rotaları daha sonra buraya eklenecek.
    ],
  },
  {
    path: "*",
    element: <div>404 Not Found</div>, // Temporary 404
  },
]);
