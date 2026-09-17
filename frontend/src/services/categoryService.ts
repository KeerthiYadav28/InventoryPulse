import api from "./api";
import type { Category } from "../types";

export interface CreateCategoryData {
  name: string;
}

export interface UpdateCategoryData {
  name: string;
}

export const getCategories = async (): Promise<Category[]> => {
  const response = await api.get<Category[]>("/categories");

  return response.data;
};

export const getCategoryById = async (
  id: string
): Promise<Category> => {
  const response = await api.get<Category>(`/categories/${id}`);

  return response.data;
};

export const createCategory = async (
  data: CreateCategoryData
): Promise<Category> => {
  const response = await api.post<Category>("/categories", data);

  return response.data;
};

export const updateCategory = async (
  id: string,
  data: UpdateCategoryData
): Promise<Category> => {
  const response = await api.put<Category>(
    `/categories/${id}`,
    data
  );

  return response.data;
};

export const deleteCategory = async (
  id: string
): Promise<void> => {
  await api.delete(`/categories/${id}`);
};