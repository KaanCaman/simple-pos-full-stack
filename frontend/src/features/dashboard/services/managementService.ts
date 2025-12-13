import { BaseService } from "../../../services/BaseService";
import type { ApiResponse } from "../../../types/api";
import { AppEndPoints } from "../../../constants/app";
import type { DailyReport, DayStatus } from "../../../types/dashboard";

class ManagementService extends BaseService {
  constructor() {
    super("");
  }

  public async startDay(userId: number) {
    return this.post<ApiResponse<any>>(
      AppEndPoints.API_V1.MANAGEMENT.START_DAY,
      { user_id: userId }
    );
  }

  public async endDay(userId: number) {
    return this.post<ApiResponse<{ report: DailyReport }>>(
      AppEndPoints.API_V1.MANAGEMENT.END_DAY,
      {
        user_id: userId,
      }
    );
  }

  public async getDayStatus() {
    return this.get<ApiResponse<DayStatus>>(
      AppEndPoints.API_V1.MANAGEMENT.STATUS
    );
  }
}

export const managementService = new ManagementService();
