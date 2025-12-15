import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import tr from "./locales/tr.json";
import en from "./locales/en.json";

// Initialize i18n configuration.
// i18n konfigürasyonunu başlat.
i18n.use(initReactI18next).init({
  resources: {
    tr: {
      translation: tr,
    },
    en: {
      translation: en,
    },
  },
  lng: localStorage.getItem("language") || "tr", // Default language / Varsayılan dil
  fallbackLng: "tr",

  interpolation: {
    escapeValue: false, // React handles XSS capability / React XSS korumasını halleder
  },
});

export default i18n;
