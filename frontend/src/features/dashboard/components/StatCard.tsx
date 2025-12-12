import type { LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  variant?: "default" | "active" | "warning" | "success";
}

export const StatCard = ({
  title,
  value,
  icon: Icon,
  variant = "default",
}: StatCardProps) => {
  const { t } = useTranslation();

  const getVariantClasses = () => {
    switch (variant) {
      case "active":
        return "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-500";
      case "success":
        return "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-500";
      case "warning":
        return "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-500";
      default:
        return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  return (
    <div className="bg-white dark:bg-[#1A1D1F] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center justify-between">
      <div>
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
          {t(title)}
        </h3>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">
          {value}
        </p>
      </div>
      <div className={`p-3 rounded-xl ${getVariantClasses()}`}>
        <Icon className="h-6 w-6" />
      </div>
    </div>
  );
};
