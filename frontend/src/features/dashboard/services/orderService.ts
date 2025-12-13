import { BaseService } from "../../../services/BaseService";
import type { ApiResponse } from "../../../types/api";
import type {
  Order,
  CreateOrderRequest,
  CloseOrderRequest,
  AddOrderItemRequest,
  UpdateOrderItemRequest,
  OrderItem,
} from "../../../types/operation";
import { AppEndPoints } from "../../../constants/app";

class OrderService extends BaseService {
  constructor() {
    super("");
  }

  // Orders are created via POST /orders (table_id, waiter_id)
  public async createOrder(data: CreateOrderRequest) {
    return this.post<ApiResponse<Order>>(AppEndPoints.API_V1.ORDERS, data);
  }

  public async closeOrder(id: number, data: CloseOrderRequest) {
    return this.post<ApiResponse<null>>(
      `${AppEndPoints.API_V1.ORDERS}/${id}/close`,
      data
    );
  }

  public async getOrder(id: number) {
    return this.get<ApiResponse<Order>>(`${AppEndPoints.API_V1.ORDERS}/${id}`);
  }

  public async addItem(orderId: number, data: AddOrderItemRequest) {
    return this.post<ApiResponse<OrderItem>>(
      `${AppEndPoints.API_V1.ORDERS}/${orderId}/items`,
      data
    );
  }

  // Update item quantity (PUT /orders/:id/items/:itemId)
  public async updateItem(
    orderId: number,
    itemId: number,
    data: UpdateOrderItemRequest
  ) {
    return this.put<ApiResponse<null>>(
      `${AppEndPoints.API_V1.ORDERS}/${orderId}/items/${itemId}`,
      data
    );
  }

  // Remove item (DELETE /orders/:id/items/:itemId)
  public async removeItem(orderId: number, itemId: number) {
    return this.delete<ApiResponse<null>>(
      `${AppEndPoints.API_V1.ORDERS}/${orderId}/items/${itemId}`
    );
  }

  public async getOrdersByTable(tableId: number) {
    return this.get<ApiResponse<Order[]>>(
      `${AppEndPoints.API_V1.ORDERS}/table/${tableId}`
    );
  }

  // Cancel order (DELETE /orders/:id)
  public async cancelOrder(id: number) {
    return this.delete<ApiResponse<null>>(
      `${AppEndPoints.API_V1.ORDERS}/${id}`
    );
  }

  // Get orders with date filter
  // Get orders with date filter
  public async getOrders(startDate?: string, endDate?: string, scope?: string) {
    return this.get<ApiResponse<Order[]>>(AppEndPoints.API_V1.ORDERS, {
      params: { start_date: startDate, end_date: endDate, scope },
    });
  }

  // Ideally we might want a getOrder details endpoint, but for now we might rely on initial creation or table management fetching orders.
  // The backend doesn't explicitly list GET /orders/:id in the snippet provided earlier, but we can assume how to get order details if needed.
  // Actually, TableService.listTables likely returns tables with current order info (maybe?).
  // Let's check Table interface in operation.ts: `current_order_id?: number`.
  // If we need to fetch the full order, we might need an endpoint.
  // In `routes.go`, I don't see `protected.Get("/orders/:id")`.
  // I only see `protected.Post("/orders", ...)` etc.
  // Check `tableHandler.ListTables`.
}

export const orderService = new OrderService();
