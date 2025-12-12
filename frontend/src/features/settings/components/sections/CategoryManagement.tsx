import { useState } from "react";
import { Plus, Edit2, Trash2, GripVertical } from "lucide-react";

const MOCK_CATEGORIES = [
  { id: 1, name: "Tostlar", color: "bg-orange-500", count: 12 },
  { id: 2, name: "İçecekler", color: "bg-blue-500", count: 8 },
  { id: 3, name: "Tatlılar", color: "bg-pink-500", count: 4 },
  { id: 4, name: "Extralar", color: "bg-green-500", count: 6 },
];

export const CategoryManagement = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Kategori Yönetimi
          </h2>
          <p className="text-sm text-gray-500">
            Menü kategorilerini düzenleyin
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl transition-colors font-medium"
        >
          <Plus className="h-4 w-4" />
          <span>Kategori Ekle</span>
        </button>
      </div>

      <div className="space-y-2">
        {MOCK_CATEGORIES.map((cat) => (
          <div
            key={cat.id}
            className="bg-white dark:bg-[#1A1D1F] p-4 rounded-xl border border-gray-200 dark:border-gray-800 flex items-center gap-4 group"
          >
            <button className="cursor-move text-gray-400 hover:text-gray-600">
              <GripVertical className="h-5 w-5" />
            </button>
            <div
              className={`h-10 w-10 rounded-lg ${cat.color} flex items-center justify-center text-white font-bold`}
            >
              {cat.name[0]}
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 dark:text-white">
                {cat.name}
              </h3>
              <p className="text-xs text-gray-500">{cat.count} Ürün</p>
            </div>
            <div className="flex gap-2">
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500 hover:text-primary-500 transition-colors">
                <Edit2 className="h-4 w-4" />
              </button>
              <button className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg text-gray-500 hover:text-red-500 transition-colors">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Mock Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-[#1A1D1F] w-full max-w-md rounded-2xl p-6 space-y-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Kategori Ekle
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Kategori Adı
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Örn: Salatalar"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Renk
                </label>
                <div className="flex gap-2">
                  {[
                    "bg-red-500",
                    "bg-blue-500",
                    "bg-green-500",
                    "bg-yellow-500",
                    "bg-purple-500",
                  ].map((color) => (
                    <button
                      key={color}
                      className={`h-8 w-8 rounded-full ${color} hover:scale-110 transition-transform`}
                    />
                  ))}
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
