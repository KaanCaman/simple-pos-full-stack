import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { Menu, Search, Bell, Moon, Sun, User } from "lucide-react";
import { useRootStore } from "../../stores/rootStore";
import { useTheme } from "../../providers/ThemeProvider";

interface HeaderProps {
  onMenuClick: () => void;
  onAddExpense: () => void;
}

export const Header = observer(({ onMenuClick, onAddExpense }: HeaderProps) => {
  const { t } = useTranslation();
  const { authStore } = useRootStore();
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1A1D1F] px-6 transition-colors duration-300">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 lg:hidden"
        >
          <Menu className="h-6 w-6" />
        </button>

        {/* Page Title - Hidden on mobile if needed, or dynamic based on route */}
        <h1 className="text-xl font-bold text-gray-900 dark:text-white hidden sm:block">
          {AppConstants.APP_NAME}
        </h1>
      </div>

      {/* Center Search Bar - Hidden on small mobile */}
      <div className="hidden md:flex max-w-md w-full mx-4">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder={t("common.search")}
            className="block w-full rounded-2xl border-none bg-gray-100 dark:bg-gray-800 py-2.5 pl-10 pr-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Quick Expense */}
        <button
          onClick={onAddExpense}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/20 dark:hover:bg-red-900/30 dark:text-red-400 rounded-lg transition-colors text-sm font-bold"
        >
          <span>Gider Ekle</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </button>

        {/* Notifications */}
        <button className="relative rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-[#1A1D1F]" />
        </button>

        {/* User Profile */}
        <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 mx-1 hidden sm:block" />

        <div className="flex items-center gap-3 pl-1">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-gray-900 dark:text-white leading-none">
              {authStore.user?.name || authStore.user?.role || "User"}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {authStore.user?.role || "Staff"}
            </p>
          </div>
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 border-2 border-white dark:border-gray-700 shadow-sm overflow-hidden">
            {/* Use an icon if no avatar available */}
            <User className="h-6 w-6 text-gray-400" />
          </button>
        </div>
      </div>
    </header>
  );
});

import { AppConstants } from "../../constants/app";
