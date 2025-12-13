    import type { BaseEntity } from "./api";
import type { PaymentMethod } from "./operation";

export type TransactionType = "EXPENSE" | "INCOME";

export interface Transaction extends BaseEntity {
  type: TransactionType;
  category: string;
  description: string;
  payment_method: PaymentMethod;
  amount: number;
  order_id: number | null;
  work_period_id: number;
  created_by: number;
  transaction_date: string;
}

export interface CreateExpenseRequest {
  amount: number;
  category: string;
  description: string;
  payment_method: PaymentMethod;
  type: "expense";
}

export interface DailyReport {
  report_date: string; // YYYY-MM-DD
  total_orders: number;
  total_sales: number;
  cash_sales: number;
  pos_sales: number;
  total_expenses: number;
  net_profit: number;
  updated_at: string;
}

// Gün sonu yanıtı raporu bir obje içinde 'report' key'i ile dönüyor
export interface EndDayResponseData {
  report: DailyReport;
}
