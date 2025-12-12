import { makeObservable, observable, action, runInAction } from "mobx";
import { api } from "../../../api/axios";
import { RootStore } from "../../../stores/rootStore";
import { logger } from "../../../utils/logger";
import type { ApiResponse } from "../../../types/api";
import type { User, LoginResponseData, UserRole } from "../../../types/auth";

export class AuthStore {
  @observable user: User | null = null;
  @observable token: string | null = null;
  @observable isAuthenticated: boolean = false;
  @observable isLoading: boolean = false;
  @observable error: string | null = null;

  rootStore: RootStore;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeObservable(this);
    this.loadToken();
  }

  // Load token from local storage on initialization.
  // Başlatma sırasında yerel depolamadan belirteci yükle.
  @action
  loadToken() {
    const token = localStorage.getItem("token");
    if (token) {
      this.token = token;
      this.isAuthenticated = true;
      api.setToken(token);
    }
  }

  // Login action.
  // Giriş yapma eylemi.
  @action
  async login(username: string, password: string) {
    this.isLoading = true;
    this.error = null;
    try {
      const response = await api.post<ApiResponse<LoginResponseData>>(
        "/auth/login",
        { username, password }
      );

      const { data } = response.data;

      runInAction(() => {
        this.token = data.token;
        // Construct a partial User object since the API only returns role and token
        this.user = {
          id: data.userID,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          deleted_at: null,
          name: username,
          role: data.role as UserRole,
          is_active: true,
        };
        this.isAuthenticated = true;
        localStorage.setItem("token", this.token);
        api.setToken(this.token);
        logger.info("User logged in", { username }, "AuthStore");
      });
    } catch (err: any) {
      runInAction(() => {
        this.error =
          err.response?.data?.message || err.message || "Login failed";
        logger.error("Login failed", { error: this.error }, "AuthStore");
      });
      throw err;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  // Logout action.
  // Çıkış yapma eylemi.
  @action
  logout() {
    this.token = null;
    this.user = null;
    this.isAuthenticated = false;
    localStorage.removeItem("token");
    api.clearToken();
    logger.info("User logged out", undefined, "AuthStore");
  }
}
