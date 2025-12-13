import { api } from "../api/axios";
import type { AxiosRequestConfig, AxiosResponse } from "axios";

export abstract class BaseService {
  protected api = api;
  protected basePath: string;

  constructor(basePath: string = "") {
    this.basePath = basePath;
  }

  protected get<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.api.get<T>(`${this.basePath}${url}`, config);
  }

  protected post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.api.post<T>(`${this.basePath}${url}`, data, config);
  }

  protected put<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.api.put<T>(`${this.basePath}${url}`, data, config);
  }

  protected delete<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.api.delete<T>(`${this.basePath}${url}`, config);
  }
}
