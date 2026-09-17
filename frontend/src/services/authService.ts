import api from "./api";
import type { AuthResponse } from "../types";

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: "admin" | "manager" | "user";
}

export interface LoginData {
  email: string;
  password: string;
}

export const registerUser = async (
  data: RegisterData
): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>("/auth/register", data);

  return response.data;
};

export const loginUser = async (
  data: LoginData
): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>("/auth/login", data);

  return response.data;
};