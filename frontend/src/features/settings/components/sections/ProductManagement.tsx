import { useState, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { Plus, Search, Edit2, Trash2, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import { useStore } from "../../../../stores/rootStore";
import type { Product } from "../../../../types/inventory";

export const ProductManagement = observer(() => {
  const { t } = useTranslation();
  const { productStore, categoryStore, uiStore } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<
    number | "all"
  >("all");

  // Form State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    categoryId: "",
    description: "",
  });

  useEffect(() => {
    productStore.fetchProducts();
    categoryStore.fetchCategories();
  }, [productStore, categoryStore]);

  // Filter products
  const filteredProducts = productStore.products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategoryFilter === "all" ||
      product.category_id === selectedCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: (product.price / 100).toString(), // Convert cents to lira
      categoryId: product.category_id.toString(),
      description: product.description || "",
    });
    setShowModal(true);
  };

  const handleCreate = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      price: "",
      categoryId: "",
      description: "",
    });
    setShowModal(true);
  };

  const handleSubmit = () => {
    if (!formData.name.trim() || !formData.price || !formData.categoryId) {
      toast.error(t("errors.generic")); // Improve validation feedback later
      return;
    }

    const priceInCents = Math.round(parseFloat(formData.price) * 100);
    const categoryId = parseInt(formData.categoryId);

    const message = editingProduct
      ? t("settings.products.confirm_update")
      : t("settings.products.confirm_create");

    uiStore.showConfirmation({
      title: editingProduct
        ? t("settings.products.edit_product")
        : t("settings.products.add_product"),
      message,
      type: "info",
      onConfirm: async () => {
        try {
          if (editingProduct) {
            await productStore.updateProduct(editingProduct.id, {
              name: formData.name,
              price: priceInCents,
              category_id: categoryId,
              description: formData.description,
            });
            toast.success(t("settings.products.update_success"));
          } else {
            await productStore.createProduct({
              name: formData.name,
              price: priceInCents,
              category_id: categoryId,
              description: formData.description,
            });
            toast.success(t("settings.products.create_success"));
          }
          setShowModal(false);
        } catch (error) {
          console.error("Product operation failed", error);
          toast.error(t("errors.generic"));
        }
      },
    });
  };

  const handleDelete = (id: number) => {
    uiStore.showConfirmation({
      title: t("common.delete"),
      message: t("settings.products.confirm_delete"),
      type: "danger",
      confirmText: t("common.delete"),
      onConfirm: async () => {
        try {
          await productStore.deleteProduct(id);
          toast.success(t("settings.products.delete_success"));
        } catch (error) {
          console.error("Delete failed", error);
          toast.error(t("errors.generic"));
        }
      },
    });
  };

  if (productStore.isLoading && !productStore.products.length) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t("common.search_placeholder")}
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-[#1A1D1F] border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          />
        </div>
        <button
          onClick={handleCreate}
          className="py-3 px-6 bg-primary-500 hover:bg-primary-600 active:scale-[0.98] text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary-500/20 transition-all shrink-0"
        >
          <Plus className="h-5 w-5" />
          <span className="hidden sm:inline">
            {t("settings.products.add_product")}
          </span>
          <span className="sm:hidden">{t("common.add")}</span>
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedCategoryFilter("all")}
          className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
            selectedCategoryFilter === "all"
              ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
              : "bg-white dark:bg-[#1A1D1F] text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800"
          }`}
        >
          {t("common.search")} (Tümü)
        </button>
        {categoryStore.categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategoryFilter(cat.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
              selectedCategoryFilter === cat.id
                ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                : "bg-white dark:bg-[#1A1D1F] text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Product List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="bg-white dark:bg-[#1A1D1F] p-4 rounded-2xl border border-gray-200 dark:border-gray-800 group"
          >
            <div className="flex items-start justify-between mb-3">
              <div
                className={`h-10 w-10 rounded-lg ${
                  product.category?.color || "bg-gray-500"
                } flex items-center justify-center text-white font-bold shadow-sm`}
              >
                {product.name[0]}
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleEdit(product)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500 hover:text-primary-500 transition-colors"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                {product.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-1">
                {product.description || "-"}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                  {product.category?.name || "Kategorisiz"}
                </span>
                <span className="font-bold text-primary-500">
                  {t("settings.products.currency")}
                  {(product.price / 100).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        ))}

        {!productStore.isLoading && filteredProducts.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
            {t("common.no_data")}
          </div>
        )}
      </div>

      {/* Mobile-Friendly Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4">
          <div className="w-full sm:max-w-lg bg-white dark:bg-[#1A1D1F] sm:rounded-2xl rounded-t-2xl p-6 space-y-6 animate-in slide-in-from-bottom duration-200 max-h-[90vh] overflow-y-auto">
            <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto sm:hidden mb-2" />

            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingProduct
                  ? t("settings.products.edit_product")
                  : t("settings.products.add_product")}
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
                  {t("settings.products.product_name")}
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-primary-500 text-base"
                  placeholder={t("settings.products.enter_product_name")}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {t("settings.products.price")}
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-primary-500 text-base"
                  placeholder={t("settings.products.enter_price")}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {t("settings.products.category")}
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) =>
                    setFormData({ ...formData, categoryId: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-primary-500 text-base"
                >
                  <option value="">
                    {t("settings.products.select_category")}
                  </option>
                  {categoryStore.categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {t("settings.products.description")}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-primary-500 text-base"
                  placeholder={t("settings.products.enter_description")}
                  rows={3}
                />
              </div>
            </div>

            <button
              onClick={handleSubmit}
              className="w-full py-4 bg-primary-500 hover:bg-primary-600 active:scale-[0.98] text-white rounded-xl font-bold text-lg shadow-lg shadow-primary-500/20 transition-all"
            >
              {editingProduct ? t("common.save") : t("common.create")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
});
