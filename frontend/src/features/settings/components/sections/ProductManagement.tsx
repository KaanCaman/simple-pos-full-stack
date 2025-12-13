import { useState } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  MoreVertical,
} from "lucide-react";

type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: boolean;
};

const MOCK_PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Kaşarlı Tost",
    category: "Tostlar",
    price: 120.0,
    stock: true,
  },
  {
    id: 2,
    name: "Sucuklu Tost",
    category: "Tostlar",
    price: 140.0,
    stock: true,
  },
  { id: 3, name: "Ayran", category: "İçecekler", price: 20.0, stock: true },
  { id: 4, name: "Çay", category: "İçecekler", price: 10.0, stock: true },
  {
    id: 5,
    name: "Cheesecake",
    category: "Tatlılar",
    price: 95.0,
    stock: false,
  },
  { id: 6, name: "Kola", category: "İçecekler", price: 40.0, stock: true },
  { id: 7, name: "Su", category: "İçecekler", price: 10.0, stock: true },
];

export const ProductManagement = () => {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("Tüm Ürünler");

  // Get unique categories for filter tabs
  const categories = [
    "Tüm Ürünler",
    ...new Set(MOCK_PRODUCTS.map((p) => p.category)),
  ];

  const filteredProducts = MOCK_PRODUCTS.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      activeCategory === "Tüm Ürünler" || product.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-4">
      {/* Header Actions */}
      <div className="flex flex-col gap-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Ürün ara..."
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-[#1A1D1F] border border-gray-200 dark:border-gray-800 text-base focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm"
            />
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 bg-primary-500 hover:bg-primary-600 active:scale-95 text-white rounded-xl transition-all shadow-lg shadow-primary-500/20 flex items-center justify-center"
          >
            <Plus className="h-6 w-6" />
          </button>
        </div>

        {/* Categories Scroller */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                  : "bg-white dark:bg-[#1A1D1F] text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product List (Grid on Desktop, Cards on Mobile) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="bg-white dark:bg-[#1A1D1F] p-4 rounded-xl border border-gray-200 dark:border-gray-800 flex items-center gap-4 relative group active:scale-[0.98] transition-all"
          >
            {/* Color Indicator based on category (pseudo) */}
            <div
              className={`w-12 h-12 rounded-lg flex items-center justify-center text-lg font-bold
              ${
                product.category === "İçecekler"
                  ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                  : product.category === "Tostlar"
                  ? "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
                  : "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
              }`}
            >
              {product.name[0]}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-gray-900 dark:text-white truncate">
                  {product.name}
                </h3>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {product.category}
              </p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-bold text-primary-600 dark:text-primary-400">
                  ₺{product.price.toFixed(2)}
                </span>
                {!product.stock && (
                  <span className="text-[10px] bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 px-1.5 py-0.5 rounded">
                    Tükendi
                  </span>
                )}
              </div>
            </div>

            {/* Quick Actions (Visible on hover on desktop, always there or via menu on mobile) */}
            <div className="flex flex-col gap-1">
              <button className="p-2 text-gray-400 hover:text-primary-500 active:bg-gray-100 dark:active:bg-gray-800 rounded-lg">
                <Edit2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Responsive Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4">
          <div className="w-full sm:max-w-md bg-white dark:bg-[#1A1D1F] sm:rounded-2xl rounded-t-2xl p-6 space-y-6 animate-in slide-in-from-bottom duration-200">
            <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto sm:hidden mb-2" />

            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Yeni Ürün Ekle
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                İptal
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Ürün Adı
                </label>
                <input
                  type="text"
                  autoFocus
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-primary-500 text-base"
                  placeholder="Örn: Coca Cola"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Fiyat (₺)
                  </label>
                  <input
                    type="number"
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-primary-500 text-base"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Kategori
                  </label>
                  <select className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-primary-500 text-base appearance-none">
                    <option>İçecekler</option>
                    <option>Tostlar</option>
                    <option>Tatlılar</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <span className="font-medium text-gray-900 dark:text-white">
                  Stok Durumu
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                </label>
              </div>
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="w-full py-4 bg-primary-500 hover:bg-primary-600 active:scale-[0.98] text-white rounded-xl font-bold text-lg shadow-lg shadow-primary-500/20 transition-all"
            >
              Ürünü Kaydet
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
