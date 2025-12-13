import { makeObservable, observable, action, runInAction } from "mobx";
import { api } from "../../../api/axios";
import { managementService } from "../../dashboard/services/managementService";
import { authService } from "../services/authService";
import { RootStore } from "../../../stores/rootStore";
import { logger } from "../../../utils/logger";
import type { User, UserRole } from "../../../types/auth";

export class AuthStore {
  @observable user: User | null = null;
  @observable token: string | null = null;
  @observable isAuthenticated: boolean = false;
  @observable isLoading: boolean = false;
  @observable isInitializing: boolean = true;
  @observable error: string | null = null;

  @observable isDayOpen: boolean = false;

  rootStore: RootStore;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeObservable(this);
    this.loadToken();

    // Register callback to handle token expiry (401)
    api.setOnUnauthorized(() => {
      this.logout();
    });
  }

  // Load token from local storage on initialization.
  // Başlatma sırasında yerel depolamadan belirteci yükle.
  @action
  async loadToken() {
    this.isInitializing = true;
    const token = localStorage.getItem("token");

    if (token) {
      this.token = token;
      this.isAuthenticated = true;
      api.setToken(token);

      try {
        // Verify token and get fresh day status
        const response = await managementService.getDayStatus();
        const { data } = response.data;

        runInAction(() => {
          this.isDayOpen = data.is_day_open;
          // Optionally preserve persistence as fallback or just trust API
          localStorage.setItem("isDayOpen", String(data.is_day_open));
        });
      } catch (error) {
        // If status check fails (e.g. 401), logout
        logger.error("Failed to verify session status", { error }, "AuthStore");
        this.logout();
      } finally {
        runInAction(() => {
          this.isInitializing = false;
        });
      }
    } else {
      runInAction(() => {
        this.isInitializing = false;
      });
    }
  }

  @action
  async startDay() {
    if (!this.user?.id) return;
    this.isLoading = true;
    try {
      await managementService.startDay(this.user.id);
      runInAction(() => {
        this.isDayOpen = true;
        localStorage.setItem("isDayOpen", "true");
        logger.info("Day started", undefined, "AuthStore");
      });
    } catch (error) {
      logger.error("Failed to start day", { error }, "AuthStore");
      throw error;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  @action
  async endDay() {
    if (!this.user?.id) return;
    this.isLoading = true;
    try {
      await managementService.endDay(this.user.id);
      runInAction(() => {
        this.isDayOpen = false;
        localStorage.setItem("isDayOpen", "false");
        logger.info("Day ended", undefined, "AuthStore");
      });
    } catch (error) {
      logger.error("Failed to end day", { error }, "AuthStore");
      throw error;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  // Login action.
  // Giriş yapma eylemi.
  @action
  async login(username: string, password: string) {
    this.isLoading = true;
    this.error = null;
    try {
      const response = await authService.login(username, password);

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
        this.isDayOpen = data.is_day_open;
        if (data.is_day_open) {
          localStorage.setItem("isDayOpen", "true");
        } else {
          localStorage.setItem("isDayOpen", "false");
        }
        const tokenForApi = this.token || "";
        localStorage.setItem("token", tokenForApi);
        api.setToken(tokenForApi);
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
