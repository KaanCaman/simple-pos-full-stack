// Tüm yanıtlar için genel wrapper
export interface ApiResponse<T = void> {
  success: boolean;
  code: string; // Örn: "OK", "CREATED", "UPDATED", "DELETED"
  message: string;
  data: T;
}

// Veritabanı nesneleri için ortak alanlar
export interface BaseEntity {
  id: number;
  created_at: string; // ISO Date string
  updated_at: string; // ISO Date string
  deleted_at: string | null;
}
