import { useState } from "react";
import { useTranslation } from "react-i18next";
import { X, Percent, DollarSign, Check } from "lucide-react";

interface DiscountModalProps {
  onClose: () => void;
  onApply: (
    type: "PERCENTAGE" | "AMOUNT",
    value: number,
    reason: string
  ) => void;
  currentSubtotal: number; // To validate amount < subtotal
}

export const DiscountModal = ({
  onClose,
  onApply,
  currentSubtotal,
}: DiscountModalProps) => {
  const { t } = useTranslation();
  const [type, setType] = useState<"PERCENTAGE" | "AMOUNT">("PERCENTAGE");
  const [value, setValue] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numValue = parseFloat(value);

    if (isNaN(numValue) || numValue < 0) {
      setError(t("errors.invalid_input"));
      return;
    }

    if (type === "PERCENTAGE" && numValue > 100) {
      setError(t("errors.invalid_percent"));
      return;
    }

    if (type === "AMOUNT") {
      // value is in TL (e.g. 50), subtotal is in kurus (5000)
      // Convert input to kurus for comparison and storage
      const valKurus = Math.round(numValue * 100);
      if (valKurus > currentSubtotal) {
        setError(t("errors.discount_exceeds_total"));
        return;
      }
      onApply(type, valKurus, reason);
    } else {
      // Percentage stays as integer (10 -> 10%)
      onApply(type, Math.round(numValue), reason);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#1A1D1F] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {t("pos.add_discount", "İndirim Ekle")}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Type Selection */}
          <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
            <button
              type="button"
              onClick={() => setType("PERCENTAGE")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${
                type === "PERCENTAGE"
                  ? "bg-white dark:bg-gray-700 text-primary-500 shadow-sm"
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              <Percent className="w-4 h-4" />
              {t("pos.percentage", "Yüzde (%)")}
            </button>
            <button
              type="button"
              onClick={() => setType("AMOUNT")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${
                type === "AMOUNT"
                  ? "bg-white dark:bg-gray-700 text-primary-500 shadow-sm"
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              <DollarSign className="w-4 h-4" />
              {t("pos.amount", "Tutar (TL)")}
            </button>
          </div>

          {/* Value Input */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase">
              {type === "PERCENTAGE"
                ? t("pos.rate", "Oran")
                : t("pos.amount", "Tutar")}
            </label>
            <div className="relative">
              <input
                type="number"
                value={value}
                onChange={(e) => {
                  setValue(e.target.value);
                  setError(null);
                }}
                placeholder={type === "PERCENTAGE" ? "10" : "50.00"}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary-500 rounded-xl text-xl font-bold text-gray-900 dark:text-white outline-none transition-all placeholder:text-gray-300"
                autoFocus
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">
                {type === "PERCENTAGE" ? "%" : "₺"}
              </div>
            </div>
            {error && (
              <p className="text-sm text-red-500 font-medium">{error}</p>
            )}
          </div>

          {/* Reason Input */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase">
              {t("pos.reason", "Açıklama / Sebep")}
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t(
                "pos.reason_placeholder",
                "Örn: Personel İndirimi"
              )}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary-500 rounded-xl text-sm font-medium text-gray-900 dark:text-white outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={!value || !reason.trim()}
            className="w-full py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-bold shadow-lg shadow-primary-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Check className="w-5 h-5" />
            {t("common.apply", "Uygula")}
          </button>
        </form>
      </div>
    </div>
  );
};
