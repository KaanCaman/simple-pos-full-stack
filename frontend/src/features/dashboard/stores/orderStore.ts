import { makeAutoObservable, runInAction } from "mobx";
import { orderService } from "../services/orderService";
import type { Order } from "../../../types/operation";
import { toast } from "react-hot-toast";
import i18n from "../../../i18n";
import type { RootStore } from "../../../stores/rootStore";

export class OrderStore {
  currentOrder: Order | null = null;
  isLoading = false;
  error: string | null = null;

  rootStore: RootStore;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }

  get cartTotal() {
    if (!this.currentOrder?.items) return 0;
    return this.currentOrder.items.reduce(
      (sum, item) => sum + item.subtotal,
      0
    );
  }

  get itemCount() {
    return this.currentOrder?.items?.length || 0;
  }

  async loadOrder(orderId: number) {
    this.isLoading = true;
    this.error = null;
    try {
      const response = await orderService.getOrder(orderId);
      if (response.data.success && response.data.data) {
        runInAction(() => {
          this.currentOrder = response.data.data;
        });
      }
    } catch (error: any) {
      runInAction(() => {
        this.error = error.message || "Failed to load order";
        console.error("Load order error:", error);
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async createOrder(tableId: number, waiterId: number) {
    this.isLoading = true;
    try {
      const response = await orderService.createOrder({
        table_id: tableId,
        waiter_id: waiterId,
      });
      if (response.data.success && response.data.data) {
        runInAction(() => {
          this.currentOrder = response.data.data;
          if (!this.currentOrder.items) {
            this.currentOrder.items = [];
          }
        });
        return response.data.data;
      }
    } catch (error: any) {
      console.error("Create order failed", error);
      toast.error(i18n.t("errors.generic"));
      throw error;
    } finally {
      // Refresh table status (optimistic or fetch)
      if (this.rootStore && this.rootStore.tableStore) {
        this.rootStore.tableStore.fetchTables();
      }
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async addItem(productId: number, quantity: number = 1, note?: string) {
    if (!this.currentOrder) return;

    this.isLoading = true;
    try {
      const response = await orderService.addItem(this.currentOrder.id, {
        product_id: productId,
        quantity,
        note,
      });
      if (response.data.success && response.data.data) {
        // Refresh full order to ensure totals/taxes are synced with backend logic
        await this.loadOrder(this.currentOrder.id);
      }
    } catch (error) {
      toast.error(i18n.t("errors.generic"));
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async updateItemQuantity(itemId: number, quantity: number) {
    if (!this.currentOrder) return;
    this.isLoading = true;
    try {
      await orderService.updateItem(this.currentOrder.id, itemId, { quantity });
      await this.loadOrder(this.currentOrder.id);
    } catch (error) {
      toast.error(i18n.t("errors.generic"));
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async removeItem(itemId: number) {
    if (!this.currentOrder) return;
    this.isLoading = true;
    try {
      await orderService.removeItem(this.currentOrder.id, itemId);
      await this.loadOrder(this.currentOrder.id);
    } catch (error) {
      toast.error(i18n.t("errors.generic"));
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async closeOrder(paymentMethod: "CASH" | "CREDIT_CARD") {
    if (!this.currentOrder) return;

    // Capture table ID because currentOrder might be cleared or we need it logic
    const currentTableId = this.currentOrder.table_id;
    this.isLoading = true;

    try {
      await orderService.closeOrder(this.currentOrder.id, {
        payment_method: paymentMethod,
      });
      toast.success(i18n.t("pos.checkout_success"));

      // Refresh table status global
      if (this.rootStore && this.rootStore.tableStore) {
        this.rootStore.tableStore.fetchTables();
      }

      // Check for remaining orders on this table
      let stayedOnScreen = false;
      if (currentTableId) {
        try {
          const response = await orderService.getOrdersByTable(currentTableId);
          const remainingOrders =
            response.data.success && response.data.data
              ? response.data.data
              : [];

          if (remainingOrders.length > 0) {
            // Found other orders, load the first one
            await this.loadOrder(remainingOrders[0].id);
            stayedOnScreen = true;
          }
        } catch (fetchErr) {
          console.error("Failed to fetch remaining orders", fetchErr);
        }
      }

      // If we didn't switch to another order, go back to table selection
      if (!stayedOnScreen) {
        runInAction(() => {
          this.currentOrder = null;
        });
      }
    } catch (error) {
      toast.error(i18n.t("errors.generic"));
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async cancelOrder(orderId: number) {
    this.isLoading = true;
    // Capture details if we are cancelling the CURRENT order
    const isCurrentOrder = this.currentOrder?.id === orderId;
    const currentTableId = this.currentOrder?.table_id;

    try {
      await orderService.cancelOrder(orderId);
      toast.success(i18n.t("pos.order_cancelled")); // Ensure i18n key exists or use hardcoded if new

      // Refresh table status
      if (this.rootStore && this.rootStore.tableStore) {
        this.rootStore.tableStore.fetchTables();
      }

      if (isCurrentOrder) {
        let stayedOnScreen = false;
        if (currentTableId) {
          try {
            const response = await orderService.getOrdersByTable(
              currentTableId
            );
            const remainingOrders =
              response.data.success && response.data.data
                ? response.data.data
                : [];

            if (remainingOrders.length > 0) {
              await this.loadOrder(remainingOrders[0].id);
              stayedOnScreen = true;
            }
          } catch (e) {
            console.error("Failed to fetch remaining orders", e);
          }
        }

        if (!stayedOnScreen) {
          runInAction(() => {
            this.currentOrder = null;
          });
        }
      }
      // If we cancelled a NON-current order (e.g. from a list), we just stay where we are.
    } catch (error) {
      toast.error(i18n.t("errors.generic"));
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async fetchTableOrders(tableId: number): Promise<Order[]> {
    this.isLoading = true;
    try {
      const response = await orderService.getOrdersByTable(tableId);
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      // Silent fail or return empty if 404
      return [];
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  reset() {
    this.currentOrder = null;
    this.error = null;
    this.isLoading = false;
  }
}
