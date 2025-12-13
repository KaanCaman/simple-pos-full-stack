import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Calendar, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Mock Data
const MOCK_HISTORY = [
  {
    id: "2941",
    date: "12.10.2023 14:30",
    type: "order",
    table: "Masa 5",
    amount: 374.0,
    method: "Credit Card",
    status: "Completed",
  },
  {
    id: "2940",
    date: "12.10.2023 14:15",
    type: "expense",
    category: "Kitchen",
    description: "Tost Ekmeği",
    amount: -240.0,
    method: "Cash",
    status: "Completed",
  },
  {
    id: "2939",
    date: "12.10.2023 13:45",
    type: "order",
    table: "Masa 2",
    amount: 120.0,
    method: "Cash",
    status: "Completed",
  },
  {
    id: "2938",
    date: "12.10.2023 12:30",
    type: "order",
    table: "Masa 1",
    amount: 45.0,
    method: "Credit Card",
    status: "Completed",
  },
  {
    id: "2937",
    date: "12.10.2023 11:00",
    type: "expense",
    category: "Drinks",
    description: "Su Damacana",
    amount: -150.0,
    method: "Cash",
    status: "Completed",
  },
];

export const HistoryPage = observer(() => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors md:hidden"
          >
            <ArrowLeft className="h-6 w-6 text-gray-600 dark:text-gray-300" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t("dashboard.menu.history")}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {t("reports.history_subtitle")}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#1A1D1F] border border-gray-200 dark:border-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm font-medium text-gray-700 dark:text-gray-300">
            <Calendar className="h-4 w-4" />
            <span>{t("reports.today")}</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl transition-colors text-sm font-medium shadow-lg shadow-primary-500/20">
            <Download className="h-4 w-4" />
            <span>{t("reports.get_report")}</span>
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-[#1A1D1F] rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                  {t("reports.col_id")}
                </th>
                <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                  {t("reports.col_date")}
                </th>
                <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                  {t("reports.col_transaction")}
                </th>
                <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                  {t("reports.col_detail")}
                </th>
                <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                  {t("reports.col_payment")}
                </th>
                <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white text-right">
                  {t("reports.col_amount")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {MOCK_HISTORY.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
                >
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                    #{item.id}
                  </td>
                  <td className="px-6 py-4 text-gray-900 dark:text-white">
                    {item.date}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.type === "order"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                          : "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
                      }`}
                    >
                      {item.type === "order"
                        ? t("reports.type_order")
                        : t("reports.type_expense")}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-900 dark:text-white">
                    {item.type === "order"
                      ? item.table
                      : `${item.category} - ${item.description}`}
                  </td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                    {item.method}
                  </td>
                  <td
                    className={`px-6 py-4 font-bold text-right ${
                      item.amount < 0 ? "text-red-500" : "text-green-500"
                    }`}
                  >
                    {item.amount < 0 ? "-" : "+"}₺
                    {Math.abs(item.amount).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
});
