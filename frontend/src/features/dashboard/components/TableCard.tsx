import { useTranslation } from "react-i18next";
import { Clock, Lock, Utensils, Users } from "lucide-react";

export type TableStatus = "available" | "dining" | "locked";

interface TableCardProps {
  id: string;
  name: string;
  status: TableStatus;
  amount?: number;
  timeElapsed?: string;
  guests?: number;
  onClick?: () => void;
}

export const TableCard = ({
  name,
  status,
  amount,
  timeElapsed,
  guests,
  onClick,
}: TableCardProps) => {
  const { t } = useTranslation();

  const getStatusColor = () => {
    switch (status) {
      case "available":
        return "bg-white dark:bg-[#1A1D1F] border-gray-200 dark:border-gray-800";
      case "dining":
        return "bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800 ring-1 ring-amber-500/20";
      case "locked":
        return "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 opacity-60";
      default:
        return "bg-white dark:bg-[#1A1D1F]";
    }
  };

  return (
    <div
      onClick={onClick}
      className={`relative p-5 rounded-2xl border transition-all duration-200 cursor-pointer hover:shadow-md ${getStatusColor()}`}
    >
      <div className="flex justify-between items-start mb-4">
        <span className="text-lg font-bold text-gray-900 dark:text-white">
          {name}
        </span>

        <div className="flex items-center gap-2">
          {status === "dining" && (
            <div className="bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
              <Utensils className="h-3 w-3" />
              {t("dashboard.table_status.dining")}
            </div>
          )}

          {guests && (
            <div className="flex items-center gap-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-lg text-gray-600 dark:text-gray-300">
              <Users className="h-3 w-3" />
              <span>{guests}</span>
            </div>
          )}

          {status === "locked" && <Lock className="h-5 w-5 text-gray-400" />}
        </div>
      </div>

      <div className="space-y-3">
        {status === "dining" ? (
          <>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              ₺{amount?.toFixed(2)}
            </div>
            {timeElapsed && (
              <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-500 font-medium">
                <Clock className="h-4 w-4" />
                <span>{timeElapsed}</span>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <span>{t("dashboard.table_status.available")}</span>
          </div>
        )}
      </div>
    </div>
  );
};
