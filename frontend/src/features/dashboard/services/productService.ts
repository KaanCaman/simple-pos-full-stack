import { BaseService } from "../../../services/BaseService";
import type { ApiResponse } from "../../../types/api";
import type {
  Product,
  CreateProductRequest,
  UpdateProductRequest,
} from "../../../types/inventory";
import { AppEndPoints } from "../../../constants/app";

class ProductService extends BaseService {
  constructor() {
    super("");
  }

  public async getProducts() {
    return this.get<ApiResponse<Product[]>>(AppEndPoints.API_V1.PRODUCTS);
  }

  public async createProduct(data: CreateProductRequest) {
    return this.post<ApiResponse<Product>>(AppEndPoints.API_V1.PRODUCTS, data);
  }

  public async updateProduct(id: number, data: UpdateProductRequest) {
    return this.put<ApiResponse<Product>>(
      `${AppEndPoints.API_V1.PRODUCTS}/${id}`,
      data
    );
  }

  public async deleteProduct(id: number) {
    return this.delete<ApiResponse<null>>(
      `${AppEndPoints.API_V1.PRODUCTS}/${id}`
    );
  }
}

export const productService = new ProductService();
