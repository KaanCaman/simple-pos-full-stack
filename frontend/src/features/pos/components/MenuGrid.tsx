import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores/rootStore";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Search } from "lucide-react";
import { AppConstants } from "../../../constants/app";

interface MenuGridProps {
  onBack?: () => void;
}

export const MenuGrid = observer(({ onBack }: MenuGridProps) => {
  const { productStore, categoryStore, orderStore } = useStore();
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState<number | "all">(
    "all"
  );
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProducts = productStore.products.filter((product) => {
    const matchSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchCategory =
      selectedCategory === "all" || product.category_id === selectedCategory;
    return matchSearch && matchCategory;
  });

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-[#111315]">
      {/* Header & Search */}
      <div className="p-4 bg-white dark:bg-[#1A1D1F] border-b border-gray-200 dark:border-gray-800 flex flex-col gap-4">
        {/* Top Bar with Back Button */}
        <div className="flex items-center gap-4">
          {onBack && (
            <button
              onClick={onBack}
              className="p-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors"
            >
              <span className="text-lg font-bold">←</span>
            </button>
          )}
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {orderStore.currentOrder
              ? `Masa ${orderStore.currentOrder.table_id}`
              : t("pos.menu")}
          </h2>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder={t("pos.search_placeholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-100 dark:bg-[#111315] border-none rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all text-gray-900 dark:text-white placeholder-gray-500"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-5 py-3 rounded-2xl text-sm font-bold whitespace-nowrap transition-all duration-200 ${
              selectedCategory === "all"
                ? "bg-gray-900 text-white dark:bg-white dark:text-black shadow-lg shadow-gray-900/10"
                : "bg-white dark:bg-[#2C2E33] text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-[#36383D]"
            }`}
          >
            {t("pos.all_categories")}
          </button>

          {categoryStore.categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-5 py-3 rounded-2xl text-sm font-bold whitespace-nowrap transition-all duration-200 ${
                selectedCategory === cat.id
                  ? "bg-gray-900 text-white dark:bg-white dark:text-black shadow-lg shadow-gray-900/10"
                  : "bg-white dark:bg-[#2C2E33] text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-[#36383D]"
              }`}
            >
              <div className="flex items-center gap-2">
                <span>{cat.icon || "🍽️"}</span>
                <span>{cat.name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {orderStore.currentOrder
              ? `Masa ${orderStore.currentOrder.table_id || "Seçimi"}`
              : t("pos.menu")}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {t("pos.select_product")}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            <button
              key={product.id}
              onClick={() => orderStore.addItem(product.id)}
              className="group relative flex flex-col p-4 rounded-3xl bg-white dark:bg-[#1A1D1F] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:shadow-primary-500/10 hover:border-primary-500 dark:hover:border-primary-500 transition-all duration-300 text-left overflow-hidden"
            >
              <div className="aspect-[4/3] rounded-2xl bg-gray-50 dark:bg-[#111315] mb-4 flex items-center justify-center text-3xl overflow-hidden relative">
                {/* Product Image or Placeholder */}
                {product.image_url ? (
                  <img
                    src={`${AppConstants.API_URL}${product.image_url}`}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <span className="text-gray-300 dark:text-gray-700 font-black text-4xl group-hover:scale-110 transition-transform">
                    {product.name[0]}
                  </span>
                )}

                {/* Add Button Overlay */}
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="bg-white dark:bg-black text-primary-500 p-2 rounded-full shadow-lg transform scale-50 group-hover:scale-100 transition-transform">
                    <span className="text-2xl font-bold">+</span>
                  </div>
                </div>
              </div>

              <div className="flex-1 flex flex-col">
                <h3 className="font-bold text-gray-900 dark:text-white text-base leading-tight mb-2 line-clamp-2">
                  {product.name}
                </h3>
                <div className="mt-auto flex items-end justify-between">
                  <span className="text-xs text-gray-400 line-through">
                    {/* Fake discount logic for visuals if needed, or remove */}
                  </span>
                  <span className="text-lg font-black text-gray-900 dark:text-white">
                    {(product.price / 100).toFixed(2)}{" "}
                    <span className="text-xs text-gray-400 font-normal">₺</span>
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
});
