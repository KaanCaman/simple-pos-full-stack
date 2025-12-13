import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";
import { logger } from "../utils/logger";
import { AppConstants } from "../constants/app";

// API Client class for handling HTTP requests with OOP approach.
// OOP yaklaşımı ile HTTP isteklerini işlemek için API İstemci sınıfı.
class ApiClient {
  private instance: AxiosInstance;
  private onUnauthorizedCallback: (() => void) | null = null;

  constructor() {
    this.instance = axios.create({
      baseURL: AppConstants.API_URL,
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 10000,
    });
    this.setupInterceptors();
  }

  // Register a callback to be called on 401 Unauthorized responses.
  // 401 Yetkisiz yanıtlarında çağrılacak bir geri arama kaydedin.
  public setOnUnauthorized(callback: () => void) {
    this.onUnauthorizedCallback = callback;
  }

  // Set up response interceptors.
  // Yanıt yakalayıcılarını ayarla.
  private setupInterceptors() {
    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        logger.info(
          `Request ${config.method?.toUpperCase()} ${config.baseURL}${
            config.url
          }`,
          {
            method: config.method,
            url: `${config.baseURL}${config.url}`,
            body: config.data,
          },
          "API"
        );
        return config;
      },
      (error: AxiosError) => Promise.reject(error)
    );

    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        logger.info(
          `Response ${response.status} ${response.config.baseURL}${response.config.url}`,
          {
            status: response.status,
            url: `${response.config.baseURL}${response.config.url}`,
            body: response.data,
          },
          "API"
        );
        return response;
      },
      (error: AxiosError) => {
        if (error.response?.status === 401 && this.onUnauthorizedCallback) {
          logger.warn(
            "Unauthorized access detected, triggering callback",
            undefined,
            "API"
          );
          this.onUnauthorizedCallback();
        }

        logger.error(
          `API Error: ${error.message}`,
          {
            url: `${error.config?.baseURL}${error.config?.url}`,
            status: error.response?.status,
            body: error.response?.data,
          },
          "API"
        );
        return Promise.reject(error);
      }
    );
  }

  // Method to set the Authorization header.
  // Authorization başlığını ayarlama yöntemi.
  public setToken(token: string) {
    this.instance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    // Also set it on the instance defaults for immediate effect,
    // though usually common is enough for future requests in axios > 0.19.
    // Ancak axios > 0.19'da gelecek istekler için genellikle common yeterlidir.
  }

  // Method to clear the Authorization header.
  // Authorization başlığını temizleme yöntemi.
  public clearToken() {
    delete this.instance.defaults.headers.common["Authorization"];
  }

  // Generic request wrappers (optional, exposes clean API).
  // Genel istek sarmalayıcıları (isteğe bağlı, temiz API sunar).
  public get<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.instance.get<T>(url, config);
  }

  public post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.instance.post<T>(url, data, config);
  }

  public put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.instance.put<T>(url, data, config);
  }

  public delete<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.instance.delete<T>(url, config);
  }

  public patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.instance.patch<T>(url, data, config);
  }
}

// Export a singleton instance.
// Tek bir örneği dışa aktar.
export const api = new ApiClient();
