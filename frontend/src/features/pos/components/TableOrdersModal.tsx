import React from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { useTranslation } from "react-i18next";
import type { Order } from "../../../types/operation";
import { Plus } from "lucide-react";

interface TableOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  tableName: string;
  onSelectOrder: (orderId: number) => void;
  onCreateNewOrder: () => void;
}

export const TableOrdersModal: React.FC<TableOrdersModalProps> = ({
  isOpen,
  onClose,
  orders,
  tableName,
  onSelectOrder,
  onCreateNewOrder,
}) => {
  const { t } = useTranslation();

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-[#1A1D1F] p-6 text-left align-middle shadow-xl transition-all border border-gray-100 dark:border-gray-800">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-bold leading-6 text-gray-900 dark:text-white mb-4"
                >
                  {tableName} - {t("pos.open_orders", "Açık Siparişler")}
                </Dialog.Title>

                <div className="mt-2 space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar">
                  {orders.map((order) => (
                    <button
                      key={order.id}
                      onClick={() => onSelectOrder(order.id)}
                      className="w-full flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-[#111315] hover:bg-gray-100 dark:hover:bg-[#2C2E33] border border-transparent hover:border-primary-500 transition-all group"
                    >
                      <div className="flex flex-col items-start gap-1">
                        <span className="font-bold text-gray-900 dark:text-white">
                          #{order.order_number}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(order.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-lg text-gray-900 dark:text-white">
                          {/* Calculate total manually or trust order.total_amount if backend provides it correctly updated */}
                          {order.total_amount
                            ? (order.total_amount / 100).toFixed(2)
                            : "0.00"}{" "}
                          ₺
                        </span>
                        <div className="text-primary-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          →
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <button
                    onClick={onCreateNewOrder}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary-500 px-4 py-3 text-sm font-bold text-white hover:bg-primary-600 transition-colors shadow-lg shadow-primary-500/20"
                  >
                    <Plus className="h-5 w-5" />
                    {t("pos.add_order")}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
