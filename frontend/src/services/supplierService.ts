import api from "./api";
import type { Supplier } from "../types";

export interface CreateSupplierData {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface UpdateSupplierData {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export const getSuppliers = async (): Promise<Supplier[]> => {
  const response = await api.get<Supplier[]>("/suppliers");

  return response.data;
};

export const getSupplierById = async (
  id: string
): Promise<Supplier> => {
  const response = await api.get<Supplier>(`/suppliers/${id}`);

  return response.data;
};

export const createSupplier = async (
  data: CreateSupplierData
): Promise<Supplier> => {
  const response = await api.post<Supplier>("/suppliers", data);

  return response.data;
};

export const updateSupplier = async (
  id: string,
  data: UpdateSupplierData
): Promise<Supplier> => {
  const response = await api.put<Supplier>(
    `/suppliers/${id}`,
    data
  );

  return response.data;
};

export const deleteSupplier = async (
  id: string
): Promise<void> => {
  await api.delete(`/suppliers/${id}`);
};