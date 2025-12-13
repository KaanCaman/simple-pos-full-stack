import { useState } from "react";
import { Plus, Edit2, Trash2, GripVertical, Check } from "lucide-react";

const MOCK_CATEGORIES = [
  { id: 1, name: "Tostlar", color: "bg-orange-500", count: 12 },
  { id: 2, name: "İçecekler", color: "bg-blue-500", count: 8 },
  { id: 3, name: "Tatlılar", color: "bg-pink-500", count: 4 },
  { id: 4, name: "Extralar", color: "bg-green-500", count: 6 },
];

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

export const CategoryManagement = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);

  return (
    <div className="space-y-4">
      {/* Header Actions */}
      <button
        onClick={() => setShowModal(true)}
        className="w-full py-3 bg-primary-500 hover:bg-primary-600active:scale-[0.98] text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary-500/20 transition-all"
      >
        <Plus className="h-5 w-5" />
        <span>Yeni Kategori Ekle</span>
      </button>

      <div className="grid gap-3">
        {MOCK_CATEGORIES.map((cat) => (
          <div
            key={cat.id}
            className="bg-white dark:bg-[#1A1D1F] p-4 rounded-2xl border border-gray-200 dark:border-gray-800 flex items-center gap-4 group active:scale-[0.99] transition-transform"
          >
            <button className="cursor-move text-gray-300 hover:text-gray-500 p-2 -ml-2">
              <GripVertical className="h-6 w-6" />
            </button>

            <div
              className={`h-12 w-12 rounded-xl ${cat.color} flex items-center justify-center text-white font-bold text-xl shadow-sm`}
            >
              {cat.name[0]}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                {cat.name}
              </h3>
              <p className="text-sm text-gray-500">{cat.count} Ürün</p>
            </div>

            <div className="flex gap-2">
              <button className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-gray-500 hover:text-primary-500 transition-colors">
                <Edit2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile-Friendly Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4">
          <div className="w-full sm:max-w-md bg-white dark:bg-[#1A1D1F] sm:rounded-2xl rounded-t-2xl p-6 space-y-6 animate-in slide-in-from-bottom duration-200">
            <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto sm:hidden mb-2" />

            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Kategori Ekle
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
                  Kategori Adı
                </label>
                <input
                  type="text"
                  autoFocus
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-primary-500 text-base"
                  placeholder="Örn: Salatalar"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Renk Seçimi
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
              onClick={() => setShowModal(false)}
              className="w-full py-4 bg-primary-500 hover:bg-primary-600 active:scale-[0.98] text-white rounded-xl font-bold text-lg shadow-lg shadow-primary-500/20 transition-all"
            >
              Kategori Oluştur
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
