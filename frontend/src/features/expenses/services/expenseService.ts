import { api as apiClient } from "../../../api/axios";
import { AppEndPoints } from "../../../constants/app";
import type { ApiResponse } from "../../../types/api";
import type { Transaction } from "../../../types/finance";

export interface CreateExpenseRequest {
  amount: number;
  description: string;
  category: string;
  payment_method: "cash" | "card";
}

class ExpenseService {
  async createExpense(data: CreateExpenseRequest) {
    const payload = {
      ...data,
      amount: data.amount * 100, // Convert to Kuruş
      payment_method: data.payment_method === "card" ? "CREDIT_CARD" : "CASH",
    };

    return apiClient.post<ApiResponse<Transaction>>(
      AppEndPoints.API_V1.TRANSACTIONS.EXPENSE,
      payload
    );
  }

  async getExpenses(startDate?: string, endDate?: string, scope?: string) {
    return apiClient.get<ApiResponse<Transaction[]>>(
      AppEndPoints.API_V1.TRANSACTIONS.EXPENSE,
      {
        params: { start_date: startDate, end_date: endDate, scope },
      }
    );
  }

  async updateExpense(id: number, data: CreateExpenseRequest) {
    // Backend expects same payload structure typically
    const payload = {
      ...data,
      amount: data.amount * 100,
      payment_method: data.payment_method === "card" ? "CREDIT_CARD" : "CASH",
    };
    return apiClient.put<ApiResponse<Transaction>>(
      `${AppEndPoints.API_V1.TRANSACTIONS.EXPENSE}/${id}`,
      payload
    );
  }

  async deleteExpense(id: number) {
    return apiClient.delete<ApiResponse<null>>(
      `${AppEndPoints.API_V1.TRANSACTIONS.EXPENSE}/${id}`
    );
  }
}

export const expenseService = new ExpenseService();
