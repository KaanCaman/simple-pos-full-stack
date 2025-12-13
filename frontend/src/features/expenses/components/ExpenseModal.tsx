import { useState, useEffect } from "react";
import { X, CreditCard, Banknote, Receipt } from "lucide-react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores/rootStore";
import type { Transaction } from "../../../types/finance";

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenseToEdit?: Transaction | null;
}

export const ExpenseModal = observer(
  ({ isOpen, onClose, expenseToEdit }: ExpenseModalProps) => {
    const { expenseStore } = useStore();
    const [lira, setLira] = useState("");
    const [kurus, setKurus] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("market");
    const [method, setMethod] = useState<"cash" | "card">("cash");

    useEffect(() => {
      if (isOpen && expenseToEdit) {
        // expenseToEdit.amount is in Kurus (integer)
        const totalKurus = expenseToEdit.amount;
        const liraPart = Math.floor(totalKurus / 100);
        const kurusPart = totalKurus % 100;

        setLira(liraPart.toString());
        setKurus(kurusPart.toString().padStart(2, "0")); // "5" -> "05", "50" -> "50"
        setDescription(expenseToEdit.description || "");
        setCategory(expenseToEdit.category || "market");
        setMethod(
          expenseToEdit.payment_method === "CREDIT_CARD" ? "card" : "cash"
        );
      } else if (isOpen && !expenseToEdit) {
        // Reset form
        setLira("");
        setKurus("");
        setDescription("");
        setCategory("market");
        setMethod("cash");
      }
    }, [isOpen, expenseToEdit]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!lira || !description) return;

      // Combine Lira and Kurus into a single float amount
      // Lira: "15", Kurus: "50" -> 15.50
      // Lira: "15", Kurus: "5"  -> 15.05 (if padded correctly)
      // Actually user types "5" -> 5 kurus or 50? Usually kurus field is 2 digits.
      // If user types "5", likely means 5 kurus (0.05). If they meant 50, they type 50.

      const safeLira = parseInt(lira) || 0;
      const safeKurus = parseInt(kurus) || 0;
      // We need to send this to store as a "TL" amount because expenseService multiplies by 100.
      // So 15 TL 50 Kurus -> 15.50
      const combinedAmount = safeLira + safeKurus / 100;

      const data = {
        amount: combinedAmount,
        description,
        category,
        payment_method: method,
      };

      if (expenseToEdit) {
        await expenseStore.updateExpense(expenseToEdit.id, data);
      } else {
        await expenseStore.createExpense(data);
      }

      // Clear and close
      setLira("");
      setKurus("");
      setDescription("");
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
                  {expenseToEdit ? "Gider Düzenle" : "Gider Ekle"}
                </h2>
                <p className="text-xs text-gray-500">
                  {expenseToEdit
                    ? "Mevcut gideri güncelle"
                    : "Kasadan çıkış yap"}
                </p>
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
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-gray-400">
                    ₺
                  </span>
                  <input
                    type="number"
                    value={lira}
                    onChange={(e) => setLira(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-red-500 text-lg font-bold text-gray-900 dark:text-white text-right"
                    placeholder="0"
                    autoFocus
                    min="0"
                    disabled={expenseStore.isLoading}
                  />
                </div>
                <span className="text-2xl font-bold text-gray-300">,</span>
                <div className="relative w-24">
                  <input
                    type="number"
                    value={kurus}
                    onChange={(e) => {
                      // Max 2 digits
                      if (e.target.value.length <= 2) {
                        setKurus(e.target.value);
                      }
                    }}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-red-500 text-lg font-bold text-gray-900 dark:text-white text-center"
                    placeholder="00"
                    min="0"
                    max="99"
                    disabled={expenseStore.isLoading}
                  />
                </div>
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
                  disabled={expenseStore.isLoading}
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
                  disabled={expenseStore.isLoading}
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
                disabled={expenseStore.isLoading}
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
                disabled={expenseStore.isLoading}
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
              disabled={expenseStore.isLoading}
              className="w-full py-4 bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black rounded-xl font-bold text-lg transition-colors shadow-xl disabled:opacity-50"
            >
              {expenseStore.isLoading
                ? "Kaydediliyor..."
                : expenseToEdit
                ? "Güncelle"
                : "Gider Kaydet"}
            </button>
          </form>
        </div>
      </div>
    );
  }
);
