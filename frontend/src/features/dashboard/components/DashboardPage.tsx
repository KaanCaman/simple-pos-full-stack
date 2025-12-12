import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { Store, Users, CheckCircle } from "lucide-react";
import { StatCard } from "./StatCard";
import { TableCard, type TableStatus } from "./TableCard";

// Mock Data for visualization
const MOCK_TABLES = [
  { id: "1", name: "MASA 1", status: "available" as TableStatus },
  { id: "2", name: "MASA 2", status: "available" as TableStatus },
  {
    id: "3",
    name: "MASA 3",
    status: "dining" as TableStatus,
    amount: 450.0,
    timeElapsed: "12m",
    guests: 4,
  },
  { id: "4", name: "MASA 4", status: "available" as TableStatus },
  {
    id: "5",
    name: "MASA 5",
    status: "dining" as TableStatus,
    amount: 120.5,
    timeElapsed: "5m",
    guests: 2,
  },
  { id: "6", name: "MASA 6", status: "available" as TableStatus },
  {
    id: "7",
    name: "MASA 7",
    status: "dining" as TableStatus,
    amount: 890.0,
    timeElapsed: "45m",
    guests: 6,
  },
  { id: "8", name: "MASA 8", status: "locked" as TableStatus },
  {
    id: "9",
    name: "MASA 9",
    status: "dining" as TableStatus,
    amount: 0.0,
    timeElapsed: "Just seated",
  },
  {
    id: "10",
    name: "MASA 10",
    status: "dining" as TableStatus,
    amount: 45.0,
    timeElapsed: "8m",
    guests: 1,
  },
];

export const DashboardPage = observer(() => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeFloor, setActiveFloor] = useState<"ground" | "terrace">(
    "ground"
  );

  return (
    <div className="space-y-8">
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="dashboard.stats.total_tables"
          value={20}
          icon={Store}
          variant="default"
        />
        <StatCard
          title="dashboard.stats.occupied"
          value={5}
          icon={Users}
          variant="active"
        />
        <StatCard
          title="dashboard.stats.available"
          value={15}
          icon={CheckCircle}
          variant="success"
        />
      </div>

      {/* Floor Overview Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <div className="w-2 h-6 bg-primary-500 rounded-full" />
          Floor Overview
        </h2>

        {/* Floor Toggle */}
        <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
          <button
            onClick={() => setActiveFloor("ground")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeFloor === "ground"
                ? "bg-white dark:bg-[#272B2E] text-gray-900 dark:text-white shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            }`}
          >
            {t("dashboard.floor.ground")}
          </button>
          <button
            onClick={() => setActiveFloor("terrace")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeFloor === "terrace"
                ? "bg-white dark:bg-[#272B2E] text-gray-900 dark:text-white shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            }`}
          >
            {t("dashboard.floor.terrace")}
          </button>
        </div>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        {MOCK_TABLES.map((table) => (
          <TableCard
            key={table.id}
            {...table}
            onClick={() => navigate(`/order/${table.id}`)}
          />
        ))}
      </div>
    </div>
  );
});
