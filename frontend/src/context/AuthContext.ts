import { createContext } from "react";
import type { User } from "../types";
import type {
  LoginData,
  RegisterData,
} from "../services/authService";

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<
  AuthContextType | undefined
>(undefined);