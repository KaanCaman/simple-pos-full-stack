import { BaseService } from "../../../services/BaseService";
import type { ApiResponse } from "../../../types/api";
import type { LoginResponseData } from "../../../types/auth";
import { AppEndPoints } from "../../../constants/app";

class AuthService extends BaseService {
  constructor() {
    super(""); // Login is at root level /auth/login, not /api/v1
  }

  public async login(username: string, password: string) {
    return this.post<ApiResponse<LoginResponseData>>(AppEndPoints.AUTH.LOGIN, {
      username,
      password,
    });
  }

  public async me() {
    return this.get<ApiResponse<any>>(AppEndPoints.API_V1.ME);
  }
}

export const authService = new AuthService();
