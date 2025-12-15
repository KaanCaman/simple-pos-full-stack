import { makeObservable, observable, action, runInAction } from "mobx";
import { productService } from "../services/productService";
import type {
  Product,
  CreateProductRequest,
  UpdateProductRequest,
} from "../../../types/inventory";
import type { RootStore } from "../../../stores/rootStore";

export class ProductStore {
  @observable products: Product[] = [];
  @observable isLoading: boolean = false;
  @observable error: string | null = null;
  rootStore: RootStore;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeObservable(this);
  }

  @action
  async fetchProducts() {
    this.isLoading = true;
    this.error = null;
    try {
      const response = await productService.getProducts();
      console.log("RM ,:", response.data.data);
      runInAction(() => {
        this.products = response.data.data;
      });
    } catch (err: any) {
      runInAction(() => {
        this.error = "Failed to fetch products";
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  @action
  async createProduct(data: CreateProductRequest) {
    this.isLoading = true;
    try {
      await productService.createProduct(data);
      await this.fetchProducts();
    } catch (err: any) {
      throw err;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  @action
  async updateProduct(id: number, data: UpdateProductRequest) {
    this.isLoading = true;
    try {
      await productService.updateProduct(id, data);
      await this.fetchProducts();
    } catch (err: any) {
      throw err;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  @action
  async deleteProduct(id: number) {
    this.isLoading = true;
    try {
      await productService.deleteProduct(id);
      await this.fetchProducts();
    } catch (err: any) {
      throw err;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }
}
