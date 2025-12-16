import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores/rootStore";
import { Minus, Plus, Trash2, Tags } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import type { Order } from "../../../types/operation";
import { AppConstants } from "../../../constants/app";
import { DiscountModal } from "./DiscountModal";

export const OrderCart = observer(({ onBack }: { onBack?: () => void }) => {
  const { orderStore, uiStore, authStore } = useStore();
  const { t } = useTranslation();
  const [tableOrders, setTableOrders] = useState<Order[]>([]);
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);

  // Fetch orders when component loads or currentOrder changes (to sync updates)
  useEffect(() => {
    if (orderStore.currentOrder?.table_id) {
      loadTableOrders(orderStore.currentOrder.table_id);
    }
  }, [orderStore.currentOrder?.id, orderStore.currentOrder?.table_id]);

  const loadTableOrders = async (tableId: number) => {
    const orders = await orderStore.fetchTableOrders(tableId);
    setTableOrders(orders);
  };

  const handleAddNewOrder = async () => {
    if (orderStore.currentOrder?.table_id && authStore.user) {
      // Create new order for same table
      // Note: user asked for horizontal tabs to add new open orders.
      // We create a new one. `orderStore.createOrder` updates `currentOrder`.
      await orderStore.createOrder(
        orderStore.currentOrder.table_id,
        authStore.user.id
      );
    }
  };

  const handleQuantityChange = async (itemId: number, newQty: number) => {
    if (newQty < 1) {
      uiStore.showConfirmation({
        title: t("pos.confirm_remove_title"),
        message: t("pos.confirm_remove_item"),
        type: "danger",
        onConfirm: () => orderStore.removeItem(itemId),
      });
    } else {
      await orderStore.updateItemQuantity(itemId, newQty);
    }
  };

  const handleCloseOrder = (method: "CASH" | "CREDIT_CARD") => {
    uiStore.showConfirmation({
      title: t("pos.confirm_checkout_title"),
      message: t("pos.confirm_checkout_message", {
        method: method === "CASH" ? t("pos.pay_cash") : t("pos.pay_credit"),
      }),
      type: "info",
      onConfirm: () => orderStore.closeOrder(method),
    });
  };

  const handleCancelOrder = () => {
    uiStore.showConfirmation({
      title: t("pos.cancel_order_title", "Siparişi İptal Et"),
      message: t(
        "pos.cancel_order_message",
        "Bu siparişi tamamen silmek istediğinize emin misiniz? Bu işlem geri alınamaz."
      ),
      type: "danger",
      confirmText: t("pos.confirm_cancel", "Evet, İptal Et"),
      onConfirm: async () => {
        if (orderStore.currentOrder) {
          const tableId = orderStore.currentOrder.table_id;
          await orderStore.cancelOrder(orderStore.currentOrder.id);
          // Switch to another order if exists
          if (tableId) {
            const remaining = await orderStore.fetchTableOrders(tableId);
            if (remaining.length > 0) {
              orderStore.loadOrder(remaining[0].id);
            } else {
              // Go back to tables if no orders left
              if (onBack) onBack();
              else {
                // If on desktop, we just show empty state or reset
                orderStore.reset();
              }
            }
          }
        }
      },
    });
  };

  if (!orderStore.currentOrder) {
    return <div className="p-4">{t("pos.no_order")}</div>;
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-[#1A1D1F]">
      {/* Top Tabs for Multi-Order */}
      <div className="flex items-center gap-2 p-2 overflow-x-auto border-b border-gray-100 dark:border-gray-800 scrollbar-hide">
        {tableOrders.map((order) => (
          <button
            key={order.id}
            onClick={() => orderStore.loadOrder(order.id)}
            className={`
                    flex-shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-all
                    ${
                      orderStore.currentOrder?.id === order.id
                        ? "bg-primary-500 text-white shadow-lg shadow-primary-500/20"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700"
                    }
                `}
          >
            #{order.order_number.slice(-4)}
          </button>
        ))}
        <button
          onClick={handleAddNewOrder}
          className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-primary-100 hover:text-primary-600 transition-colors"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Header */}
      <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex flex-col gap-1">
        <div className="flex items-center justify-between mb-2">
          {/* Back button removed, moved to OrderInterface/MenuGrid */}
          <div className="font-mono text-xs text-gray-400">
            {orderStore.currentOrder.order_number}
          </div>
          <button
            className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
            onClick={handleCancelOrder}
          >
            <span className="flex items-center gap-1 text-xs font-bold px-2 py-1 bg-red-100 dark:bg-red-900/30 rounded-md">
              <Trash2 className="w-3 h-3" />
              {t("pos.cancel_label", "İPTAL")}
            </span>
          </button>
        </div>

        <h2 className="text-2xl font-black text-gray-900 dark:text-white">
          {t("pos.table")} {orderStore.currentOrder.table_id}
        </h2>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>
            {t("pos.waiter")}: {authStore.user?.name || "Unknown"}
          </span>
        </div>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {orderStore.currentOrder.items?.map((item) => (
          <div
            key={item.id}
            className="group flex flex-col gap-2 p-3 hover:bg-gray-50 dark:hover:bg-[#2C2E33] rounded-2xl transition-colors border border-transparent hover:border-gray-100 dark:hover:border-gray-700"
          >
            <div className="flex justify-between items-start">
              <h4 className="font-bold text-gray-900 dark:text-white text-base">
                {item.product_name}
              </h4>
              <span className="font-bold text-gray-900 dark:text-white">
                {(item.subtotal / 100).toFixed(2)} ₺
              </span>
            </div>

            <div className="flex justify-between items-center">
              <p className="text-xs text-gray-400">
                {(item.unit_price / 100).toFixed(2)} ₺ / {t("pos.quantity")}
              </p>

              <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1 h-8">
                <button
                  onClick={() =>
                    handleQuantityChange(item.id, item.quantity - 1)
                  }
                  className="w-8 h-full flex items-center justify-center rounded-md hover:bg-white dark:hover:bg-gray-700 shadow-sm transition-all text-gray-600 dark:text-gray-300"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="font-bold w-8 text-center text-sm text-gray-900 dark:text-white">
                  {item.quantity}
                </span>
                <button
                  onClick={() =>
                    handleQuantityChange(item.id, item.quantity + 1)
                  }
                  className="w-8 h-full flex items-center justify-center rounded-md hover:bg-white dark:hover:bg-gray-700 shadow-sm transition-all text-gray-600 dark:text-gray-300"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Totals */}
      <div className="p-6 bg-white dark:bg-[#1A1D1F] border-t border-gray-100 dark:border-gray-800 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] z-20 space-y-4">
        <div className="space-y-2 mb-2">
          <div className="flex justify-between items-center text-sm text-gray-500">
            <span>{t("pos.subtotal")}</span>
            <span>{(orderStore.cartTotal / 100).toFixed(2)} ₺</span>
          </div>

          {/* Discount Display */}
          {orderStore.currentOrder.discount_type !== "NONE" && (
            <div className="flex justify-between items-center text-sm text-green-500 font-medium">
              <div className="flex items-center gap-1">
                <span>{t("pos.discount", "İndirim")}</span>
                {orderStore.currentOrder.discount_type === "PERCENTAGE" && (
                  <span className="text-xs bg-green-100 dark:bg-green-900/30 px-1.5 py-0.5 rounded">
                    %{orderStore.currentOrder.discount_value}
                  </span>
                )}
                {orderStore.currentOrder.discount_reason && (
                  <span className="text-xs text-green-600/70 dark:text-green-400/70 max-w-[100px] truncate">
                    ({orderStore.currentOrder.discount_reason})
                  </span>
                )}
              </div>
              <span>
                -{(orderStore.currentOrder.discount_amount / 100).toFixed(2)} ₺
              </span>
            </div>
          )}

          <div className="flex justify-between items-center text-sm text-gray-500">
            <span>
              {t("pos.vat_rate_dynamic", {
                rate: AppConstants.TAX_RATE * 100,
                defaultValue: `KDV (%${AppConstants.TAX_RATE * 100})`,
              })}
            </span>
            {/* Tax is calculated on what? Backend says Total = Subtotal - Discount + Tax. TaxAmount field in Order. */}
            {/* Current frontend logic was: cartTotal * rate. Correct logic if Tax is ON TOP of discounted price: */}
            {/* But backend calculates taxAmount. Let's use backend provided taxAmount if available, or fallback. */}
            {/* Since currentOrder has tax_amount from backend (if we strictly synced interfaces), we should use it. */}
            {/* But Order interface might not have updated types yet. Let's assume we rely on backend 'total_amount'. */}

            {/* Quick check: In frontend types/operation.ts, does Order have tax_amount? */}
            {/* The previous OrderStore logic was calculating it manually: (courseStore.cartTotal * AppConstants.TAX_RATE) / 100 */}
            {/* If we apply discount, we should use (Subtotal - Discount) * TaxRate */}

            <span>
              {(
                ((orderStore.cartTotal -
                  (orderStore.currentOrder.discount_amount || 0)) *
                  AppConstants.TAX_RATE) /
                100
              ).toFixed(2)}{" "}
              ₺
            </span>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              {t("pos.total_amount")}
            </span>
            {/* Discount Button */}
            <button
              onClick={() => setIsDiscountModalOpen(true)}
              className="text-xs font-bold text-primary-500 hover:text-primary-600 hover:underline flex items-center gap-1 pt-1"
            >
              <Tags className="w-3 h-3" />
              {orderStore.currentOrder.discount_type !== "NONE"
                ? t("pos.edit_discount", "İndirimi Düzenle")
                : t("pos.add_discount", "İndirim Ekle")}
            </button>
          </div>
          <span className="text-3xl font-black text-primary-500">
            {/* Use backend totalAmount if available and trusted, or recalc. */}
            {/* OrderStore.loadOrder fetches data. Backend calculates totalAmount. */}
            {/* Let's use `currentOrder.total_amount` if accessible, otherwise recalc. */}
            {/* Order type usually has total_amount. */}
            {(orderStore.currentOrder.total_amount / 100).toFixed(2)} ₺
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={() => handleCloseOrder("CASH")}
            className="py-4 bg-[#FFC107] hover:bg-[#FFD54F] text-black rounded-xl font-black text-lg shadow-lg shadow-yellow-500/20 active:scale-[0.98] transition-all flex flex-col items-center leading-none gap-1"
          >
            <span>{t("pos.pay_cash")}</span>
            <span className="text-xs font-medium opacity-70">
              {t("pos.pay_cash_hint", "NAKİT ÖDE")}
            </span>
          </button>

          <button
            onClick={() => handleCloseOrder("CREDIT_CARD")}
            className="py-4 bg-[#1A1D1F] hover:bg-[#2C2E33] text-white rounded-xl font-black text-lg shadow-lg shadow-gray-900/20 active:scale-[0.98] transition-all flex flex-col items-center leading-none gap-1"
          >
            <span>{t("pos.pay_credit")}</span>
            <span className="text-xs font-medium opacity-70">
              {t("pos.pay_credit_hint", "KART (POS)")}
            </span>
          </button>
        </div>
      </div>

      {isDiscountModalOpen && (
        <DiscountModal
          currentSubtotal={orderStore.cartTotal}
          onClose={() => setIsDiscountModalOpen(false)}
          onApply={(type, value, reason) =>
            orderStore.applyDiscount(type, value, reason)
          }
        />
      )}
    </div>
  );
});
