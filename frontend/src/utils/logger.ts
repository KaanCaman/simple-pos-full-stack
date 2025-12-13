// Log levels.
// Günlük seviyeleri.
export type LogLevel = "info" | "warn" | "error" | "debug";

// Log entry structure.
// Günlük girdisi yapısı.
export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
  context?: string; // e.g., 'AuthService', 'ApiClient'
}

// Logger class for handling application logs.
// Uygulama günlüklerini işlemek için Logger sınıfı.
class Logger {
  private static instance: Logger;

  private constructor() {}

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private formatEntry(
    level: LogLevel,
    message: string,
    data?: any,
    context?: string
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      context,
    };
  }

  private print(entry: LogEntry) {
    // In the future, this can be replaced with a call to a backend logging service.
    // Gelecekte, bu bir arka uç loglama servisine yapılan çağrı ile değiştirilebilir.

    const style = this.getStyle(entry.level);
    console.log(
      `%c[${entry.timestamp}] [${entry.level.toUpperCase()}]${
        entry.context ? ` [${entry.context}]` : ""
      }: ${entry.message}`,
      style,
      entry.data || ""
    );
  }

  private getStyle(level: LogLevel): string {
    switch (level) {
      case "info":
        return "color: #3B82F6; font-weight: bold;"; // Blue
      case "warn":
        return "color: #F59E0B; font-weight: bold;"; // Orange
      case "error":
        return "color: #EF4444; font-weight: bold;"; // Red
      case "debug":
        return "color: #10B981; font-weight: bold;"; // Green
      default:
        return "color: inherit;";
    }
  }

  public info(message: string, data?: any, context?: string) {
    const entry = this.formatEntry("info", message, data, context);
    this.print(entry);
  }

  public warn(message: string, data?: any, context?: string) {
    const entry = this.formatEntry("warn", message, data, context);
    this.print(entry);
  }

  public error(message: string, data?: any, context?: string) {
    const entry = this.formatEntry("error", message, data, context);
    this.print(entry);
  }

  public debug(message: string, data?: any, context?: string) {
    // Only log debug in development.
    // Sadece geliştirme ortamında debug logu al.
    if (import.meta.env.DEV) {
      const entry = this.formatEntry("debug", message, data, context);
      this.print(entry);
    }
  }

  // Method to log user actions specially.
  // Kullanıcı eylemlerini özel olarak kaydetme yöntemi.
  public logAction(action: string, data?: any) {
    this.info(`User Action: ${action}`, data, "UserAction");
  }
}

export const logger = Logger.getInstance();
