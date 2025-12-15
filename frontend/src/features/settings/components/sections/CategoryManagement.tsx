import { useState, useEffect } from "react";
import { observer } from "mobx-react-lite";
import {
  Plus,
  Edit2,
  Trash2,
  GripVertical,
  Check,
  Loader2,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import { useStore } from "../../../../stores/rootStore";
import type { Category } from "../../../../types/inventory";

const COLORS = [
  "bg-red-500",
  "bg-orange-500",
  "bg-amber-500",
  "bg-green-500",
  "bg-emerald-500",
  "bg-teal-500",
  "bg-cyan-500",
  "bg-blue-500",
  "bg-indigo-500",
  "bg-violet-500",
  "bg-purple-500",
  "bg-fuchsia-500",
  "bg-pink-500",
  "bg-rose-500",
];

export const CategoryManagement = observer(() => {
  const { t } = useTranslation();
  const { categoryStore, uiStore } = useStore();
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);

  useEffect(() => {
    categoryStore.fetchCategories();
  }, [categoryStore]);

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setSelectedColor(category.color || COLORS[0]);
    setShowModal(true);
  };

  const handleCreate = () => {
    setEditingCategory(null);
    setCategoryName("");
    setSelectedColor(COLORS[0]);
    setShowModal(true);
  };

  const handleSubmit = () => {
    if (!categoryName.trim()) return;

    const message = editingCategory
      ? t("settings.categories.confirm_update")
      : t("settings.categories.confirm_create");

    uiStore.showConfirmation({
      title: editingCategory
        ? t("settings.categories.edit_category")
        : t("settings.categories.add_category"),
      message,
      type: "info",
      onConfirm: async () => {
        try {
          if (editingCategory) {
            await categoryStore.updateCategory(editingCategory.id, {
              name: categoryName,
              color: selectedColor,
            });
            toast.success(t("settings.categories.update_success"));
          } else {
            await categoryStore.createCategory({
              name: categoryName,
              color: selectedColor,
              icon: "", // Icon selection can be added later
              sort_order: 0,
            });
            toast.success(t("settings.categories.create_success"));
          }
          setShowModal(false);
        } catch (error) {
          console.error("Category operation failed", error);
          toast.error(t("errors.generic"));
        }
      },
    });
  };

  const handleDelete = (id: number) => {
    uiStore.showConfirmation({
      title: t("common.delete"),
      message: t("settings.categories.confirm_delete"),
      type: "danger",
      confirmText: t("common.delete"),
      onConfirm: async () => {
        try {
          await categoryStore.deleteCategory(id);
          toast.success(t("settings.categories.delete_success"));
        } catch (error) {
          console.error("Delete failed", error);
          toast.error(t("errors.generic"));
        }
      },
    });
  };

  if (categoryStore.isLoading && !categoryStore.categories.length) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header Actions */}
      <button
        onClick={handleCreate}
        className="w-full py-3 bg-primary-500 hover:bg-primary-600 active:scale-[0.98] text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary-500/20 transition-all"
      >
        <Plus className="h-5 w-5" />
        <span>{t("settings.categories.add_category")}</span>
      </button>

      <div className="grid gap-3">
        {categoryStore.categories.map((cat) => (
          <div
            key={cat.id}
            className="bg-white dark:bg-[#1A1D1F] p-4 rounded-2xl border border-gray-200 dark:border-gray-800 flex items-center gap-4 group active:scale-[0.99] transition-transform"
          >
            <button className="cursor-move text-gray-300 hover:text-gray-500 p-2 -ml-2">
              <GripVertical className="h-6 w-6" />
            </button>

            <div
              className={`h-12 w-12 rounded-xl ${
                cat.color || "bg-gray-500"
              } flex items-center justify-center text-white font-bold text-xl shadow-sm`}
            >
              {cat.name[0]}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                {cat.name}
              </h3>
              <p className="text-sm text-gray-500">
                {t("settings.categories.products_count", {
                  count: cat.products?.length || 0,
                })}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(cat)}
                className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-gray-500 hover:text-primary-500 transition-colors"
              >
                <Edit2 className="h-5 w-5" />
              </button>
              <button
                onClick={() => handleDelete(cat.id)}
                className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-gray-500 hover:text-red-500 transition-colors"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}

        {!categoryStore.isLoading && categoryStore.categories.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            {t("common.no_data")}
          </div>
        )}
      </div>

      {/* Mobile-Friendly Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4">
          <div className="w-full sm:max-w-md bg-white dark:bg-[#1A1D1F] sm:rounded-2xl rounded-t-2xl p-6 space-y-6 animate-in slide-in-from-bottom duration-200">
            <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto sm:hidden mb-2" />

            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingCategory
                  ? t("settings.categories.edit_category")
                  : t("settings.categories.add_category")}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                {t("common.cancel")}
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {t("settings.categories.category_name")}
                </label>
                <input
                  type="text"
                  autoFocus
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-primary-500 text-base text-gray-900 dark:text-white"
                  placeholder={t("settings.categories.enter_category_name")}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("settings.categories.color_select")}
                </label>
                <div className="grid grid-cols-7 gap-3">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`aspect-square rounded-full ${color} flex items-center justify-center transition-transform hover:scale-110 ${
                        selectedColor === color
                          ? "ring-2 ring-offset-2 ring-gray-900 dark:ring-white scale-110"
                          : ""
                      }`}
                    >
                      {selectedColor === color && (
                        <Check className="w-4 h-4 text-white" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              className="w-full py-4 bg-primary-500 hover:bg-primary-600 active:scale-[0.98] text-white rounded-xl font-bold text-lg shadow-lg shadow-primary-500/20 transition-all"
            >
              {editingCategory ? t("common.save") : t("common.create")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
});
