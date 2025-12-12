import { useState } from "react";
import { Plus, Edit2, Trash2, LayoutGrid } from "lucide-react";

const MOCK_TABLES = [
  { id: 1, name: "Masa 1", capacity: 4, zone: "Zemin Kat" },
  { id: 2, name: "Masa 2", capacity: 2, zone: "Zemin Kat" },
  { id: 3, name: "Bahçe 1", capacity: 6, zone: "Bahçe" },
  { id: 4, name: "Teras 1", capacity: 4, zone: "Teras" },
];

export const TableManagement = () => {
  const [tables] = useState(MOCK_TABLES);
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Masa Yönetimi
          </h2>
          <p className="text-sm text-gray-500">
            Masa düzenini ve bölgeleri yönetin
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl transition-colors font-medium"
        >
          <Plus className="h-4 w-4" />
          <span>Masa Ekle</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {tables.map((table) => (
          <div
            key={table.id}
            className="bg-white dark:bg-[#1A1D1F] p-4 rounded-2xl border border-gray-200 dark:border-gray-800 flex items-center justify-between group hover:border-primary-500 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center text-gray-500 dark:text-gray-400">
                <LayoutGrid className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">
                  {table.name}
                </h3>
                <p className="text-xs text-gray-500">
                  {table.zone} • {table.capacity} Kişilik
                </p>
              </div>
            </div>
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
              Yeni Masa Ekle
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Masa Adı
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Örn: Masa 5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Bölge
                </label>
                <select className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-primary-500">
                  <option>Zemin Kat</option>
                  <option>Teras</option>
                  <option>Bahçe</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Kapasite
                </label>
                <input
                  type="number"
                  className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-primary-500"
                  placeholder="4"
                />
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
