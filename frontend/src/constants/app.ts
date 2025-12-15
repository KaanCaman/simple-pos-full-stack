// Application constants.
// Uygulama sabitleri.

export class AppConstants {
  static readonly APP_VERSION = __APP_VERSION__;
  static readonly APP_NAME = __APP_NAME__;
  static readonly API_URL = __API_URL__;
  static readonly IDLE_TIMEOUT = __IDLE_TIMEOUT__;
  static readonly TAX_RATE = __TAX_RATE__;
}

export class AppEndPoints {
  static readonly AUTH = {
    LOGIN: "/auth/login",
  };

  static readonly API_V1 = {
    BASE: "/api/v1",
    UPLOADS: {
      PRODUCT_IMAGE: "/uploads/product-image",
    },
    ME: "/api/v1/auth/me",
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
