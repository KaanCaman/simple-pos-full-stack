
import { observer } from "mobx-react-lite";
import { useStore } from "../stores/rootStore";
import {
  X,
  AlertTriangle,
  AlertCircle,
  Info,
} from "lucide-react";

export const GlobalConfirmationDialog = observer(() => {
  const { uiStore } = useStore();
  const options = uiStore.confirmation;

  if (!options) return null;

  const handleConfirm = () => {
    options.onConfirm();
    uiStore.closeConfirmation();
  };

  const handleCancel = () => {
    if (options.onCancel) options.onCancel();
    uiStore.closeConfirmation();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={handleCancel}
      />
      <div className="relative w-full max-w-md bg-white dark:bg-[#1A1D1F] rounded-2xl shadow-2xl scale-100 opacity-100 transition-all transform border border-gray-100 dark:border-gray-800">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div
              className={`
              flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center
              ${
                !options.type || options.type === "danger"
                  ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                  : ""
              }
              ${
                options.type === "warning"
                  ? "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
                  : ""
              }
              ${
                options.type === "info"
                  ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                  : ""
              }
            `}
            >
              {(!options.type || options.type === "danger") && (
                <AlertTriangle className="w-6 h-6" />
              )}
              {options.type === "warning" && (
                <AlertCircle className="w-6 h-6" />
              )}
              {options.type === "info" && <Info className="w-6 h-6" />}
            </div>
            <div className="flex-1 pt-1">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-6">
                {options.title}
              </h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {options.message}
              </p>
            </div>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="mt-8 flex gap-3 justify-end">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors"
            >
              {options.cancelText || "İptal"}
            </button>
            <button
              onClick={handleConfirm}
              className={`
                px-4 py-2 text-sm font-medium text-white rounded-xl shadow-sm transition-colors
                ${
                  !options.type || options.type === "danger"
                    ? "bg-red-600 hover:bg-red-700"
                    : ""
                }
                ${
                  options.type === "warning"
                    ? "bg-orange-600 hover:bg-orange-700"
                    : ""
                }
                ${
                  options.type === "info" ? "bg-blue-600 hover:bg-blue-700" : ""
                }
              `}
            >
              {options.confirmText || "Onayla"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});
