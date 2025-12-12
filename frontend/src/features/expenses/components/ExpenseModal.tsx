import { useState } from "react";
import { X, CreditCard, Banknote, Receipt } from "lucide-react";

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExpenseModal = ({ isOpen, onClose }: ExpenseModalProps) => {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("market");
  const [method, setMethod] = useState<"cash" | "card">("cash");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ amount, description, category, method });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-[#1A1D1F] w-full max-w-md rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center text-red-500">
              <Receipt className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Gider Ekle
              </h2>
              <p className="text-xs text-gray-500">Kasadan çıkış yap</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tutar
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-gray-400">
                ₺
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-red-500 text-lg font-bold text-gray-900 dark:text-white"
                placeholder="0.00"
                autoFocus
              />
            </div>
          </div>

          {/* Description & Category */}
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Açıklama
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-primary-500"
                placeholder="Örn: Bulaşık Deterjanı"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Kategori
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="market">Market</option>
                <option value="bill">Fatura</option>
                <option value="maintenance">Bakım/Onarım</option>
                <option value="salary">Personel/Maaş</option>
                <option value="other">Diğer</option>
              </select>
            </div>
          </div>

          {/* Payment Method */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setMethod("cash")}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                method === "cash"
                  ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"
                  : "border-transparent bg-gray-50 dark:bg-gray-800 text-gray-500"
              }`}
            >
              <Banknote className="h-6 w-6" />
              <span className="text-sm font-bold">Nakit</span>
            </button>
            <button
              type="button"
              onClick={() => setMethod("card")}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                method === "card"
                  ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400"
                  : "border-transparent bg-gray-50 dark:bg-gray-800 text-gray-500"
              }`}
            >
              <CreditCard className="h-6 w-6" />
              <span className="text-sm font-bold">Kredi Kartı</span>
            </button>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black rounded-xl font-bold text-lg transition-colors shadow-xl"
          >
            Gider Kaydet
          </button>
        </form>
      </div>
    </div>
  );
};
