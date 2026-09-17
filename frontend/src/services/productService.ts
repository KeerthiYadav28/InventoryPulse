import api from "./api";
import type { Product } from "../types";

export interface CreateProductData {
  sku: string;
  name: string;
  description?: string;
  category_id?: string;
  supplier_id?: string;
  quantity: number;
  reorder_level: number;
  unit_price: number;
}

export interface UpdateProductData {
  sku?: string;
  name?: string;
  description?: string;
  category_id?: string;
  supplier_id?: string;
  quantity?: number;
  reorder_level?: number;
  unit_price?: number;
}

export const getProducts = async (): Promise<Product[]> => {
  const response = await api.get<Product[]>("/products");

  return response.data;
};

export const getProductById = async (
  id: string
): Promise<Product> => {
  const response = await api.get<Product>(`/products/${id}`);

  return response.data;
};

export const getLowStockProducts = async (): Promise<Product[]> => {
  const response = await api.get<Product[]>("/products/low-stock");

  return response.data;
};

export const createProduct = async (
  data: CreateProductData
): Promise<Product> => {
  const response = await api.post<Product>("/products", data);

  return response.data;
};

export const updateProduct = async (
  id: string,
  data: UpdateProductData
): Promise<Product> => {
  const response = await api.put<Product>(`/products/${id}`, data);

  return response.data;
};

export const deleteProduct = async (
  id: string
): Promise<void> => {
  await api.delete(`/products/${id}`);
};