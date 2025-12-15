import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import "./i18n";
import "./index.css";
import { appRoutes } from "./routes";
import { ThemeProvider } from "./providers/ThemeProvider";
import { AppConstants } from "./constants/app";
import i18n from "./i18n";

// Dynamic Title & Lang
document.title = AppConstants.APP_NAME;
document.documentElement.lang = i18n.language || "tr";

i18n.on("languageChanged", (lng) => {
  document.documentElement.lang = lng;
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
      <RouterProvider router={appRoutes} />
    </ThemeProvider>
  </StrictMode>
);
