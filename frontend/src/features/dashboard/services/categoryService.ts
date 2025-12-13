import { BaseService } from "../../../services/BaseService";
import type { ApiResponse } from "../../../types/api";
import type { Category, CreateCategoryRequest } from "../../../types/inventory";
import { AppEndPoints } from "../../../constants/app";

class CategoryService extends BaseService {
  constructor() {
    super("");
  }

  public async getCategories() {
    return this.get<ApiResponse<Category[]>>(AppEndPoints.API_V1.CATEGORIES);
  }

  public async createCategory(data: CreateCategoryRequest) {
    return this.post<ApiResponse<Category>>(
      AppEndPoints.API_V1.CATEGORIES,
      data
    );
  }

  public async updateCategory(
    id: number,
    data: Partial<CreateCategoryRequest>
  ) {
    return this.put<ApiResponse<Category>>(
      `${AppEndPoints.API_V1.CATEGORIES}/${id}`,
      data
    );
  }

  public async deleteCategory(id: number) {
    return this.delete<ApiResponse<null>>(
      `${AppEndPoints.API_V1.CATEGORIES}/${id}`
    );
  }
}

export const categoryService = new CategoryService();
