import { api } from "../../../api/axios";
import { AppEndPoints } from "../../../constants/app";

// Define local types if not compatible with auth types
export interface CreateUserPayload {
  name: string;
  pin: string;
  role: "admin" | "waiter";
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  code?: string;
}

export interface UserResponse {
  id: number;
  name: string;
  role: "admin" | "waiter";
  is_active: boolean;
}

class UserService {
  async getUsers() {
    return api.get<ApiResponse<UserResponse[]>>(AppEndPoints.API_V1.USERS);
  }

  async createUser(data: CreateUserPayload) {
    return api.post<ApiResponse<UserResponse>>(AppEndPoints.API_V1.USERS, data);
  }

  async updateUser(id: number, data: Partial<UserResponse>) {
    return api.put<ApiResponse<UserResponse>>(
      `${AppEndPoints.API_V1.USERS}/${id}`,
      data
    );
  }

  async deleteUser(id: number) {
    return api.delete<ApiResponse<null>>(`${AppEndPoints.API_V1.USERS}/${id}`);
  }

  async changePin(id: number, pin: string) {
    return api.put<ApiResponse<null>>(
      `${AppEndPoints.API_V1.USERS}/${id}/pin`,
      {
        pin,
      }
    );
  }
}

export const userService = new UserService();
