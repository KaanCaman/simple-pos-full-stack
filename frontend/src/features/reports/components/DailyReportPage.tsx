import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores/rootStore";
import { reportService, type DailyReport } from "../services/reportService";
import { orderService } from "../../dashboard/services/orderService";
import { expenseService } from "../../expenses/services/expenseService";
import { managementService } from "../../dashboard/services/managementService";
import type { Order } from "../../../types/operation";
import type { Transaction } from "../../../types/finance";
import { formatCurrency } from "../../../utils/format";
import { Tab } from "@headlessui/react";
import { useParams, useNavigate } from "react-router-dom";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  CreditCard,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Receipt,
  ArrowLeft,
} from "lucide-react";
import clsx from "clsx";
import { DailySalesChart } from "./charts/DailySalesChart";
import { IncomeExpenseChart } from "./charts/IncomeExpenseChart";
import { PaymentMethodChart } from "./charts/PaymentMethodChart";
import toast from "react-hot-toast";

export const DailyReportPage = observer(() => {
  const { t } = useTranslation();
  const { uiStore, authStore } = useStore();
  const { date } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState<DailyReport | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [expenses, setExpenses] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState<Set<number>>(new Set());

  // Check if we are viewing a past date (report mode) or current active day
  const isHistoryView = Boolean(date);

  useEffect(() => {
    loadData();
  }, [date]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Use provided date or default to today/current (Local Time)
      // NOTE: getDailyReport accepts YYYY-MM-DD
      let targetDateStr = date;
      if (!targetDateStr) {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");
        targetDateStr = `${year}-${month}-${day}`;
      }

      // Determine scope: period_XXX overrides everything.
      // If Today (no history view), use "active" scope to show Current Shift data.
      // If History Date View, use undefined scope (Date Range) for full day stats.
      const isPeriod = targetDateStr?.startsWith("period_");
      const effectiveScope = isPeriod
        ? targetDateStr
        : isHistoryView
        ? undefined
        : "active";

      const [reportRes, ordersRes, expensesRes] = await Promise.all([
        reportService.getDailyReport(targetDateStr || "", effectiveScope),
        orderService.getOrders(targetDateStr, undefined, effectiveScope),
        expenseService.getExpenses(targetDateStr, undefined, effectiveScope),
      ]);

      if (reportRes.data.success && reportRes.data.data)
        setReport(reportRes.data.data);
      if (ordersRes.data.success && ordersRes.data.data)
        setOrders(ordersRes.data.data);
      if (expensesRes.data.success && expensesRes.data.data)
        setExpenses(expensesRes.data.data);
    } catch (error) {
      console.error("General loading error", error);
      toast.error(t("reports.loading_error"));
    } finally {
      setLoading(false);
    }
  };

  const toggleOrderExpand = (id: number) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedOrders(newExpanded);
  };

  const handleEndDay = () => {
    uiStore.showConfirmation({
      title: t("reports.end_day_confirm_title"),
      message: t("reports.end_day_confirm_message"),
      confirmText: t("reports.end_day"),
      cancelText: t("common.cancel"),
      type: "danger",
      onConfirm: async () => {
        try {
          if (!authStore.user) return;

          await managementService.endDay(authStore.user.id);
          toast.success(t("reports.end_day_success"));

          // Refresh data or navigate to history
          // Calling loadData will fetch the now-finalized report
          loadData();

          // Also update auth store status if needed, though simple reload might be safer for full app state reset
          // But for SPA experience:
          authStore.checkAuth();
        } catch (e: any) {
          console.error(e);
          const message =
            e.response?.data?.message || e.message || "Gün kapatılamadı.";
          toast.error(message);
        }
        uiStore.closeConfirmation();
      },
    });
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500 dark:text-gray-400">
        {t("common.loading")}
      </div>
    );
  }

  if (!report) {
    // If report failed but we have other data, we might want to show partial UI.
    // However, the page structure relies heavily on report stats.
    // Let's explicitly style this message.
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          {t("reports.report_not_found")}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-md">
          {t("reports.report_not_found_desc")}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {t("reports.refresh")}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">
      {/* History Navigation */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-blue-500" />
            {isHistoryView ? t("reports.history_title") : t("reports.title")}
          </h1>
          <p className="text-gray-500 mt-1">
            {report
              ? new Date(report.report_date).toLocaleDateString("tr-TR", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : t("common.loading")}
          </p>
        </div>

        {isHistoryView ? (
          <button
            onClick={() => navigate("/reports/history")}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>{t("reports.back_to_list")}</span>
          </button>
        ) : (
          <button
            onClick={() => navigate("/reports/history")}
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
          >
            <Clock className="h-5 w-5" />
            <span>{t("reports.history_reports")}</span>
          </button>
        )}
      </div>
      {/* Header & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t("reports.stat_total_sales")}
          value={formatCurrency((report.total_sales || 0) / 100)}
          icon={<DollarSign className="h-6 w-6 text-green-500" />}
        />
        <StatCard
          title={t("reports.stat_cash_pos")}
          value={`${formatCurrency(
            (report.cash_sales || 0) / 100
          )} / ${formatCurrency((report.pos_sales || 0) / 100)}`}
          icon={<CreditCard className="h-6 w-6 text-blue-500" />}
        />
        <StatCard
          title={t("reports.stat_total_expenses")}
          value={formatCurrency((report.total_expenses || 0) / 100)}
          icon={<TrendingDown className="h-6 w-6 text-red-500" />}
        />
        <StatCard
          title={t("reports.stat_net_profit")}
          value={formatCurrency((report.net_profit || 0) / 100)}
          icon={<TrendingUp className="h-6 w-6 text-purple-500" />}
        />
      </div>

      {/* Charts */}
      {report && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <DailySalesChart orders={orders} />
          </div>
          <div className="space-y-6">
            <IncomeExpenseChart
              totalSales={report.total_sales || 0}
              totalExpenses={report.total_expenses || 0}
            />
            <PaymentMethodChart
              cashSales={report.cash_sales || 0}
              creditSales={report.pos_sales || 0}
            />
          </div>
        </div>
      )}

      {/* Tabs */}
      <Tab.Group>
        <Tab.List className="flex space-x-1 rounded-xl bg-gray-200 dark:bg-gray-800 p-1">
          {[t("reports.tab_orders"), t("reports.tab_expenses")].map(
            (category) => (
              <Tab
                key={category}
                className={({ selected }) =>
                  clsx(
                    "w-full rounded-lg py-2.5 text-sm font-medium leading-5",
                    "ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2",
                    selected
                      ? "bg-white dark:bg-gray-700 shadow text-blue-700 dark:text-blue-100"
                      : "text-gray-500 dark:text-gray-400 hover:bg-white/[0.12] hover:text-gray-700 dark:hover:text-gray-200"
                  )
                }
              >
                {category}
              </Tab>
            )
          )}
        </Tab.List>
        <Tab.Panels className="mt-4">
          {/* Orders Panel */}
          <Tab.Panel className="rounded-xl bg-white dark:bg-[#1A1D1F] p-4 shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="space-y-4">
              {orders.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  Bugün henüz sipariş yok.
                </p>
              ) : (
                orders.map((order) => (
                  <div
                    key={order.id}
                    className="border border-gray-100 dark:border-gray-800 rounded-lg overflow-hidden"
                  >
                    <div
                      onClick={() => toggleOrderExpand(order.id)}
                      className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors bg-white dark:bg-[#1A1D1F]"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={clsx(
                            "h-10 w-10 rounded-full flex items-center justify-center",
                            order.status === "COMPLETED"
                              ? "bg-green-100 text-green-600"
                              : "bg-yellow-100 text-yellow-600"
                          )}
                        >
                          {order.status === "COMPLETED" ? (
                            <TrendingUp className="h-5 w-5" />
                          ) : (
                            <Clock className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 dark:text-white">
                            #{order.order_number}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {formatCurrency((order.total_amount || 0) / 100)} •{" "}
                            {order.payment_method === "CREDIT_CARD"
                              ? "Kredi Kartı"
                              : "Nakit"}
                            {order.waiter && (
                              <span className="ml-2 text-gray-400">
                                • 👤 {order.waiter.name}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-400">
                          {new Date(order.created_at).toLocaleString("tr-TR", {
                            day: "2-digit",
                            month: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {expandedOrders.has(order.id) ? (
                          <ChevronUp className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {expandedOrders.has(order.id) && (
                      <div className="bg-gray-50 dark:bg-black/20 p-4 border-t border-gray-100 dark:border-gray-800">
                        <div className="space-y-2">
                          {order.items?.map((item) => (
                            <div
                              key={item.id}
                              className="flex justify-between text-sm"
                            >
                              <span className="text-gray-600 dark:text-gray-300">
                                {item.quantity}x {item.product_name}
                              </span>
                              <span className="font-medium text-gray-900 dark:text-white">
                                {formatCurrency((item.subtotal || 0) / 100)}
                              </span>
                            </div>
                          ))}
                          <div className="border-t border-gray-200 dark:border-gray-700 my-2 pt-2 flex justify-between font-bold">
                            <span>Toplam</span>
                            <span>
                              {formatCurrency((order.total_amount || 0) / 100)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </Tab.Panel>

          {/* Expenses Panel */}
          <Tab.Panel className="rounded-xl bg-white dark:bg-[#1A1D1F] p-4 shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {expenses.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  Bugün henüz gider yok.
                </p>
              ) : (
                expenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="py-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center text-red-500">
                        <Receipt className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {expense.description}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {expense.category}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-red-500">
                      -{formatCurrency((expense.amount || 0) / 100)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>

      {/* Danger Zone: End Day */}
      {!isHistoryView && authStore.user?.role === "admin" && (
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-bold text-red-500 mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            {t("reports.danger_zone")}
          </h3>
          <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-red-700 dark:text-red-400 mb-1">
                {t("reports.end_day")}
              </h4>
              <p className="text-sm text-red-600/80 dark:text-red-400/70">
                {t("reports.end_day_desc")}
              </p>
            </div>
            <button
              onClick={handleEndDay}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors whitespace-nowrap"
            >
              {t("reports.end_day")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white dark:bg-[#1A1D1F] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <span className="text-gray-500 text-sm font-medium">{title}</span>
        <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">{icon}</div>
      </div>
      <div className="flex items-baseline gap-2">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
          {value}
        </h3>
      </div>
    </div>
  );
}
