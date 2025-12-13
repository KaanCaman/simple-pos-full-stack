import { createContext, useContext } from "react";
import { AuthStore } from "../features/auth/stores/authStore";
import { TableStore } from "../features/dashboard/stores/tableStore";
import { UiStore } from "./uiStore";

// Root store for global state management.
// Küresel durum yönetimi için kök mağaza.
export class RootStore {
  authStore: AuthStore;
  tableStore: TableStore;
  uiStore: UiStore;

  constructor() {
    this.authStore = new AuthStore(this);
    this.tableStore = new TableStore(this);
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
