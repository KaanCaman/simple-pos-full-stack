import { observer } from "mobx-react-lite";

// Mock Data
export const MOCK_PRODUCTS = [
  { id: 1, categoryId: 1, name: "Kaşarlı Tost", price: 120.0, image: "🥪" },
  { id: 2, categoryId: 1, name: "Sucuklu Tost", price: 140.0, image: "🥪" },
  { id: 3, categoryId: 1, name: "Karışık Tost", price: 150.0, image: "🥪" },
  { id: 4, categoryId: 2, name: "Ayran", price: 20.0, image: "🥛" },
  { id: 5, categoryId: 2, name: "Çay", price: 10.0, image: "☕" },
  { id: 6, categoryId: 2, name: "Limonata", price: 25.0, image: "🍋" },
  { id: 7, categoryId: 3, name: "Cheesecake", price: 95.0, image: "🍰" },
  { id: 8, categoryId: 2, name: "Türk Kahvesi", price: 40.0, image: "☕" },
];

interface ProductGridProps {
  activeCategory: number;
  onProductClick: (product: any) => void;
}

export const ProductGrid = observer(
  ({ activeCategory, onProductClick }: ProductGridProps) => {
    const products = MOCK_PRODUCTS.filter(
      (p) => p.categoryId === activeCategory
    );

    return (
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 h-full content-start overflow-y-auto pb-20">
        {products.map((product) => (
          <button
            key={product.id}
            onClick={() => onProductClick(product)}
            className="group relative flex flex-col items-start justify-between h-40 p-4 bg-white dark:bg-[#1A1D1F] rounded-2xl border border-gray-200 dark:border-gray-800 transition-all duration-200 hover:shadow-lg hover:border-primary-500 dark:hover:border-primary-500 active:scale-95 text-left"
          >
            <div className="text-4xl mb-2 group-hover:scale-110 transition-transform duration-200">
              {product.image}
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white leading-tight">
                {product.name}
              </h3>
              <p className="text-primary-600 dark:text-primary-400 font-bold mt-1">
                ₺{product.price.toFixed(2)}
              </p>
            </div>
          </button>
        ))}
      </div>
    );
  }
);
