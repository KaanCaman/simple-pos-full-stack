import type { User } from "./auth";
import type { BaseEntity } from "./api";

export type TableStatus = "available" | "occupied"; // Diğer durumlar eklenebilir
export type OrderStatus = "OPEN" | "CLOSED" | "CANCELLED" | "COMPLETED";
export type PaymentMethod = "CASH" | "CREDIT_CARD" | "";

export interface Table extends BaseEntity {
  name: string;
  status: TableStatus;
  current_order_id?: number;
  order_count?: number;
}

export interface CreateTableRequest {
  name: string;
}

export interface UpdateTableRequest {
  name: string;
}

export interface Order extends BaseEntity {
  order_number: string;
  work_period_id: number;
  table_id: number;
  waiter_id: number;
  status: OrderStatus;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  payment_method: PaymentMethod;
  completed_at: string | null;
  items?: OrderItem[]; // Response often includes items
  waiter?: User;
}

export interface CreateOrderRequest {
  table_id?: number;
  waiter_id: number;
}

export interface OrderItem extends BaseEntity {
  order_id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  note?: string;
}

export interface AddOrderItemRequest {
  product_id: number;
  quantity: number;
  note?: string;
}

export interface UpdateOrderItemRequest {
  quantity: number;
}

export interface CloseOrderRequest {
  payment_method: PaymentMethod;
}
