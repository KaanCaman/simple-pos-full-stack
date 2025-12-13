import { BaseService } from "../../../services/BaseService";
import type { ApiResponse } from "../../../types/api";
import { AppEndPoints } from "../../../constants/app";
import type {
  Table,
  CreateTableRequest,
  UpdateTableRequest,
} from "../../../types/operation";

class TableService extends BaseService {
  constructor() {
    super(AppEndPoints.API_V1.TABLES);
  }

  public async getTables() {
    return this.get<ApiResponse<Table[]>>("");
  }

  public async createTable(data: CreateTableRequest) {
    return this.post<ApiResponse<Table>>("", data);
  }

  public async updateTable(id: number, data: UpdateTableRequest) {
    return this.put<ApiResponse<Table>>(`/${id}`, data);
  }

  public async deleteTable(id: number) {
    return this.delete<ApiResponse<null>>(`/${id}`);
  }
}

export const tableService = new TableService();
