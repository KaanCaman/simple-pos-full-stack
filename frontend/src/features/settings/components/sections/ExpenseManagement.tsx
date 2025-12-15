import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../stores/rootStore";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import { Plus, Trash2, Edit2, Search, Receipt } from "lucide-react";

import { ExpenseModal } from "../../../expenses/components/ExpenseModal";
import type { Transaction } from "../../../../types/finance";
import { formatCurrency } from "../../../../utils/format";

export const ExpenseManagement = observer(() => {
  const { t } = useTranslation();
  const { expenseStore, authStore, uiStore } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Transaction | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    expenseStore.loadExpenses();
  }, [expenseStore]);

  const handleEdit = (expense: Transaction) => {
    setEditingExpense(expense);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    uiStore.showConfirmation({
      title: t("settings.expenses.confirm_delete_title"),
      message: t("settings.expenses.confirm_delete"),
      confirmText: t("common.delete"),
      cancelText: t("common.cancel"),
      type: "danger",
      onConfirm: async () => {
        try {
          await expenseStore.deleteExpense(id);
          toast.success(t("settings.expenses.delete_success"));
          uiStore.closeConfirmation();
        } catch (error) {
          toast.error(t("errors.generic"));
        }
      },
    });
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingExpense(null);
  };

  const filteredExpenses = expenseStore.expenses.filter(
    (e) =>
      e.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isAdmin = authStore.user?.role === "admin";

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder={t("settings.expenses.search_placeholder")}
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearchTerm(e.target.value)
            }
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-[#1A1D1F] border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {isAdmin && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-colors"
          >
            <Plus className="h-5 w-5" />
            {t("settings.expenses.add_expense")}
          </button>
        )}
      </div>

      {/* List */}
      <div className="bg-white dark:bg-[#1A1D1F] rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        {expenseStore.isLoading ? (
          <div className="p-8 text-center text-gray-500">
            {t("common.loading")}
          </div>
        ) : filteredExpenses.length === 0 ? (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center gap-3">
            <Receipt className="h-12 w-12 opacity-20" />
            <p>{t("settings.expenses.empty_state")}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {filteredExpenses.map((expense) => (
              <div
                key={expense.id}
                className="p-4 flex items-center justify-between gap-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center text-red-500">
                    <Receipt className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {expense.description || t("settings.expenses.title")}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {expense.category} •{" "}
                      {new Date(expense.created_at).toLocaleDateString("tr-TR")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="font-bold text-red-500">
                    -{formatCurrency(expense.amount / 100)}
                  </span>

                  {isAdmin && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEdit(expense)}
                        className="p-2 text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(expense.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ExpenseModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        expenseToEdit={editingExpense}
      />
    </div>
  );
});
