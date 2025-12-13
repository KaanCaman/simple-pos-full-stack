import { makeAutoObservable, runInAction } from "mobx";
import { expenseService } from "../services/expenseService";
import type { CreateExpenseRequest } from "../services/expenseService";
import { toast } from "react-hot-toast";
import type { RootStore } from "../../../stores/rootStore";

import type { Transaction } from "../../../types/finance";

export class ExpenseStore {
  expenses: Transaction[] = [];
  isLoading = false;
  rootStore: RootStore;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }

  async loadExpenses(startDate?: string, endDate?: string) {
    this.isLoading = true;
    try {
      const response = await expenseService.getExpenses(startDate, endDate);
      if (response.data.success && response.data.data) {
        runInAction(() => {
          this.expenses = response.data.data!;
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("Giderler yüklenemedi");
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async createExpense(data: CreateExpenseRequest) {
    this.isLoading = true;
    try {
      const response = await expenseService.createExpense(data);
      if (response.data.success) {
        toast.success("Gider kaydedildi");
        // Reload list if we are viewing it
        await this.loadExpenses();
      }
      return response.data.data;
    } catch (error) {
      console.error(error);
      toast.error("Gider kaydedilemedi");
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async updateExpense(id: number, data: CreateExpenseRequest) {
    this.isLoading = true;
    try {
      const response = await expenseService.updateExpense(id, data);
      if (response.data.success) {
        toast.success("Gider güncellendi");
        await this.loadExpenses();
      }
    } catch (error) {
      console.error(error);
      toast.error("Gider güncellenemedi");
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async deleteExpense(id: number) {
    this.isLoading = true;
    try {
      const response = await expenseService.deleteExpense(id);
      if (response.data.success) {
        toast.success("Gider silindi");
        runInAction(() => {
          this.expenses = this.expenses.filter((e) => e.id !== id);
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("Gider silinemedi");
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }
}
