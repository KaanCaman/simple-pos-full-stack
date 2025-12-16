import { observer } from "mobx-react-lite";
import { OrderCart } from "./OrderCart";
import { MenuGrid } from "./MenuGrid";
import { useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { useStore } from "../../../stores/rootStore";
import { ShoppingBag, X } from "lucide-react";
import { useTranslation } from "react-i18next";

interface OrderInterfaceProps {
  onBack: () => void;
}

export const OrderInterface = observer(({ onBack }: OrderInterfaceProps) => {
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
  const { orderStore } = useStore();
  const { t } = useTranslation();

  return (
    <div className="h-full w-full overflow-hidden flex flex-col md:flex-row bg-gray-50 dark:bg-[#111315]">
      {/* Left: Menu Grid (Flex-1) */}
      <div className="flex-1 h-full overflow-hidden pb-20 md:pb-0 md:mr-[400px]">
        <MenuGrid onBack={onBack} />
      </div>

      {/* Mobile Cart Toggle Button (Floating Bottom Bar) */}
      <div className="md:hidden fixed bottom-4 left-4 right-4 z-30">
        <button
          onClick={() => setIsMobileCartOpen(true)}
          className="w-full bg-gray-900 dark:bg-white text-white dark:text-black p-4 rounded-2xl shadow-xl flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="bg-white/20 dark:bg-black/10 p-2 rounded-xl">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <div className="flex flex-col items-start">
              <span className="font-bold text-sm opacity-80">
                {t("pos.open_orders", "Sipariş Özeti")}
              </span>
              <span className="font-black text-lg">
                {(orderStore.cartTotal / 100).toFixed(2)} ₺
              </span>
            </div>
          </div>
          <span className="font-bold text-sm bg-white/20 dark:bg-black/10 px-3 py-1 rounded-lg">
            {t("dashboard.menu.pos")} &rarr;
          </span>
        </button>
      </div>

      {/* Right: Cart (Fixed width on desktop, buried on mobile unless toggled) */}
      <div className="hidden md:flex flex-col w-[400px] h-full border-l border-gray-200 dark:border-gray-800 shadow-xl z-20 bg-white dark:bg-[#1A1D1F] overflow-hidden fixed right-0 top-0">
        <OrderCart onBack={onBack} />
      </div>

      {/* Mobile Bottom Sheet for Cart */}
      <Transition show={isMobileCartOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50 md:hidden"
          onClose={() => setIsMobileCartOpen(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 flex items-end">
            <Transition.Child
              as={Fragment}
              enter="transform transition ease-in-out duration-300"
              enterFrom="translate-y-full"
              enterTo="translate-y-0"
              leave="transform transition ease-in-out duration-300"
              leaveFrom="translate-y-0"
              leaveTo="translate-y-full"
            >
              <Dialog.Panel className="w-full h-[90vh] bg-white dark:bg-[#1A1D1F] rounded-t-3xl shadow-2xl flex flex-col overflow-hidden">
                {/* Mobile Cart Header */}
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                    Sipariş Detayı
                  </h3>
                  <button
                    onClick={() => setIsMobileCartOpen(false)}
                    className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full"
                  >
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>

                {/* Re-use OrderCart content but fit for mobile height */}
                <div className="flex-1 overflow-hidden">
                  <OrderCart onBack={onBack} />
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
});
