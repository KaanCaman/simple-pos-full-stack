import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { Sun, AlertCircle } from "lucide-react";
import { useStore } from "../../../stores/rootStore";
import { useNavigate } from "react-router-dom";

export const StartDayPage = observer(() => {
  const { t } = useTranslation();
  const { authStore } = useStore();
  const navigate = useNavigate();

  const handleStartDay = async () => {
    try {
      await authStore.startDay();
      navigate("/");
    } catch (error) {
      console.error("Failed to start day:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 text-center space-y-6">
        <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto">
          <Sun className="w-10 h-10 text-amber-500" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {t("common.welcome")}
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            {t("day.start_day_message")}
          </p>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl flex items-start gap-3 text-left">
          <AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700 dark:text-blue-300">
            <p className="font-medium">{t("day.why_start_day_title")}</p>
            <p className="mt-1 opacity-90">{t("day.why_start_day_desc")}</p>
          </div>
        </div>

        <button
          onClick={handleStartDay}
          className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold py-4 rounded-xl shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <Sun className="w-5 h-5" />
          {t("day.start_day_button")}
        </button>
      </div>
    </div>
  );
});
