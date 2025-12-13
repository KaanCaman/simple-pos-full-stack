import { useState, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores/rootStore";
import { TableSelection, OrderInterface } from ".";
import { Loader2 } from "lucide-react";

export const POSPage = observer(() => {
  const { tableStore, orderStore, productStore, categoryStore } = useStore();
  const [view, setView] = useState<"tables" | "order">("tables");

  useEffect(() => {
    tableStore.fetchTables();
    productStore.fetchProducts();
    categoryStore.fetchCategories();
    return () => {
      orderStore.reset();
    };
  }, [tableStore, productStore, categoryStore, orderStore]);

  // If we have a current order, switch to order view automatically
  useEffect(() => {
    if (orderStore.currentOrder) {
      setView("order");
    } else {
      setView("tables");
    }
  }, [orderStore.currentOrder]);

  if (tableStore.isLoading && !tableStore.tables.length) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-[#111315]">
        <Loader2 className="h-12 w-12 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 dark:bg-[#111315] flex flex-col overflow-hidden">
      {/* Top Bar could go here if needed, or embedded in sub-components */}

      <div className="flex-1 overflow-hidden relative">
        {view === "tables" ? (
          <TableSelection />
        ) : (
          <OrderInterface
            onBack={() => {
              orderStore.reset(); // Clear order to go back to tables
            }}
          />
        )}
      </div>
    </div>
  );
});
