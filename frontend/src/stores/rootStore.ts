import { createContext, useContext } from "react";
import { AuthStore } from "../features/auth/stores/authStore";

// Root store for global state management.
// Küresel durum yönetimi için kök mağaza.
export class RootStore {
  authStore: AuthStore;

  constructor() {
    this.authStore = new AuthStore(this);
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
