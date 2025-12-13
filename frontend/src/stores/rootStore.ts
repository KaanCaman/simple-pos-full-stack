import { createContext, useContext } from "react";
import { AuthStore } from "../features/auth/stores/authStore";
import { TableStore } from "../features/dashboard/stores/tableStore";
import { CategoryStore } from "../features/dashboard/stores/categoryStore";
import { ProductStore } from "../features/dashboard/stores/productStore";
import { OrderStore } from "../features/dashboard/stores/orderStore"; // Added OrderStore import
import { UiStore } from "./uiStore";

// Root store for global state management.
// Küresel durum yönetimi için kök mağaza.
export class RootStore {
  authStore: AuthStore;
  tableStore: TableStore;
  categoryStore: CategoryStore;
  productStore: ProductStore;
  orderStore: OrderStore; // Added orderStore property
  uiStore: UiStore;

  constructor() {
    this.authStore = new AuthStore(this);
    this.tableStore = new TableStore(this);
    this.categoryStore = new CategoryStore(this);
    this.productStore = new ProductStore(this);
    this.orderStore = new OrderStore(this); // Initialized orderStore
    this.uiStore = new UiStore(this);
  }
}

// Create the root store instance
export const rootStore = new RootStore();

// Create a context for the RootStore.
// RootStore için bir bağlam oluşturun.
export const RootStoreContext = createContext<RootStore>(rootStore);

// Hook to use the RootStore.
// RootStore'u kullanmak için kanca.
export const useRootStore = () => {
  const context = useContext(RootStoreContext);
  if (context === null) {
    throw new Error("useRootStore must be used within a RootStoreProvider");
  }
  return context;
};

export const useStore = useRootStore;
