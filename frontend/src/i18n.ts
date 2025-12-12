import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import tr from "./locales/tr.json";

// Initialize i18n configuration.
// i18n konfigürasyonunu başlat.
i18n.use(initReactI18next).init({
  resources: {
    tr: {
      translation: tr,
    },
  },
  lng: "tr", // Default language / Varsayılan dil
  fallbackLng: "tr",

  interpolation: {
    escapeValue: false, // React handles XSS capability / React XSS korumasını halleder
  },
});

export default i18n;
