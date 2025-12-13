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

export interface DayStatus {
  is_day_open: boolean;
  work_period_id?: number;
}
