import { BaseService } from "../../../services/BaseService";
import { AppEndPoints } from "../../../constants/app";
import type { ApiResponse } from "../../../types/api";

// We need to match the backend DailyReport struct
export interface DailyReport {
  report_date: string;
  total_orders: number;
  total_sales: number;
  cash_sales: number;
  pos_sales: number;
  total_expenses: number;
  net_profit: number;
  updated_at: string;
}

export interface WorkPeriodHistory {
  id: number;
  start_time: string;
  end_time: string;
  total_sales: number;
  total_orders: number;
  total_expenses: number;
  net_profit: number;
}

class ReportService extends BaseService {
  constructor() {
    super("");
  }

  public async getDailyReport(date: string, scope?: string) {
    return this.get<ApiResponse<DailyReport>>(
      AppEndPoints.API_V1.ANALYTICS.DAILY,
      {
        params: { date, scope },
      }
    );
  }

  public async getReportHistory() {
    return this.get<ApiResponse<WorkPeriodHistory[]>>(
      `/api/v1/analytics/history`
    );
  }
}

export const reportService = new ReportService();
