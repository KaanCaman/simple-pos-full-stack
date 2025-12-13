// Application constants.
// Uygulama sabitleri.

export class AppConstants {
  static readonly APP_VERSION = "0.0.1";
  static readonly APP_NAME = import.meta.env.VITE_APP_NAME || "APP NAME";
  static readonly API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:3000";
  static readonly IDLE_TIMEOUT =
    Number(import.meta.env.VITE_IDLE_TIMEOUT) || 15 * 60 * 1000; // 15 minutes
  static readonly TAX_RATE =
    import.meta.env.VITE_TAX_RATE !== undefined
      ? Number(import.meta.env.VITE_TAX_RATE)
      : 0;
}

export class AppEndPoints {
  static readonly AUTH = {
    LOGIN: "/auth/login",
  };

  static readonly API_V1 = {
    BASE: "/api/v1",
    CATEGORIES: "/api/v1/categories",
    PRODUCTS: "/api/v1/products",
    TABLES: "/api/v1/tables",
    ORDERS: "/api/v1/orders",
    USERS: "/api/v1/users",
    TRANSACTIONS: {
      EXPENSE: "/api/v1/transactions/expense",
    },
    MANAGEMENT: {
      BASE: "/api/v1/management",
      START_DAY: "/api/v1/management/start-day",
      END_DAY: "/api/v1/management/end-day",
      STATUS: "/api/v1/management/status",
    },
    ANALYTICS: {
      DAILY: "/api/v1/analytics/daily",
    },
  };
}
