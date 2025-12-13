import { useState, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { Plus, Edit2, Trash2, LayoutGrid, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import { useStore } from "../../../../stores/rootStore";
import type { Table } from "../../../../types/operation";

export const TableManagement = observer(() => {
  const { t } = useTranslation();
  const { tableStore, uiStore } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [tableName, setTableName] = useState("");

  useEffect(() => {
    tableStore.fetchTables();
  }, [tableStore]);

  const handleSubmit = () => {
    if (!tableName.trim()) return;

    const message = editingTable
      ? t("settings.tables.confirm_update")
      : t("settings.tables.confirm_create");

    uiStore.showConfirmation({
      title: editingTable
        ? t("settings.tables.edit_table")
        : t("settings.tables.add_table"),
      message,
      type: "info",
      onConfirm: async () => {
        try {
          if (editingTable) {
            await tableStore.updateTable(editingTable.id, { name: tableName });
            toast.success(t("settings.tables.update_success"));
          } else {
            await tableStore.createTable({ name: tableName });
            toast.success(t("settings.tables.create_success"));
          }
          setShowModal(false);
          setTableName("");
          setEditingTable(null);
        } catch (error) {
          console.error("Operation failed", error);
          toast.error(t("errors.generic"));
        }
      },
    });
  };

  const handleEdit = (table: Table) => {
    setEditingTable(table);
    setTableName(table.name);
    setShowModal(true);
  };

  const handleDelete = (id: number) => {
    uiStore.showConfirmation({
      title: t("common.delete"),
      message: t("settings.tables.confirm_delete"),
      type: "danger",
      confirmText: t("common.delete"),
      onConfirm: async () => {
        try {
          await tableStore.deleteTable(id);
          toast.success(t("settings.tables.delete_success"));
        } catch (error) {
          console.error("Delete failed", error);
          toast.error(t("errors.generic"));
        }
      },
    });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTable(null);
    setTableName("");
  };

  if (tableStore.isLoading && tableStore.tables.length === 0) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            {t("settings.tables.title")}
          </h2>
          <p className="text-sm text-gray-500">{t("settings.tables.desc")}</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl transition-colors font-medium"
        >
          <Plus className="h-4 w-4" />
          <span>{t("settings.tables.add_table")}</span>
        </button>
      </div>

      {tableStore.error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl">
          {tableStore.error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {tableStore.tables.map((table) => (
          <div
            key={table.id}
            className="bg-white dark:bg-[#1A1D1F] p-4 rounded-2xl border border-gray-200 dark:border-gray-800 flex items-center justify-between group hover:border-primary-500 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center text-gray-500 dark:text-gray-400">
                <LayoutGrid className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">
                  {table.name}
                </h3>
                <p className="text-xs text-gray-500">
                  {table.status === "occupied" ? (
                    <span className="text-red-500">
                      {t("settings.tables.occupied")}
                    </span>
                  ) : (
                    <span className="text-green-500">
                      {t("settings.tables.empty")}
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => handleEdit(table)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500 hover:text-primary-500 transition-colors"
                title={t("common.edit")}
              >
                <Edit2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDelete(table.id)}
                className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg text-gray-500 hover:text-red-500 transition-colors"
                title={t("common.delete")}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}

        {tableStore.tables.length === 0 && !tableStore.isLoading && (
          <div className="col-span-full text-center py-12 text-gray-500">
            {t("settings.tables.empty_state")}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-[#1A1D1F] w-full max-w-md rounded-2xl p-6 space-y-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {editingTable
                ? t("settings.tables.edit_table")
                : t("settings.tables.add_table")}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("settings.tables.table_name")}
                </label>
                <input
                  type="text"
                  value={tableName}
                  onChange={(e) => setTableName(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
                  placeholder="Örn: Masa 5"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleCloseModal}
                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium"
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={handleSubmit}
                disabled={tableStore.isLoading}
                className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-xl font-medium disabled:opacity-50"
              >
                {tableStore.isLoading ? t("common.loading") : t("common.save")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
