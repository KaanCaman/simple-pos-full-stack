import type { BaseEntity } from "./api";

export interface Category extends BaseEntity {
  name: string;
  icon: string;
  color: string;
  sort_order: number;
  is_active: boolean;
  products?: Product[];
}

export interface CreateCategoryRequest {
  name: string;
  icon: string;
  color: string;
  sort_order: number;
}

export interface Product extends BaseEntity {
  category_id: number;
  category?: Category; // Response içinde bazen full obje dönüyor
  name: string;
  description: string;
  price: number; // Kuruş cinsinden (örn: 1500 = 15.00 TL)
  image_url: string;
  is_available: boolean;
  sort_order: number;
}

export interface CreateProductRequest {
  category_id: number;
  name: string;
  description: string;
  price: number;
}

export interface UpdateProductRequest {
  category_id?: number;
  name?: string;
  price?: number;
  description?: string;
}
