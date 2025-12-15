import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";

export const GeneralSettings = observer(() => {
  const { t, i18n } = useTranslation();

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("language", lang);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
          {t("settings.general_settings")}
        </h2>
        <p className="text-sm text-gray-500">
          {t("settings.general_settings_desc")}
        </p>
      </div>

      <div className="bg-white dark:bg-[#1A1D1F] rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">
                {t("settings.language")}
              </h3>
              <p className="text-sm text-gray-500">
                {t("settings.language_desc")}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => handleLanguageChange("tr")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                i18n.language === "tr"
                  ? "bg-primary-500 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              Türkçe
            </button>
            <button
              onClick={() => handleLanguageChange("en")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                i18n.language === "en"
                  ? "bg-primary-500 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              English
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});
