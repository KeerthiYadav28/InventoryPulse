export type UserRole = "admin" | "manager" | "user";

export type StockMovementType = "IN" | "OUT" | "ADJUSTMENT";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  user: User;
}

export interface Category {
  id: string;
  name: string;
}

export interface Supplier {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string | null;
  category_id?: string | null;
  supplier_id?: string | null;
  quantity: number;
  reorder_level: number;
  unit_price: number;
  created_at?: string;
  updated_at?: string;
}

export interface StockMovement {
  id: string;
  product_id: string;
  type: StockMovementType;
  quantity: number;
  reason?: string | null;
  created_by?: string | null;
  created_at?: string;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: unknown[];
}