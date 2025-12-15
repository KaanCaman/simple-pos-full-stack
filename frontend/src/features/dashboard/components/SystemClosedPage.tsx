import { observer } from "mobx-react-lite";
import { Lock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useStore } from "../../../stores/rootStore";

export const SystemClosedPage = observer(() => {
  const { t } = useTranslation();
  const { authStore } = useStore();

  const handleLogout = () => {
    authStore.logout();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 text-center space-y-6">
        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto">
          <Lock className="w-10 h-10 text-gray-400" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {t("day.system_closed")}
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            {t("day.contact_manager")}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium rounded-xl transition-colors"
        >
          {t("auth.logout")}
        </button>
      </div>
    </div>
  );
});
