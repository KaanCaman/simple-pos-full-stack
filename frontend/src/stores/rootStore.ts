// Root store for global state management.
// Küresel durum yönetimi için kök mağaza.
export class RootStore {
  // Define feature stores here.
  // Özellik mağazalarını burada tanımlayın.
  // authStore: AuthStore;
  // posStore: PosStore;

  constructor() {
    // Initialize stores.
    // Mağazaları başlatın.
    // this.authStore = new AuthStore(this);
    // this.posStore = new PosStore(this);
  }
}

// Create a context for the RootStore.
// RootStore için bir bağlam oluşturun.
// export const RootStoreContext = createContext<RootStore | null>(null);

// Hook to use the RootStore.
// RootStore'u kullanmak için kanca.
// export const useRootStore = () => {
//   const context = useContext(RootStoreContext);
//   if (context === null) {
//     throw new Error('useRootStore must be used within a RootStoreProvider');
//   }
//   return context;
// };
