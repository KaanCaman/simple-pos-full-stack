import { observer } from "mobx-react-lite";

import { useStore } from "../../../stores/rootStore";
import { AppConstants } from "../../../constants/app";

interface ProductGridProps {
  activeCategory: number;
  onProductClick: (product: any) => void;
}

export const ProductGrid = observer(
  ({ activeCategory, onProductClick }: ProductGridProps) => {
    const { productStore } = useStore();

    // Sort products: availability first, then by name
    const products = productStore.products
      .filter((p) => activeCategory === 0 || p.category_id === activeCategory)
      .sort((a, b) => {
        if (a.is_available === b.is_available) {
          return a.name.localeCompare(b.name);
        }
        return a.is_available ? -1 : 1;
      });

    return (
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 h-full content-start overflow-y-auto pb-20">
        {products.map((product) => (
          <button
            key={product.id}
            onClick={() => onProductClick(product)}
            className={`group relative flex flex-col items-start justify-between h-40 p-4 rounded-2xl border transition-all duration-200 text-left overflow-hidden ${
              !product.is_available
                ? "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 opacity-60 cursor-not-allowed"
                : "bg-white dark:bg-[#1A1D1F] border-gray-200 dark:border-gray-800 hover:shadow-lg hover:border-primary-500 dark:hover:border-primary-500 active:scale-95"
            }`}
            disabled={!product.is_available}
          >
            <div className="flex-1 w-full flex items-center justify-center mb-2 overflow-hidden rounded-lg">
              {product.image_url ? (
                <img
                  src={`${AppConstants.API_URL}${product.image_url}`}
                  alt={product.name + "   Kaaşşşarraaars"}
                  className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-200"
                />
              ) : (
                <div className="text-4xl group-hover:scale-110 transition-transform duration-200">
                  📦
                </div>
              )}
            </div>
            <div className="w-full">
              <h3 className="font-bold text-gray-900 dark:text-white leading-tight line-clamp-2">
                {product.name}
              </h3>
              <p className="text-primary-600 dark:text-primary-400 font-bold mt-1">
                ₺{(product.price / 100).toFixed(2)}
              </p>
            </div>
          </button>
        ))}
      </div>
    );
  }
);
