import { useState, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { Plus, Search, Edit2, Trash2, Loader2, Upload, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import { useStore } from "../../../../stores/rootStore";
import { api } from "../../../../api/axios";
import type { Product } from "../../../../types/inventory";
import { useRef } from "react";
import { AppConstants, AppEndPoints } from "../../../../constants/app";

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
    lira: "",
    kurus: "",
    categoryId: "",
    description: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      lira: Math.floor(product.price / 100).toString(),
      kurus: (product.price % 100).toString().padStart(2, "0"),
      categoryId: product.category_id.toString(),
      description: product.description || "",
    });
    setPreviewUrl(
      product.image_url ? `${AppConstants.API_URL}${product.image_url}` : null
    );
    setImageFile(null);
    setErrors({});
    setShowModal(true);
  };

  const handleCreate = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      lira: "",
      kurus: "",
      categoryId: "",
      description: "",
    });
    setPreviewUrl(null);
    setImageFile(null);
    setErrors({});
    setShowModal(true);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(t("errors.file_too_large"));
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast.error(t("errors.invalid_file_type"));
        return;
      }
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setErrors((prev) => ({ ...prev, image: "" }));
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = t("errors.required");
    if (!formData.categoryId) newErrors.categoryId = t("errors.required");
    if (!formData.lira) newErrors.price = t("errors.required");

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsUploading(true);
    let imageUrl = editingProduct?.image_url;

    try {
      if (imageFile) {
        const uploadFormData = new FormData();
        uploadFormData.append("image", imageFile);
        const response = await api.post<{ data: { url: string } }>(
          "/api/v1/uploads/product-image",
          uploadFormData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        imageUrl = response.data.data.url;
      } else if (previewUrl === null) {
        // If preview is cleared, remove image
        imageUrl = "";
      }

      const priceInCents =
        parseInt(formData.lira || "0") * 100 + parseInt(formData.kurus || "0");
      const categoryId = parseInt(formData.categoryId);

      if (editingProduct) {
        await productStore.updateProduct(editingProduct.id, {
          name: formData.name,
          price: priceInCents,
          category_id: categoryId,
          description: formData.description,
          image_url: imageUrl,
        });
        toast.success(t("settings.products.update_success"));
      } else {
        await productStore.createProduct({
          name: formData.name,
          price: priceInCents,
          category_id: categoryId,
          description: formData.description,
          image_url: imageUrl,
        });
        toast.success(t("settings.products.create_success"));
      }

      // Explicitly refresh lists to ensure UI is up to date
      await Promise.all([
        productStore.fetchProducts(),
        categoryStore.fetchCategories(),
      ]);

      setShowModal(false);
    } catch (error) {
      console.error("Product operation failed", error);
      toast.error(t("errors.generic"));
    } finally {
      setIsUploading(false);
    }
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

          await Promise.all([
            productStore.fetchProducts(),
            categoryStore.fetchCategories(),
          ]);

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
            placeholder={t("common.search")}
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-[#1A1D1F] border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-gray-900 dark:text-white"
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
                } flex items-center justify-center text-white font-bold shadow-sm overflow-hidden`}
              >
                {product.image_url ? (
                  <img
                    src={`${AppConstants.API_URL}${product.image_url}`}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  product.name[0]
                )}
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
              {/* Image Upload */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("settings.products.image")}
                </label>
                <div className="flex items-center gap-4">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative w-24 h-24 rounded-xl border-2 border-dashed flex items-center justify-center cursor-pointer overflow-hidden transition-colors ${
                      previewUrl
                        ? "border-primary-500 bg-gray-50 dark:bg-gray-800"
                        : "border-gray-300 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-500"
                    }`}
                  >
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-2">
                        <Upload className="w-6 h-6 mx-auto text-gray-400 mb-1" />
                        <span className="text-[10px] text-gray-500">
                          {t("common.upload")}
                        </span>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageSelect}
                    />
                  </div>
                  {previewUrl && (
                    <button
                      onClick={handleRemoveImage}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title={t("common.remove")}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
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
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-primary-500 text-base text-gray-900 dark:text-white"
                  placeholder={t("settings.products.enter_product_name")}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {t("settings.products.price")}
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-gray-400">
                      ₺
                    </span>
                    <input
                      type="number"
                      value={formData.lira}
                      onChange={(e) =>
                        setFormData({ ...formData, lira: e.target.value })
                      }
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-primary-500 text-lg font-bold text-gray-900 dark:text-white text-right placeholder-gray-400 dark:placeholder-gray-500"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                  <span className="text-2xl font-bold text-gray-300">,</span>
                  <div className="relative w-24">
                    <input
                      type="number"
                      value={formData.kurus}
                      onChange={(e) => {
                        if (e.target.value.length <= 2) {
                          setFormData({ ...formData, kurus: e.target.value });
                        }
                      }}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-primary-500 text-lg font-bold text-gray-900 dark:text-white text-center placeholder-gray-400 dark:placeholder-gray-500"
                      placeholder="00"
                      min="0"
                      max="99"
                    />
                  </div>
                </div>
                {errors.price && (
                  <p className="mt-1 text-sm text-red-500">{errors.price}</p>
                )}
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
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-primary-500 text-base text-gray-900 dark:text-white"
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
                {errors.categoryId && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.categoryId}
                  </p>
                )}
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
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-primary-500 text-base text-gray-900 dark:text-white"
                  placeholder={t("settings.products.enter_description")}
                  rows={3}
                />
              </div>
            </div>

            <button
              onClick={handleSubmit}
              className="w-full py-4 bg-primary-500 hover:bg-primary-600 active:scale-[0.98] text-white rounded-xl font-bold text-lg shadow-lg shadow-primary-500/20 transition-all"
            >
              {isUploading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="animate-spin h-5 w-5" />
                  <span>{t("common.processing")}</span>
                </div>
              ) : editingProduct ? (
                t("common.save")
              ) : (
                t("common.create")
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
});
