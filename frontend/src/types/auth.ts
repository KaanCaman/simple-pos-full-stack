import type { BaseEntity } from "./api";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponseData {
  token: string;
  role: string;
  userID: number;
  is_day_open: boolean;
  work_period_id?: number;
}

export interface WorkDayRequest {
  user_id: number;
}

export type UserRole = "admin" | "waiter";

export interface User extends BaseEntity {
  name: string;
  role: UserRole;
  is_active?: boolean;
}

export interface CreateUserRequest {
  name: string;
  pin: string;
  role: UserRole;
}

export interface UpdateUserRequest {
  name?: string;
  role?: UserRole;
  is_active?: boolean;
}

export interface UpdatePinRequest {
  pin: string;
}
