import { makeObservable, observable, action, runInAction } from "mobx";
import { categoryService } from "../services/categoryService";
import type { Category, CreateCategoryRequest } from "../../../types/inventory";
import { RootStore } from "../../../stores/rootStore";

export class CategoryStore {
  @observable categories: Category[] = [];
  @observable isLoading: boolean = false;
  @observable error: string | null = null;
  rootStore: RootStore;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeObservable(this);
  }

  @action
  async fetchCategories() {
    this.isLoading = true;
    this.error = null;
    try {
      const response = await categoryService.getCategories();
      runInAction(() => {
        this.categories = response.data.data;
      });
    } catch (err: any) {
      runInAction(() => {
        this.error = "Failed to fetch categories";
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  @action
  async createCategory(data: CreateCategoryRequest) {
    this.isLoading = true;
    try {
      await categoryService.createCategory(data);
      await this.fetchCategories();
    } catch (err: any) {
      throw err;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  @action
  async updateCategory(id: number, data: Partial<CreateCategoryRequest>) {
    this.isLoading = true;
    try {
      await categoryService.updateCategory(id, data);
      await this.fetchCategories();
    } catch (err: any) {
      throw err;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  @action
  async deleteCategory(id: number) {
    this.isLoading = true;
    try {
      await categoryService.deleteCategory(id);
      await this.fetchCategories();
    } catch (err: any) {
      throw err;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }
}
