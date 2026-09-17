import {
  useState,
  type ReactNode,
} from "react";
import {
  loginUser,
  registerUser,
  type LoginData,
  type RegisterData,
} from "../services/authService";
import type { User } from "../types";
import {
  AuthContext,
  type AuthContextType,
} from "./AuthContext";

interface AuthProviderProps {
  children: ReactNode;
}

const getStoredAuth = (): {
  user: User | null;
  token: string | null;
} => {
  const storedToken = localStorage.getItem("inventorypulse_token");
  const storedUser = localStorage.getItem("inventorypulse_user");

  if (!storedToken || !storedUser) {
    return {
      user: null,
      token: null,
    };
  }

  try {
    const parsedUser: User = JSON.parse(storedUser);

    return {
      user: parsedUser,
      token: storedToken,
    };
  } catch {
    localStorage.removeItem("inventorypulse_token");
    localStorage.removeItem("inventorypulse_user");

    return {
      user: null,
      token: null,
    };
  }
};

export const AuthProvider = ({
  children,
}: AuthProviderProps) => {
  const [auth, setAuth] = useState(getStoredAuth);

  const login = async (data: LoginData): Promise<void> => {
    const response = await loginUser(data);

    localStorage.setItem(
      "inventorypulse_token",
      response.token
    );

    localStorage.setItem(
      "inventorypulse_user",
      JSON.stringify(response.user)
    );

    setAuth({
      token: response.token,
      user: response.user,
    });
  };

  const register = async (
    data: RegisterData
  ): Promise<void> => {
    const response = await registerUser(data);

    localStorage.setItem(
      "inventorypulse_token",
      response.token
    );

    localStorage.setItem(
      "inventorypulse_user",
      JSON.stringify(response.user)
    );

    setAuth({
      token: response.token,
      user: response.user,
    });
  };

  const logout = (): void => {
    localStorage.removeItem("inventorypulse_token");
    localStorage.removeItem("inventorypulse_user");

    setAuth({
      token: null,
      user: null,
    });
  };

  const value: AuthContextType = {
    user: auth.user,
    token: auth.token,
    isAuthenticated: Boolean(
      auth.token && auth.user
    ),
    isLoading: false,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};