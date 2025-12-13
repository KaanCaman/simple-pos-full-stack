// Application constants.
// Uygulama sabitleri.

export class AppConstants {
  static readonly APP_VERSION = "0.0.1";
  static readonly APP_NAME = "755 Erzincan";
  static readonly API_URL = "http://localhost:3000"; // Trigger axios trailing slash handling manually if needed, or keep standard
  static readonly IDLE_TIMEOUT = 15 * 60 * 1000; // 15 minutes
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
