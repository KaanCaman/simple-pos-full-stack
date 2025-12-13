import { makeObservable, observable, action, runInAction } from "mobx";
import { api } from "../../../api/axios";
import { managementService } from "../../dashboard/services/managementService";
import { authService } from "../services/authService";
import type { RootStore } from "../../../stores/rootStore";
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
  @observable dayStartTime: string | null = null;

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
      this.isAuthenticated = true; // Optimistic
      api.setToken(token);

      try {
        // Fetch user details from API
        const response = await authService.me();
        const { data } = response.data;

        runInAction(() => {
          this.user = {
            id: data.userID,
            created_at: new Date().toISOString(), // Mock
            updated_at: new Date().toISOString(),
            deleted_at: null,
            name: data.name,
            role: data.role as UserRole,
            is_active: true,
          };
        });

        // Fetch current day status including start time
        try {
          const statusRes = await managementService.getDayStatus();
          if (statusRes.data.success && statusRes.data.data) {
            runInAction(() => {
              this.isDayOpen = statusRes.data.data.is_day_open;
              this.dayStartTime = statusRes.data.data.start_time || null;
              localStorage.setItem("isDayOpen", String(this.isDayOpen));
            });
          }
        } catch (e) {
          console.error("Failed to fetch day status", e);
        }
      } catch (error) {
        logger.error("Failed to restore session", { error }, "AuthStore");
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

      // Fetch status to get the exact server start time
      const statusRes = await managementService.getDayStatus();

      runInAction(() => {
        this.isDayOpen = true;
        if (statusRes.data.success && statusRes.data.data) {
          this.dayStartTime =
            statusRes.data.data.start_time || new Date().toISOString();
        } else {
          this.dayStartTime = new Date().toISOString(); // Fallback
        }
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
        this.dayStartTime = null;
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

      // Verify status to populate dayStartTime correctly if day is open
      if (data.is_day_open) {
        const statusRes = await managementService.getDayStatus();
        if (statusRes.data.success && statusRes.data.data) {
          runInAction(() => {
            this.dayStartTime = statusRes.data.data.start_time || null;
          });
        }
      }
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
  // Alias for manual re-checking of auth/session state
  @action
  async checkAuth() {
    return this.loadToken();
  }
}
