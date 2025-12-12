import { Link, useLocation } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  History,
  Settings,
  UtensilsCrossed,
  X,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar = observer(({ isOpen, onClose }: SidebarProps) => {
  const { t } = useTranslation();
  const location = useLocation();

  const menuItems = [
    { icon: LayoutDashboard, label: "dashboard.menu.dashboard", path: "/" },
    { icon: History, label: "dashboard.menu.history", path: "/history" },
    { icon: Settings, label: "dashboard.menu.settings", path: "/settings" },
  ];

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
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              Tostçu POS
            </span>
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
      </aside>
    </>
  );
});
