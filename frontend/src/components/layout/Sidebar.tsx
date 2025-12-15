import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores/rootStore";
import { useTranslation } from "react-i18next";
import {
  History,
  Settings,
  UtensilsCrossed,
  FileText,
  X,
  LogOut,
} from "lucide-react";
import { AppConstants } from "../../constants/app";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar = observer(({ isOpen, onClose }: SidebarProps) => {
  const { t } = useTranslation();
  const store = useStore();
  const location = useLocation();
  // State to force re-render every minute for time calculation
  const [, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTick((t) => t + 1);
    }, 60000); // Check every minute
    return () => clearInterval(timer);
  }, []);

  const menuItems = [
    { icon: UtensilsCrossed, label: "dashboard.menu.pos", path: "/pos" },
    {
      icon: FileText,
      label: "dashboard.menu.daily_report",
      path: "/reports",
    },
    {
      icon: History,
      label: "dashboard.menu.history",
      path: "/reports/history",
    },
    { icon: Settings, label: "dashboard.menu.settings", path: "/settings" },
  ].filter((item) => {
    // Admin sees everything
    if (store.authStore.user?.role === "admin") return true;

    // Waiter only sees POS
    // Garson sadece POS (Masa/Sipariş) ekranını görür
    if (store.authStore.user?.role === "waiter") {
      return item.path === "/pos";
    }

    return false;
  });

  // Calculate if day has been open for more than 13 hours
  const isDayTooLong = () => {
    if (!store.authStore.isDayOpen || !store.authStore.dayStartTime)
      return false;
    const start = new Date(store.authStore.dayStartTime);
    const now = new Date();
    const diffInHours = (now.getTime() - start.getTime()) / (1000 * 60 * 60);
    return diffInHours > 13;
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-64 bg-white dark:bg-[#1A1D1F] border-r border-gray-200 dark:border-gray-800 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:block ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo Area */}
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500 text-white shadow-lg shadow-primary-500/20">
              <UtensilsCrossed className="h-6 w-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                {AppConstants.APP_NAME}
              </span>
              {store.authStore.isDayOpen && store.authStore.dayStartTime && (
                <div className="flex flex-col mt-0.5">
                  <span className="text-xs text-green-600 font-medium">
                    {t("dashboard.sidebar.day_started")}:{" "}
                    {new Date(store.authStore.dayStartTime).toLocaleString(
                      "tr-TR",
                      {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </span>
                  {isDayTooLong() && (
                    <span className="text-[10px] text-red-500 font-bold mt-1 animate-pulse">
                      {t("dashboard.sidebar.long_day_warning")}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 lg:hidden"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => onClose()} // Close sidebar on mobile on click
                className={`flex items-center space-x-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors duration-200 ${
                  isActive
                    ? "bg-primary-500 text-white shadow-lg shadow-primary-500/25"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-200"
                }`}
              >
                <Icon
                  className={`h-5 w-5 ${
                    isActive ? "text-white" : "text-gray-500 dark:text-gray-400"
                  }`}
                />
                <span>{t(item.label)}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1A1D1F]">
          <button
            onClick={() => store.authStore.logout()}
            className="flex w-full items-center space-x-3 rounded-xl px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>{t("auth.logout")}</span>
          </button>
        </div>
      </aside>
    </>
  );
});
