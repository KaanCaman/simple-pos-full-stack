import { observer } from "mobx-react-lite";
import { Trash2, Plus, Minus, CreditCard, Banknote } from "lucide-react";

interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

interface OrderSummaryProps {
  items: OrderItem[];
  onUpdateQuantity: (id: number, delta: number) => void;
  onRemoveItem: (id: number) => void;
  onCloseOrder: (method: "cash" | "pos") => void;
}

export const OrderSummary = observer(
  ({
    items,
    onUpdateQuantity,
    onRemoveItem,
    onCloseOrder,
  }: OrderSummaryProps) => {
    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const tax = subtotal * 0.1; // 10% VAT example
    const total = subtotal + tax;

    return (
      <div className="flex flex-col h-full bg-white dark:bg-[#1A1D1F] border-l border-gray-200 dark:border-gray-800">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex justify-between items-center mb-1">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Masa 5 Siparişi
            </h2>
            <button
              onClick={() => onRemoveItem(0)} // Example usage or clear all
              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Sipariş #2941 • Garson: Ahmet Y.
          </p>
        </div>

        {/* Order List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <p>Sipariş henüz boş</p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl"
              >
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 dark:text-white">
                    {item.name}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    ₺{item.price.toFixed(2)}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-3 bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
                    <button
                      onClick={() => onUpdateQuantity(item.id, -1)}
                      className="p-1 hover:text-red-500 text-gray-600 dark:text-gray-300"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="text-sm font-bold w-4 text-center text-gray-900 dark:text-white">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(item.id, 1)}
                      className="p-1 hover:text-green-500 text-gray-600 dark:text-gray-300"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="text-right w-16">
                    <p className="font-bold text-gray-900 dark:text-white">
                      ₺{(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer / Totals */}
        <div className="p-6 bg-gray-50 dark:bg-gray-800/30 border-t border-gray-200 dark:border-gray-800">
          <div className="space-y-2 mb-6">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>Ara Toplam</span>
              <span>₺{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>KDV (%10)</span>
              <span>₺{tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-2xl font-bold text-gray-900 dark:text-white pt-2 border-t border-gray-200 dark:border-gray-700">
              <span>Genel Toplam</span>
              <span className="text-primary-500">₺{total.toFixed(2)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => onCloseOrder("cash")}
              className="flex flex-col items-center justify-center p-4 bg-primary-500 hover:bg-primary-600 text-white rounded-xl transition-colors shadow-lg shadow-primary-500/20"
            >
              <Banknote className="h-6 w-6 mb-1" />
              <span className="font-bold">NAKİT ÖDE</span>
            </button>
            <button
              onClick={() => onCloseOrder("pos")}
              className="flex flex-col items-center justify-center p-4 bg-gray-900 hover:bg-gray-800 text-white rounded-xl transition-colors dark:bg-black dark:border dark:border-gray-800"
            >
              <CreditCard className="h-6 w-6 mb-1" />
              <span className="font-bold">KART (POS)</span>
            </button>
          </div>
        </div>
      </div>
    );
  }
);
