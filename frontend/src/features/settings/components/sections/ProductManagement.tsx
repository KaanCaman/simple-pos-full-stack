import { useState } from "react";
import { Plus, Edit2, Trash2, Search, Filter } from "lucide-react";

const MOCK_PRODUCTS = [
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
];

export const ProductManagement = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Ürün Yönetimi
          </h2>
          <p className="text-sm text-gray-500">
            Menü kalemlerini ve fiyatları yönetin
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl transition-colors font-medium"
        >
          <Plus className="h-4 w-4" />
          <span>Ürün Ekle</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Ürün ara..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white dark:bg-[#1A1D1F] border border-gray-200 dark:border-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <button className="px-3 py-2 bg-white dark:bg-[#1A1D1F] border border-gray-200 dark:border-gray-800 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-50">
          <Filter className="h-4 w-4" />
        </button>
      </div>

      {/* Product List */}
      <div className="bg-white dark:bg-[#1A1D1F] rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
            <tr>
              <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                Ürün Adı
              </th>
              <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                Kategori
              </th>
              <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                Fiyat
              </th>
              <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                Durum
              </th>
              <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white text-right">
                İşlemler
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {MOCK_PRODUCTS.map((product) => (
              <tr
                key={product.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
              >
                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                  {product.name}
                </td>
                <td className="px-6 py-4 text-gray-500">{product.category}</td>
                <td className="px-6 py-4 text-gray-900 dark:text-white">
                  ₺{product.price.toFixed(2)}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      product.stock
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                    }`}
                  >
                    {product.stock ? "Stokta" : "Tükendi"}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500 hover:text-primary-500 transition-colors">
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg text-gray-500 hover:text-red-500 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mock Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-[#1A1D1F] w-full max-w-md rounded-2xl p-6 space-y-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Ürün Ekle
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Ürün Adı
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Örn: Coca Cola"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Fiyat
                  </label>
                  <input
                    type="number"
                    className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-primary-500"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Kategori
                  </label>
                  <select className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-primary-500">
                    <option>İçecekler</option>
                    <option>Tostlar</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium"
              >
                İptal
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-xl font-medium"
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
